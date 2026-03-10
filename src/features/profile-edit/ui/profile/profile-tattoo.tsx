import MyInfo from "@/src/features/my-info";
import type { Preferences } from "@/src/features/my-info/api";
import colors from "@/src/shared/constants/colors";
import { PreferenceSlider, FormSection } from "@/src/shared/ui";
import React from "react";
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from "react-native";

const SORT_ORDER: Record<string, number> = {
  NONE: 0,
  NONE_STRICT: 0,
  SMALL: 1,
  NO_PREFERENCE: 2,
  OKAY: 3,
};

// key → tooltip 설명 번역키 prefix
const TOOLTIP_PREFIX: Record<string, string> = {
  NONE: "apps.my-info.tattoo.tooltip_0",
  NONE_STRICT: "apps.my-info.tattoo.tooltip_0",
  SMALL: "apps.my-info.tattoo.tooltip_1",
  OKAY: "apps.my-info.tattoo.tooltip_2",
};

const { hooks, queries } = MyInfo;
const { useMyInfoForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

function ProfileTattoo() {
  const { t } = useTranslation();
  const { updateForm, tattoo } = useMyInfoForm();

  const {
    data: preferencesArray = [{ typeCode: "", typeName: "", options: [] }],
    isLoading: optionsLoading,
  } = usePreferenceOptionsQuery();

  const rawPreferences: Preferences =
    preferencesArray?.find((item) => item.typeCode === Keys.TATTOO) ??
    preferencesArray[0];

  // key 기준 정렬
  const sortedOptions = [...rawPreferences.options].sort(
    (a, b) => (SORT_ORDER[a.key ?? ""] ?? 99) - (SORT_ORDER[b.key ?? ""] ?? 99)
  );

  const preferences = { ...rawPreferences, options: sortedOptions };

  // key 기반 tooltip: title은 displayName, description은 번역키
  const tooltips = sortedOptions.map((opt) => {
    const prefix = TOOLTIP_PREFIX[opt.key ?? ""];
    if (!prefix) return { title: opt.displayName, description: [] };
    const descriptions: string[] = [];
    for (let i = 1; i <= 5; i++) {
      const desc = t(`${prefix}_desc_${i}`, { defaultValue: "" });
      if (!desc) break;
      descriptions.push(desc);
    }
    return { title: opt.displayName, description: descriptions };
  });

  return (
    <FormSection
      title={t("features.profile-edit.ui.profile.tattoo.title")}
      showDivider={false}
      containerStyle={styles.container}
    >
      <PreferenceSlider
        preferences={preferences}
        value={tattoo}
        onChange={(option) => updateForm("tattoo", option)}
        isLoading={optionsLoading}
        loadingTitle={t("features.profile-edit.ui.profile.tattoo.loading")}
        showMiddle={true}
        middleLabelLeft={-8}
        tooltips={tooltips}
        showTooltip={true}
        autoSetInitialValue={true}
      />
    </FormSection>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
});

export default ProfileTattoo;
