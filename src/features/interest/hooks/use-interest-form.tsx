import type { PreferenceOption } from "@/src/types/user";
import { create } from "zustand";
import type { AgeOption } from "../types";

type StoreStates = {
  age?: AgeOption;
  drinking?: PreferenceOption;
  goodMbti?: string;
  badMbti?: string;
  personality?: string;
  // interestIds: string[];
  // datingStyleIds: string[];
  militaryPreference?: PreferenceOption;

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

export const useInterestForm = create<StoreProps>((set) => ({
  updateForm: (propertyName, data) => set({ [propertyName]: data }),
  clear: () =>
    set({
      age: undefined,
      drinking: undefined,
      tattoo: undefined,
      smoking: undefined,
      goodMbti: undefined,
      personality: undefined,
      badMbti: undefined,
    }),
}));
