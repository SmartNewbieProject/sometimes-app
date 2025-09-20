import type { Preferences } from "@/src/features/interest/api";
import Loading from "@/src/features/loading";
import colors from "@/src/shared/constants/colors";
import { ChipSelector, StepIndicator } from "@/src/widgets";
import { useTranslation } from 'react-i18next';
import Interest from "@/src/features/interest";
import { StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
const { hooks, queries } = Interest;
const { useInterestForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;
function InterestPersonality() {
  const { personality, updateForm } = useInterestForm();
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
      (item) => item.typeName === PreferenceKeys.PERSONALITY
    ) ?? preferencesArray[0];

  const onChangeOption = (values: string[]) => {
    if (values.length > 3) {
      return;
    }
    if (values.length === 0) {
      updateForm("personality", undefined);
      return;
    }
    updateForm("personality", values);
  };
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{t("features.profile-edit.ui.interest.personality.title")}</Text>
        <StepIndicator
          length={3}
          step={personality?.length ?? 0}
          dotGap={4}
          dotSize={16}
          className="self-end"
        />
      </View>
      <View style={styles.bar} />
      <View style={styles.chipSelector}>
        <Loading.Lottie title={t("features.profile-edit.ui.interest.personality.loading")} loading={isLoading}>
          <ChipSelector
            value={personality}
            options={
              preferences?.options.map((option) => ({
                label: option.displayName,
                value: option.id,
                imageUrl: option?.imageUrl,
              })) || []
            }
            multiple={true}
            onChange={onChangeOption}
            className="w-full"
          />
        </Loading.Lottie>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
    paddingHorizontal: 28,
  },
  title: {
    color: colors.black,
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    fontWeight: 600,
    lineHeight: 22,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chipSelector: {
    marginTop: 16,

    flexDirection: "row",
    justifyContent: "flex-start",
  },
  bar: {
    marginTop: 6,
    marginBottom: 10,
    height: 0.5,
    backgroundColor: "#E7E9EC",
  },
});

export default InterestPersonality;
