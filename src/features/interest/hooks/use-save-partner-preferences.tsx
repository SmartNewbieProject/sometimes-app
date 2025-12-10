import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type PreferenceSaveBody, savePreferencesApi } from "../apis";
import { useInterestForm } from "./use-interest-form";
import { PreferenceKeys } from "../queries";

export type SavePartnerPreferencesParams = {
  age: string;
  drinking: string;
  personality: string[];
  militaryPreference?: string;
  smoking: string;
  goodMbti: string | null;
  badMbti: string | null;
  tattoo: string;
};

const buildPreferencesBody = (params: SavePartnerPreferencesParams): PreferenceSaveBody => {
  const body: PreferenceSaveBody = {
    additional: {
      goodMbti: params.goodMbti,
      badMbti: params.badMbti,
    },
    preferences: [
      {
        typeName: PreferenceKeys.AGE,
        optionIds: [params.age].filter(Boolean),
      },
      {
        typeName: PreferenceKeys.DRINKING,
        optionIds: [params.drinking].filter(Boolean),
      },
      {
        typeName: PreferenceKeys.SMOKING,
        optionIds: [params.smoking].filter(Boolean),
      },
      {
        typeName: PreferenceKeys.TATTOO,
        optionIds: [params.tattoo].filter(Boolean),
      },
      {
        typeName: PreferenceKeys.PERSONALITY,
        optionIds: params.personality || [],
      },
    ],
  };

  if (params.militaryPreference) {
    body.preferences.push({
      typeName: PreferenceKeys.MILITARY_PREFERENCE,
      optionIds: [params.militaryPreference].filter(Boolean),
    });
  }

  return body;
};

export const useSavePartnerPreferencesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SavePartnerPreferencesParams) => {
      const body = buildPreferencesBody(params);
      return savePreferencesApi(body);
    },
    onSuccess: () => {
      useInterestForm.getState().clear();

      queryClient.invalidateQueries({ queryKey: ["my-details"] });
      queryClient.invalidateQueries({ queryKey: ["check-preference-fill"] });
      queryClient.invalidateQueries({ queryKey: ["preference-self"] });
    },
  });
};
