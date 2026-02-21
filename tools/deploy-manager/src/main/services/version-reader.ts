import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

export interface VersionInfo {
  version: string
  buildNumber: string
  ios: { buildNumber: string }
  android: { versionCode: number }
}

export class VersionReader {
  constructor(private appPath: string) {}

  read(): VersionInfo {
    const configPath = join(this.appPath, 'app.config.ts')

    if (!existsSync(configPath)) {
      throw new Error(`app.config.ts not found at ${configPath}`)
    }

    const content = readFileSync(configPath, 'utf-8')

    const versionMatch = content.match(/version:\s*['"]([^'"]+)['"]/)
    const iosBuildMatch = content.match(/buildNumber:\s*['"](\d+)['"]/)
    const androidCodeMatch = content.match(/versionCode:\s*(\d+)/)

    return {
      version: versionMatch?.[1] ?? '0.0.0',
      buildNumber: iosBuildMatch?.[1] ?? '0',
      ios: { buildNumber: iosBuildMatch?.[1] ?? '0' },
      android: { versionCode: Number(androidCodeMatch?.[1] ?? 0) }
    }
  }

  increment(type: 'patch' | 'minor' | 'major'): VersionInfo {
    // Try using sometimes-next-version script first
    const scriptPath = join(this.appPath, 'scripts/sometimes-next-version')
    if (existsSync(scriptPath)) {
      try {
        execSync(`chmod +x "${scriptPath}" && "${scriptPath}" ${type}`, {
          cwd: this.appPath,
          encoding: 'utf-8'
        })
        return this.read()
      } catch {
        // Fallback to manual increment
      }
    }

    // Manual version increment
    const current = this.read()
    const parts = current.version.split('.').map(Number)

    switch (type) {
      case 'major':
        parts[0]++
        parts[1] = 0
        parts[2] = 0
        break
      case 'minor':
        parts[1]++
        parts[2] = 0
        break
      case 'patch':
        parts[2]++
        break
    }

    const newVersion = parts.join('.')
    const newBuildNumber = String(Number(current.buildNumber) + 1)
    const newVersionCode = current.android.versionCode + 1

    const configPath = join(this.appPath, 'app.config.ts')
    let content = readFileSync(configPath, 'utf-8')

    content = content.replace(
      /version:\s*['"][^'"]+['"]/,
      `version: '${newVersion}'`
    )
    content = content.replace(
      /buildNumber:\s*['"][^'"]+['"]/,
      `buildNumber: '${newBuildNumber}'`
    )
    content = content.replace(
      /versionCode:\s*\d+/,
      `versionCode: ${newVersionCode}`
    )

    writeFileSync(configPath, content)

    return this.read()
  }
}
