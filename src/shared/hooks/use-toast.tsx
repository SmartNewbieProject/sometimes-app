import React from 'react';
import { create } from 'zustand';

const MIN_DURATION = 3000;
const MAX_DURATION = 5000;
const BASE_DURATION = 2500;
const CHAR_READING_TIME = 70;

const calculateToastDuration = (message: string): number => {
  const messageLength = message.length;
  const calculatedDuration = BASE_DURATION + (messageLength * CHAR_READING_TIME);
  return Math.min(Math.max(calculatedDuration, MIN_DURATION), MAX_DURATION);
};

interface ToastStore {
  toast: string | null;
  icon: React.ReactNode | null;
  timeoutId: NodeJS.Timeout | null;
  emitToast: (toast: string, icon?: React.ReactNode, customDuration?: number) => void;
  dismissToast: () => void;
}

export const useToast = create<ToastStore>((set, get) => ({
  toast: null,
  icon: null,
  timeoutId: null,
  emitToast: (toast, icon, customDuration) => {
    const currentTimeoutId = get().timeoutId;
    if (currentTimeoutId) {
      clearTimeout(currentTimeoutId);
    }

    const duration = customDuration ?? calculateToastDuration(toast);

    set({ toast, icon: icon ? icon : null });

    const newTimeoutId = setTimeout(() => {
      set({ toast: null, icon: null, timeoutId: null });
    }, duration);

    set({ timeoutId: newTimeoutId });
  },
  dismissToast: () => {
    const currentTimeoutId = get().timeoutId;
    if (currentTimeoutId) {
      clearTimeout(currentTimeoutId);
    }
    set({ toast: null, icon: null, timeoutId: null });
  }
}))

