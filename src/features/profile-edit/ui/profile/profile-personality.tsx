import Loading from "@/src/features/loading";
import MyInfo from "@/src/features/my-info";
import type { Preferences } from "@/src/features/my-info/api";
import colors , { semanticColors } from "@/src/shared/constants/colors";
import { ChipSelector, StepIndicator } from "@/src/widgets";
import React from "react";

import { StyleSheet, Text, View } from "react-native";

const { hooks, queries } = MyInfo;
const { useMyInfoForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

function ProfilePersonality() {
  const { personality, updateForm } = useMyInfoForm();
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
        <Text style={styles.title}>성격 유형</Text>
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
        <Loading.Lottie title="성격 유형을 불러오고 있어요" loading={isLoading}>
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
  chipSelector: {
    marginTop: 16,

    flexDirection: "row",
    justifyContent: "flex-start",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bar: {
    marginTop: 6,
    marginBottom: 10,
    height: 0.5,
    backgroundColor: semanticColors.surface.other,
  },
});

export default ProfilePersonality;
