import MyInfo from "@/src/features/my-info";
import type { Preferences } from "@/src/features/my-info/api";
import { PreferenceSelector, FormSection } from "@/src/shared/ui";
import { StepIndicator } from "@/src/widgets";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

const { hooks, queries } = MyInfo;
const { useMyInfoForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

function ProfilePersonality() {
  const { t } = useTranslation();
  const { personality, updateForm } = useMyInfoForm();
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
      (item) => item.typeCode === PreferenceKeys.PERSONALITY
    ) ?? preferencesArray[0];

  const onChangeOption = (values: string[]) => {
    if (values.length > 3) {
      return;
    }
    updateForm("personality", values);
  };

  return (
    <FormSection
      title={t("features.profile-edit.ui.profile.personality.title")}
      titleRight={
        <StepIndicator
          length={3}
          step={personality?.length ?? 0}
          dotGap={4}
          dotSize={16}
          style={styles.stepIndicator}
        />
      }
      contentStyle={styles.chipSelector}
    >
      <PreferenceSelector
        preferences={preferences}
        value={personality}
        multiple={true}
        onChange={onChangeOption}
        isLoading={isLoading}
        loadingTitle={t("features.profile-edit.ui.profile.personality.loading")}
        style={{ width: "100%" }}
      />
    </FormSection>
  );
}

const styles = StyleSheet.create({
  chipSelector: {
    marginTop: 16,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  stepIndicator: {
    alignSelf: 'flex-end',
  },
});

export default ProfilePersonality;
