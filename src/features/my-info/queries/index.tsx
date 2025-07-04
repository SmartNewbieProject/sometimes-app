import { useQuery } from "@tanstack/react-query";
import { getSelfPreferenceOptions } from "../api";

export enum PreferenceKeys {
  DRINKING = "음주 선호도",
  SMOKING = "흡연 선호도",
  INTEREST = "관심사",
  DATING_STYLE = "연애 스타일",
  MBTI = "MBTI 유형",
  MILITARY_STATUS = "군필 여부",
  PERSONALITY = "성격 유형",
  TATTOO = "문신 선호도",
}

export const usePreferenceOptionsQuery = () =>
  useQuery({
    queryKey: ["self-preference-options"],
    queryFn: () => getSelfPreferenceOptions(),
    placeholderData: [
      {
        typeId: "",
        options: [],
      },
    ],
  });
