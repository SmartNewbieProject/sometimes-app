import MyInfo from "@/src/features/my-info";
import type { Preferences } from "@/src/features/my-info/api";
import { PreferenceSlider, FormSection } from "@/src/shared/ui";
import React from "react";
import { useTranslation } from 'react-i18next';
import { StyleSheet } from "react-native";

const { hooks, queries } = MyInfo;
const { useMyInfoForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

function ProfileMilitary() {
  const { updateForm, militaryStatus } = useMyInfoForm();
  const { t } = useTranslation();

  const {
    data: preferencesArray = [{ typeCode: "", typeName: "", options: [] }],
    isLoading: optionsLoading,
  } = usePreferenceOptionsQuery();

  const preferences: Preferences =
    preferencesArray?.find(
      (item) => item.typeCode === PreferenceKeys.MILITARY_STATUS ||
                item.typeCode === "MILITARY_STATUS_MALE" ||
                item.typeCode === "MILITARY_STATUS_FEMALE"
    ) ?? preferencesArray[0];

  return (
    <FormSection
      title={t("features.profile-edit.ui.profile.military.title")}
      showDivider={false}
      containerStyle={styles.container}
    >
      <PreferenceSlider
        preferences={preferences}
        value={militaryStatus}
        onChange={(option) => updateForm("militaryStatus", option)}
        isLoading={optionsLoading}
        loadingTitle={t("features.profile-edit.ui.profile.military.loading")}
        middleLabelLeft={-10}
      />
    </FormSection>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
});

export default ProfileMilitary;
