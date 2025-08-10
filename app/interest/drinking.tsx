import { useAuth } from "@/src/features/auth";
import type { Preferences } from "@/src/features/interest/api";
import Loading from "@/src/features/loading";
import Tooltip from "@/src/shared/ui/tooltip";
import { Selector } from "@/src/widgets/selector";
import { track } from "@amplitude/analytics-react-native";
import Interest from "@features/interest";
import Layout from "@features/layout";
import { PalePurpleGradient, StepSlider, Text } from "@shared/ui";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

const { hooks, services, queries } = Interest;
const { useInterestStep, useInterestForm } = hooks;

const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

const tooltips = [
  {
    title: "안 마시면 좋겠어요.",
    description: [
      "비음주자를 선호해요",
      "술자리에 가지 않는 사람이 좋아요",
      "음주에 대해 부정적인 생각을 가진 분이 좋아요",
    ],
  },
  {
    title: "가끔만 마셨으면 해요",
    description: [
      "특별한 날에만 가볍게 마시는 정도가 좋아요",
      "술에 크게 의존하지 않는 사람이 좋아요",
      "월 1-2회 정도만 마시는 분이 좋아요",
    ],
  },
  {
    title: "적당히 마시는 정도가 좋아요",
    description: [
      "사교적으로 적절히 마실 줄 아는 사람이 좋아요",
      "음주는 하지만 과하지 않는 분이 좋아요",
      "월 2-3회 정도 마시는 것은 괜찮아요",
    ],
  },
  {
    title: "술자리를 즐기는 사람이 좋아요",
    description: [
      "함께 술자리를 즐길 수 있는 사람이 좋아요",
      "주말 술자리에 잘 참여하는 분이 좋아요",
      "술게임도 재밌게 할 줄 아는 분이 좋아요",
    ],
  },
  {
    title: "자주 마셔도 괜찮아요",
    description: [
      "술을 즐기는 사람도 전혀 상관없어요",
      "함께 술 문화를 즐기고 싶어요",
      "주 2-3회 이상 마셔도 괜찮아요",
    ],
  },
];

export default function DrinkingSelectionScreen() {
  const { updateStep } = useInterestStep();
  const { drinking, updateForm } = useInterestForm();
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
    track("Interest_Drinking", { env: process.env.EXPO_PUBLIC_TRACKING_MODE });
    router.push("/interest/smoking");
  };

  useFocusEffect(
    useCallback(() => updateStep(InterestSteps.DRINKING), [updateStep])
  );

  const handleBackButton = () => {
    router.navigate("/interest/personality");
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
            음주는 만남에서 중요한 부분이죠
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            음주 선호도를 알려주세요!
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
              showMiddle={false}
              defaultValue={2}
              value={currentIndex}
              onChange={onChangeDrinking}
              lastLabelLeft={-70}
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
