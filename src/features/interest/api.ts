import { axiosClient } from "@/src/shared/libs";
import type { PreferenceOption } from "@/src/types/user";

export type Preferences = {
  typeId: string;
  options: PreferenceOption[];
};

export const getPreferenceOptions = (name: string): Promise<Preferences> =>
  axiosClient.get(`/preferences/options?name=${name}`);
