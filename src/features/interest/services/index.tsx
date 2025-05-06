import { PreferenceSaveBody, savePreferencesApi } from "../apis";
import { useInterestForm } from "../hooks";
import { PreferenceKeys } from "../queries";

export enum InterestSteps {
  AGE = 1,
  DRIKNING = 2,
  INTEREST = 3,
  DATING_STYLE = 4,
  MILITARY = 5,
  SMOKING = 6,
  TATTOO = 7,
}

export const phaseCount = Object.keys(InterestSteps).length / 2;

export type Properties = {
  age: string;
  drinking: string;
  interestIds: string[];
  smoking: string;
  tattoo: string;
}

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
        typeName: PreferenceKeys.INTEREST,
        optionIds: props.interestIds,
      },
      {
        typeName: PreferenceKeys.SMOKING,
        optionIds: [props.smoking],
      },
      {
        typeName: PreferenceKeys.TATTOO,
        optionIds: [props.tattoo]
      }
    ],
  };

  await savePreferencesApi(body);
  useInterestForm.getState().clear();
};
