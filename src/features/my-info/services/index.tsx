import { type PreferenceSaveBody, savePreferencesApi } from "../apis";
import { useMyInfoForm } from "../hooks/use-my-info-form";
import { PreferenceKeys } from "../queries";

export enum MyInfoSteps {
  INTEREST = 1,
  MBTI = 2,
  PERSONALITY = 3,
  DATING_STYLE = 4,
  DRINKING = 5,
  SMOKING = 6,
  TATTOO = 7,
  MILITARY = 8,
}

export const phaseCount = Object.keys(MyInfoSteps).length / 2;

export type Properties = {
  drinking: string;
  mbti: string;
  datingStyleIds: string[];
  personality: string;
  interestIds: string[];
  militaryStatus?: string;
  smoking: string;
  tattoo: string;
};

export const savePreferences = async (props: Properties) => {
  const body: PreferenceSaveBody = {
    preferences: [
      {
        typeName: PreferenceKeys.DRINKING,
        optionIds: [props.drinking],
      },

      {
        typeName: PreferenceKeys.SMOKING,
        optionIds: [props.smoking],
      },
      {
        typeName: PreferenceKeys.TATTOO,
        optionIds: [props.tattoo],
      },
      {
        typeName: PreferenceKeys.MBTI,
        optionIds: [props.mbti],
      },
      {
        typeName: PreferenceKeys.INTEREST,
        optionIds: props.interestIds,
      },

      {
        typeName: PreferenceKeys.PERSONALITY,
        optionIds: [props.personality],
      },

      {
        typeName: PreferenceKeys.DATING_STYLE,
        optionIds: props.datingStyleIds,
      },
    ],
  };

  if (props.militaryStatus) {
    body.preferences.push({
      typeName: PreferenceKeys.MILITARY_STATUS,
      optionIds: [props.militaryStatus],
    });
  }

  await savePreferencesApi(body);
  useMyInfoForm.getState().clear();
};
