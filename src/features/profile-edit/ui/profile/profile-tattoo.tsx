import Loading from "@/src/features/loading";
import MyInfo from "@/src/features/my-info";
import type { Preferences } from "@/src/features/my-info/api";
import colors from "@/src/shared/constants/colors";

import { StepSlider } from "@/src/shared/ui";
import Tooltip from "@/src/shared/ui/tooltip";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from "react-native";

const { hooks, services, queries } = MyInfo;
const { useMyInfoForm, useMyInfoStep } = hooks;
const { MyInfoSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

interface ProfileTattooProps {
  onSliderTouchStart?: () => void;
  onSliderTouchEnd?: () => void;
}

function ProfileTattoo({ onSliderTouchStart, onSliderTouchEnd }: ProfileTattooProps) {
  const { t } = useTranslation();
  const { updateForm, tattoo, ...form } = useMyInfoForm();

  const tooltips = [
    {
      title: t("apps.my-info.tattoo.tooltip_0_title"),
      description: [
        t("apps.my-info.tattoo.tooltip_0_desc_1"),
        t("apps.my-info.tattoo.tooltip_0_desc_2"),
      ],
    },
    {
      title: t("apps.my-info.tattoo.tooltip_1_title"),
      description: [
        t("apps.my-info.tattoo.tooltip_1_desc_1"),
        t("apps.my-info.tattoo.tooltip_1_desc_2"),
        t("apps.my-info.tattoo.tooltip_1_desc_3"),
      ],
    },
    {
      title: t("apps.my-info.tattoo.tooltip_2_title"),
      description: [
        t("apps.my-info.tattoo.tooltip_2_desc_1"),
        t("apps.my-info.tattoo.tooltip_2_desc_2"),
        t("apps.my-info.tattoo.tooltip_2_desc_3"),
      ],
    },
  ];

  const {
    data: preferencesArray = [
      {
        typeName: "",
        options: [],
      },
    ],
    isLoading: optionsLoading,
  } = usePreferenceOptionsQuery();

  const preferences: Preferences =
    preferencesArray?.find((item) => item.typeName === Keys.TATTOO) ??
    preferencesArray[0];
  const index = preferences?.options.findIndex(
    (item) => item.id === tattoo?.id
  );
  const currentIndex = index !== undefined && index !== -1 ? index : 0;
  useEffect(() => {
    if (optionsLoading) return;
    if (preferences.options.length > 0) {
      updateForm("tattoo", preferences.options[currentIndex]);
    }
  }, [optionsLoading, preferences.options.length, currentIndex]);

  const onChangeTattoo = (value: number) => {
    if (preferences?.options && preferences.options.length > value) {
      updateForm("tattoo", preferences.options[value]);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("features.profile-edit.ui.profile.tattoo.title")}</Text>
      <View style={styles.wrapper}>
        <Loading.Lottie
          title={t("features.profile-edit.ui.profile.tattoo.loading")}
          loading={optionsLoading}
        >
          <StepSlider
            min={0}
            max={(preferences?.options.length ?? 1) - 1}
            step={1}
            showMiddle={true}
            key={`tattoo-${currentIndex || "none"}`}
            defaultValue={currentIndex}
            value={currentIndex}
            middleLabelLeft={-8}
            onChange={onChangeTattoo}
            onTouchStart={onSliderTouchStart}
            onTouchEnd={onSliderTouchEnd}
            options={
              preferences?.options?.map((option) => ({
                label: option.displayName,
                value: option.id,
              })) ?? []
            }
          />
        </Loading.Lottie>
      </View>
      <View style={styles.tooltipContainer}>
        <Tooltip
          title={tooltips[currentIndex]?.title || ""}
          description={tooltips[currentIndex]?.description || []}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    paddingTop: 32,
  },
  title: {
    color: colors.black,
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    fontWeight: 600,

    lineHeight: 22,
  },
  container: {
    paddingHorizontal: 28,
    marginBottom: 24,
  },
  tooltipContainer: {
    marginTop: 24,
  },
});

export default ProfileTattoo;