import { db } from './database'
import type { AppConfig, DeployHistoryEntry } from './database'

// Re-export interfaces for backward compatibility
export type { AppConfig, DeployHistoryEntry }

export class ConfigStore {
  getAll(): AppConfig {
    return db.getConfig()
  }

  update(partial: Partial<AppConfig>): AppConfig {
    return db.setConfig(partial)
  }

  getDeployHistory(): DeployHistoryEntry[] {
    return db.getDeployHistory()
  }

  addDeployHistory(entry: DeployHistoryEntry): void {
    db.addDeployHistory(entry)
  }
}
