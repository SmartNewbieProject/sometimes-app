import type { Preferences } from "@/src/features/interest/api";
import Loading from "@/src/features/loading";
import Tooltip from "@/src/shared/ui/tooltip";
import { PreferenceOption } from "@/src/types/user";
import { Selector } from "@/src/widgets/selector";
import Interest from "@features/interest";
import Layout from "@features/layout";
import { PalePurpleGradient, StepSlider, Text } from "@shared/ui";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

const { ui, hooks, services, queries } = Interest;
const { useInterestStep, useInterestForm } = hooks;
const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

const tooltips = [
  {
    title: "비흡연자였으면 좋겠어요",
    description: [
      "담배를 전혀 피우지 않는 사람을 선호해요",
      "담배 냄새에 민감하거나 간접흡연이 싫어요",
      "건강에 관심이 많은 사람이 좋아요",
    ],
  },
  {
    title: "상관없어요",
    description: [
      "흡연 여부는 중요한 기준이 아니에요",
      "흡연자든 비흡연자든 괜찮아요",
      "다른 가치관이나 성격이 더 중요해요",
      "전자담배나 간헐적 흡연도 허용할 수 있어요",
    ],
  },
  {
    title: "흡연자여도 좋아요",
    description: [
      "흡연자를 선호하거나 흡연에 거부감이 없어요",
      "함께 담배 피우는 시간을 공유하고 싶어요",
      "흡연을 개인의 취향으로 존중해요",
    ],
  },
];

export default function SmokingSelectionScreen() {
  const { updateStep } = useInterestStep();
  const { smoking, updateForm } = useInterestForm();

  const {
    data: preferencesArray = [
      {
        typeName: "",
        options: [],
      },
    ],
    isLoading: optionsLoading,
  } = usePreferenceOptionsQuery();

  console.log(
    "result",
    preferencesArray?.find((item) => item.typeName === Keys.SMOKING)
  );
  const preferences: Preferences =
    preferencesArray?.find((item) => item.typeName === Keys.SMOKING) ??
    preferencesArray[0];

  const index = preferences?.options.findIndex(
    (item) => item.id === smoking?.id
  );

  const currentIndex = index !== undefined && index !== -1 ? index : 0;
  const onChangeSmoking = (value: number) => {
    if (preferences?.options && preferences.options.length > value) {
      updateForm("smoking", preferences.options[value]);
    }
  };

  const handleNextButton = () => {
    if (!smoking) {
      updateForm("smoking", preferences.options[currentIndex]);
    }
    router.navigate("/interest/tattoo");
  };
  useFocusEffect(
    useCallback(() => updateStep(InterestSteps.SMOKING), [updateStep])
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
            흡연에 대해
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            어떻게 생각하시나요?
          </Text>
        </View>

        <View style={styles.bar} />
        <View style={styles.wrapper}>
          <Loading.Lottie
            title="선호도를 불러오고 있어요"
            loading={optionsLoading}
          >
            <StepSlider
              min={0}
              max={(preferences?.options.length ?? 1) - 1}
              step={1}
              showMiddle={true}
              defaultValue={2}
              value={currentIndex}
              middleLabelLeft={-5}
              onChange={onChangeSmoking}
              options={
                preferences?.options.map((option) => ({
                  label: option.displayName,
                  value: option.id,
                })) || []
              }
            />
          </Loading.Lottie>
        </View>

        <View style={styles.tooltipContainer}>
          <Tooltip
            title={tooltips[currentIndex].title}
            description={tooltips[currentIndex].description}
          />
        </View>
      </View>
      <Layout.TwoButtons
        style={{ paddingHorizontal: 32 }}
        disabledNext={false}
        onClickNext={handleNextButton}
        onClickPrevious={() => router.navigate("/interest/drinking")}
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
    marginTop: 39,
    marginBottom: 30,
  },
  wrapper: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    paddingTop: 32,
    paddingHorizontal: 32,
  },
  tooltipContainer: {
    position: "absolute",
    paddingHorizontal: 32,
    bottom: 42,
  },
});
