import MyInfo from "@/src/features/my-info";
import type { Preferences, PreferenceOption } from "@/src/features/my-info/api";
import { PreferenceSlider, FormSection } from "@/src/shared/ui";
import React, { useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { StyleSheet } from "react-native";

const { hooks, queries } = MyInfo;
const { useMyInfoForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

interface ProfileDrinkingProps {
  onSliderTouchStart?: () => void;
  onSliderTouchEnd?: () => void;
}

function ProfileDrinking({ onSliderTouchStart, onSliderTouchEnd }: ProfileDrinkingProps) {
  const { drinking, updateForm } = useMyInfoForm();
  const { t } = useTranslation();

  const tooltips = [
    {
      title: t("apps.my-info.drinking.tooltip_0_title"),
      description: [
        t("apps.my-info.drinking.tooltip_0_desc_1"),
        t("apps.my-info.drinking.tooltip_0_desc_2"),
        t("apps.my-info.drinking.tooltip_0_desc_3"),
      ],
    },
    {
      title: t("apps.my-info.drinking.tooltip_1_title"),
      description: [
        t("apps.my-info.drinking.tooltip_1_desc_1"),
        t("apps.my-info.drinking.tooltip_1_desc_2"),
      ],
    },
    {
      title: t("apps.my-info.drinking.tooltip_2_title"),
      description: [
        t("apps.my-info.drinking.tooltip_2_desc_1"),
        t("apps.my-info.drinking.tooltip_2_desc_2"),
      ],
    },
    {
      title: t("apps.my-info.drinking.tooltip_3_title"),
      description: [
        t("apps.my-info.drinking.tooltip_3_desc_1"),
        t("apps.my-info.drinking.tooltip_3_desc_2"),
      ],
    },
    {
      title: t("apps.my-info.drinking.tooltip_4_title"),
      description: [
        t("apps.my-info.drinking.tooltip_4_desc_1"),
        t("apps.my-info.drinking.tooltip_4_desc_2"),
      ],
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
    preferencesArray?.find((item) => item.typeCode === Keys.DRINKING) ??
    preferencesArray[0];

  const mapOption = useMemo(() => {
    return (option: PreferenceOption) => ({
      label:
        option.displayName === t("features.profile-edit.ui.profile.drinking.not_drinking_at_all_old")
          ? t("features.profile-edit.ui.profile.drinking.not_drinking_at_all")
          : option.displayName,
      value: option.id,
    });
  }, [t]);

  return (
    <FormSection
      title={t("features.profile-edit.ui.profile.drinking.title")}
      showDivider={false}
      containerStyle={styles.container}
    >
      <PreferenceSlider
        preferences={preferences}
        value={drinking}
        onChange={(option) => updateForm("drinking", option)}
        isLoading={optionsLoading}
        loadingTitle={t("features.profile-edit.ui.profile.drinking.loading")}
        showMiddle={false}
        lastLabelLeft={-50}
        tooltips={tooltips}
        showTooltip={true}
        onSliderTouchStart={onSliderTouchStart}
        onSliderTouchEnd={onSliderTouchEnd}
        mapOption={mapOption}
      />
    </FormSection>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
});

export default ProfileDrinking;
