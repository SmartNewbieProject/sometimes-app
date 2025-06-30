import { create } from "zustand";
import { InterestSteps, phaseCount } from "../services";

interface Store {
  step: InterestSteps;
  updateStep: (step: InterestSteps) => void;
  progress: number;
}

export const useInterestStep = create<Store>((set) => ({
  progress: 1 / phaseCount,
  step: InterestSteps.AGE,
  updateStep: step => {
    const isLast = step === phaseCount;
    return set({
      step,
      progress: isLast ? 1 : step / phaseCount,
    })
  },
}));
