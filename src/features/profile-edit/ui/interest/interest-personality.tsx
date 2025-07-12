import type { Preferences } from "@/src/features/interest/api";
import Loading from "@/src/features/loading";
import colors from "@/src/shared/constants/colors";
import { ChipSelector } from "@/src/widgets";
import React from "react";

import Interest from "@/src/features/interest";
import { StyleSheet, Text, View } from "react-native";

const { hooks, queries } = Interest;
const { useInterestForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

function InterestPersonality() {
  const { personality, updateForm } = useInterestForm();
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

  const onChangeOption = (values: string) => {
    updateForm("personality", values);
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>원하는 이상형의 성격</Text>
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
            multiple={false}
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
    fontWeight: 600,
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
    backgroundColor: "#E7E9EC",
  },
});

export default InterestPersonality;
