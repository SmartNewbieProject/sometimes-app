import { useAuth } from "@/src/features/auth";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import type { Preferences } from "@/src/features/interest/api";
import { savePreferences } from "@/src/features/interest/services";
import Layout from "@/src/features/layout";
import Loading from "@/src/features/loading";
import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { ImageResources, tryCatch } from "@/src/shared/libs";
import { PalePurpleGradient, StepSlider, Text } from "@/src/shared/ui";
import type { PreferenceOption } from "@/src/types/user";
import Interest from "@features/interest";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

const { hooks, services, queries } = Interest;
const { useInterestStep, useInterestForm } = hooks;
const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

export default function MilitarySelectionScreen() {
  const {
    updateForm,
    clear: _,
    militaryPreference,
    ...form
  } = useInterestForm();
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const { my } = useAuth();
  const { showErrorModal } = useModal();
  const {
    data: preferencesArray = [{ typeName: "", options: [] }],
    isLoading: optionsLoading,
  } = usePreferenceOptionsQuery();

  const preferences: Preferences =
    preferencesArray?.find(
      (item) => item.typeName === PreferenceKeys.MILITARY_PREFERENCE
    ) ?? preferencesArray[0];
  const index = preferences?.options.findIndex(
    (item) => item.id === militaryPreference?.id
  );

  const currentIndex = index !== undefined && index !== -1 ? index : 0;

  useEffect(() => {
    if (optionsLoading) return;
    if (!militaryPreference && preferences.options[currentIndex]) {
      updateForm("militaryPreference", preferences.options[currentIndex]);
    }
  }, [optionsLoading, preferences.options, currentIndex, militaryPreference]);
  useFocusEffect(
    useCallback(
      () => useInterestStep.getState().updateStep(InterestSteps.MILITARY),
      []
    )
  );

  const onFinish = async () => {
    setFormSubmitLoading(true);
    updateForm("militaryPreference", preferences?.options[currentIndex]);
    await tryCatch(
      async () => {
        const emptyFields = [];
        if (!form.age) emptyFields.push("선호 나이");
        if (!form.drinking) emptyFields.push("음주");
        if (!form.smoking) emptyFields.push("흡연");
        if (!form.tattoo) emptyFields.push("문신");
        if (!form.personality || form.personality.length === 0) emptyFields.push("성격");

        if (emptyFields.length > 0) {
          const message = `다음 정보를 입력해주세요: ${emptyFields.join(", ")}`;
          console.error("Validation failed:", { emptyFields, form });
          throw new Error(message);
        }

        await savePreferences({
          age: form.age as string,
          drinking: form.drinking?.id as string,
          smoking: form.smoking?.id as string,
          tattoo: form.tattoo?.id as string,
          personality: form.personality as string[],
          militaryPreference: preferences?.options[currentIndex]?.id ?? "",
          goodMbti: form.goodMbti as string,
          badMbti: form.badMbti as string,
        });
        await queryClient.invalidateQueries({
          queryKey: ["check-preference-fill"],
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
              middleLabelLeft={-15}
              onChange={onChangeOption}
              lastLabelLeft={-3}
              options={
                preferences?.options?.map((option) => ({
                  label: option.displayName,
                  value: option.id,
                })) ?? []
              }
            />
          </Loading.Lottie>
        </View>
      </View>

      <Layout.TwoButtons
        disabledNext={false}
        onClickNext={onFinish}
        onClickPrevious={() => router.navigate("/interest/tattoo")}
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
});
