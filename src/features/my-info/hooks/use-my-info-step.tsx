import { create } from "zustand";
import { MyInfoSteps, phaseCount } from "../services";

interface Store {
  step: MyInfoSteps;
  updateStep: (step: MyInfoSteps) => void;
  progress: number;
}

export const useMyInfoStep = create<Store>((set) => ({
  progress: 1 / phaseCount,
  step: MyInfoSteps.INTEREST,
  updateStep: (step) => {
    const isLast = step === phaseCount;
    return set({
      step,
      progress: isLast ? 1 : step / phaseCount,
    });
  },
}));
