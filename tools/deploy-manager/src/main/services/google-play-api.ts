import { readFileSync, createReadStream, statSync } from 'fs'
import { createSign } from 'crypto'
import https from 'https'

interface GooglePlayConfig {
  packageName: string
  serviceAccountPath: string
  track: string
}

interface ServiceAccountKey {
  client_email: string
  private_key: string
  token_uri: string
}

export interface UploadResult {
  versionCode: number
  sha256: string
}

export interface TrackRelease {
  name: string
  versionCodes: string[]
  status: string
  userFraction?: number
}

export interface TrackStatus {
  track: string
  releases: TrackRelease[]
}

export class GooglePlayAPI {
  private config: GooglePlayConfig
  private accessToken: string | null = null
  private tokenExpiry = 0

  constructor(config: GooglePlayConfig) {
    this.config = config
  }

  private ensureConfigured(): void {
    if (!this.config.serviceAccountPath || !this.config.packageName) {
      throw new Error('Google Play API is not configured. Please set Service Account in Settings.')
    }
  }

  async getAccessToken(): Promise<string> {
    this.ensureConfigured()
    const now = Math.floor(Date.now() / 1000)
    if (this.accessToken && this.tokenExpiry > now + 60) {
      return this.accessToken
    }

    const keyFile: ServiceAccountKey = JSON.parse(
      readFileSync(this.config.serviceAccountPath, 'utf-8')
    )

    // Create JWT for Google OAuth2
    const header = { alg: 'RS256', typ: 'JWT' }
    const payload = {
      iss: keyFile.client_email,
      scope: 'https://www.googleapis.com/auth/androidpublisher',
      aud: keyFile.token_uri || 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600
    }

    const encodedHeader = base64url(JSON.stringify(header))
    const encodedPayload = base64url(JSON.stringify(payload))
    const signingInput = `${encodedHeader}.${encodedPayload}`

    const sign = createSign('RSA-SHA256')
    sign.update(signingInput)
    const signature = base64url(sign.sign(keyFile.private_key))
    const jwt = `${signingInput}.${signature}`

    // Exchange JWT for access token
    const tokenData = await this.postForm('https://oauth2.googleapis.com/token', {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })

    this.accessToken = tokenData.access_token
    this.tokenExpiry = now + (tokenData.expires_in || 3600)
    return this.accessToken!
  }

  async createEdit(): Promise<string> {
    const resp = await this.apiRequest<{ id: string }>(
      'POST',
      `/edits`,
      {}
    )
    return resp.id
  }

  async uploadBundle(editId: string, aabPath: string): Promise<UploadResult> {
    const token = await this.getAccessToken()
    const fileSize = statSync(aabPath).size

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'androidpublisher.googleapis.com',
        port: 443,
        path: `/upload/androidpublisher/v3/applications/${this.config.packageName}/edits/${editId}/bundles?uploadType=media`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/octet-stream',
          'Content-Length': fileSize
        }
      }

      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            const result = JSON.parse(data)
            resolve({
              versionCode: result.versionCode,
              sha256: result.sha256 || ''
            })
          } else {
            reject(new Error(`Upload failed ${res.statusCode}: ${data}`))
          }
        })
      })

      req.on('error', reject)

      const stream = createReadStream(aabPath)
      stream.pipe(req)
    })
  }

  async setTrackRelease(
    editId: string,
    versionCode: number,
    notes: Record<string, string>,
    versionName?: string
  ): Promise<void> {
    const releaseNotes = Object.entries(notes).map(([lang, text]) => ({
      language: lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : 'en-US',
      text
    }))

    await this.apiRequest('PUT', `/edits/${editId}/tracks/${this.config.track}`, {
      track: this.config.track,
      releases: [
        {
          name: versionName || `${versionCode}`,
          versionCodes: [String(versionCode)],
          status: 'draft',
          releaseNotes
        }
      ]
    })
  }

  async commitEdit(editId: string): Promise<void> {
    await this.apiRequest('POST', `/edits/${editId}:commit`, undefined)
  }

  async releaseToProduction(): Promise<void> {
    const editId = await this.createEdit()

    // Get current track info
    const track = await this.apiRequest<{
      track: string
      releases: Array<{
        name: string
        versionCodes: string[]
        status: string
        releaseNotes?: Array<{ language: string; text: string }>
      }>
    }>('GET', `/edits/${editId}/tracks/${this.config.track}`)

    const draftRelease = track.releases?.find((r) => r.status === 'draft')
    if (!draftRelease) {
      try { await this.apiRequest('DELETE', `/edits/${editId}`, undefined) } catch { /* ignore */ }
      throw new Error('출시 가능한 draft 릴리즈가 없습니다')
    }

    // Update draft → completed
    await this.apiRequest('PUT', `/edits/${editId}/tracks/${this.config.track}`, {
      track: this.config.track,
      releases: [
        {
          ...draftRelease,
          status: 'completed'
        }
      ]
    })

    await this.commitEdit(editId)
  }

  async getTrackStatus(): Promise<TrackStatus | null> {
    try {
      const token = await this.getAccessToken()
      const editId = await this.createEdit()

      const resp = await this.apiRequest<{
        track: string
        releases: Array<{
          name: string
          versionCodes: string[]
          status: string
          userFraction?: number
        }>
      }>('GET', `/edits/${editId}/tracks/${this.config.track}`)

      // Don't commit, just delete the edit
      try {
        await this.apiRequest('DELETE', `/edits/${editId}`, undefined)
      } catch {
        // Ignore delete errors
      }

      return {
        track: resp.track,
        releases: resp.releases || []
      }
    } catch {
      return null
    }
  }

  private async apiRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = await this.getAccessToken()

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'androidpublisher.googleapis.com',
        port: 443,
        path: `/androidpublisher/v3/applications/${this.config.packageName}${path}`,
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }

      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data ? JSON.parse(data) : ({} as T))
          } else {
            reject(new Error(`Google Play API ${res.statusCode}: ${data}`))
          }
        })
      })

      req.on('error', reject)
      if (body !== undefined) req.write(JSON.stringify(body))
      req.end()
    })
  }

  private postForm(url: string, params: Record<string, string>): Promise<{ access_token: string; expires_in: number }> {
    const body = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')

    const urlObj = new URL(url)

    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: urlObj.hostname,
          port: 443,
          path: urlObj.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(body)
          }
        },
        (res) => {
          let data = ''
          res.on('data', (chunk) => { data += chunk })
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(JSON.parse(data))
            } else {
              reject(new Error(`OAuth2 error ${res.statusCode}: ${data}`))
            }
          })
        }
      )

      req.on('error', reject)
      req.write(body)
      req.end()
    })
  }
}

function base64url(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
