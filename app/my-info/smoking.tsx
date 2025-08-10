import Loading from "@/src/features/loading";
import MyInfo from "@/src/features/my-info";
import type { Preferences } from "@/src/features/my-info/api";
import Tooltip from "@/src/shared/ui/tooltip";
import { track } from "@amplitude/analytics-react-native";

import Layout from "@features/layout";
import { PalePurpleGradient, StepSlider, Text } from "@shared/ui";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

const { hooks, services, queries } = MyInfo;
const { useMyInfoForm, useMyInfoStep } = hooks;
const { MyInfoSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

const tooltips = [
  {
    title: "비흡연자",
    description: [
      "담배를 전혀 피우지 않아요",
      "간접흡연도 불편해요",
      "금연한 지 오래됐어요",
    ],
  },
  {
    title: "전자담배",
    description: ["일반 담배 대신 전자담배만 사용해요"],
  },
  {
    title: "흡연자",
    description: ["일반 담배를 피워요"],
  },
];

export default function SmokingSelectionScreen() {
  const { updateStep } = useMyInfoStep();
  const { smoking, updateForm } = useMyInfoForm();

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
    preferencesArray?.find((item) => item.typeName === Keys.SMOKING) ??
    preferencesArray[0];

  const index = preferences?.options.findIndex(
    (item) => item.id === smoking?.id
  );

  const currentIndex = index !== undefined && index !== -1 ? index : 0;
  useEffect(() => {
    if (optionsLoading) return;
    if (!smoking && preferences.options[currentIndex]) {
      updateForm("smoking", preferences.options[currentIndex]);
    }
  }, [optionsLoading, preferences.options, currentIndex, smoking]);
  const onChangeSmoking = (value: number) => {
    if (preferences?.options && preferences.options.length > value) {
      updateForm("smoking", preferences.options[value]);
    }
  };

  const handleNextButton = () => {
    if (!smoking) {
      updateForm("smoking", preferences.options[currentIndex]);
    }
    track("Profile_Smoking", { env: process.env.EXPO_PUBLIC_TRACKING_MODE });
    router.push("/my-info/tattoo");
  };
  useFocusEffect(
    useCallback(() => updateStep(MyInfoSteps.SMOKING), [updateStep])
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
            흡연은 하시나요?
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
              defaultValue={0}
              value={currentIndex}
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
        onClickPrevious={() => router.navigate("/my-info/drinking")}
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
