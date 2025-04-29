import { ImageResources } from "@/src/shared/libs";
import { create } from "zustand";

type StoreStates = {
  uri: string;
  update: (uri: string) => void;
};

export const useMatchingBackground = create<StoreStates>(set => ({
  uri: ImageResources.TIME_CARD_BG,
  update: uri => set({ uri }),
}));

