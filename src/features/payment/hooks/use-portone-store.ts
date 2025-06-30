import { create } from 'zustand';
import type { CustomData } from '../types';


interface PortoneStore {
  customData: CustomData | null;
  setCustomData: (customData: CustomData) => void;
}

export const usePortoneStore = create<PortoneStore>((set, get) => ({
  customData: null,
  setCustomData: (customData: CustomData) => set({ customData }),
}));