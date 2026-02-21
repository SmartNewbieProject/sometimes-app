import https from 'https'
import { logger } from './logger'

interface SlackBlock {
  type: string
  text?: { type: string; text: string; emoji?: boolean }
  elements?: Array<{ type: string; text: string; emoji?: boolean }>
  fields?: Array<{ type: string; text: string }>
}

interface SlackResponse {
  ok: boolean
  error?: string
}

function post(botToken: string, body: Record<string, unknown>): Promise<SlackResponse> {
  const data = JSON.stringify(body)

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'slack.com',
        path: '/api/chat.postMessage',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${botToken}`,
          'Content-Length': Buffer.byteLength(data)
        }
      },
      (res) => {
        let raw = ''
        res.on('data', (chunk) => (raw += chunk))
        res.on('end', () => {
          try {
            resolve(JSON.parse(raw) as SlackResponse)
          } catch {
            reject(new Error(`Slack API invalid JSON: ${raw.slice(0, 200)}`))
          }
        })
      }
    )

    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

export async function sendSlackMessage(
  botToken: string,
  channelId: string,
  title: string,
  body: string
): Promise<{ ok: boolean; error?: string }> {
  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: title, emoji: true }
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: body }
    },
    {
      type: 'context',
      elements: [{ type: 'mrkdwn', text: `Deploy Manager \u00b7 ${new Date().toLocaleString('ko-KR')}` }]
    }
  ]

  try {
    const resp = await post(botToken, {
      channel: channelId,
      text: `${title}: ${body}`,
      blocks
    })

    if (!resp.ok) {
      logger.error(`Slack API error: ${resp.error}`)
    }
    return resp
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error(`Slack send failed: ${message}`)
    return { ok: false, error: message }
  }
}

export async function sendSlackMonitorAlert(
  botToken: string,
  channelId: string,
  platform: 'ios' | 'android',
  version: string,
  oldState: string,
  newState: string,
  description: string
): Promise<{ ok: boolean; error?: string }> {
  const emoji = platform === 'ios' ? '\uF8FF' : '\ud83e\udd16'
  const platformName = platform === 'ios' ? 'iOS' : 'Android'
  const color = newState.includes('REJECTED') || newState.includes('halted') ? '\ud83d\udd34' : '\ud83d\udfe2'

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `${emoji} ${platformName} ${version}`, emoji: true }
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Status*\n${color} ${description}` },
        { type: 'mrkdwn', text: `*Transition*\n\`${oldState}\` → \`${newState}\`` }
      ]
    },
    {
      type: 'context',
      elements: [{ type: 'mrkdwn', text: `Deploy Manager \u00b7 ${new Date().toLocaleString('ko-KR')}` }]
    }
  ]

  try {
    const resp = await post(botToken, {
      channel: channelId,
      text: `${platformName} ${version}: ${description} (${oldState} → ${newState})`,
      blocks
    })

    if (!resp.ok) {
      logger.error(`Slack monitor alert error: ${resp.error}`)
    }
    return resp
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error(`Slack monitor alert failed: ${message}`)
    return { ok: false, error: message }
  }
}
