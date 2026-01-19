import type { PreferenceOption } from "@/src/types/user";
import { create } from "zustand";
import type { AgeOption } from "../types";

type StoreStates = {
  age?: string;
  drinking?: PreferenceOption;
  goodMbti?: string | null;
  badMbti?: string | null;
  personality: string[];
  militaryPreference?: PreferenceOption;
  init: boolean;
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
} & StoreStates;

export const useInterestForm = create<StoreProps>((set, get) => ({
  goodMbti: null,
  badMbti: null,
  init: false,
  personality: [],
  initialSnapshot: null,
  updateForm: (propertyName, data) => set({ [propertyName]: data }),
  setInitialSnapshot: (data) => set({ initialSnapshot: data }),
  clear: () =>
    set({
      age: undefined,
      drinking: undefined,
      tattoo: undefined,
      init: false,
      smoking: undefined,
      goodMbti: null,
      personality: [],
      badMbti: null,
      militaryPreference: undefined,
      initialSnapshot: null,
    }),
}));
