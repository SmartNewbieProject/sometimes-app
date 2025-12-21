import { create } from "zustand";
import { devLogWithTag } from "@/src/shared/utils";

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
    devLogWithTag('로딩', 'Start');
    set({ loading: true, rematchingLoading: true });
  },
  finishLoading: () => {
    devLogWithTag('로딩', 'Finish');
    set({ loading: false });
  },
  finishRematching: () => {
    devLogWithTag('로딩', 'Rematch finish');
    set({ rematchingLoading: false });
  },
}));
