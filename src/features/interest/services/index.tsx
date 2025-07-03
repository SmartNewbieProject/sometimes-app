import { type PreferenceSaveBody, savePreferencesApi } from "../apis";
import { useInterestForm } from "../hooks";
import { PreferenceKeys } from "../queries";

export enum InterestSteps {
  AGE = 1,
  GOODMBTI = 2,
  BADMBTI = 3,
  DATING_STYLE = 4,
  MILITARY = 5,
  DRIKNING = 6,
  SMOKING = 7,
  TATTOO = 8,
}

export const phaseCount = Object.keys(InterestSteps).length / 2;

export type Properties = {
  age: string;
  drinking: string;

  datingStyleIds: string[];
  militaryPreference?: string;
  militaryStatus?: string;
  smoking: string;
  goodMbti: string;
  badMbti: string;
  tattoo: string;
};

export const savePreferences = async (props: Properties) => {
  const body: PreferenceSaveBody = {
    data: [
      {
        typeName: PreferenceKeys.AGE,
        optionIds: [props.age],
      },
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
        typeName: PreferenceKeys.GOOD_MBTI,
        optionIds: [props.goodMbti],
      },
      {
        typeName: PreferenceKeys.BAD_MBTI,
        optionIds: [props.badMbti],
      },
      {
        typeName: PreferenceKeys.DATING_STYLE,
        optionIds: props.datingStyleIds,
      },
    ],
  };

  if (props.militaryPreference) {
    body.data.push({
      typeName: PreferenceKeys.MILITARY_PREFERENCE,
      optionIds: [props.militaryPreference],
    });
  }

  await savePreferencesApi(body);
  useInterestForm.getState().clear();
};
