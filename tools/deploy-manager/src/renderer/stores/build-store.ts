import { create } from 'zustand'

export interface BuildLog {
  id: number
  line: string
  type: 'info' | 'warn' | 'error' | 'success'
}

interface BuildState {
  isBuilding: boolean
  logs: BuildLog[]
  progress: { ios: number; android: number }
  status: { ios: string; android: string }
  activeSessionId: number | null

  setBuilding: (v: boolean) => void
  addLog: (data: { sessionId: number; line: string }) => void
  clearLogs: () => void
  setProgress: (platform: string, percent: number, status: string) => void
  reset: () => void
}

let logIdCounter = 0

function classifyLine(line: string): BuildLog['type'] {
  if (line.includes('error') || line.includes('Error') || line.includes('failed')) return 'error'
  if (line.includes('warn') || line.includes('Warning')) return 'warn'
  if (line.includes('completed') || line.includes('success') || line.includes('done')) return 'success'
  return 'info'
}

export const useBuildStore = create<BuildState>((set) => ({
  isBuilding: false,
  logs: [],
  progress: { ios: 0, android: 0 },
  status: { ios: 'idle', android: 'idle' },
  activeSessionId: null,

  setBuilding: (v) => set({ isBuilding: v }),

  addLog: ({ sessionId, line }) =>
    set((s) => ({
      activeSessionId: sessionId,
      logs: [...s.logs, { id: ++logIdCounter, line, type: classifyLine(line) }]
    })),

  clearLogs: () => set({ logs: [] }),

  setProgress: (platform, percent, status) =>
    set((s) => ({
      progress: { ...s.progress, [platform]: percent },
      status: { ...s.status, [platform]: status }
    })),

  reset: () =>
    set({
      isBuilding: false,
      logs: [],
      progress: { ios: 0, android: 0 },
      status: { ios: 'idle', android: 'idle' },
      activeSessionId: null
    })
}))
