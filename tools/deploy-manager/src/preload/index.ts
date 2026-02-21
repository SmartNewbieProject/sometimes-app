import { contextBridge, ipcRenderer } from 'electron'

export type DeployManagerAPI = typeof api

const api = {
  // Config
  config: {
    get: () => ipcRenderer.invoke('config:get'),
    set: (partial: Record<string, unknown>) => ipcRenderer.invoke('config:set', partial)
  },

  // Version
  version: {
    read: () => ipcRenderer.invoke('version:read'),
    increment: (type: 'patch' | 'minor' | 'major') => ipcRenderer.invoke('version:increment', type)
  },

  // Build
  build: {
    start: (opts: { platform: string; profile: string }) => ipcRenderer.invoke('build:start', opts),
    stop: () => ipcRenderer.invoke('build:stop'),
    artifacts: () => ipcRenderer.invoke('build:artifacts'),
    deleteArtifact: (path: string) => ipcRenderer.invoke('build:delete-artifact', path),
    deleteArtifacts: (paths: string[]) => ipcRenderer.invoke('build:delete-artifacts', paths),
    onLog: (cb: (data: { sessionId: number; line: string }) => void) => {
      const handler = (_: unknown, data: { sessionId: number; line: string }) => cb(data)
      ipcRenderer.on('build:log', handler)
      return () => ipcRenderer.removeListener('build:log', handler)
    },
    onProgress: (cb: (data: unknown) => void) => {
      const handler = (_: unknown, data: unknown) => cb(data)
      ipcRenderer.on('build:progress', handler)
      return () => ipcRenderer.removeListener('build:progress', handler)
    },
    onDone: (cb: (result: unknown) => void) => {
      const handler = (_: unknown, result: unknown) => cb(result)
      ipcRenderer.on('build:done', handler)
      return () => ipcRenderer.removeListener('build:done', handler)
    },
    onError: (cb: (err: string) => void) => {
      const handler = (_: unknown, err: string) => cb(err)
      ipcRenderer.on('build:error', handler)
      return () => ipcRenderer.removeListener('build:error', handler)
    },
    queryLogs: (query: Record<string, unknown>) => ipcRenderer.invoke('build:log-query', query),
    getSessions: (limit?: number) => ipcRenderer.invoke('build:sessions', limit)
  },

  // Deploy
  deploy: {
    ios: (opts: { version: string; buildNumber?: string; releaseNotes: Record<string, string> }) =>
      ipcRenderer.invoke('deploy:ios', opts),
    android: (opts: { aabPath: string; releaseNotes: Record<string, string>; version?: string }) =>
      ipcRenderer.invoke('deploy:android', opts),
    releaseIos: () => ipcRenderer.invoke('deploy:release-ios'),
    releaseAndroid: () => ipcRenderer.invoke('deploy:release-android'),
    generateReleaseNotes: (sinceTag?: string) =>
      ipcRenderer.invoke('release-notes:generate', sinceTag),
    generateReleaseNotesAI: (sinceTag?: string) =>
      ipcRenderer.invoke('release-notes:ai-generate', sinceTag),
    onProgress: (cb: (data: unknown) => void) => {
      const handler = (_: unknown, data: unknown) => cb(data)
      ipcRenderer.on('deploy:progress', handler)
      return () => ipcRenderer.removeListener('deploy:progress', handler)
    }
  },

  // Monitor
  monitor: {
    iosStatus: () => ipcRenderer.invoke('monitor:ios-status'),
    androidStatus: () => ipcRenderer.invoke('monitor:android-status'),
    history: () => ipcRenderer.invoke('monitor:history'),
    saveHistory: (entry: Record<string, unknown>) => ipcRenderer.invoke('monitor:save-history', entry),
    importGitHistory: () => ipcRenderer.invoke('monitor:import-git-history')
  },

  // System
  system: {
    selectFile: (filters?: Array<{ name: string; extensions: string[] }>) =>
      ipcRenderer.invoke('system:select-file', filters),
    selectDirectory: () => ipcRenderer.invoke('system:select-directory'),
    openExternal: (url: string) => ipcRenderer.invoke('system:open-external', url),
    showInFolder: (path: string) => ipcRenderer.invoke('system:show-in-folder', path),
    appVersion: () => ipcRenderer.invoke('system:app-version'),
    onNotification: (cb: (data: { title: string; body: string }) => void) => {
      const handler = (_: unknown, data: { title: string; body: string }) => cb(data)
      ipcRenderer.on('system:notification', handler)
      return () => ipcRenderer.removeListener('system:notification', handler)
    }
  }
}

contextBridge.exposeInMainWorld('api', api)
