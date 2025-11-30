import Interest from "@/src/features/interest";
import type { Preferences } from "@/src/features/interest/api";
import { AgeOptionData } from "@/src/features/interest/types";
import Loading from "@/src/features/loading";
import colors , { semanticColors } from "@/src/shared/constants/colors";
import { ChipSelector } from "@/src/widgets";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const { ui, hooks, queries } = Interest;
const { useInterestForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

function InterestAge() {
  const { age, updateForm } = useInterestForm();
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
    preferencesArray?.find((item) => item.typeName === PreferenceKeys.AGE) ??
    preferencesArray[0];

  const onChangeOption = (values: string) => {
    updateForm("age", values);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>선호 나이대</Text>
      <View style={styles.bar} />
      <View style={styles.chipSelector}>
        <Loading.Lottie
          title="선호 나이대 옵션을 불러오고 있어요"
          loading={isLoading}
        >
          <ChipSelector
            value={age}
            options={
              preferences?.options?.map((option) => ({
                label: option.displayName,
                value: option.id,
                imageUrl: option?.imageUrl,
              })) ?? []
            }
            multiple={false}
            onChange={onChangeOption}
            style={styles.chipSelectorFullWidth}
          />
        </Loading.Lottie>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
    marginTop: 10,
    paddingHorizontal: 28,
  },
  title: {
    color: colors.black,
    fontSize: 18,
    fontWeight: 600,
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 22,
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
    backgroundColor: semanticColors.surface.other,
  },
  chipSelectorFullWidth: {
    width: '100%',
  },
});

export default InterestAge;
