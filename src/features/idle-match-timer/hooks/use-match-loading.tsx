import { create } from "zustand";

type StoreStates = {
  loading: boolean;
  onLoading: () => void;
  finishLoading: () => void;
}

export const useMatchLoading = create<StoreStates>(set => ({
  loading: false,
  onLoading: () => set({ loading: true }),
  finishLoading: () => set({ loading: false }),
}));
