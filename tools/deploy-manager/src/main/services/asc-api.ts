import { readFileSync, statSync } from 'fs'
import { createSign, createHash } from 'crypto'
import https from 'https'
import { URL } from 'url'
import { basename } from 'path'
import type { ReviewInfo } from './database'

interface ASCConfig {
  appId: string
  bundleId: string
  ascApiKeyId: string
  ascApiKeyIssuerId: string
  ascApiKeyPath: string
}

export interface Build {
  id: string
  version: string
  processingState: string
  uploadedDate: string
}

export interface BuildStatus {
  processingState: string
}

export interface AppStoreVersion {
  id: string
  versionString: string
  appStoreState: string
}

export interface VersionStatus {
  id: string
  versionString: string
  appStoreState: string
  createdDate: string
}

export class AppStoreConnectAPI {
  private config: ASCConfig
  private token: string | null = null
  private tokenExpiry = 0

  constructor(config: ASCConfig) {
    this.config = config
  }

  private ensureConfigured(): void {
    if (!this.config.ascApiKeyPath || !this.config.ascApiKeyId || !this.config.ascApiKeyIssuerId) {
      throw new Error('App Store Connect API is not configured. Please set API Key in Settings.')
    }
  }

  private generateJWT(): string {
    this.ensureConfigured()
    const now = Math.floor(Date.now() / 1000)

    // Check if token is still valid (with 60s buffer)
    if (this.token && this.tokenExpiry > now + 60) {
      return this.token
    }

    const header = {
      alg: 'ES256',
      kid: this.config.ascApiKeyId,
      typ: 'JWT'
    }

    const payload = {
      iss: this.config.ascApiKeyIssuerId,
      iat: now,
      exp: now + 1200, // 20 minutes
      aud: 'appstoreconnect-v1'
    }

    const encodedHeader = base64url(JSON.stringify(header))
    const encodedPayload = base64url(JSON.stringify(payload))
    const signingInput = `${encodedHeader}.${encodedPayload}`

    const privateKey = readFileSync(this.config.ascApiKeyPath, 'utf-8')
    const sign = createSign('SHA256')
    sign.update(signingInput)

    // ES256 produces DER-encoded signature, need to convert to raw r|s format
    const derSig = sign.sign({ key: privateKey, dsaEncoding: 'ieee-p1363' })
    const signature = base64url(derSig)

    this.token = `${signingInput}.${signature}`
    this.tokenExpiry = now + 1200
    return this.token
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = this.generateJWT()

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.appstoreconnect.apple.com',
        port: 443,
        path: `/v1${path}`,
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
            reject(new Error(`ASC API ${res.statusCode}: ${data}`))
          }
        })
      })

      req.on('error', reject)
      if (body) req.write(JSON.stringify(body))
      req.end()
    })
  }

  async getBuilds(buildNumber: string): Promise<Build[]> {
    const resp = await this.request<{ data: Array<{ id: string; attributes: Record<string, string> }> }>(
      'GET',
      `/builds?filter[app]=${this.config.appId}&filter[version]=${buildNumber}&sort=-uploadedDate&limit=5`
    )

    return resp.data.map((b) => ({
      id: b.id,
      version: b.attributes.version,
      processingState: b.attributes.processingState,
      uploadedDate: b.attributes.uploadedDate
    }))
  }

  async *waitForProcessing(buildId: string): AsyncGenerator<BuildStatus> {
    const maxWait = 30 * 60 * 1000 // 30 minutes
    const interval = 30 * 1000 // 30 seconds
    const start = Date.now()

    while (Date.now() - start < maxWait) {
      const resp = await this.request<{ data: { attributes: { processingState: string } } }>(
        'GET',
        `/builds/${buildId}`
      )

      const state = resp.data.attributes.processingState
      yield { processingState: state }

      if (state === 'VALID' || state === 'FAILED' || state === 'INVALID') {
        return
      }

      await new Promise((r) => setTimeout(r, interval))
    }

    throw new Error('Build processing timeout (30 minutes)')
  }

  async getOrCreateVersion(versionString: string, buildId: string): Promise<AppStoreVersion> {
    // Check existing versions (must access through app relationship)
    const existing = await this.request<{ data: Array<{ id: string; attributes: Record<string, string> }> }>(
      'GET',
      `/apps/${this.config.appId}/appStoreVersions?filter[versionString]=${versionString}&filter[platform]=IOS`
    )

    if (existing.data.length > 0) {
      const ver = existing.data[0]
      const state = ver.attributes.appStoreState
      // Only attach build if version is still editable
      const readOnlyStates = ['WAITING_FOR_REVIEW', 'IN_REVIEW', 'PENDING_DEVELOPER_RELEASE', 'READY_FOR_SALE']
      if (!readOnlyStates.includes(state)) {
        await this.request('PATCH', `/appStoreVersions/${ver.id}/relationships/build`, {
          data: { type: 'builds', id: buildId }
        })
      }
      return {
        id: ver.id,
        versionString: ver.attributes.versionString,
        appStoreState: state
      }
    }

    // Create new version
    const created = await this.request<{ data: { id: string; attributes: Record<string, string> } }>(
      'POST',
      '/appStoreVersions',
      {
        data: {
          type: 'appStoreVersions',
          attributes: {
            versionString,
            platform: 'IOS',
            releaseType: 'MANUAL'
          },
          relationships: {
            app: { data: { type: 'apps', id: this.config.appId } },
            build: { data: { type: 'builds', id: buildId } }
          }
        }
      }
    )

    return {
      id: created.data.id,
      versionString: created.data.attributes.versionString,
      appStoreState: created.data.attributes.appStoreState
    }
  }

  async setReleaseNotes(versionId: string, notes: Record<string, string>): Promise<void> {
    // Get existing localizations
    const existing = await this.request<{ data: Array<{ id: string; attributes: { locale: string } }> }>(
      'GET',
      `/appStoreVersions/${versionId}/appStoreVersionLocalizations`
    )

    const localeMap: Record<string, string> = {}
    for (const loc of existing.data) {
      localeMap[loc.attributes.locale] = loc.id
    }

    // Map our note keys to ASC locale codes (en-US excluded — not submitted to App Store)
    const localeMapping: Record<string, string> = {
      'ko': 'ko',
      'ja': 'ja'
    }

    for (const [noteKey, ascLocale] of Object.entries(localeMapping)) {
      const whatsNew = notes[noteKey]
      if (!whatsNew) continue

      if (localeMap[ascLocale]) {
        // Update existing
        await this.request('PATCH', `/appStoreVersionLocalizations/${localeMap[ascLocale]}`, {
          data: {
            type: 'appStoreVersionLocalizations',
            id: localeMap[ascLocale],
            attributes: { whatsNew }
          }
        })
      } else {
        // Create new
        await this.request('POST', '/appStoreVersionLocalizations', {
          data: {
            type: 'appStoreVersionLocalizations',
            attributes: { locale: ascLocale, whatsNew },
            relationships: {
              appStoreVersion: { data: { type: 'appStoreVersions', id: versionId } }
            }
          }
        })
      }
    }
  }

  async setReviewDetails(versionId: string, reviewInfo: ReviewInfo): Promise<string> {
    // Try to get existing review detail
    const existing = await this.request<{ data: Array<{ id: string }> }>(
      'GET',
      `/appStoreVersions/${versionId}/appStoreReviewDetail`
    ).catch(() => ({ data: [] }))

    const attributes: Record<string, unknown> = {
      contactFirstName: reviewInfo.contactFirstName,
      contactLastName: reviewInfo.contactLastName,
      contactEmail: reviewInfo.contactEmail,
      contactPhone: reviewInfo.contactPhone,
      demoAccountName: reviewInfo.demoAccountName,
      demoAccountPassword: reviewInfo.demoAccountPassword,
      demoAccountRequired: reviewInfo.demoAccountRequired,
      notes: reviewInfo.reviewNotes
    }

    if (existing.data.length > 0) {
      const detailId = existing.data[0].id
      await this.request('PATCH', `/appStoreReviewDetails/${detailId}`, {
        data: {
          type: 'appStoreReviewDetails',
          id: detailId,
          attributes
        }
      })
      return detailId
    }

    const created = await this.request<{ data: { id: string } }>(
      'POST',
      '/appStoreReviewDetails',
      {
        data: {
          type: 'appStoreReviewDetails',
          attributes,
          relationships: {
            appStoreVersion: { data: { type: 'appStoreVersions', id: versionId } }
          }
        }
      }
    )
    return created.data.id
  }

  async uploadReviewAttachment(reviewDetailId: string, filePath: string): Promise<void> {
    // 1. Delete existing attachments
    const existing = await this.request<{ data: Array<{ id: string }> }>(
      'GET',
      `/appStoreReviewDetails/${reviewDetailId}/appStoreReviewAttachments`
    ).catch(() => ({ data: [] }))

    for (const att of existing.data) {
      await this.request('DELETE', `/appStoreReviewAttachments/${att.id}`)
    }

    // 2. Read file and compute checksum
    const fileBuffer = readFileSync(filePath)
    const fileSize = statSync(filePath).size
    const fileName = basename(filePath)
    const md5 = createHash('md5').update(fileBuffer).digest('base64')

    // 3. Reserve attachment (get presigned upload URLs)
    const reserved = await this.request<{
      data: {
        id: string
        attributes: {
          uploadOperations: Array<{
            method: string
            url: string
            length: number
            offset: number
            requestHeaders: Array<{ name: string; value: string }>
          }>
        }
      }
    }>('POST', '/appStoreReviewAttachments', {
      data: {
        type: 'appStoreReviewAttachments',
        attributes: {
          fileName,
          fileSize
        },
        relationships: {
          appStoreReviewDetail: { data: { type: 'appStoreReviewDetails', id: reviewDetailId } }
        }
      }
    })

    const attachmentId = reserved.data.id
    const operations = reserved.data.attributes.uploadOperations

    // 4. Upload binary chunks
    for (const op of operations) {
      const chunk = fileBuffer.subarray(op.offset, op.offset + op.length)
      const headers: Record<string, string> = {}
      for (const h of op.requestHeaders) {
        headers[h.name] = h.value
      }
      await this.uploadBinary(op.url, chunk, headers)
    }

    // 5. Commit upload
    await this.request('PATCH', `/appStoreReviewAttachments/${attachmentId}`, {
      data: {
        type: 'appStoreReviewAttachments',
        id: attachmentId,
        attributes: {
          uploaded: true,
          sourceFileChecksum: md5
        }
      }
    })
  }

  private uploadBinary(url: string, buffer: Buffer, headers: Record<string, string>): Promise<void> {
    return new Promise((resolve, reject) => {
      const parsed = new URL(url)
      const options = {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname + parsed.search,
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Length': buffer.length
        }
      }

      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve()
          } else {
            reject(new Error(`Upload failed ${res.statusCode}: ${data}`))
          }
        })
      })

      req.on('error', reject)
      req.write(buffer)
      req.end()
    })
  }

  async releaseVersion(versionId: string): Promise<void> {
    // Transition from PENDING_DEVELOPER_RELEASE → READY_FOR_SALE
    await this.request('POST', `/appStoreVersionReleaseRequests`, {
      data: {
        type: 'appStoreVersionReleaseRequests',
        relationships: {
          appStoreVersion: { data: { type: 'appStoreVersions', id: versionId } }
        }
      }
    })
  }

  async submitForReview(versionId: string): Promise<void> {
    await this.request('POST', '/appStoreVersionSubmissions', {
      data: {
        type: 'appStoreVersionSubmissions',
        relationships: {
          appStoreVersion: { data: { type: 'appStoreVersions', id: versionId } }
        }
      }
    })
  }

  async getVersionStatus(): Promise<VersionStatus | null> {
    const resp = await this.request<{ data: Array<{ id: string; attributes: Record<string, string> }> }>(
      'GET',
      `/apps/${this.config.appId}/appStoreVersions?limit=1&filter[platform]=IOS`
    )

    if (resp.data.length === 0) return null

    const v = resp.data[0]
    return {
      id: v.id,
      versionString: v.attributes.versionString,
      appStoreState: v.attributes.appStoreState,
      createdDate: v.attributes.createdDate
    }
  }
}

function base64url(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
