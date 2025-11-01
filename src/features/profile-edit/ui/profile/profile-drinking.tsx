import Loading from "@/src/features/loading";
import MyInfo from "@/src/features/my-info";
import type { Preferences } from "@/src/features/my-info/api";
import colors from "@/src/shared/constants/colors";
import { useAppFont } from "@/src/shared/hooks/use-app-font";
import { StepSlider } from "@/src/shared/ui";
import React, { useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from "react-native";

const { hooks, services, queries } = MyInfo;
const { useMyInfoForm, useMyInfoStep } = hooks;

const { MyInfoSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

function ProfileDrinking() {
  const { drinking, updateForm } = useMyInfoForm();
  const { t } = useTranslation();

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
    preferencesArray?.find((item) => item.typeName === Keys.DRINKING) ??
    preferencesArray[0];
  const index = preferences?.options.findIndex(
    (item) => item.id === drinking?.id
  );

  const currentIndex = index !== undefined && index !== -1 ? index : 0;
  useEffect(() => {
    if (optionsLoading) return;
    if (!drinking && preferences.options[currentIndex]) {
      updateForm("drinking", preferences.options[currentIndex]);
    }
  }, [optionsLoading, preferences.options, currentIndex, drinking, updateForm]);

  const onChangeDrinking = (value: number) => {
    if (preferences?.options && preferences.options.length > value) {
      updateForm("drinking", preferences.options[value]);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("features.profile-edit.ui.profile.drinking.title")}</Text>
      <View style={styles.wrapper}>
        <Loading.Lottie
          title={t("features.profile-edit.ui.profile.drinking.loading")}
          loading={optionsLoading}
        >
          <StepSlider
            min={0}
            max={(preferences?.options.length ?? 1) - 1}
            step={1}
            showMiddle={false}
            key={`drinking-${currentIndex || "none"}`}
            defaultValue={currentIndex}
            value={currentIndex}
            onChange={onChangeDrinking}
            lastLabelLeft={-50}
            options={
              preferences?.options
                .map((option) =>
                  option.displayName === t("features.profile-edit.ui.profile.drinking.not_drinking_at_all_old")
                    ? { ...option, displayName: t("features.profile-edit.ui.profile.drinking.not_drinking_at_all") }
                    : option
                )
                .map((option) => ({
                  label: option.displayName,
                  value: option.id,
                })) || []
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
    fontFamily: useAppFont("semibold"),
    fontWeight: 600,
    lineHeight: 22,
  },
  container: {
    paddingHorizontal: 28,
    marginBottom: 24,
  },
});

export default ProfileDrinking;
