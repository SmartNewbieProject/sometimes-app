import Loading from "@/src/features/loading";
import MyInfo from "@/src/features/my-info";
import type { Preferences } from "@/src/features/my-info/api";
import colors from "@/src/shared/constants/colors";

import { StepSlider } from "@/src/shared/ui";
import React, { useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from "react-native";

const { hooks, services, queries } = MyInfo;
const { useMyInfoForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

interface ProfileMilitaryProps {
  onSliderTouchStart?: () => void;
  onSliderTouchEnd?: () => void;
}

function ProfileMilitary({ onSliderTouchStart, onSliderTouchEnd }: ProfileMilitaryProps) {
  const { updateForm, clear: _, militaryStatus, ...form } = useMyInfoForm();
  const { t } = useTranslation();

  const {
    data: preferencesArray = [{ typeName: "", options: [] }],
    isLoading: optionsLoading,
  } = usePreferenceOptionsQuery();
  const preferences: Preferences =
    preferencesArray?.find(
      (item) => item.typeName === PreferenceKeys.MILITARY_STATUS
    ) ?? preferencesArray[0];
  const index = preferences?.options.findIndex(
    (item) => item.id === militaryStatus?.id
  );

  const currentIndex = index !== undefined && index !== -1 ? index : 0;
  useEffect(() => {
    if (optionsLoading) return;
    if (!militaryStatus && preferences.options[currentIndex]) {
      updateForm("militaryStatus", preferences.options[currentIndex]);
    }
  }, [optionsLoading, preferences.options, currentIndex, militaryStatus]);
  const onChangeOption = (value: number) => {
    if (preferences?.options && preferences.options.length > value) {
      updateForm("militaryStatus", preferences.options[value]);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("features.profile-edit.ui.profile.military.title")}</Text>
      <View style={styles.wrapper}>
        <Loading.Lottie title={t("features.profile-edit.ui.profile.military.loading")} loading={optionsLoading}>
          <StepSlider
            key={`military-${currentIndex || "none"}`}
            min={0}
            defaultValue={currentIndex}
            max={(preferences?.options.length ?? 1) - 1}
            step={1}
            value={currentIndex}
            onChange={onChangeOption}
            middleLabelLeft={-10}
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
});

export default ProfileMilitary;
