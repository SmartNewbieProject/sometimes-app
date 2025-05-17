import { create } from 'zustand';
import type { CustomData, Product } from '../types';


interface PortoneStore {
  isInitialized: boolean;
  initialize: (accountID: string) => boolean;
  reset: () => void;
  customData: CustomData | null;
  setCustomData: (customData: CustomData) => void;
}

export const usePortoneStore = create<PortoneStore>((set, get) => ({
  isInitialized: false,
  initialize: (accountID: string) => {
    try {
      if (typeof window === 'undefined' || !window.IMP) {
        console.error('포트원 스크립트가 로드되지 않았습니다.');
        return false;
      }
      if (get().isInitialized) return true;
      
      window.IMP.init(accountID);
      set({ isInitialized: true });
      return true;
    } catch (error) {
      console.error('포트원 초기화 중 오류가 발생했습니다:', error);
      return false;
    }
  },
  reset: () => set({ isInitialized: false }),
  customData: null,
  setCustomData: (customData: CustomData) => set({ customData }),
}));