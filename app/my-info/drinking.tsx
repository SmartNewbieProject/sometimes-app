import { useAuth } from "@/src/features/auth";
import Loading from "@/src/features/loading";
import MyInfo from "@/src/features/my-info";
import type { Preferences } from "@/src/features/my-info/api";
import Tooltip from "@/src/shared/ui/tooltip";
import { track } from "@amplitude/analytics-react-native";
import Interest from "@features/interest";
import Layout from "@features/layout";
import { PalePurpleGradient, StepSlider, Text } from "@shared/ui";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, View } from "react-native";

const { hooks, services, queries } = MyInfo;
const { useMyInfoForm, useMyInfoStep } = hooks;

const { MyInfoSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

export default function DrinkingSelectionScreen() {
  const { t } = useTranslation();
  const { updateStep } = useMyInfoStep();
  const { drinking, updateForm } = useMyInfoForm();

  const tooltips = [
    {
      title: t("apps.my-info.drinking.tooltip_0_title"),
      description: [
        t("apps.my-info.drinking.tooltip_0_desc_1"),
        t("apps.my-info.drinking.tooltip_0_desc_2"),
        t("apps.my-info.drinking.tooltip_0_desc_3"),
      ],
    },
    {
      title: t("apps.my-info.drinking.tooltip_1_title"),
      description: [
        t("apps.my-info.drinking.tooltip_1_desc_1"),
        t("apps.my-info.drinking.tooltip_1_desc_2"),
      ],
    },
    {
      title: t("apps.my-info.drinking.tooltip_2_title"),
      description: [
        t("apps.my-info.drinking.tooltip_2_desc_1"),
        t("apps.my-info.drinking.tooltip_2_desc_2"),
      ],
    },
    {
      title: t("apps.my-info.drinking.tooltip_3_title"),
      description: [
        t("apps.my-info.drinking.tooltip_3_desc_1"),
        t("apps.my-info.drinking.tooltip_3_desc_2"),
      ],
    },
    {
      title: t("apps.my-info.drinking.tooltip_4_title"),
      description: [
        t("apps.my-info.drinking.tooltip_4_desc_1"),
        t("apps.my-info.drinking.tooltip_4_desc_2"),
      ],
    },
  ];

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
    track("Profile_Drinking", { env: process.env.EXPO_PUBLIC_TRACKING_MODE });
    router.push("/my-info/smoking");
  };

  useFocusEffect(
    useCallback(() => updateStep(MyInfoSteps.DRINKING), [updateStep])
  );

  const handleBackButton = () => {
    router.navigate("/my-info/dating-style");
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
            {t("apps.my-info.drinking.title_1")}
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            {t("apps.my-info.drinking.title_2")}
          </Text>
        </View>
        <View style={styles.bar} />
        <View style={styles.wrapper}>
          <Loading.Lottie
            title={t("apps.my-info.drinking.loading")}
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
              lastLabelLeft={-50}
              options={
                preferences?.options
                  .map((option) =>
                    option.displayName ===
                    t("apps.my-info.drinking.option_not_drink_at_all")
                      ? {
                          ...option,
                          displayName: t(
                            "apps.my-info.drinking.option_not_drink"
                          ),
                        }
                      : option
                  )
                  .map((option) => ({
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
