import { execSync } from 'child_process'

export interface LocalizedNotes {
  'ko': string
  'ja': string
  'en-US': string
}

interface CommitEntry {
  hash: string
  type: string
  scope: string
  subject: string
}

export class ReleaseNotesGenerator {
  constructor(private appPath: string) {}

  async generateWithAI(apiKey: string, sinceTag?: string): Promise<LocalizedNotes> {
    const commits = this.getCommits(sinceTag)
    const commitSummary = commits.map((c) => `${c.type}(${c.scope}): ${c.subject}`).join('\n')

    const prompt = `아래 커밋 메시지를 기반으로 앱 스토어 릴리즈 노트를 작성해주세요.
규칙:
- 코드/기술 용어 없이 일반 사용자가 이해할 수 있는 언어로
- 5줄 이내로 간결하게
- 한국어(ko)와 일본어(ja) 두 가지 언어로 작성
- JSON 형식으로 {"ko": "...", "ja": "..."} 반환

커밋 메시지:
${commitSummary}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        messages: [
          { role: 'developer', content: 'You are a mobile app release notes writer.' },
          { role: 'user', content: prompt }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'release_notes',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                ko: { type: 'string', description: 'Korean release notes' },
                ja: { type: 'string', description: 'Japanese release notes' }
              },
              required: ['ko', 'ja'],
              additionalProperties: false
            }
          }
        }
      })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'OpenAI API error')

    const parsed = JSON.parse(data.choices[0].message.content)
    return {
      ko: parsed.ko || '',
      ja: parsed.ja || '',
      'en-US': ''
    }
  }

  generate(sinceTag?: string): LocalizedNotes {
    const commits = this.getCommits(sinceTag)
    const categorized = this.categorize(commits)

    return {
      'ko': this.formatKo(categorized),
      'ja': this.formatJa(categorized),
      'en-US': this.formatEn(categorized)
    }
  }

  private getCommits(sinceTag?: string): CommitEntry[] {
    const range = sinceTag ? `${sinceTag}..HEAD` : 'HEAD~20..HEAD'

    try {
      const log = execSync(
        `git log ${range} --pretty=format:"%h|%s" --no-merges`,
        { cwd: this.appPath, encoding: 'utf-8' }
      )

      return log
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [hash, ...rest] = line.split('|')
          const subject = rest.join('|')

          // Parse conventional commit: type(scope): message
          const match = subject.match(/^(\w+)(?:\(([^)]*)\))?\s*:\s*(.+)/)
          if (match) {
            return { hash, type: match[1], scope: match[2] || '', subject: match[3] }
          }
          return { hash, type: 'other', scope: '', subject }
        })
    } catch {
      return []
    }
  }

  private categorize(commits: CommitEntry[]): {
    features: CommitEntry[]
    fixes: CommitEntry[]
    improvements: CommitEntry[]
  } {
    const features: CommitEntry[] = []
    const fixes: CommitEntry[] = []
    const improvements: CommitEntry[] = []

    for (const c of commits) {
      switch (c.type) {
        case 'feat':
          features.push(c)
          break
        case 'fix':
          fixes.push(c)
          break
        case 'perf':
        case 'refactor':
        case 'style':
          improvements.push(c)
          break
        // Skip: chore, docs, test, ci
      }
    }

    return { features, fixes, improvements }
  }

  private formatKo(cat: ReturnType<typeof this.categorize>): string {
    const lines: string[] = []

    if (cat.features.length) {
      lines.push('[새로운 기능]')
      for (const c of cat.features) lines.push(`- ${c.subject}`)
      lines.push('')
    }

    if (cat.fixes.length) {
      lines.push('[버그 수정]')
      for (const c of cat.fixes) lines.push(`- ${c.subject}`)
      lines.push('')
    }

    if (cat.improvements.length) {
      lines.push('[개선]')
      for (const c of cat.improvements) lines.push(`- ${c.subject}`)
      lines.push('')
    }

    return lines.join('\n').trim() || '안정성 및 성능이 개선되었습니다.'
  }

  private formatJa(cat: ReturnType<typeof this.categorize>): string {
    const lines: string[] = []

    if (cat.features.length) {
      lines.push('[新機能]')
      for (const c of cat.features) lines.push(`- ${c.subject}`)
      lines.push('')
    }

    if (cat.fixes.length) {
      lines.push('[バグ修正]')
      for (const c of cat.fixes) lines.push(`- ${c.subject}`)
      lines.push('')
    }

    if (cat.improvements.length) {
      lines.push('[改善]')
      for (const c of cat.improvements) lines.push(`- ${c.subject}`)
      lines.push('')
    }

    return lines.join('\n').trim() || '安定性とパフォーマンスが向上しました。'
  }

  private formatEn(cat: ReturnType<typeof this.categorize>): string {
    const lines: string[] = []

    if (cat.features.length) {
      lines.push('[New Features]')
      for (const c of cat.features) lines.push(`- ${c.subject}`)
      lines.push('')
    }

    if (cat.fixes.length) {
      lines.push('[Bug Fixes]')
      for (const c of cat.fixes) lines.push(`- ${c.subject}`)
      lines.push('')
    }

    if (cat.improvements.length) {
      lines.push('[Improvements]')
      for (const c of cat.improvements) lines.push(`- ${c.subject}`)
      lines.push('')
    }

    return lines.join('\n').trim() || 'Stability and performance improvements.'
  }
}
