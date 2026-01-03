import { type PreferenceSaveBody, savePreferencesApi } from "../apis";
import { useInterestForm } from "../hooks/use-interest-form";
import { PreferenceKeys } from "../queries";

export enum InterestSteps {
  AGE = 1,
  GOODMBTI = 2,
  BADMBTI = 3,
  PERSONALITY = 4,
  DRINKING = 5,
  SMOKING = 6,
  TATTOO = 7,
  MILITARY = 8,
}

export const phaseCount = Object.keys(InterestSteps).length / 2;

export type Properties = {
  age: string;
  drinking: string;
  personality: string[];
  // datingStyleIds: string[];
  militaryPreference?: string;
  militaryStatus?: string;
  smoking: string;
  goodMbti: string | null;
  badMbti: string | null;
  tattoo: string;
};

export const savePreferences = async (props: Properties) => {
  const body: PreferenceSaveBody = {
    additional: {
      goodMbti: props.goodMbti,
      badMbti: props.badMbti,
    },
    preferences: [
      {
        typeName: PreferenceKeys.AGE,
        optionIds: [props.age].filter(Boolean),
      },
      {
        typeName: PreferenceKeys.DRINKING,
        optionIds: [props.drinking].filter(Boolean),
      },

      {
        typeName: PreferenceKeys.SMOKING,
        optionIds: [props.smoking].filter(Boolean),
      },
      {
        typeName: PreferenceKeys.TATTOO,
        optionIds: [props.tattoo].filter(Boolean),
      },

      {
        typeName: PreferenceKeys.PERSONALITY,
        optionIds: props.personality || [],
      },
    ],
  };

  if (props.militaryPreference) {
    body.preferences.push({
      typeName: PreferenceKeys.MILITARY_PREFERENCE,
      optionIds: [props.militaryPreference].filter(Boolean),
    });
  }

  await savePreferencesApi(body);
  useInterestForm.getState().clear();
};
