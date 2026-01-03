import MyInfo from "@/src/features/my-info";
import type { Preferences } from "@/src/features/my-info/api";
import { PreferenceSlider, FormSection } from "@/src/shared/ui";
import React from "react";
import { useTranslation } from 'react-i18next';
import { StyleSheet } from "react-native";

const { hooks, queries } = MyInfo;
const { useMyInfoForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

interface ProfileSmokingProps {
  onSliderTouchStart?: () => void;
  onSliderTouchEnd?: () => void;
}

function ProfileSmoking({ onSliderTouchStart, onSliderTouchEnd }: ProfileSmokingProps) {
  const { t } = useTranslation();
  const { updateForm, smoking } = useMyInfoForm();

  const tooltips = [
    {
      title: t("apps.my-info.smoking.tooltip_0_title"),
      description: [
        t("apps.my-info.smoking.tooltip_0_desc_1"),
        t("apps.my-info.smoking.tooltip_0_desc_2"),
        t("apps.my-info.smoking.tooltip_0_desc_3"),
      ],
    },
    {
      title: t("apps.my-info.smoking.tooltip_1_title"),
      description: [t("apps.my-info.smoking.tooltip_1_desc_1")],
    },
    {
      title: t("apps.my-info.smoking.tooltip_2_title"),
      description: [t("apps.my-info.smoking.tooltip_2_desc_1")],
    },
  ];

  const {
    data: preferencesArray = [
      {
        typeCode: "",
        typeName: "",
        options: [],
      },
    ],
    isLoading: optionsLoading,
  } = usePreferenceOptionsQuery();

  const preferences: Preferences =
    preferencesArray?.find((item) => item.typeCode === Keys.SMOKING) ??
    preferencesArray[0];

  return (
    <FormSection
      title={t("features.profile-edit.ui.profile.smoking.title")}
      showDivider={false}
      containerStyle={styles.container}
    >
      <PreferenceSlider
        preferences={preferences}
        value={smoking}
        onChange={(option) => updateForm("smoking", option)}
        isLoading={optionsLoading}
        loadingTitle={t("features.profile-edit.ui.profile.smoking.loading")}
        showMiddle={true}
        middleLabelLeft={-10}
        tooltips={tooltips}
        showTooltip={true}
        onSliderTouchStart={onSliderTouchStart}
        onSliderTouchEnd={onSliderTouchEnd}
      />
    </FormSection>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
});

export default ProfileSmoking;