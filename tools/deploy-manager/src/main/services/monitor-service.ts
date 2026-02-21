import { BrowserWindow } from 'electron'
import { AppStoreConnectAPI, type VersionStatus } from './asc-api'
import { GooglePlayAPI, type TrackStatus } from './google-play-api'
import { ConfigStore } from './config-store'
import { logger } from '../utils/logger'
import { sendNotification } from '../utils/notify'
import { sendSlackMonitorAlert } from '../utils/slack'

interface LastState {
  ios: string | null
  android: string | null
}

// Transitions worth notifying about
const IOS_TRANSITIONS: Record<string, string> = {
  'WAITING_FOR_REVIEW→IN_REVIEW': '심사가 시작되었습니다',
  'IN_REVIEW→PENDING_DEVELOPER_RELEASE': '심사가 승인되었습니다! 출시 대기 중',
  'IN_REVIEW→REJECTED': '심사가 거부되었습니다',
  'PENDING_DEVELOPER_RELEASE→READY_FOR_SALE': 'App Store에 출시되었습니다'
}

const ANDROID_TRANSITIONS: Record<string, string> = {
  'draft→completed': 'Google Play에 출시되었습니다',
  'completed→halted': '출시가 중단되었습니다',
  'inProgress→completed': '롤아웃이 완료되었습니다'
}

export class MonitorService {
  private timer: ReturnType<typeof setInterval> | null = null
  private lastState: LastState = { ios: null, android: null }
  private configStore: ConfigStore

  constructor(configStore: ConfigStore) {
    this.configStore = configStore
  }

  start(): void {
    logger.info('MonitorService started')
    // First poll after 10 seconds (let the app initialize)
    setTimeout(() => {
      this.poll()
      this.scheduleNext()
    }, 10_000)
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    logger.info('MonitorService stopped')
  }

  async pollNow(): Promise<{ ios: VersionStatus | null; android: TrackStatus | null }> {
    return this.poll()
  }

  private scheduleNext(): void {
    if (this.timer) clearInterval(this.timer)
    const config = this.configStore.getAll()
    const interval = Math.max(config.monitorInterval || 300_000, 60_000)
    this.timer = setInterval(() => this.poll(), interval)
  }

  private async poll(): Promise<{ ios: VersionStatus | null; android: TrackStatus | null }> {
    const config = this.configStore.getAll()
    let iosStatus: VersionStatus | null = null
    let androidStatus: TrackStatus | null = null

    // iOS
    try {
      const asc = new AppStoreConnectAPI(config.ios)
      iosStatus = await asc.getVersionStatus()
      if (iosStatus) {
        this.checkIOSTransition(iosStatus)
      }
    } catch (err) {
      logger.error(`MonitorService iOS poll failed: ${err}`)
    }

    // Android
    try {
      const gplay = new GooglePlayAPI(config.android)
      androidStatus = await gplay.getTrackStatus()
      if (androidStatus) {
        this.checkAndroidTransition(androidStatus)
      }
    } catch (err) {
      logger.error(`MonitorService Android poll failed: ${err}`)
    }

    // Push to renderer
    this.sendToRenderer('monitor:state-changed', {
      ios: iosStatus,
      android: androidStatus,
      timestamp: new Date().toISOString()
    })

    return { ios: iosStatus, android: androidStatus }
  }

  private checkIOSTransition(status: VersionStatus): void {
    const newState = status.appStoreState
    const oldState = this.lastState.ios

    if (oldState !== null && oldState !== newState) {
      const key = `${oldState}→${newState}`
      const msg = IOS_TRANSITIONS[key]
      if (msg) {
        const title = `iOS ${status.versionString}`
        logger.info(`iOS state transition: ${key}`)
        sendNotification(title, msg)
        this.trySendSlack('ios', status.versionString, oldState, newState, msg)

        // Update deploy history
        this.configStore.updateDeployHistoryStatus(status.versionString, 'ios', newState)
      }
    }

    this.lastState.ios = newState
  }

  private checkAndroidTransition(track: TrackStatus): void {
    // Pick the most relevant release (draft > inProgress > halted > completed)
    const priorityOrder = ['draft', 'inProgress', 'halted', 'completed']
    const sorted = [...(track.releases || [])].sort(
      (a, b) => priorityOrder.indexOf(a.status) - priorityOrder.indexOf(b.status)
    )
    const release = sorted[0]
    if (!release) return

    const newState = release.status
    const oldState = this.lastState.android

    if (oldState !== null && oldState !== newState) {
      const key = `${oldState}→${newState}`
      const msg = ANDROID_TRANSITIONS[key]
      if (msg) {
        const title = `Android ${release.name || 'release'}`
        logger.info(`Android state transition: ${key}`)
        sendNotification(title, msg)
        this.trySendSlack('android', release.name || 'release', oldState, newState, msg)

        // Update deploy history
        if (release.name) {
          this.configStore.updateDeployHistoryStatus(release.name, 'android', newState)
        }
      }
    }

    this.lastState.android = newState
  }

  private trySendSlack(
    platform: 'ios' | 'android',
    version: string,
    oldState: string,
    newState: string,
    description: string
  ): void {
    const config = this.configStore.getAll()
    const { slack } = config
    if (!slack?.enabled || !slack.botToken || !slack.channelId) return

    sendSlackMonitorAlert(slack.botToken, slack.channelId, platform, version, oldState, newState, description).catch(
      (err) => logger.error(`Slack alert failed: ${err}`)
    )
  }

  private sendToRenderer(channel: string, data: unknown): void {
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) {
        win.webContents.send(channel, data)
      }
    }
  }
}
