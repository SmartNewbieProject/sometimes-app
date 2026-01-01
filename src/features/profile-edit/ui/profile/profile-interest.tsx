import Loading from "@/src/features/loading";
import MyInfo from "@/src/features/my-info";
import colors from "@/src/shared/constants/colors";

import { Divider } from "@/src/shared/ui";
import { ChipSelector, StepIndicator } from "@/src/widgets";
import React from "react";
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from "react-native";

const { hooks, services, queries } = MyInfo;
const { MyInfoSteps } = services;
const { useMyInfoForm, useMyInfoStep } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys, getTypeNamesForLocale } = queries;

function ProfileInterest() {
  const { interestIds, updateForm } = useMyInfoForm();
  const { t, i18n } = useTranslation();
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
  const preferences = preferencesArray?.find(
    (item) => item.typeCode === PreferenceKeys.INTEREST
  );

  const onChangeOption = (values: string[]) => {
    if (values?.length > 5) {
      return;
    }
    updateForm("interestIds", values);
  };

  return (
    <View style={styles.container}>
      <View style={styles.indicatorContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t("features.profile-edit.ui.profile.interest.title")}</Text>
          <StepIndicator
            length={5}
            step={interestIds?.length ?? 0}
            dotGap={4}
            dotSize={16}
            style={styles.stepIndicator}
          />
        </View>

        <Divider.Horizontal />
      </View>

      <View style={styles.loadingContainer}>
        <Loading.Lottie title={t("features.profile-edit.ui.profile.interest.loading")} loading={isLoading}>
          <ChipSelector
            value={interestIds}
            options={
              preferences?.options?.map((option) => ({
                label: option.displayName,
                value: option.id,
                imageUrl: option?.imageUrl,
              })) ?? []
            }
            onChange={onChangeOption}
            multiple
            style={styles.chipSelector}
            align="center"
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
    fontFamily: "Pretendard-SemiBold",
    fontWeight: 600,

    lineHeight: 22,
  },
  chipSelector: {
    marginTop: 12,
    justifyContent: "flex-start",
  },
  stepIndicator: {
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flex: 1,
    width: '100%',
  },
});

export default ProfileInterest;
