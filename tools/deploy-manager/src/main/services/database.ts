import Database from 'better-sqlite3'
import { app } from 'electron'
import { existsSync, readFileSync, renameSync, mkdirSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

// ── Interfaces (re-exported from config-store) ──

export interface ReviewInfo {
  contactFirstName: string
  contactLastName: string
  contactEmail: string
  contactPhone: string
  demoAccountName: string
  demoAccountPassword: string
  demoAccountRequired: boolean
  reviewNotes: string
  attachmentPath: string
}

export interface AppConfig {
  sometimesAppPath: string
  ios: {
    appId: string
    bundleId: string
    ascApiKeyId: string
    ascApiKeyIssuerId: string
    ascApiKeyPath: string
    review: ReviewInfo
  }
  android: {
    packageName: string
    serviceAccountPath: string
    track: string
  }
  buildDir: string
  monitorInterval: number
  openaiApiKey: string
}

export interface DeployHistoryEntry {
  id: string
  version: string
  buildNumber: string
  date: string
  iosStatus: string
  androidStatus: string
}

export interface BuildSession {
  id: number
  platform: string
  profile: string
  startedAt: number
  finishedAt: number | null
  status: 'running' | 'completed' | 'failed'
}

export interface BuildLogEntry {
  id: number
  sessionId: number
  line: string
  type: 'info' | 'warn' | 'error' | 'success'
  seq: number
  loggedAt: number
}

export interface BuildLogQuery {
  sessionId?: number
  platform?: string
  type?: string
  keyword?: string
  dateFrom?: number
  dateTo?: number
  limit?: number
  offset?: number
}

// ── Default Config ──

const DEFAULT_CONFIG: AppConfig = {
  sometimesAppPath: '/Users/user/projects/sometimes-app',
  ios: {
    appId: '6746120889',
    bundleId: 'com.some-in-univ',
    ascApiKeyId: '',
    ascApiKeyIssuerId: '',
    ascApiKeyPath: '',
    review: {
      contactFirstName: 'JUNYEONG',
      contactLastName: 'JEON',
      contactEmail: 'smartnewb2@gmail.com',
      contactPhone: '+821057051328',
      demoAccountName: 'AppleConnect',
      demoAccountPassword: '',
      demoAccountRequired: true,
      reviewNotes: `CRITICAL: Our Demo Login Process (PLEASE FOLLOW THIS EXACTLY)
Our app has a dedicated Apple Review demo mode that bypasses all standard authentication. Please follow ONE of these two methods:
Method 1: Logo Long Press

Open the app
Long press the top logo for 3+ seconds
A demo login modal will appear
Enter "AppleConnect" (exactly as written)
This grants full access to all app features

Method 2: Review Account Button

Open the app
Tap "Log in with Review Account" at the bottom of the screen
A demo login modal will appear
Enter "AppleConnect" (exactly as written)
This grants full access to all app features

Guideline 2.1 - Performance - App Completeness

Apple Sign-In Error Fixed: Resolved authentication token handling issues and tested on iPhone 13 mini and iPad Air (5th generation) running iOS 18.6.1.

Guideline 1.2 - Safety - User Generated Content

User Blocking System: Implemented complete blocking mechanism preventing future matches and displaying "Communication with this user is restricted" message.
Content Moderation: Added reporting system with 24-hour response commitment and updated EULA.

Guideline 2.3.6 - Performance - Accurate Metadata

Age Rating Updated: Set "Mature or Suggestive Themes" to "Frequent" and used "Override to Higher Age Rating" option for 18+ rating.

Additional Metadata Updates

Platform References: Removed all references to other platforms (Android) from our app metadata, promotional text, and "What's New" descriptions.
Camera Permissions: Updated the camera permission request message to clearly explain that camera access is required for profile photo capture, including specific examples of how users can take photos directly within the app to create their dating profiles.
Screenshots: Uploaded new screenshots that accurately reflect the app's appearance on each supported device without any stretched or modified images.

Revised Login Instructions
For App Review Access:

Press and hold the app logo
Enter "AppleConnect"
Automatic login with full feature access

A demonstration video has been included.
Previous Compliance Updates from Version 2.1.7
Regarding Guideline 4.8 - Design - Login Services:
We have implemented an additional login option that complies with all requirements specified in guideline 4.8. The new login service:

Limits data collection to only the user's name and email address
Allows users to keep their email address private from all parties during account setup
Does not collect app interactions for advertising purposes without explicit user consent

This login option is now available alongside our existing third-party login service, providing users with a privacy-focused alternative that meets all the specified requirements.
Regarding Guideline 3.1.1 - Business - Payments - In-App Purchase:
We have fully implemented Apple's In-App Purchase system using the StoreKit framework:

All "구슬" (virtual currency) purchases now exclusively use Apple's In-App Purchase
Removed all alternative payment mechanisms for digital content
All paid digital content and services are now only available through Apple's approved payment system

All these changes have been thoroughly tested and are ready for review. We believe our app now fully complies with all App Store guidelines and provides a safe, appropriate experience for our users.
We appreciate your guidance in helping us improve our app and look forward to your approval of this updated submission.`,
      attachmentPath: '/Volumes/eungu/media/apple-review-login-demo.mp4'
    }
  },
  android: {
    packageName: 'com.smartnewb.sometimes',
    serviceAccountPath: '',
    track: 'production'
  },
  buildDir: '/Volumes/eungu/build/sometimes',
  monitorInterval: 300000,
  openaiApiKey: ''
}

// ── Line Classifier ──

export function classifyLine(line: string): BuildLogEntry['type'] {
  if (line.includes('error') || line.includes('Error') || line.includes('failed')) return 'error'
  if (line.includes('warn') || line.includes('Warning')) return 'warn'
  if (line.includes('completed') || line.includes('success') || line.includes('done')) return 'success'
  return 'info'
}

// ── Database Class ──

class DeployDatabase {
  private _db: Database.Database
  private insertLogStmt: Database.Statement

  constructor() {
    const userDataPath = app?.getPath?.('userData') ?? join(process.cwd(), '.data')
    if (!existsSync(userDataPath)) mkdirSync(userDataPath, { recursive: true })

    const dbPath = join(userDataPath, 'deploy-manager.db')
    this._db = new Database(dbPath)

    // Pragmas
    this._db.pragma('journal_mode = WAL')
    this._db.pragma('foreign_keys = ON')

    this.migrate()
    this.importLegacyData(userDataPath)

    // Prepared statement cache for hot path
    this.insertLogStmt = this._db.prepare(
      `INSERT INTO build_logs (session_id, line, type, seq, logged_at)
       VALUES (@sessionId, @line, @type, @seq, @loggedAt)`
    )
  }

  // ── Schema Migration ──

  private migrate(): void {
    this._db.exec(`
      CREATE TABLE IF NOT EXISTS config (
        id      INTEGER PRIMARY KEY CHECK (id = 1),
        data    TEXT    NOT NULL,
        updated INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS deploy_history (
        id             TEXT    PRIMARY KEY,
        version        TEXT    NOT NULL,
        build_number   TEXT    NOT NULL,
        date           TEXT    NOT NULL,
        ios_status     TEXT    NOT NULL DEFAULT '',
        android_status TEXT    NOT NULL DEFAULT '',
        created_at     INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS build_sessions (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        platform    TEXT NOT NULL,
        profile     TEXT NOT NULL,
        started_at  INTEGER NOT NULL,
        finished_at INTEGER,
        status      TEXT NOT NULL DEFAULT 'running'
      );

      CREATE TABLE IF NOT EXISTS build_logs (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL REFERENCES build_sessions(id) ON DELETE CASCADE,
        line       TEXT    NOT NULL,
        type       TEXT    NOT NULL DEFAULT 'info',
        seq        INTEGER NOT NULL,
        logged_at  INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_deploy_history_created
        ON deploy_history(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_build_logs_session_seq
        ON build_logs(session_id, seq);
      CREATE INDEX IF NOT EXISTS idx_build_logs_type
        ON build_logs(type);
    `)
  }

  // ── Legacy JSON Migration ──

  private importLegacyData(userDataPath: string): void {
    const configPath = join(userDataPath, 'config.json')
    const historyPath = join(userDataPath, 'deploy-history.json')

    // Migrate config.json
    if (existsSync(configPath)) {
      try {
        const raw = readFileSync(configPath, 'utf-8')
        const data = JSON.parse(raw) as AppConfig
        // Only import if config table is empty
        const existing = this._db.prepare('SELECT COUNT(*) as cnt FROM config').get() as { cnt: number }
        if (existing.cnt === 0) {
          this._db.prepare(
            'INSERT INTO config (id, data, updated) VALUES (1, ?, ?)'
          ).run(JSON.stringify({ ...DEFAULT_CONFIG, ...data }), Date.now())
        }
        renameSync(configPath, configPath + '.migrated')
      } catch {
        // ignore parse errors
      }
    }

    // Migrate deploy-history.json
    if (existsSync(historyPath)) {
      try {
        const raw = readFileSync(historyPath, 'utf-8')
        const entries = JSON.parse(raw) as DeployHistoryEntry[]
        const existing = this._db.prepare('SELECT COUNT(*) as cnt FROM deploy_history').get() as { cnt: number }
        if (existing.cnt === 0 && entries.length > 0) {
          const insert = this._db.prepare(
            `INSERT OR IGNORE INTO deploy_history (id, version, build_number, date, ios_status, android_status, created_at)
             VALUES (@id, @version, @buildNumber, @date, @iosStatus, @androidStatus, @createdAt)`
          )
          const tx = this._db.transaction((items: DeployHistoryEntry[]) => {
            for (const e of items) {
              insert.run({
                id: e.id,
                version: e.version,
                buildNumber: e.buildNumber,
                date: e.date,
                iosStatus: e.iosStatus || '',
                androidStatus: e.androidStatus || '',
                createdAt: new Date(e.date).getTime() || Date.now()
              })
            }
          })
          tx(entries)
        }
        renameSync(historyPath, historyPath + '.migrated')
      } catch {
        // ignore parse errors
      }
    }
  }

  // ── Config CRUD ──

  getConfig(): AppConfig {
    const row = this._db.prepare('SELECT data FROM config WHERE id = 1').get() as { data: string } | undefined
    if (!row) return { ...DEFAULT_CONFIG }
    try {
      const stored = JSON.parse(row.data)
      const merged = { ...DEFAULT_CONFIG, ...stored }
      // Deep merge nested objects so DEFAULT_CONFIG defaults fill gaps
      merged.ios = { ...DEFAULT_CONFIG.ios, ...stored.ios }
      merged.ios.review = { ...DEFAULT_CONFIG.ios.review, ...(stored.ios?.review || {}) }
      merged.android = { ...DEFAULT_CONFIG.android, ...stored.android }
      return merged
    } catch {
      return { ...DEFAULT_CONFIG }
    }
  }

  setConfig(partial: Partial<AppConfig>): AppConfig {
    const current = this.getConfig()
    const merged = { ...current, ...partial }
    // Deep merge nested objects
    if (partial.ios) {
      merged.ios = { ...current.ios, ...partial.ios }
      if (partial.ios.review) merged.ios.review = { ...current.ios.review, ...partial.ios.review }
    }
    if (partial.android) merged.android = { ...current.android, ...partial.android }

    const json = JSON.stringify(merged)
    this._db.prepare(
      `INSERT INTO config (id, data, updated) VALUES (1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated = excluded.updated`
    ).run(json, Date.now())
    return merged
  }

  // ── Deploy History CRUD ──

  getDeployHistory(): DeployHistoryEntry[] {
    const rows = this._db.prepare(
      `SELECT id, version, build_number as buildNumber, date, ios_status as iosStatus, android_status as androidStatus
       FROM deploy_history ORDER BY created_at DESC`
    ).all()
    return rows as DeployHistoryEntry[]
  }

  addDeployHistory(entry: DeployHistoryEntry): void {
    this._db.prepare(
      `INSERT OR REPLACE INTO deploy_history (id, version, build_number, date, ios_status, android_status, created_at)
       VALUES (@id, @version, @buildNumber, @date, @iosStatus, @androidStatus, @createdAt)`
    ).run({
      id: entry.id,
      version: entry.version,
      buildNumber: entry.buildNumber,
      date: entry.date,
      iosStatus: entry.iosStatus || '',
      androidStatus: entry.androidStatus || '',
      createdAt: new Date(entry.date).getTime() || Date.now()
    })
  }

  // ── Build Sessions ──

  createBuildSession(platform: string, profile: string): number {
    const result = this._db.prepare(
      `INSERT INTO build_sessions (platform, profile, started_at, status)
       VALUES (?, ?, ?, 'running')`
    ).run(platform, profile, Date.now())
    return Number(result.lastInsertRowid)
  }

  finishBuildSession(id: number, status: 'completed' | 'failed'): void {
    this._db.prepare(
      'UPDATE build_sessions SET finished_at = ?, status = ? WHERE id = ?'
    ).run(Date.now(), status, id)
  }

  getSessions(limit = 50): BuildSession[] {
    const rows = this._db.prepare(
      `SELECT id, platform, profile,
              started_at as startedAt, finished_at as finishedAt, status
       FROM build_sessions ORDER BY started_at DESC LIMIT ?`
    ).all(limit)
    return rows as BuildSession[]
  }

  // ── Build Logs ──

  insertBuildLog(sessionId: number, line: string, seq: number): void {
    this.insertLogStmt.run({
      sessionId,
      line,
      type: classifyLine(line),
      seq,
      loggedAt: Date.now()
    })
  }

  queryBuildLogs(query: BuildLogQuery): { rows: BuildLogEntry[]; total: number } {
    const conditions: string[] = []
    const params: Record<string, unknown> = {}

    if (query.sessionId != null) {
      conditions.push('bl.session_id = @sessionId')
      params.sessionId = query.sessionId
    }
    if (query.platform) {
      conditions.push('bs.platform = @platform')
      params.platform = query.platform
    }
    if (query.type) {
      conditions.push('bl.type = @type')
      params.type = query.type
    }
    if (query.keyword) {
      conditions.push('bl.line LIKE @keyword')
      params.keyword = `%${query.keyword}%`
    }
    if (query.dateFrom != null) {
      conditions.push('bl.logged_at >= @dateFrom')
      params.dateFrom = query.dateFrom
    }
    if (query.dateTo != null) {
      conditions.push('bl.logged_at <= @dateTo')
      params.dateTo = query.dateTo
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const limit = query.limit ?? 200
    const offset = query.offset ?? 0

    const countRow = this._db.prepare(
      `SELECT COUNT(*) as total FROM build_logs bl
       JOIN build_sessions bs ON bl.session_id = bs.id ${where}`
    ).get(params) as { total: number }

    const rows = this._db.prepare(
      `SELECT bl.id, bl.session_id as sessionId, bl.line, bl.type, bl.seq,
              bl.logged_at as loggedAt
       FROM build_logs bl
       JOIN build_sessions bs ON bl.session_id = bs.id
       ${where}
       ORDER BY bl.session_id DESC, bl.seq ASC
       LIMIT @limit OFFSET @offset`
    ).all({ ...params, limit, offset })

    return { rows: rows as BuildLogEntry[], total: countRow.total }
  }

  // ── Git History Import ──

  importFromGit(appPath: string): number {
    if (!existsSync(appPath)) return 0

    let output: string
    try {
      // Get commits that changed app.config.ts, with the version info from each commit
      output = execSync(
        'git log --all --pretty=format:"%H|%aI" -- app.config.ts',
        { cwd: appPath, encoding: 'utf-8', timeout: 30000 }
      )
    } catch {
      return 0
    }

    const lines = output.trim().split('\n').filter(Boolean)
    if (lines.length === 0) return 0

    let imported = 0

    const insert = this._db.prepare(
      `INSERT OR IGNORE INTO deploy_history (id, version, build_number, date, ios_status, android_status, created_at)
       VALUES (@id, @version, @buildNumber, @date, @iosStatus, @androidStatus, @createdAt)`
    )

    const tx = this._db.transaction((entries: Array<{ hash: string; date: string }>) => {
      for (const { hash, date } of entries) {
        let fileContent: string
        try {
          fileContent = execSync(`git show ${hash}:app.config.ts`, {
            cwd: appPath,
            encoding: 'utf-8',
            timeout: 5000
          })
        } catch {
          continue
        }

        // Parse version from app.config.ts content
        const versionMatch = fileContent.match(/version\s*[:=]\s*['"]([^'"]+)['"]/)
        const buildMatch = fileContent.match(/(?:buildNumber|versionCode)\s*[:=]\s*['"]?(\d+)['"]?/)

        if (!versionMatch) continue

        const version = versionMatch[1]
        const buildNumber = buildMatch?.[1] || ''
        const id = `git-${version}-${buildNumber || hash.slice(0, 7)}`

        const result = insert.run({
          id,
          version,
          buildNumber,
          date,
          iosStatus: '',
          androidStatus: '',
          createdAt: new Date(date).getTime()
        })

        if (result.changes > 0) imported++
      }
    })

    const entries = lines.map((line) => {
      const [hash, date] = line.split('|')
      return { hash, date }
    })

    tx(entries)
    return imported
  }

  // ── Lifecycle ──

  close(): void {
    this._db.close()
  }
}

// ── Singleton Export ──

export const db = new DeployDatabase()
