import type { PreferenceOption } from "@/src/types/user";
import { create } from "zustand";
import type { AgeOption } from "../types";

type StoreStates = {
  age?: string;
  drinking?: PreferenceOption;
  goodMbti?: string | null;
  badMbti?: string | null;
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
  goodMbti: null,
  badMbti: null,
  updateForm: (propertyName, data) => set({ [propertyName]: data }),
  clear: () =>
    set({
      age: undefined,
      drinking: undefined,
      tattoo: undefined,
      smoking: undefined,
      goodMbti: null,
      personality: undefined,
      badMbti: null,
    }),
}));
