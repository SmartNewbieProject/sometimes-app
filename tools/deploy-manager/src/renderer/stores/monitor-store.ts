import { create } from 'zustand'

export interface IOSVersionStatus {
  id: string
  versionString: string
  appStoreState: string
  createdDate: string
}

export interface AndroidTrackStatus {
  track: string
  releases: Array<{
    name: string
    versionCodes: string[]
    status: string
    userFraction?: number
  }>
}

export interface DeployHistoryEntry {
  id: string
  version: string
  buildNumber: string
  date: string
  iosStatus: string
  androidStatus: string
}

interface MonitorState {
  iosStatus: IOSVersionStatus | null
  androidStatus: AndroidTrackStatus | null
  history: DeployHistoryEntry[]
  isLoading: boolean
  lastRefresh: string | null

  setIOSStatus: (s: IOSVersionStatus | null) => void
  setAndroidStatus: (s: AndroidTrackStatus | null) => void
  setHistory: (h: DeployHistoryEntry[]) => void
  setLoading: (v: boolean) => void
  setLastRefresh: () => void
}

export const useMonitorStore = create<MonitorState>((set) => ({
  iosStatus: null,
  androidStatus: null,
  history: [],
  isLoading: false,
  lastRefresh: null,

  setIOSStatus: (s) => set({ iosStatus: s }),
  setAndroidStatus: (s) => set({ androidStatus: s }),
  setHistory: (h) => set({ history: h }),
  setLoading: (v) => set({ isLoading: v }),
  setLastRefresh: () => set({ lastRefresh: new Date().toLocaleTimeString() })
}))
