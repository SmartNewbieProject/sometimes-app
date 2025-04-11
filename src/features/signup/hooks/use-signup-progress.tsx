import { create } from 'zustand';


type StoreProps = {
  progress: number;
  step: SignupSteps;
  updateStep: (step: SignupSteps) => void;
};

enum SignupSteps {
  TERMS = 1,
  ACCOUNT = 2,
  PERSON = 3,
  PROFILE_IMAGE = 4,
  UNIVERSITY = 5,
  UNIVERSITY_DETAIL = 6,
}

const phaseCount = Object.keys(SignupSteps).length;

const useSignupProgress = create<StoreProps>((set) => ({
  progress: 1 / phaseCount,
  step: SignupSteps.TERMS,
  updateStep: (step) => {
    const isLast = step === phaseCount;
    return set({
      step,
      progress: isLast ? 1 : step / phaseCount,
    });
  },
}));

export default useSignupProgress;
