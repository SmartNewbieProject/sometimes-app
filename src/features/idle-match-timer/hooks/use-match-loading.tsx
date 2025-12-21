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
  onLoading: () => {
    console.log('[로딩 상태] onLoading 호출 - loading: true, rematchingLoading: true');
    set({ loading: true, rematchingLoading: true });
  },
  finishLoading: () => {
    console.log('[로딩 상태] finishLoading 호출 - loading: false');
    set({ loading: false });
  },
  finishRematching: () => {
    console.log('[로딩 상태] finishRematching 호출 - rematchingLoading: false');
    set({ rematchingLoading: false });
  },
}));
