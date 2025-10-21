import { create } from "zustand";

type StoreStates = {
  step: number;
};

type StoreProps = {
  setStep: (step: number) => void;

  clear: () => void;
} & StoreStates;

export const useStep = create<StoreProps>((set) => ({
  step: 0,

  setStep: (step: number) => {
    set({ step: step });
  },
  clear: () =>
    set({
      step: 0,
    }),
}));
