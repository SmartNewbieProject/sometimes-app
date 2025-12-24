import { create } from "zustand";
import type { SignupForm, SignupResponse } from "../types";

export type { SignupForm };

type StoreProps = {
  progress: number;
  step: SignupSteps;
  showHeader: boolean;
  updateStep: (step: SignupSteps) => void;
  form: Partial<SignupForm>;
  regions: string[];
  updateRegions: (regions: string[]) => void;
  univTitle: string;
  updateUnivTitle: (area: string) => void;
  updateForm: (form: Partial<SignupForm>) => void;
  signupResponse: SignupResponse | null;
  setSignupResponse: (response: SignupResponse | null) => void;
  clear: () => void;

  updateShowHeader: (bool: boolean) => void;
};

export enum SignupSteps {
  // AREA = 1,
  UNIVERSITY = 1,
  UNIVERSITY_DETAIL = 2,
  INSTAGRAM = 3,
  PROFILE_IMAGE = 4,
  INVITE_CODE = 5,
}

const phaseCount = Object.keys(SignupSteps).length / 2;

const useSignupProgress = create<StoreProps>((set) => ({
  progress: 1 / phaseCount,

  step: SignupSteps.UNIVERSITY,
  updateStep: (step) => {
    const isLast = step === phaseCount;
    return set({
      step,
      progress: isLast ? 1 : step / phaseCount,
    });
  },
  regions: [],
  updateRegions: (regions) => set({ regions }),
  form: {},
  updateForm: (form) =>
    set((state) => ({
      form: {
        ...state.form,
        ...form,
      },
    })),
  signupResponse: null,
  setSignupResponse: (response) => set({ signupResponse: response }),
  clear: () =>
    set({
      form: {},
      step: SignupSteps.UNIVERSITY,
      progress: 1 / phaseCount,
      regions: [],
      signupResponse: null,
      univTitle: "",
      showHeader: false,
    }),

  updateShowHeader: (bool) => {
    set({ showHeader: bool });
  },
  showHeader: false,
  univTitle: "",
  updateUnivTitle: (univTitle: string) => set({ univTitle: univTitle }),
}));

export default useSignupProgress;
