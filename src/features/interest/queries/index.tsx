import { PreferenceOption } from "@/src/types/user";
import { useQuery } from "@tanstack/react-query";
import { type Preferences, getPreferenceOptions } from "../api";

export enum PreferenceKeys {
  AGE = "선호 나이대",
  DRINKING = "음주 선호도",
  SMOKING = "흡연 선호도",
  PERSONALITY = "성격",
  INTEREST = "관심사",
  DATING_STYLE = "연애 스타일",
  MILITARY_PREFERENCE = "군필 여부 선호도",
  GOOD_MBTI = "좋아하는 MBTI",
  BAD_MBTI = "싫어하는 MBTI",
  MILITARY_STATUS = "군필 여부",
  TATTOO = "문신 선호도",
}

export const usePreferenceOptionsQuery = () =>
  useQuery<Preferences[]>({
    queryKey: ["preference-options"],
    queryFn: () => getPreferenceOptions(),

    placeholderData: [
      {
        typeName: "",
        options: [],
      },
    ],
  });
