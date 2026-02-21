import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'

class Logger {
  private logPath: string

  constructor() {
    const logDir = join(app?.getPath?.('userData') ?? process.cwd(), 'logs')
    if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true })

    const date = new Date().toISOString().split('T')[0]
    this.logPath = join(logDir, `deploy-${date}.log`)
  }

  info(message: string): void {
    this.write('INFO', message)
  }

  warn(message: string): void {
    this.write('WARN', message)
  }

  error(message: string): void {
    this.write('ERROR', message)
  }

  private write(level: string, message: string): void {
    const timestamp = new Date().toISOString()
    const line = `[${timestamp}] [${level}] ${message}\n`
    try {
      appendFileSync(this.logPath, line)
    } catch {
      // ignore write errors
    }
  }
}

export const logger = new Logger()
