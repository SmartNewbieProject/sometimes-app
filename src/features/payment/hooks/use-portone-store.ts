import { create } from 'zustand';
import type { CustomData } from '../types';


interface PortoneStore {
  customData: CustomData | null;
  setCustomData: (customData: CustomData) => void;
  gemCount?: number;
  setGemCount: (gemCount: number) => void;
}

export const usePortoneStore = create<PortoneStore>((set, get) => ({
  customData: null,
  setCustomData: (customData: CustomData) => set({ customData }),
  setGemCount: (gemCount: number) => set({ gemCount }),
}));
