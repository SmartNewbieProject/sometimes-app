import { useAuth } from "@/src/features/auth";
import { semanticColors } from '../../src/shared/constants/colors';
import type { Preferences } from "@/src/features/interest/api";
import Loading from "@/src/features/loading";
import Tooltip from "@/src/shared/ui/tooltip";
import { Selector } from "@/src/widgets/selector";
import { useTranslation } from 'react-i18next';
import { track } from "@amplitude/analytics-react-native";
import Interest from "@features/interest";
import Layout from "@features/layout";
import { PalePurpleGradient, StepSlider, Text } from "@shared/ui";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

const { hooks, services, queries } = Interest;
const { useInterestStep, useInterestForm } = hooks;

const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;
import i18n from "@/src/shared/libs/i18n";
// TODO: The 't' function might not be in scope here.
// Consider moving this array definition inside the component or passing 't' as a prop.
const tooltips = [
  {
    title: i18n.t("apps.interest.drink.tooltip_0_title"),
    description: [
      i18n.t("apps.interest.drink.tooltip_0_desc_1"),
      i18n.t("apps.interest.drink.tooltip_0_desc_2"),
      i18n.t("apps.interest.drink.tooltip_0_desc_3"),
    ],
  },
  {
    title: i18n.t("apps.interest.drink.tooltip_1_title"),
    description: [
      i18n.t("apps.interest.drink.tooltip_1_desc_1"),
      i18n.t("apps.interest.drink.tooltip_1_desc_2"),
      i18n.t("apps.interest.drink.tooltip_1_desc_3"),
    ],
  },
  {
    title: i18n.t("apps.interest.drink.tooltip_2_title"),
    description: [
      i18n.t("apps.interest.drink.tooltip_2_desc_1"),
      i18n.t("apps.interest.drink.tooltip_2_desc_2"),
      i18n.t("apps.interest.drink.tooltip_2_desc_3"),
    ],
  },
  {
    title: i18n.t("apps.interest.drink.tooltip_3_title"),
    description: [
      i18n.t("apps.interest.drink.tooltip_3_desc_1"),
      i18n.t("apps.interest.drink.tooltip_3_desc_2"),
      i18n.t("apps.interest.drink.tooltip_3_desc_3"),
    ],
  },
  {
    title: i18n.t("apps.interest.drink.tooltip_4_title"),
    description: [
      i18n.t("apps.interest.drink.tooltip_4_desc_1"),
      i18n.t("apps.interest.drink.tooltip_4_desc_2"),
      i18n.t("apps.interest.drink.tooltip_4_desc_3"),
    ],
  },
];

export default function DrinkingSelectionScreen() {
  const { t } = useTranslation();
  const { updateStep } = useInterestStep();
  const { drinking, updateForm } = useInterestForm();
  const { my } = useAuth();
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
    preferencesArray?.find((item) => item.typeName === Keys.DRINKING) ??
    preferencesArray[0];
  const index = preferences?.options.findIndex(
    (item) => item.id === drinking?.id
  );

  const currentIndex = index !== undefined && index !== -1 ? index : 0;
  useEffect(() => {
    if (optionsLoading) return;
    if (!drinking && preferences.options[currentIndex]) {
      updateForm("drinking", preferences.options[currentIndex]);
    }
  }, [optionsLoading, preferences.options, currentIndex, drinking]);
  const onChangeDrinking = (value: number) => {
    if (preferences?.options && preferences.options.length > value) {
      updateForm("drinking", preferences.options[value]);
    }
  };

  const handleNextButton = () => {
    if (!drinking) {
      updateForm("drinking", preferences.options[currentIndex]);
    }
    track("Interest_Drinking", { env: process.env.EXPO_PUBLIC_TRACKING_MODE });
    router.push("/interest/smoking");
  };

  useFocusEffect(
    useCallback(() => updateStep(InterestSteps.DRINKING), [updateStep])
  );

  const handleBackButton = () => {
    router.navigate("/interest/personality");
  };

  return (
    <Layout.Default>
      <PalePurpleGradient />
      <View style={styles.contentContainer}>
        <Image
          source={require("@assets/images/drink.png")}
          style={{ width: 81, height: 81, marginLeft: 28 }}
        />
        <View style={styles.topContainer}>
          <Text weight="semibold" size="20" textColor="black">
            {t("apps.interest.drink.title_1")}
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            {t("apps.interest.drink.title_2")}
          </Text>
        </View>
        <View style={styles.bar} />
        <View style={styles.wrapper}>
          <Loading.Lottie
            title={t("apps.interest.drink.loading")}
            loading={optionsLoading}
          >
            <StepSlider
              min={0}
              max={(preferences?.options.length ?? 1) - 1}
              step={1}
              showMiddle={false}
              defaultValue={2}
              value={currentIndex}
              onChange={onChangeDrinking}
              lastLabelLeft={-70}
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
            title={tooltips[currentIndex].title}
            description={tooltips[currentIndex].description}
          />
        </View>
      </View>
      <Layout.TwoButtons
        style={{ paddingHorizontal: 32 }}
        disabledNext={false}
        onClickNext={handleNextButton}
        onClickPrevious={handleBackButton}
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
    position: "relative",
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
