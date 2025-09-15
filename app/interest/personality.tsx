import type { Preferences } from "@/src/features/interest/api";
import Layout from "@/src/features/layout";
import Loading from "@/src/features/loading";
import { ChipSelector } from "@/src/widgets";
import { track } from "@amplitude/analytics-react-native";
import Interest from "@features/interest";
import { PalePurpleGradient, Text } from "@shared/ui";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Image, StyleSheet, View } from "react-native";

const { hooks, services, queries } = Interest;
const { useInterestForm, useInterestStep } = hooks;
const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

export default function PersonalitySelectionScreen() {
  const { updateStep } = useInterestStep();
  const { personality, updateForm } = useInterestForm();
  const {
    data: preferencesArray = [
      {
        typeName: "",
        options: [],
      },
    ],
    isLoading,
  } = usePreferenceOptionsQuery();

  const preferences: Preferences =
    preferencesArray?.find(
      (item) => item.typeName === PreferenceKeys.PERSONALITY
    ) ?? preferencesArray[0];

  const onChangeOption = (values: string[]) => {
    if (values.length > 3) {
      return;
    }

    if (values.length === 0) {
      updateForm("personality", undefined);
    } else {
      updateForm("personality", values);
    }
  };

  const nextMessage = (() => {
    if (!personality) {
      return "최대 3개 선택 가능";
    }
    return "다음으로";
  })();

  const onNext = () => {
    track("Interest_Personality", {
      env: process.env.EXPO_PUBLIC_TRACKING_MODE,
    });
    router.push("/interest/drinking");
  };

  useFocusEffect(
    useCallback(() => updateStep(InterestSteps.PERSONALITY), [updateStep])
  );
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
            당신이 원하는
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            이상형의 성격은 어떤가요?
          </Text>
        </View>

        <View style={styles.bar} />

        <View style={styles.chipSelector}>
          <Loading.Lottie
            title="성격 유형을 불러오고 있어요"
            loading={isLoading}
          >
            <ChipSelector
              value={personality}
              options={
                preferences?.options.map((option) => ({
                  label: option.displayName,
                  value: option.id,
                  imageUrl: option?.imageUrl,
                })) || []
              }
              multiple={true}
              onChange={onChangeOption}
              className="w-full"
            />
          </Loading.Lottie>
        </View>
      </View>
      <Layout.TwoButtons
        disabledNext={!personality}
        content={{
          next: nextMessage,
        }}
        onClickNext={onNext}
        onClickPrevious={() => router.navigate("/interest/bad-mbti")}
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
    marginTop: 15,
  },
  indicatorContainer: {
    width: "100%",
    rowGap: 10,
    paddingHorizontal: 32,
  },
  chipSelector: {
    marginTop: 12,
    paddingLeft: 24,
    paddingRight: 28,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
});
