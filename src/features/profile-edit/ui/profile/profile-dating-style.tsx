import MyInfo from "@/src/features/my-info";
import type { Preferences } from "@/src/features/my-info/api";
import { PreferenceSelector, FormSection } from "@/src/shared/ui";
import { StepIndicator } from "@/src/widgets";
import React from "react";
import { useTranslation } from 'react-i18next';
import { StyleSheet } from "react-native";

const { hooks, queries } = MyInfo;
const { useMyInfoForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

function ProfileDatingStyle() {
  const { datingStyleIds, updateForm } = useMyInfoForm();
  const { t } = useTranslation();
  const {
    data: preferencesArray = [
      {
        typeCode: "",
        typeName: "",
        options: [],
      },
    ],
    isLoading,
  } = usePreferenceOptionsQuery();

  const preferences: Preferences =
    preferencesArray?.find(
      (item) => item.typeCode === PreferenceKeys.DATING_STYLE
    ) ?? preferencesArray[0];

  const onChangeOption = (values: string[]) => {
    if (values.length > 3) {
      return;
    }
    updateForm("datingStyleIds", values);
  };

  return (
    <FormSection
      title={t("features.profile-edit.ui.profile.dating_style.title")}
      titleRight={
        <StepIndicator
          length={3}
          step={datingStyleIds?.length ?? 0}
          dotGap={4}
          dotSize={16}
          style={styles.stepIndicator}
        />
      }
    >
      <PreferenceSelector
        preferences={preferences}
        value={datingStyleIds}
        multiple={true}
        onChange={onChangeOption}
        isLoading={isLoading}
        loadingTitle={t("features.profile-edit.ui.profile.dating_style.loading")}
        style={styles.chipSelector}
      />
    </FormSection>
  );
}

const styles = StyleSheet.create({
  chipSelector: {
    marginTop: 12,
    justifyContent: "flex-start",
  },
  stepIndicator: {
    alignSelf: 'flex-end',
  },
});

export default ProfileDatingStyle;
