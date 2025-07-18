import { useAuth } from "@/src/features/auth";
import Loading from "@/src/features/loading";
import MyInfo from "@/src/features/my-info";
import type { Preferences } from "@/src/features/my-info/api";
import { Properties, savePreferences } from "@/src/features/my-info/services";
import { queryClient } from "@/src/shared/config/query";
import { useModal } from "@/src/shared/hooks/use-modal";
import { tryCatch } from "@/src/shared/libs";
import Tooltip from "@/src/shared/ui/tooltip";
import Layout from "@features/layout";
import { PalePurpleGradient, StepSlider, Text } from "@shared/ui";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

const { hooks, services, queries } = MyInfo;
const { useMyInfoForm, useMyInfoStep } = hooks;
const { MyInfoSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

const tooltips = [
  {
    title: "문신 X",
    description: ["문신이 전혀 없어요", "향후에도 할 계획이 없어요"],
  },
  {
    title: "작은 문신",
    description: [
      "눈에 잘 뜨지 않는 곳에 작은 문신이 있어요",
      "손목, 발목, 어깨 등에 1-2개 정도의 작은 문신",
      "평소엔 옷으로 가려지는 은근한 포인트 문신",
    ],
  },
  {
    title: "문신 O",
    description: [
      "눈에 띄는 문신이 있어요",
      "다수의 문신이 있거나 큰 사이즈의 문신",
      "문신을 패션/자기 표현의 일부로 생각해요",
    ],
  },
];

export default function TattooSelectionScreen() {
  const { updateStep } = useMyInfoStep();
  const { updateForm, clear: _, tattoo, ...form } = useMyInfoForm();
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

  console.log(
    "result",
    preferencesArray?.find((item) => item.typeName === Keys.TATTOO)
  );
  const preferences: Preferences =
    preferencesArray?.find((item) => item.typeName === Keys.TATTOO) ??
    preferencesArray[0];
  const index = preferences?.options.findIndex(
    (item) => item.id === tattoo?.id
  );

  const currentIndex = index !== undefined && index !== -1 ? index : 0;
  useEffect(() => {
    if (preferences.options[currentIndex]) {
      updateForm("tattoo", preferences.options[currentIndex]);
    }
  }, [currentIndex, updateForm, preferences]);
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
          drinking: form.drinking?.id as string,
          smoking: form.smoking?.id as string,
          personality: form.personality as string,
          tattoo: preferences.options[currentIndex].id,
          datingStyleIds: form.datingStyleIds,
          interestIds: form.interestIds,
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

  const handleNextButton = () => {
    updateForm("tattoo", preferences.options[currentIndex]);

    router.navigate("/my-info/military");
  };

  useFocusEffect(
    useCallback(() => updateStep(MyInfoSteps.TATTOO), [updateStep])
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
            문신이 있으신가요?
          </Text>
        </View>
        <View style={styles.bar} />
        <View style={styles.wrapper}>
          <Loading.Lottie
            title="선호도를 불러오고 있어요"
            loading={optionsLoading}
          >
            <StepSlider
              min={0}
              max={(preferences?.options.length ?? 1) - 1}
              step={1}
              showMiddle={true}
              defaultValue={0}
              value={currentIndex}
              middleLabelLeft={-10}
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
        onClickNext={my?.gender === "FEMALE" ? onFinish : handleNextButton}
        onClickPrevious={() => router.navigate("/my-info/smoking")}
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
