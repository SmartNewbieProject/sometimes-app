import Loading from "@/src/features/loading";
import MyInfo from "@/src/features/my-info";
import type { Preferences } from "@/src/features/my-info/api";
import colors from "@/src/shared/constants/colors";

import { Divider } from "@/src/shared/ui";
import { ChipSelector, StepIndicator } from "@/src/widgets";
import React from "react";
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from "react-native";

const { hooks, services, queries } = MyInfo;
const { useMyInfoForm, useMyInfoStep } = hooks;
const { MyInfoSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

function ProfileDatingStyle() {
  const { datingStyleIds, updateForm } = useMyInfoForm();
  const { t } = useTranslation();
  const {
    data: preferencesArray = [
      {
        typeName: "",
        options: [],
      },
    ],
    isLoading,
  } = usePreferenceOptionsQuery();

  const preferences: Preferences =
    preferencesArray?.find(
      (item) => item.typeName === PreferenceKeys.DATING_STYLE
    ) ?? preferencesArray[0];

  const onChangeOption = (values: string[]) => {
    if (values.length > 3) {
      return;
    }
    updateForm("datingStyleIds", values);
  };

  return (
    <View style={styles.container}>
      <View style={styles.indicatorContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t("features.profile-edit.ui.profile.dating_style.title")}</Text>
          <StepIndicator
            length={3}
            step={datingStyleIds?.length ?? 0}
            dotGap={4}
            dotSize={16}
            className="self-end"
          />
        </View>

        <Divider.Horizontal />
      </View>
      <View>
        <Loading.Lottie title={t("features.profile-edit.ui.profile.dating_style.loading")} loading={isLoading}>
          <ChipSelector
            value={datingStyleIds}
            options={
              preferences?.options?.map((option) => ({
                label: option.displayName,
                value: option.id,
                imageUrl: option?.imageUrl,
              })) ?? []
            }
            onChange={onChangeOption}
            multiple
            align="center"
            style={styles.chipSelector}
          />
        </Loading.Lottie>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 28,
    marginBottom: 30,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  indicatorContainer: {
    width: "100%",
    rowGap: 10,
  },
  title: {
    color: colors.black,
    fontSize: 18,
    fontFamily: "semibold",
    fontWeight: 600,
    lineHeight: 22,
  },
  chipSelector: {
    marginTop: 12,

    justifyContent: "flex-start",
  },
});

export default ProfileDatingStyle;
