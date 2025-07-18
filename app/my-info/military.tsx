import { useAuth } from "@/src/features/auth";
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
import { Image, StyleSheet, View } from "react-native";

const { hooks, services, queries } = MyInfo;
const { useMyInfoForm, useMyInfoStep } = hooks;
const { MyInfoSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

export default function MilitarySelectionScreen() {
  const { updateForm, clear: _, militaryStatus, ...form } = useMyInfoForm();
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const { my } = useAuth();
  const { showErrorModal } = useModal();
  const {
    data: preferencesArray = [{ typeName: "", options: [] }],
    isLoading: optionsLoading,
  } = usePreferenceOptionsQuery();

  console.log(
    "result",
    preferencesArray,
    preferencesArray?.find(
      (item) => item.typeName === PreferenceKeys.MILITARY_STATUS
    )
  );
  const preferences: Preferences =
    preferencesArray?.find(
      (item) => item.typeName === PreferenceKeys.MILITARY_STATUS
    ) ?? preferencesArray[0];
  const index = preferences?.options.findIndex(
    (item) => item.id === militaryStatus?.id
  );

  const currentIndex = index !== undefined && index !== -1 ? index : 0;
  useEffect(() => {
    if (preferences.options[currentIndex]) {
      updateForm("militaryStatus", preferences.options[currentIndex]);
    }
  }, [currentIndex, updateForm, preferences]);
  console.log(militaryStatus, "mili");
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
        const validation = Object.values(form).every((v) => v !== null);
        if (!validation) throw new Error("비어있는 양식이 존재합니다.");
        await savePreferences({
          datingStyleIds: form.datingStyleIds,
          interestIds: form.interestIds,
          drinking: form.drinking?.id as string,
          smoking: form.smoking?.id as string,
          tattoo: form.tattoo?.id as string,
          personality: form.personality as string,
          militaryStatus: preferences?.options[currentIndex]?.id ?? "",

          mbti: form.mbti as string,
        });
        await queryClient.invalidateQueries({
          queryKey: ["preference-self"],
        });
        router.navigate("/my-info/done");
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
            군대는 다녀 오셨나요?
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
              onChange={onChangeOption}
              middleLabelLeft={-15}
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
