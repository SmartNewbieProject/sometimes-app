import type { PreferenceOption } from "@/src/types/user";
import { create } from "zustand";

type StoreStates = {
  drinking?: PreferenceOption;
  mbti?: string;
  init: boolean;
  interestIds: string[];
  datingStyleIds: string[];
  militaryStatus?: PreferenceOption;
  personality?: string[];
  smoking?: PreferenceOption;
  tattoo?: PreferenceOption;
};

type StoreProps = {
  updateForm: <T extends keyof StoreStates>(
    propertyName: T,
    data: StoreStates[T]
  ) => void;
  init: boolean;
  clear: () => void;
  initialSnapshot: StoreStates | null;
  setInitialSnapshot: (data: StoreStates) => void;
  hasChanges: () => boolean;
} & StoreStates;

const deepEqual = (obj1: any, obj2: any): boolean => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

export const useMyInfoForm = create<StoreProps>((set, get) => ({
  interestIds: [],
  datingStyleIds: [],
  init: false,
  initialSnapshot: null,
  updateForm: (propertyName, data) => set({ [propertyName]: data }),
  setInitialSnapshot: (data) => set({ initialSnapshot: data }),
  hasChanges: () => {
    const state = get();
    const { initialSnapshot } = state;

    if (!initialSnapshot) return false;

    const currentValues: StoreStates = {
      drinking: state.drinking,
      mbti: state.mbti,
      init: state.init,
      interestIds: state.interestIds,
      datingStyleIds: state.datingStyleIds,
      militaryStatus: state.militaryStatus,
      personality: state.personality,
      smoking: state.smoking,
      tattoo: state.tattoo,
    };

    return !deepEqual(initialSnapshot, currentValues);
  },
  clear: () =>
    set({
      interestIds: [],
      init: false,
      militaryStatus: undefined,
      drinking: undefined,
      tattoo: undefined,
      smoking: undefined,
      personality: undefined,
      mbti: undefined,
      datingStyleIds: [],
      initialSnapshot: null,
    }),
}));
