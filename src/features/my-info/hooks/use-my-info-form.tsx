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
} & StoreStates;

export const useMyInfoForm = create<StoreProps>((set) => ({
  interestIds: [],
  datingStyleIds: [],
  init: false,
  updateForm: (propertyName, data) => set({ [propertyName]: data }),
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
    }),
}));
