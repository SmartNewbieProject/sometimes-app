import { useAuth } from "@/src/features/auth";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import Layout from "@/src/features/layout";
import Loading from "@/src/features/loading";
import MyInfo from "@/src/features/my-info";
import type { Preferences } from "@/src/features/my-info/api";
import { savePreferences } from "@/src/features/my-info/services";
import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { ImageResources, tryCatch } from "@/src/shared/libs";
import { PalePurpleGradient, StepSlider, Text } from "@/src/shared/ui";

import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, View } from "react-native";

const { hooks, services, queries } = MyInfo;
const { useMyInfoForm, useMyInfoStep } = hooks;
const { MyInfoSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

export default function MilitarySelectionScreen() {
  const { t } = useTranslation();
  const { updateForm, clear: _, militaryStatus, ...form } = useMyInfoForm();
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const { my } = useAuth();
  const { showErrorModal } = useModal();
  const {
    data: preferencesArray = [{ typeCode: "", typeName: "", options: [] }],
    isLoading: optionsLoading,
  } = usePreferenceOptionsQuery();

  const preferences: Preferences =
    preferencesArray?.find(
      (item) => item.typeCode === PreferenceKeys.MILITARY_STATUS
    ) ?? preferencesArray[0];
  const index = preferences?.options.findIndex(
    (item) => item.id === militaryStatus?.id
  );

  const currentIndex = index !== undefined && index !== -1 ? index : 0;
  useEffect(() => {
    if (optionsLoading) return;
    if (!militaryStatus && preferences.options[currentIndex]) {
      updateForm("militaryStatus", preferences.options[currentIndex]);
    }
  }, [optionsLoading, preferences.options, currentIndex, militaryStatus]);

  useFocusEffect(
    useCallback(
      () => useMyInfoStep.getState().updateStep(MyInfoSteps.MILITARY),
      []
    )
  );

  const onFinish = async () => {
    setFormSubmitLoading(true);
    updateForm("militaryStatus", preferences?.options[currentIndex]);
    await tryCatch(
      async () => {
        const emptyFields = [];
        if (!form.drinking) emptyFields.push(t("apps.my-info.fields.drinking"));
        if (!form.smoking) emptyFields.push(t("apps.my-info.fields.smoking"));
        if (!form.tattoo) emptyFields.push(t("apps.my-info.fields.tattoo"));
        if (!form.personality || form.personality.length === 0) emptyFields.push(t("apps.my-info.fields.personality"));
        if (!form.datingStyleIds || form.datingStyleIds.length === 0) emptyFields.push(t("apps.my-info.fields.dating_style"));
        if (!form.interestIds || form.interestIds.length === 0) emptyFields.push(t("apps.my-info.fields.interests"));
        if (!form.mbti) emptyFields.push(t("apps.my-info.fields.mbti"));

        if (emptyFields.length > 0) {
          const message = t("apps.my-info.validation.required_fields", { fields: emptyFields.join(", ") });
          console.error("Validation failed:", { emptyFields, form });
          throw new Error(message);
        }

        await savePreferences({
          datingStyleIds: form.datingStyleIds,
          interestIds: form.interestIds,
          drinking: form.drinking?.id as string,
          smoking: form.smoking?.id as string,
          tattoo: form.tattoo?.id as string,
          personality: form.personality as string[],
          militaryStatus: preferences?.options[currentIndex]?.id ?? "",

          mbti: form.mbti as string,
        });
        await queryClient.invalidateQueries({
          queryKey: ["preference-self"],
        });
        router.navigate("/my-info/done");
        setFormSubmitLoading(false);
      },
      (serverError: unknown) => {
        const err = serverError as { message?: string; error?: string; status?: number; statusCode?: number } | null;
        console.error("Profile save error:", {
          error: serverError,
          errorMessage: err?.message,
          errorString: err?.error,
          status: err?.status,
          statusCode: err?.statusCode,
          form,
        });

        const errorMessage = err?.message || err?.error || t("apps.my-info.errors.profile_save_failed");
        showErrorModal(errorMessage, "error");
        setFormSubmitLoading(false);
      }
    );
  };
  const onChangeOption = (value: number) => {
    if (preferences?.options && preferences.options.length > value) {
      updateForm("militaryStatus", preferences.options[value]);
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
            {t("apps.my-info.military.title")}
          </Text>
        </View>

        <View style={styles.bar} />

        <View style={styles.wrapper}>
          <Loading.Lottie
            title={t("apps.my-info.military.loading")}
            loading={optionsLoading}
          >
            <StepSlider
              min={0}
              max={(preferences?.options.length ?? 1) - 1}
              step={1}
              defaultValue={1}
              value={currentIndex}
              onChange={onChangeOption}
              middleLabelLeft={-15}
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
        onClickPrevious={() => router.navigate("/my-info/tattoo")}
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
