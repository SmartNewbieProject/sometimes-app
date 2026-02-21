import { spawn, ChildProcess, execSync } from 'child_process'
import { EventEmitter } from 'events'
import { existsSync, readdirSync, statSync, readFileSync, mkdirSync, copyFileSync, writeFileSync, unlinkSync, rmdirSync } from 'fs'
import { join, resolve, dirname } from 'path'
import type { AppConfig } from './config-store'
import { VersionReader } from './version-reader'

export interface BuildOptions {
  platform: 'ios' | 'android' | 'both'
  profile: 'production' | 'preview'
}

export interface BuildArtifact {
  platform: 'ios' | 'android'
  path: string
  filename: string
  size: number
  date: string
  version: string
  buildNumber: string
}

export interface BuildProgress {
  platform: string
  percent: number
  status: string
}

export class BuildService extends EventEmitter {
  private processes: ChildProcess[] = []

  constructor(private config: AppConfig) {
    super()
  }

  async start(opts: BuildOptions): Promise<void> {
    const platforms = opts.platform === 'both' ? ['ios', 'android'] : [opts.platform]

    for (const platform of platforms) {
      this.runBuild(platform, opts.profile)
      // Stagger builds by 30s when building both
      if (platforms.length > 1 && platform === 'ios') {
        await new Promise((r) => setTimeout(r, 30000))
      }
    }
  }

  private loadEnvFile(): Record<string, string> {
    const envPath = join(this.config.sometimesAppPath, '.env.production')
    const env: Record<string, string> = {}
    if (!existsSync(envPath)) return env
    try {
      const content = readFileSync(envPath, 'utf-8')
      for (const line of content.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx > 0) {
          env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1)
        }
      }
    } catch { /* ignore */ }
    return env
  }

  private runBuild(platform: string, profile: string): void {
    const args = ['build', '--platform', platform, '--profile', profile, '--non-interactive', '--local']

    this.emit('log', `[${platform}] Starting: eas ${args.join(' ')}`)

    // Load .env.production (matches build-all-production.sh)
    const prodEnv = this.loadEnvFile()

    // External build dir for TMPDIR (matches build-all-production.sh)
    const externalBuildDir = this.config.buildDir
    let tmpDir = process.env.TMPDIR || ''
    if (existsSync(externalBuildDir)) {
      const tmpPath = join(externalBuildDir, 'tmp')
      mkdirSync(tmpPath, { recursive: true })
      tmpDir = tmpPath
    }

    // Resolve eas binary path via nvm if available
    const nvmDir = process.env.NVM_DIR || join(process.env.HOME || '', '.nvm')
    const nvmBin = existsSync(nvmDir)
      ? (() => { try { return execSync('source "$NVM_DIR/nvm.sh" && dirname "$(which eas)"', { shell: '/bin/bash', encoding: 'utf-8' }).trim() } catch { return '' } })()
      : ''
    const pathExtra = nvmBin ? `:${nvmBin}` : ''

    const proc = spawn('eas', args, {
      cwd: this.config.sometimesAppPath,
      env: {
        ...process.env,
        ...prodEnv,
        EXPO_PUBLIC_APPLE_ENVIRONMENT: 'production',
        EXPO_NO_DOCTOR: '1',
        FORCE_COLOR: '0',
        TMPDIR: tmpDir || process.env.TMPDIR || '',
        PATH: `${process.env.PATH}${pathExtra}`
      },
      shell: true
    })

    this.processes.push(proc)

    proc.stdout?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter(Boolean)
      for (const line of lines) {
        this.emit('log', `[${platform}] ${line}`)
        this.parseProgress(platform, line)
      }
    })

    proc.stderr?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter(Boolean)
      for (const line of lines) {
        this.emit('log', `[${platform}] ⚠ ${line}`)
      }
    })

    proc.on('close', (code) => {
      if (code === 0) {
        this.organizeArtifacts()
        this.emit('log', `[${platform}] Build completed successfully!`)
        this.emit('done', { platform, success: true })
      } else {
        this.emit('log', `[${platform}] Build failed with code ${code}`)
        this.emit('error', `${platform} build failed with exit code ${code}`)
      }
    })

    proc.on('error', (err) => {
      this.emit('error', `${platform}: ${err.message}`)
    })
  }

  private parseProgress(platform: string, line: string): void {
    // Parse EAS build output for progress estimation
    let percent = 0
    let status = 'building'

    if (line.includes('Compressing')) { percent = 10; status = 'compressing' }
    else if (line.includes('Uploading')) { percent = 20; status = 'uploading' }
    else if (line.includes('Building')) { percent = 40; status = 'building' }
    else if (line.includes('Installing pods') || line.includes('Installing CocoaPods')) { percent = 30; status = 'installing pods' }
    else if (line.includes('Archiving')) { percent = 60; status = 'archiving' }
    else if (line.includes('Signing')) { percent = 70; status = 'signing' }
    else if (line.includes('Exporting')) { percent = 80; status = 'exporting' }
    else if (line.includes('Build finished')) { percent = 100; status = 'done' }

    if (percent > 0) {
      this.emit('progress', { platform, percent, status } satisfies BuildProgress)
    }
  }

  private readMeta(artifactPath: string): { version: string; buildNumber: string } {
    const metaPath = artifactPath + '.meta.json'
    try {
      if (existsSync(metaPath)) {
        const data = JSON.parse(readFileSync(metaPath, 'utf-8'))
        return { version: data.version || '', buildNumber: data.buildNumber || '' }
      }
    } catch { /* ignore */ }
    return { version: '', buildNumber: '' }
  }

  private collectFromDir(dir: string, artifacts: BuildArtifact[], seen: Set<string>): void {
    try {
      for (const entry of readdirSync(dir)) {
        if (!entry.endsWith('.ipa') && !entry.endsWith('.aab')) continue
        if (seen.has(entry)) continue
        seen.add(entry)

        const fullPath = join(dir, entry)
        const stat = statSync(fullPath)
        const meta = this.readMeta(fullPath)
        artifacts.push({
          platform: entry.endsWith('.ipa') ? 'ios' : 'android',
          path: fullPath,
          filename: entry,
          size: stat.size,
          date: stat.mtime.toISOString(),
          version: meta.version,
          buildNumber: meta.buildNumber
        })
      }
    } catch {
      // Directory not accessible
    }
  }

  getArtifacts(): BuildArtifact[] {
    const artifacts: BuildArtifact[] = []
    const seen = new Set<string>()

    // Scan both buildDir and sometimesAppPath (project root)
    const scanDirs = [this.config.buildDir, this.config.sometimesAppPath].filter(
      (d) => d && existsSync(d)
    )

    for (const dir of scanDirs) {
      this.collectFromDir(dir, artifacts, seen)
    }

    // Also scan subdirectories in buildDir (production_YYYYMMDD_HHMMSS from organize_artifacts)
    if (existsSync(this.config.buildDir)) {
      try {
        for (const subdir of readdirSync(this.config.buildDir)) {
          const subdirPath = join(this.config.buildDir, subdir)
          if (!statSync(subdirPath).isDirectory()) continue
          this.collectFromDir(subdirPath, artifacts, seen)
        }
      } catch {
        // Ignore
      }
    }

    // Fallback: fill missing version from app.config.ts
    const missing = artifacts.filter((a) => !a.version)
    if (missing.length > 0) {
      try {
        const reader = new VersionReader(this.config.sometimesAppPath)
        const v = reader.read()
        for (const a of missing) {
          a.version = v.version
          a.buildNumber = a.platform === 'ios'
            ? v.ios.buildNumber
            : String(v.android.versionCode)

          // Persist meta so future reads don't need fallback
          const metaPath = a.path + '.meta.json'
          if (!existsSync(metaPath)) {
            try {
              writeFileSync(metaPath, JSON.stringify({ version: a.version, buildNumber: a.buildNumber }))
            } catch { /* ignore */ }
          }
        }
      } catch {
        // ignore
      }
    }

    return artifacts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  private organizeArtifacts(): void {
    const srcDir = this.config.sometimesAppPath
    const targetDir = this.config.buildDir

    // Read current version with per-platform build numbers
    let versionInfo: { version: string; iosBuild: string; androidCode: string } = {
      version: '', iosBuild: '', androidCode: ''
    }
    try {
      const reader = new VersionReader(srcDir)
      const v = reader.read()
      versionInfo = {
        version: v.version,
        iosBuild: v.ios.buildNumber,
        androidCode: String(v.android.versionCode)
      }
    } catch { /* ignore */ }

    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000

    let entries: string[]
    try {
      entries = readdirSync(srcDir)
    } catch {
      return
    }

    for (const entry of entries) {
      if (!entry.endsWith('.ipa') && !entry.endsWith('.aab')) continue

      try {
        const srcPath = join(srcDir, entry)
        const stat = statSync(srcPath)
        if (stat.mtime.getTime() < twoHoursAgo) continue

        // Write meta with platform-specific buildNumber
        const isIOS = entry.endsWith('.ipa')
        const meta = {
          version: versionInfo.version,
          buildNumber: isIOS ? versionInfo.iosBuild : versionInfo.androidCode
        }

        const metaPath = srcPath + '.meta.json'
        if (!existsSync(metaPath) && meta.version) {
          writeFileSync(metaPath, JSON.stringify(meta))
        }

        if (!targetDir || !existsSync(targetDir)) continue

        const destPath = join(targetDir, entry)
        if (existsSync(destPath)) continue

        // Use copy+delete for cross-device support
        copyFileSync(srcPath, destPath)
        unlinkSync(srcPath)

        const destMetaPath = destPath + '.meta.json'
        if (existsSync(metaPath)) {
          copyFileSync(metaPath, destMetaPath)
          unlinkSync(metaPath)
        }
      } catch {
        // Per-file error — continue with other artifacts
      }
    }
  }

  deleteArtifact(artifactPath: string): { success: boolean; error?: string } {
    const resolved = resolve(artifactPath)

    // Security: only allow deletion within buildDir or sometimesAppPath
    const allowedDirs = [this.config.buildDir, this.config.sometimesAppPath].filter(Boolean)
    const isAllowed = allowedDirs.some((dir) => resolved.startsWith(resolve(dir)))
    if (!isAllowed) {
      return { success: false, error: 'Path is outside allowed directories' }
    }

    // Only allow .ipa / .aab files
    if (!resolved.endsWith('.ipa') && !resolved.endsWith('.aab')) {
      return { success: false, error: 'Only .ipa and .aab files can be deleted' }
    }

    if (!existsSync(resolved)) {
      return { success: false, error: 'File not found' }
    }

    try {
      // Delete artifact
      unlinkSync(resolved)

      // Delete companion .meta.json if present
      const metaPath = resolved + '.meta.json'
      if (existsSync(metaPath)) {
        unlinkSync(metaPath)
      }

      // Remove parent directory if it's now empty (only within buildDir subdirectories)
      const parentDir = dirname(resolved)
      const buildDirResolved = resolve(this.config.buildDir)
      if (parentDir !== buildDirResolved && parentDir.startsWith(buildDirResolved)) {
        try {
          const remaining = readdirSync(parentDir)
          if (remaining.length === 0) {
            rmdirSync(parentDir)
          }
        } catch { /* ignore */ }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  stop(): void {
    for (const proc of this.processes) {
      proc.kill('SIGTERM')
    }
    this.processes = []
  }
}
