import { useAuth } from "@/src/features/auth";
import Loading from "@/src/features/loading";
import MyInfo from "@/src/features/my-info";
import type { Preferences } from "@/src/features/my-info/api";
import Tooltip from "@/src/shared/ui/tooltip";
import { track } from "@amplitude/analytics-react-native";
import Interest from "@features/interest";
import Layout from "@features/layout";
import { PalePurpleGradient, StepSlider, Text } from "@shared/ui";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

const { hooks, services, queries } = MyInfo;
const { useMyInfoForm, useMyInfoStep } = hooks;

const { MyInfoSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

const tooltips = [
  {
    title: "전혀 안 마셔요",
    description: [
      "비음주자를 선호해요",
      "술자리에 가지 않는 사람이 좋아요",
      "음주에 대해 부정적인 생각을 가진 분이 좋아요",
    ],
  },
  {
    title: "술은 거의 못 마셔요",
    description: [
      "학기에 1-2번 특별한 자리에서만",
      "맥주 반잔도 얼굴 빨개지는 수준",
    ],
  },
  {
    title: "적당히 마셔요",
    description: [
      "월 2-3회 정도 과모임이나 친구 만날 때",
      "소주 한두 잔 정도는 괜찮아요",
    ],
  },
  {
    title: "자주 마시는 편이에요",
    description: [
      "주말마다 한 번씩은 마셔요",
      "월 4-5회 정도, 소주 반병~한병 정도",
    ],
  },
  {
    title: "술자리 빠지면 섭섭해요",
    description: ["주 2-3회 이상 마셔요", "MT나 뒤풀이에서 항상 끝까지 남아요"],
  },
];

export default function DrinkingSelectionScreen() {
  const { updateStep } = useMyInfoStep();
  const { drinking, updateForm } = useMyInfoForm();

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
    track("Profile_Drinking");
    router.push("/my-info/smoking");
  };

  useFocusEffect(
    useCallback(() => updateStep(MyInfoSteps.DRINKING), [updateStep])
  );

  const handleBackButton = () => {
    router.navigate("/my-info/dating-style");
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
              lastLabelLeft={-50}
              options={
                preferences?.options
                  .map((option) =>
                    option.displayName === "전혀 안마시지 않음"
                      ? { ...option, displayName: "전혀 마시지 않음" }
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
