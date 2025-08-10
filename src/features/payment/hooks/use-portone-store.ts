import { create } from 'zustand';
import type { CustomData } from '../types';
import { EventType } from '../../event/types';


interface PortoneStore {
  customData: CustomData | null;
  setCustomData: (customData: CustomData) => void;
  gemCount?: number;
  setGemCount: (gemCount: number) => void;
  eventType?: EventType;
  setEventType: (eventType: EventType) => void;
}

export const usePortoneStore = create<PortoneStore>((set, get) => ({
  customData: null,
  setCustomData: (customData: CustomData) => set({ customData }),
  setGemCount: (gemCount: number) => set({ gemCount }),
  setEventType: (eventType: EventType) => set({ eventType }),
}));
