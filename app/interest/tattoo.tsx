import { useAuth } from "@/src/features/auth";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import type { Preferences } from "@/src/features/interest/api";
import { Properties, savePreferences } from "@/src/features/interest/services";
import Loading from "@/src/features/loading";
import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { tryCatch } from "@/src/shared/libs";
import Tooltip from "@/src/shared/ui/tooltip";
import { Selector } from "@/src/widgets/selector";
import { mixpanelAdapter } from "@/src/shared/libs/mixpanel";
import Interest from "@features/interest";
import Layout from "@features/layout";
import { PalePurpleGradient, StepSlider, Text } from "@shared/ui";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useTranslation } from 'react-i18next';

const { ui, hooks, services, queries } = Interest;
const { useInterestStep, useInterestForm } = hooks;
const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

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

  const tooltips = preferences?.options.map((_, idx) => {
    const titleKey = `apps.interest.tattoo.tooltip_${idx}_title`;
    const title = t(titleKey, { defaultValue: t("apps.interest.tattoo.tooltip_0_title") });

    const descriptions: string[] = [];
    let descIdx = 1;
    while (true) {
      const descKey = `apps.interest.tattoo.tooltip_${idx}_desc_${descIdx}`;
      const desc = t(descKey, { defaultValue: "" });
      if (!desc) break;
      descriptions.push(desc);
      descIdx++;
    }

    return {
      title,
      description: descriptions.length > 0 ? descriptions : [t("apps.interest.tattoo.tooltip_0_desc_1")],
    };
  }) ?? [];
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
        const emptyFields = [];
        if (!form.age) emptyFields.push("선호 나이");
        if (!form.drinking) emptyFields.push("음주");
        if (!form.smoking) emptyFields.push("흡연");
        if (!form.personality || form.personality.length === 0) emptyFields.push("성격");
        if (my?.gender === "FEMALE" && !form.militaryPreference) emptyFields.push("군필 여부");

        if (emptyFields.length > 0) {
          const message = `다음 정보를 입력해주세요: ${emptyFields.join(", ")}`;
          console.error("Validation failed:", { emptyFields, form });
          throw new Error(message);
        }

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
        mixpanelAdapter.track("Interest_Tattoo", {
          env: process.env.EXPO_PUBLIC_TRACKING_MODE,
        });
        router.navigate("/interest/done");
        setFormSubmitLoading(false);
      },
      (serverError: unknown) => {
        const err = serverError as { message?: string; error?: string; status?: number; statusCode?: number } | null;
        console.error("Preference save error:", {
          error: serverError,
          errorMessage: err?.message,
          errorString: err?.error,
          status: err?.status,
          statusCode: err?.statusCode,
          form,
        });

        const errorMessage = err?.message || err?.error || "선호 정보 저장에 실패했습니다. 잠시 후 다시 시도해주세요.";
        showErrorModal(errorMessage, "error");
        setFormSubmitLoading(false);
      }
    );
  };

  const handleNextButton = () => {
    mixpanelAdapter.track("Interest_Tattoo", { env: process.env.EXPO_PUBLIC_TRACKING_MODE });
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
            {t("apps.interest.tattoo.title_1")}
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            {t("apps.interest.tattoo.title_2")}
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
