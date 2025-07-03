import Loading from "@/src/features/loading";
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

export default function SmokingSelectionScreen() {
  const { updateStep } = useInterestStep();
  const { smoking, updateForm } = useInterestForm();

  const {
    data: preferences = {
      id: "",
      options: [],
    },
    isLoading: optionsLoading,
  } = usePreferenceOptionsQuery(Keys.SMOKING);
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

        <Layout.TwoButtons
          style={{ paddingHorizontal: 32 }}
          disabledNext={false}
          onClickNext={handleNextButton}
          onClickPrevious={() => router.navigate("/interest/drinking")}
        />
      </View>
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
});
