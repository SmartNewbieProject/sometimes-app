import { ipcMain, dialog, shell, BrowserWindow } from 'electron'
import { existsSync } from 'fs'
import { BuildService } from './services/build-service'
import { AppStoreConnectAPI } from './services/asc-api'
import { GooglePlayAPI } from './services/google-play-api'
import { ReleaseNotesGenerator } from './services/release-notes'
import { VersionReader } from './services/version-reader'
import { ConfigStore } from './services/config-store'
import { db } from './services/database'
import { logger } from './utils/logger'
import { sendNotification } from './utils/notify'

const configStore = new ConfigStore()
let activeBuildService: BuildService | null = null

export function registerIpcHandlers(): void {
  // ── Config ──
  ipcMain.handle('config:get', () => configStore.getAll())
  ipcMain.handle('config:set', (_, partial) => configStore.update(partial))

  // ── Version ──
  ipcMain.handle('version:read', () => {
    const config = configStore.getAll()
    const reader = new VersionReader(config.sometimesAppPath)
    return reader.read()
  })
  ipcMain.handle('version:increment', async (_, type: 'patch' | 'minor' | 'major') => {
    const config = configStore.getAll()
    const reader = new VersionReader(config.sometimesAppPath)
    return reader.increment(type)
  })

  // ── Build ──
  ipcMain.handle('build:start', (event, opts) => {
    const config = configStore.getAll()
    const service = new BuildService(config)
    activeBuildService = service
    const sender = event.sender

    logger.info(`Build started: platform=${opts.platform}, profile=${opts.profile}`)

    // Create DB session
    const sessionId = db.createBuildSession(opts.platform, opts.profile)
    let seq = 0

    service.on('log', (line: string) => {
      db.insertBuildLog(sessionId, line, ++seq)
      sender.send('build:log', { sessionId, line })
    })
    service.on('progress', (data: unknown) => sender.send('build:progress', data))
    service.on('done', (result: unknown) => {
      db.finishBuildSession(sessionId, 'completed')
      activeBuildService = null
      logger.info(`Build completed: platform=${opts.platform}`)
      sendNotification('빌드 완료', `${opts.platform} ${opts.profile} 빌드가 완료되었습니다.`)
      sender.send('build:done', result)
    })
    service.on('error', (err: string) => {
      db.finishBuildSession(sessionId, 'failed')
      activeBuildService = null
      logger.error(`Build failed: platform=${opts.platform}, error=${err}`)
      sendNotification('빌드 실패', `${opts.platform}: ${err}`)
      sender.send('build:error', err)
    })

    return service.start(opts)
  })

  ipcMain.handle('build:stop', () => {
    if (activeBuildService) {
      logger.info('Build cancelled by user')
      activeBuildService.stop()
      activeBuildService = null
      return { success: true }
    }
    return { success: false, error: 'No active build' }
  })

  ipcMain.handle('build:artifacts', () => {
    const config = configStore.getAll()
    const service = new BuildService(config)
    return service.getArtifacts()
  })

  ipcMain.handle('build:delete-artifact', (_, path: string) => {
    const config = configStore.getAll()
    const service = new BuildService(config)
    return service.deleteArtifact(path)
  })

  ipcMain.handle('build:delete-artifacts', (_, paths: string[]) => {
    const config = configStore.getAll()
    const service = new BuildService(config)
    const results: Array<{ path: string; success: boolean; error?: string }> = []
    for (const p of paths) {
      const result = service.deleteArtifact(p)
      results.push({ path: p, ...result })
    }
    return results
  })

  // ── Build Log Query (new) ──
  ipcMain.handle('build:log-query', (_, query) => {
    return db.queryBuildLogs(query)
  })

  ipcMain.handle('build:sessions', (_, limit?: number) => {
    return db.getSessions(limit)
  })

  // ── Release Notes ──
  ipcMain.handle('release-notes:generate', (_, sinceTag?: string) => {
    const config = configStore.getAll()
    const generator = new ReleaseNotesGenerator(config.sometimesAppPath)
    return generator.generate(sinceTag)
  })

  ipcMain.handle('release-notes:ai-generate', async (_, sinceTag?: string) => {
    const config = configStore.getAll()
    if (!config.openaiApiKey) {
      return { success: false, error: 'OpenAI API Key not configured' }
    }
    const generator = new ReleaseNotesGenerator(config.sometimesAppPath)
    try {
      const notes = await generator.generateWithAI(config.openaiApiKey, sinceTag)
      return { success: true, notes }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // ── Deploy iOS ──
  ipcMain.handle('deploy:ios', async (event, opts) => {
    const config = configStore.getAll()
    const asc = new AppStoreConnectAPI(config.ios)
    const sender = event.sender

    try {
      sender.send('deploy:progress', { platform: 'ios', step: 'waiting', message: '빌드 프로세싱 대기 중...' })

      const buildNumber = opts.buildNumber
      if (!buildNumber) {
        throw new Error('빌드 번호가 없습니다. 아티팩트를 다시 선택해주세요.')
      }

      const builds = await asc.getBuilds(buildNumber)
      if (builds.length === 0) {
        throw new Error(`빌드 번호 ${buildNumber}에 해당하는 빌드를 찾을 수 없습니다`)
      }

      const build = builds[0]

      // Wait for processing
      for await (const status of asc.waitForProcessing(build.id)) {
        sender.send('deploy:progress', { platform: 'ios', step: 'processing', message: `프로세싱: ${status.processingState}` })
        if (status.processingState === 'VALID') break
        if (status.processingState === 'FAILED') throw new Error('빌드 프로세싱 실패')
      }

      sender.send('deploy:progress', { platform: 'ios', step: 'version', message: '버전 확인 중...' })
      const version = await asc.getOrCreateVersion(opts.version, build.id)

      // Already in review or beyond — skip all modification steps
      const readOnlyStates = ['WAITING_FOR_REVIEW', 'IN_REVIEW', 'PENDING_DEVELOPER_RELEASE', 'READY_FOR_SALE']
      if (readOnlyStates.includes(version.appStoreState)) {
        sender.send('deploy:progress', { platform: 'ios', step: 'done', message: `이미 심사 진행 중 (${version.appStoreState})` })
      } else {
        sender.send('deploy:progress', { platform: 'ios', step: 'notes', message: '릴리즈 노트 설정 중...' })
        await asc.setReleaseNotes(version.id, opts.releaseNotes)

        // Review details
        const review = config.ios.review
        if (review && review.contactEmail) {
          sender.send('deploy:progress', { platform: 'ios', step: 'review', message: '심사 정보 설정 중...' })
          const reviewDetailId = await asc.setReviewDetails(version.id, review)

          if (review.attachmentPath && existsSync(review.attachmentPath)) {
            sender.send('deploy:progress', { platform: 'ios', step: 'attachment', message: '데모 영상 업로드 중...' })
            await asc.uploadReviewAttachment(reviewDetailId, review.attachmentPath)
          }
        }

        sender.send('deploy:progress', { platform: 'ios', step: 'submit', message: '심사 제출 중...' })
        await asc.submitForReview(version.id)
        sender.send('deploy:progress', { platform: 'ios', step: 'done', message: '심사 제출 완료!' })
      }

      configStore.addDeployHistory({
        id: `ios-${Date.now()}`,
        version: opts.version,
        buildNumber: '',
        date: new Date().toISOString(),
        iosStatus: 'WAITING_FOR_REVIEW',
        androidStatus: ''
      })

      logger.info(`iOS deploy completed: version=${opts.version}`)
      sendNotification('Deploy 완료', `iOS ${opts.version} 심사 제출이 완료되었습니다.`)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      sender.send('deploy:progress', { platform: 'ios', step: 'error', message })
      logger.error(`iOS deploy failed: ${message}`)
      sendNotification('Deploy 실패', `iOS: ${message}`)
      return { success: false, error: message }
    }
  })

  // ── Release iOS (after review approval) ──
  ipcMain.handle('deploy:release-ios', async () => {
    const config = configStore.getAll()
    const asc = new AppStoreConnectAPI(config.ios)

    try {
      const status = await asc.getVersionStatus()
      if (!status) {
        return { success: false, error: '버전 정보를 찾을 수 없습니다' }
      }
      if (status.appStoreState !== 'PENDING_DEVELOPER_RELEASE') {
        return { success: false, error: `현재 상태(${status.appStoreState})에서는 출시할 수 없습니다` }
      }

      await asc.releaseVersion(status.id)
      logger.info(`iOS released: version=${status.versionString}`)
      sendNotification('iOS 출시 완료', `${status.versionString}이 App Store에 출시되었습니다.`)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logger.error(`iOS release failed: ${message}`)
      return { success: false, error: message }
    }
  })

  // ── Release Android (draft → completed) ──
  ipcMain.handle('deploy:release-android', async () => {
    const config = configStore.getAll()
    const gplay = new GooglePlayAPI(config.android)

    try {
      await gplay.getAccessToken()
      await gplay.releaseToProduction()
      logger.info('Android released to production')
      sendNotification('Android 출시 완료', 'Google Play에 출시되었습니다.')
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logger.error(`Android release failed: ${message}`)
      return { success: false, error: message }
    }
  })

  // ── Deploy Android ──
  ipcMain.handle('deploy:android', async (event, opts) => {
    const config = configStore.getAll()
    const gplay = new GooglePlayAPI(config.android)
    const sender = event.sender

    try {
      sender.send('deploy:progress', { platform: 'android', step: 'auth', message: '인증 중...' })
      await gplay.getAccessToken()

      sender.send('deploy:progress', { platform: 'android', step: 'edit', message: 'Edit 생성 중...' })
      const editId = await gplay.createEdit()

      sender.send('deploy:progress', { platform: 'android', step: 'upload', message: 'AAB 업로드 중...' })
      const uploadResult = await gplay.uploadBundle(editId, opts.aabPath)

      sender.send('deploy:progress', { platform: 'android', step: 'track', message: '트랙 설정 중...' })
      await gplay.setTrackRelease(editId, uploadResult.versionCode, opts.releaseNotes, opts.version)

      sender.send('deploy:progress', { platform: 'android', step: 'commit', message: 'Edit 커밋 중...' })
      await gplay.commitEdit(editId)

      sender.send('deploy:progress', { platform: 'android', step: 'done', message: '배포 완료!' })

      configStore.addDeployHistory({
        id: `android-${Date.now()}`,
        version: opts.version || '',
        buildNumber: String(uploadResult.versionCode),
        date: new Date().toISOString(),
        iosStatus: '',
        androidStatus: 'draft'
      })

      logger.info(`Android deploy completed: versionCode=${uploadResult.versionCode}`)
      sendNotification('Deploy 완료', `Android 배포가 완료되었습니다.`)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      sender.send('deploy:progress', { platform: 'android', step: 'error', message })
      logger.error(`Android deploy failed: ${message}`)
      sendNotification('Deploy 실패', `Android: ${message}`)
      return { success: false, error: message }
    }
  })

  // ── Monitor ──
  ipcMain.handle('monitor:ios-status', async () => {
    const config = configStore.getAll()
    const asc = new AppStoreConnectAPI(config.ios)
    return asc.getVersionStatus()
  })

  ipcMain.handle('monitor:android-status', async () => {
    const config = configStore.getAll()
    const gplay = new GooglePlayAPI(config.android)
    return gplay.getTrackStatus()
  })

  ipcMain.handle('monitor:history', () => {
    return configStore.getDeployHistory()
  })

  ipcMain.handle('monitor:save-history', (_, entry) => {
    return configStore.addDeployHistory(entry)
  })

  ipcMain.handle('monitor:import-git-history', () => {
    const config = configStore.getAll()
    const count = db.importFromGit(config.sometimesAppPath)
    logger.info(`Git history imported: ${count} entries`)
    return { imported: count }
  })

  // ── System ──
  ipcMain.handle('system:select-file', async (_, filters) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('system:select-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('system:open-external', (_, url) => {
    shell.openExternal(url)
  })

  ipcMain.handle('system:show-in-folder', (_, path) => {
    shell.showItemInFolder(path)
  })

  ipcMain.handle('system:app-version', () => {
    return { electron: process.versions.electron, app: '1.0.0' }
  })

  ipcMain.handle('system:notify', (_, { title, body }) => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      win.webContents.send('system:notification', { title, body })
    }
  })
}
