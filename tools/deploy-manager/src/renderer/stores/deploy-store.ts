import { create } from 'zustand'

export interface DeployStep {
  key: string
  title: string
  status: 'wait' | 'process' | 'finish' | 'error'
  message?: string
}

interface DeployState {
  isDeploying: boolean
  iosSteps: DeployStep[]
  androidSteps: DeployStep[]
  releaseNotes: { ko: string; ja: string; 'en-US': string }

  setDeploying: (v: boolean) => void
  updateStep: (platform: 'ios' | 'android', stepKey: string, status: DeployStep['status'], message?: string) => void
  setReleaseNotes: (notes: { ko: string; ja: string; 'en-US': string }) => void
  resetSteps: () => void
}

const IOS_STEPS: DeployStep[] = [
  { key: 'waiting', title: '빌드 확인', status: 'wait' },
  { key: 'processing', title: '프로세싱 대기', status: 'wait' },
  { key: 'version', title: '버전 생성', status: 'wait' },
  { key: 'notes', title: '릴리즈 노트', status: 'wait' },
  { key: 'submit', title: '심사 제출', status: 'wait' }
]

const ANDROID_STEPS: DeployStep[] = [
  { key: 'auth', title: '인증', status: 'wait' },
  { key: 'edit', title: 'Edit 생성', status: 'wait' },
  { key: 'upload', title: 'AAB 업로드', status: 'wait' },
  { key: 'track', title: '트랙 설정', status: 'wait' },
  { key: 'commit', title: 'Edit 커밋', status: 'wait' }
]

export const useDeployStore = create<DeployState>((set) => ({
  isDeploying: false,
  iosSteps: IOS_STEPS.map((s) => ({ ...s })),
  androidSteps: ANDROID_STEPS.map((s) => ({ ...s })),
  releaseNotes: { ko: '', ja: '', 'en-US': '' },

  setDeploying: (v) => set({ isDeploying: v }),

  updateStep: (platform, stepKey, status, message) =>
    set((s) => {
      const key = platform === 'ios' ? 'iosSteps' : 'androidSteps'
      return {
        [key]: s[key].map((step) =>
          step.key === stepKey ? { ...step, status, message } : step
        )
      }
    }),

  setReleaseNotes: (notes) => set({ releaseNotes: notes }),

  resetSteps: () =>
    set({
      iosSteps: IOS_STEPS.map((s) => ({ ...s })),
      androidSteps: ANDROID_STEPS.map((s) => ({ ...s })),
      isDeploying: false
    })
}))
