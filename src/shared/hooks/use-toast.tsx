import React from 'react';
import { create } from 'zustand';


interface ToastStore {
  toast: string | null;
  emitToast: (toast: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toast: null,
  emitToast: (toast) => {
    set({ toast })
    
    setTimeout(() => {
      set({ toast: null})
    }, 2000)


  }
}))

