import React from 'react';
import { create } from 'zustand';


interface ToastStore {
  toast: string | null;
  icon: React.ReactNode | null;
  emitToast: (toast: string, icon?: React.ReactNode) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toast: null,
  icon: null,
  emitToast: (toast, icon) => {
    set({ toast, icon: icon? icon: null })
    
    setTimeout(() => {
      set({ toast: null, icon: null})
    }, 2000)


  }
}))

