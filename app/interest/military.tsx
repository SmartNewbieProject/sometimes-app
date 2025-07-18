import { useAuth } from "@/src/features/auth";
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

  console.log(
    "result",
    preferencesArray?.find(
      (item) => item.typeName === PreferenceKeys.MILITARY_PREFERENCE
    )
  );
  const preferences: Preferences =
    preferencesArray?.find(
      (item) => item.typeName === PreferenceKeys.MILITARY_PREFERENCE
    ) ?? preferencesArray[0];
  const index = preferences?.options.findIndex(
    (item) => item.id === militaryPreference?.id
  );

  const currentIndex = index !== undefined && index !== -1 ? index : 0;
  console.log(militaryPreference, "mili");

  useEffect(() => {
    updateForm("militaryPreference", preferences.options[currentIndex]);
  }, [currentIndex, updateForm, preferences]);
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
        const validation = Object.values(form).every((v) => v !== null);
        if (!validation) throw new Error("비어있는 양식이 존재합니다.");
        await savePreferences({
          age: form.age as string,
          drinking: form.drinking?.id as string,
          smoking: form.smoking?.id as string,
          tattoo: form.tattoo?.id as string,
          personality: form.personality as string,
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
      ({ error }) => {
        showErrorModal(error, "error");
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
