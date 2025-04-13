import { create } from 'zustand';

type SignupForm = {
  email: string;
  password: string;
  name: string;
  birthday: string;
  gender: 'female' | 'male';
  universityName: string;
  mbti: string;
  profileImages: string[];
  departmentName: string;
  grade: string;
  studentNumber: string;
  instagramId: string;
}

type StoreProps = {
  progress: number;
  step: SignupSteps;
  updateStep: (step: SignupSteps) => void;
  form: Partial<SignupForm>;
  updateForm: (form: Partial<SignupForm>) => void;
};

export enum SignupSteps {
  TERMS = 1,
  ACCOUNT = 2,
  PERSONAL_INFO = 3,
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
  form: {},
  updateForm: (form) => set({ form }),
}));

export default useSignupProgress;
