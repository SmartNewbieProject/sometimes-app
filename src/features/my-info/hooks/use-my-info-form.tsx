import type { PreferenceOption } from "@/src/types/user";
import { create } from "zustand";

type StoreStates = {
  drinking?: PreferenceOption;
  mbti?: string;

  interestIds: string[];
  datingStyleIds: string[];
  militaryStatus?: PreferenceOption;
  personalityIds: string[];
  smoking?: PreferenceOption;
  tattoo?: PreferenceOption;
};

type StoreProps = {
  updateForm: <T extends keyof StoreStates>(
    propertyName: T,
    data: StoreStates[T]
  ) => void;
  clear: () => void;
} & StoreStates;

export const useMyInfoForm = create<StoreProps>((set) => ({
  interestIds: [],
  datingStyleIds: [],
  personalityIds: [],
  updateForm: (propertyName, data) => set({ [propertyName]: data }),
  clear: () =>
    set({
      interestIds: [],
      militaryStatus: undefined,
      drinking: undefined,
      tattoo: undefined,
      smoking: undefined,
      mbti: undefined,
      datingStyleIds: [],
    }),
}));
