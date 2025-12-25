import type { Preferences } from "@/src/features/interest/api";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import Loading from "@/src/features/loading";
import Tooltip from "@/src/shared/ui/tooltip";
import { PreferenceOption } from "@/src/types/user";
import { Selector } from "@/src/widgets/selector";
import { useTranslation } from 'react-i18next';
import { mixpanelAdapter } from "@/src/shared/libs/mixpanel";
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
  const { t } = useTranslation();
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

  const preferences: Preferences =
    preferencesArray?.find((item) => item.typeName === Keys.SMOKING) ??
    preferencesArray[0];

  const index = preferences?.options.findIndex(
    (item) => item.id === smoking?.id
  );

  const currentIndex = index !== undefined && index !== -1 ? index : 0;

  const tooltips = preferences?.options.map((_, idx) => {
    const titleKey = `apps.interest.smoke.tooltip_${idx}_title`;
    const title = t(titleKey, { defaultValue: t("apps.interest.smoke.tooltip_0_title") });

    const descriptions: string[] = [];
    let descIdx = 1;
    while (true) {
      const descKey = `apps.interest.smoke.tooltip_${idx}_desc_${descIdx}`;
      const desc = t(descKey, { defaultValue: "" });
      if (!desc) break;
      descriptions.push(desc);
      descIdx++;
    }

    return {
      title,
      description: descriptions.length > 0 ? descriptions : [t("apps.interest.smoke.tooltip_0_desc_1")],
    };
  }) ?? [];
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
    mixpanelAdapter.track("Interest_Smoking", { env: process.env.EXPO_PUBLIC_TRACKING_MODE });
    router.push("/interest/tattoo");
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
            {t("apps.interest.smoke.title_1")}
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            {t("apps.interest.smoke.title_2")}
          </Text>
        </View>

        <View style={styles.bar} />
        <View style={styles.wrapper}>
          <Loading.Lottie
            title={t("apps.interest.smoke.loading")}
            loading={optionsLoading}
          >
            <StepSlider
              min={0}
              max={(preferences?.options.length ?? 1) - 1}
              step={1}
              showMiddle={true}
              defaultValue={1}
              value={currentIndex}
              middleLabelLeft={-15}
              onChange={onChangeSmoking}
              options={
                preferences?.options?.map((option) => ({
                  label: option.displayName,
                  value: option.id,
                })) ?? []
              }
            />
          </Loading.Lottie>
        </View>

        <View style={styles.tooltipContainer}>
          <Tooltip
            title={tooltips[currentIndex]?.title ?? ""}
            description={tooltips[currentIndex]?.description ?? []}
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
    backgroundColor: semanticColors.surface.background,
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
