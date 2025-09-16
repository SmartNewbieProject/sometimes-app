import { useAuth } from "@/src/features/auth";
import type { Preferences } from "@/src/features/interest/api";
import { Properties, savePreferences } from "@/src/features/interest/services";
import Loading from "@/src/features/loading";
import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { tryCatch } from "@/src/shared/libs";
import Tooltip from "@/src/shared/ui/tooltip";
import { Selector } from "@/src/widgets/selector";
import { track } from "@amplitude/analytics-react-native";
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
import i18n from "@/src/shared/libs/i18n";
import { useTranslation } from 'react-i18next';

const tooltips = [
  {
    title: i18n.t("apps.interest.tattoo.tooltip_0_title"),
    description: [
      i18n.t("apps.interest.tattoo.tooltip_0_desc_1"),
      i18n.t("apps.interest.tattoo.tooltip_0_desc_2"),
    ],
  },
  {
    title: i18n.t("apps.interest.tattoo.tooltip_1_title"),
    description: [
      i18n.t("apps.interest.tattoo.tooltip_1_desc_1"),
      i18n.t("apps.interest.tattoo.tooltip_1_desc_2"),
      i18n.t("apps.interest.tattoo.tooltip_1_desc_3"),
      i18n.t("apps.interest.tattoo.tooltip_1_desc_4"),
    ],
  },
  {
    title: i18n.t("apps.interest.tattoo.tooltip_2_title"),
    description: [
      i18n.t("apps.interest.tattoo.tooltip_2_desc_1"),
      i18n.t("apps.interest.tattoo.tooltip_2_desc_2"),
      i18n.t("apps.interest.tattoo.tooltip_2_desc_3"),
    ],
  },
];

export default function TattooSelectionScreen() {
  const { updateStep } = useInterestStep();
  const { updateForm, clear: _, tattoo, ...form } = useInterestForm();
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
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
  const { showErrorModal } = useModal();
  const { t } = useTranslation();

  const preferences: Preferences =
    preferencesArray?.find((item) => item.typeName === Keys.TATTOO) ??
    preferencesArray[0];
  const index = preferences?.options.findIndex(
    (item) => item.id === tattoo?.id
  );

  const currentIndex = index !== undefined && index !== -1 ? index : 0;
  useEffect(() => {
    if (optionsLoading) return;
    if (!tattoo && preferences.options[currentIndex]) {
      updateForm("tattoo", preferences.options[currentIndex]);
    }
  }, [optionsLoading, preferences.options, currentIndex, tattoo]);
  const onChangeTattoo = (value: number) => {
    if (preferences?.options && preferences.options.length > value) {
      updateForm("tattoo", preferences.options[value]);
    }
  };
  const onFinish = async () => {
    setFormSubmitLoading(true);
    updateForm("tattoo", preferences.options[currentIndex]);
    await tryCatch(
      async () => {
        const validation = Object.entries(form)
          .filter(([key]) => key !== "goodMbti" && key !== "badMbti")
          .every(([_, value]) => value !== null);
        if (!validation) throw new Error("비어있는 양식이 존재합니다.");
        await savePreferences({
          age: form.age as string,
          drinking: form.drinking?.id as string,
          smoking: form.smoking?.id as string,
          personality: form.personality as string[],
          tattoo: preferences.options[currentIndex].id,
          militaryPreference: form.militaryPreference?.id ?? "",
          goodMbti: form.goodMbti as string,
          badMbti: form.badMbti as string,
        });
        await queryClient.invalidateQueries({
          queryKey: ["check-preference-fill"],
        });
        track("Interest_Tattoo", {
          env: process.env.EXPO_PUBLIC_TRACKING_MODE,
        });
        router.navigate("/interest/done");
        setFormSubmitLoading(false);
      },
      ({ error }) => {
        showErrorModal(error, "error");
        setFormSubmitLoading(false);
      }
    );
  };

  const handleNextButton = () => {
    track("Interest_Tattoo", { env: process.env.EXPO_PUBLIC_TRACKING_MODE });
    updateForm("tattoo", preferences.options[currentIndex]);
    router.push("/interest/military");
  };

  useFocusEffect(
    useCallback(() => updateStep(InterestSteps.TATTOO), [updateStep])
  );

  if (formSubmitLoading) {
    return <Loading.Page />;
  }

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
            t("apps.interest.tattoo.title_1"),
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            t("apps.interest.tattoo.title_2"),
          </Text>
        </View>
        <View style={styles.bar} />
        <View style={styles.wrapper}>
          <Loading.Lottie
            title={ t("apps.interest.tattoo.loading")}
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
              onChange={onChangeTattoo}
              options={
                preferences?.options
                  .map((option) =>
                    option.displayName === "문신 없음"
                      ? { ...option, displayName: "작은 문신" }
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
        onClickNext={my?.gender === "MALE" ? onFinish : handleNextButton}
        onClickPrevious={() => router.navigate("/interest/smoking")}
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
