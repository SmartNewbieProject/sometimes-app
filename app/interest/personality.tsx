import type { Preferences } from "@/src/features/interest/api";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import Layout from "@/src/features/layout";
import Loading from "@/src/features/loading";
import { ChipSelector, StepIndicator } from "@/src/widgets";
import { useTranslation } from 'react-i18next';
import { track } from "@/src/shared/libs/amplitude-compat";
import Interest from "@features/interest";
import { PalePurpleGradient, Text } from "@shared/ui";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Image, StyleSheet, View } from "react-native";

const { hooks, services, queries } = Interest;
const { useInterestForm, useInterestStep } = hooks;
const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

export default function PersonalitySelectionScreen() {
  const { t } = useTranslation();
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
  } = usePreferenceOptionsQuery();

  const preferences: Preferences =
    preferencesArray?.find(
      (item) => item.typeName === PreferenceKeys.PERSONALITY
    ) ?? preferencesArray[0];

  const onChangeOption = (values: string[]) => {
    if (values.length > 3) return;

    // 항상 배열로 유지하여 최소 1개 선택 필요하도록 함
    updateForm("personality", values);
  };

  const nextMessage = (() => {
    if (!personality || personality.length === 0) return t("apps.interest.personality.next_none"); //최소 1개 선택해주세요
    return "다음으로";
  })();

  const onNext = () => {
    track("Interest_Personality", {
      env: process.env.EXPO_PUBLIC_TRACKING_MODE,
    });
    router.push("/interest/drinking");
  };

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
            {t("apps.interest.personality.title_1")}
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            {t("apps.interest.personality.title_2")}
          </Text>
        </View>

        <View style={styles.indicatorRow}>
          <View style={{ flex: 1 }} />
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
          <Loading.Lottie
            title={t("apps.interest.personality.loading")}
            loading={isLoading}
          >
            <ChipSelector
              value={personality}
              options={
                preferences?.options?.map((option) => ({
                  label: option.displayName,
                  value: option.id,
                  imageUrl: option?.imageUrl,
                })) ?? []
              }
              multiple
              onChange={onChangeOption}
              style={styles.chipSelectorContent}
            />
          </Loading.Lottie>
        </View>
      </View>

      <Layout.TwoButtons
        disabledNext={!personality || personality.length === 0}
        content={{ next: nextMessage }}
        onClickNext={onNext}
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
    backgroundColor: semanticColors.surface.background,
    marginTop: 15,
  },
  indicatorRow: {
    width: "100%",
    paddingHorizontal: 32,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  chipSelector: {
    marginTop: 12,
    paddingHorizontal: 24,
  },
  chipSelectorContent: {
    width: "100%",
  },
});
