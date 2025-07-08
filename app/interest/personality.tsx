import type { Preferences } from "@/src/features/interest/api";
import Layout from "@/src/features/layout";
import Loading from "@/src/features/loading";
import { ChipSelector, StepIndicator } from "@/src/widgets";
import Interest from "@features/interest";
import { Divider, PalePurpleGradient, Text } from "@shared/ui";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Image, StyleSheet, View } from "react-native";

const { hooks, services, queries } = Interest;
const { useInterestStep, useInterestForm } = hooks;
const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

export default function PersonalitySelectionScreen() {
  const { updateStep } = useInterestStep();
  const { personality, updateForm } = useInterestForm();
  const {
    data: preferencesArray = [
      {
        typeName: "",
        options: [],
      },
    ],
    isLoading,
  } = usePreferenceOptionsQuery(PreferenceKeys.PERSONALITY);

  console.log(
    "result",
    preferencesArray?.find(
      (item) => item.typeName === PreferenceKeys.PERSONALITY
    )
  );
  const preferences: Preferences =
    preferencesArray?.find(
      (item) => item.typeName === PreferenceKeys.PERSONALITY
    ) ?? preferencesArray[0];

  const onChangeOption = (values: string) => {
    updateForm("personality", values);
  };

  const nextMessage = (() => {
    if (!personality) {
      return `${1} 개만 더!`;
    }
    return "다음으로";
  })();

  useFocusEffect(
    useCallback(() => updateStep(InterestSteps.PERSONALITY), [updateStep])
  );
  return (
    <Layout.Default>
      <PalePurpleGradient />
      <View style={styles.contentContainer}>
        <Image
          source={require("@assets/images/loved.png")}
          style={{ width: 81, height: 81, marginLeft: 28 }}
        />
        <View style={styles.topContainer}>
          <Text weight="semibold" size="20" textColor="black">
            최근에 관심이 가는
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            활동이나 일이 있나요?
          </Text>
        </View>

        <View style={styles.bar} />

        <View style={styles.chipSelector}>
          <Loading.Lottie
            title="성격 유형을 불러오고 있어요"
            loading={isLoading}
          >
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
      <Layout.TwoButtons
        disabledNext={!personality}
        content={{
          next: nextMessage,
        }}
        onClickNext={() => router.navigate("/interest/drinking")}
        onClickPrevious={() => router.navigate("/interest/bad-mbti")}
      />
    </Layout.Default>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    marginHorizontal: 32,
    marginTop: 15,
  },
  contentContainer: {
    flex: 1,
  },
  ageContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  bar: {
    marginHorizontal: 32,

    height: 0.5,
    backgroundColor: "#E7E9EC",
    marginTop: 15,
  },
  indicatorContainer: {
    width: "100%",
    rowGap: 10,
    paddingHorizontal: 32,
  },
  chipSelector: {
    marginTop: 12,
    paddingLeft: 24,
    paddingRight: 26,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
});
