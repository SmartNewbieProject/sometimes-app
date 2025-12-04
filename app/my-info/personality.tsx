import Layout from "@/src/features/layout";
import { semanticColors } from '../../src/shared/constants/colors';
import Loading from "@/src/features/loading";
import MyInfo from "@/src/features/my-info";
import type { Preferences } from "@/src/features/my-info/api";
import { ChipSelector, StepIndicator } from "@/src/widgets";
import { track } from "@/src/shared/libs/amplitude-compat";
import { Divider, PalePurpleGradient, Text } from "@shared/ui";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, View } from "react-native";

const { hooks, services, queries } = MyInfo;
const { useMyInfoForm, useMyInfoStep } = hooks;
const { MyInfoSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

export default function PersonalitySelectionScreen() {
  const { t } = useTranslation();
  const { updateStep } = useMyInfoStep();
  const { personality, updateForm } = useMyInfoForm();
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
    if (values.length > 3) {
      return;
    }

    updateForm("personality", values);
  };

  const nextMessage = (() => {
    if (!personality) {
      return t("apps.my-info.personality.max_3");
    }
    return t("apps.my-info.personality.next");
  })();

  const onNext = () => {
    track("Profile_personality", {
      env: process.env.EXPO_PUBLIC_TRACKING_MODE,
    });
    router.push("/my-info/dating-style");
  };

  useFocusEffect(
    useCallback(() => updateStep(MyInfoSteps.PERSONALITY), [updateStep])
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
            {t("apps.my-info.personality.title_1")}
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            {t("apps.my-info.personality.title_2")}
          </Text>
        </View>

        <View style={styles.indicatorContainer}>
          <StepIndicator
            length={3}
            step={personality?.length ?? 0}
            dotGap={4}
            dotSize={16}
            className="self-end"
          />
          <Divider.Horizontal />
        </View>

        <View style={styles.chipSelector}>
          <Loading.Lottie
            title={t("apps.my-info.personality.loading")}
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
              multiple={true}
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
        onClickNext={onNext}
        onClickPrevious={() => router.navigate("/my-info/mbti")}
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
  indicatorContainer: {
    width: "100%",
    rowGap: 10,
    paddingHorizontal: 32,
  },
  chipSelector: {
    marginTop: 12,
    paddingLeft: 24,
    paddingRight: 28,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
});
