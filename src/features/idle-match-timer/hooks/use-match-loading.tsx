import { create } from "zustand";

type StoreStates = {
  loading: boolean;
  rematchingLoading: boolean;
  onLoading: () => void;
  finishLoading: () => void;
  finishRematching: () => void;
};

export const useMatchLoading = create<StoreStates>((set) => ({
  loading: false,
  rematchingLoading: false,
  onLoading: () => set({ loading: true, rematchingLoading: true }),
  finishLoading: () => set({ loading: false }),
  finishRematching: () => set({ rematchingLoading: false }),
}));
