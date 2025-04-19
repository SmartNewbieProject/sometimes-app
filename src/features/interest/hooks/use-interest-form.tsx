import { PreferenceOption } from "@/src/types/user";
import { AgeOption } from "../ui"
import { create } from "zustand";

type StoreStates = {
  age?: AgeOption;
  drinking?: PreferenceOption;
  interestIds: string[];
  smoking?: PreferenceOption;
  tattoo?: PreferenceOption;
}

type StoreProps = {
  updateForm: <T extends keyof StoreStates>(propertyName: T, data: StoreStates[T]) => void;
  clear: () => void;
} & StoreStates;

export const useInterestForm = create<StoreProps>((set) => ({
  interestIds: [],
  updateForm: (propertyName, data) => set({ [propertyName]: data }),
  clear: () => set({ interestIds: [], age: undefined, drinking: undefined, tattoo: undefined, smoking: undefined }),
}));
