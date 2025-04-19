import { useQuery } from "@tanstack/react-query";
import { getPreferenceOptions } from "../api";

export enum PreferenceKeys {
  AGE = "선호 나이대",
  DRINKING = "음주 선호도",
  SMOKING = "흡연 선호도",
  INTEREST = "관심사",
  TATTOO = "문신 선호도"
}

export const usePreferenceOptionsQuery = (name?: PreferenceKeys) =>
  useQuery({
    queryKey: ['preference-options', name],
    queryFn: () => getPreferenceOptions(name!),
    enabled: !!name,
    placeholderData: {
      typeId: '',
      options: [],
    },
  });
