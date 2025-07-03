import { useAuth } from "@/src/features/auth";
import Layout from "@/src/features/layout";
import Loading from "@/src/features/loading";
import { ImageResources } from "@/src/shared/libs";
import { PalePurpleGradient, StepSlider, Text } from "@/src/shared/ui";
import type { PreferenceOption } from "@/src/types/user";
import Interest from "@features/interest";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

const { hooks, services, queries } = Interest;
const { useInterestStep, useInterestForm } = hooks;
const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

export default function MilitarySelectionScreen() {
  const { updateForm, militaryPreference } = useInterestForm();
  const { my } = useAuth();
  const { data: preferences, isLoading: optionsLoading } =
    usePreferenceOptionsQuery(PreferenceKeys.MILITARY_PREFERENCE);
  const index = preferences?.options.findIndex(
    (item) => item.id === militaryPreference?.id
  );

  const currentIndex = index !== undefined && index !== -1 ? index : 0;
  console.log(militaryPreference, "mili");
  useFocusEffect(
    useCallback(
      () => useInterestStep.getState().updateStep(InterestSteps.MILITARY),
      []
    )
  );

  const handleNextButton = () => {
    if (!militaryPreference) {
      updateForm("militaryPreference", preferences?.options[currentIndex]);
    }
    router.navigate("/interest/drinking");
  };

  const onChangeOption = (value: number) => {
    if (preferences?.options && preferences.options.length > value) {
      updateForm("militaryPreference", preferences.options[value]);
    }
  };

  return (
    <Layout.Default>
      <PalePurpleGradient />
      <View style={styles.contentContainer}>
        <Image
          source={{ uri: ImageResources.MILITARY }}
          style={{ width: 81, height: 81, marginLeft: 28 }}
        />
        <View style={styles.topContainer}>
          <Text weight="semibold" size="20" textColor="black">
            군필에 대해
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            어떻게 생각하시나요?
          </Text>
        </View>

        <View style={styles.bar} />

        <View style={styles.wrapper}>
          <Loading.Lottie
            title="옵션을 불러오고 있어요"
            loading={optionsLoading}
          >
            <StepSlider
              min={0}
              max={(preferences?.options.length ?? 1) - 1}
              step={1}
              defaultValue={1}
              value={currentIndex}
              onChange={onChangeOption}
              options={
                preferences?.options.map((option) => ({
                  label: option.displayName,
                  value: option.id,
                })) || []
              }
            />
          </Loading.Lottie>
        </View>
      </View>

      <Layout.TwoButtons
        disabledNext={false}
        onClickNext={handleNextButton}
        onClickPrevious={() => router.navigate("/interest/dating-style")}
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
});
