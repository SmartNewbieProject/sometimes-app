import { Properties, savePreferences } from "@/src/features/interest/services";
import Loading from "@/src/features/loading";
import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { tryCatch } from "@/src/shared/libs";
import { Selector } from "@/src/widgets/selector";
import Interest from "@features/interest";
import Layout from "@features/layout";
import { PalePurpleGradient, StepSlider, Text } from "@shared/ui";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

const { ui, hooks, services, queries } = Interest;
const { useInterestStep, useInterestForm } = hooks;
const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

export default function TattooSelectionScreen() {
  const { updateStep } = useInterestStep();
  const { updateForm, clear: _, tattoo, ...form } = useInterestForm();
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  const {
    data: preferences = {
      id: "",
      options: [],
    },
    isLoading: optionsLoading,
  } = usePreferenceOptionsQuery(Keys.TATTOO);
  const { showErrorModal } = useModal();
  const index = preferences?.options.findIndex(
    (item) => item.id === tattoo?.id
  );

  const currentIndex = index !== undefined && index !== -1 ? index : 0;
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
        const validation = Object.values(form).every((v) => v !== null);
        if (!validation) throw new Error("비어있는 양식이 존재합니다.");
        await savePreferences({
          age: form.age as string,
          drinking: form.drinking?.id as string,
          smoking: form.smoking?.id as string,
          tattoo: preferences.options[currentIndex].id,
          datingStyleIds: form.datingStyleIds as string[],
          militaryPreference: form.militaryPreference?.id as string,
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

  useFocusEffect(
    useCallback(() => updateStep(InterestSteps.TATTOO), [updateStep])
  );

  if (formSubmitLoading) {
    return <Loading.Page />;
  }

  return (
    <Layout.Default>
      <PalePurpleGradient />
      <View className="flex-1 px-5 pt-4">
        <Image
          source={require("@assets/images/loved.png")}
          style={{ width: 81, height: 81 }}
        />
        <View className="flex flex-col my-2 mb-4">
          <Text weight="semibold" size="20" textColor="black">
            문신에 대해
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            어떻게 생각하시나요?
          </Text>
        </View>

        <View className="flex-1 w-full items-center pt-2">
          <Loading.Lottie
            title="선호도를 불러오고 있어요"
            loading={optionsLoading}
          >
            <StepSlider
              min={0}
              max={(preferences?.options.length ?? 1) - 1}
              step={1}
              showMiddle={true}
              defaultValue={2}
              value={currentIndex}
              onChange={onChangeTattoo}
              options={
                preferences?.options.map((option) => ({
                  label: option.displayName,
                  value: option.id,
                })) || []
              }
            />
          </Loading.Lottie>
        </View>

        <Layout.TwoButtons
          style={{ paddingHorizontal: 32 }}
          disabledNext={false}
          onClickNext={onFinish}
          onClickPrevious={() => router.navigate("/interest/smoking")}
        />
      </View>
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
