import { create } from 'zustand';

export type SignupForm = {
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

type Agreement = {
  id: string;
  label: string;
  link?: string;
  required: boolean;
  checked: boolean;
}

const AGREEMENTS: Agreement[] = [
  {
    id: 'privacy',
    label: '(필수) 개인정보 수집 및 이용 동의',
    link: 'https://ruby-composer-6d2.notion.site/1cd1bbec5ba180a3a4bbdf9301683145',
    required: true,
    checked: false
  },
  {
    id: 'terms',
    label: '(필수) 서비스 이용약관 동의',
    link: 'https://ruby-composer-6d2.notion.site/1cd1bbec5ba1805dbafbc9426a0aaa80',
    required: true,
    checked: false
  },
  {
    id: 'location',
    label: '(필수) 개인정보 처리방침 동의',
    link: 'https://www.notion.so/1cd1bbec5ba180a3a4bbdf9301683145',
    required: true,
    checked: false
  },
  {
    id: 'sensitive',
    label: '(필수) 민감정보 이용 동의',
    link: 'https://www.notion.so/1cd1bbec5ba180ae800ff36c46285274',
    required: true,
    checked: false
  },
  {
    id: 'marketing',
    label: '(선택) 마케팅 수신 동의',
    link: 'https://www.notion.so/1cd1bbec5ba1800daa29fd7a8d01b7c9',
    required: false,
    checked: false
  }
];

type StoreProps = {
  progress: number;
  step: SignupSteps;
  updateStep: (step: SignupSteps) => void;
  form: Partial<SignupForm>;
  updateForm: (form: Partial<SignupForm>) => void;
  agreements: Agreement[];
  updateAgreements: (agreements: Agreement[]) => void;
  clear: () => void;
};

export enum SignupSteps {
  TERMS = 1,
  ACCOUNT = 2,
  PERSONAL_INFO = 3,
  PROFILE_IMAGE = 4,
  UNIVERSITY = 5,
  UNIVERSITY_DETAIL = 6,
}

const phaseCount = Object.keys(SignupSteps).length / 2;

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
  clear: () => set({ form: {}, step: SignupSteps.TERMS }),

  agreements: AGREEMENTS,
  updateAgreements: (agreements) => set({ agreements }),
}));

export default useSignupProgress;
