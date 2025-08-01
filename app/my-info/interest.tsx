import Layout from "@/src/features/layout";
import Loading from "@/src/features/loading";
import MyInfo from "@/src/features/my-info";
import { ChipSelector, StepIndicator } from "@/src/widgets";
import { track } from "@amplitude/analytics-react-native";
import { Divider, PalePurpleGradient, Text } from "@shared/ui";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Image, StyleSheet, View } from "react-native";

const { hooks, services, queries } = MyInfo;
const { MyInfoSteps } = services;
const { useMyInfoForm, useMyInfoStep } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

export default function InterestSelectionScreen() {
  const { updateStep } = useMyInfoStep();
  const { interestIds, updateForm } = useMyInfoForm();
  const {
    data: preferencesArray = [
      {
        typeName: "",
        options: [],
      },
    ],
    isLoading,
  } = usePreferenceOptionsQuery();
  const preferences = preferencesArray?.find(
    (item) => item.typeName === PreferenceKeys.INTEREST
  );

  const onChangeOption = (values: string[]) => {
    if (values.length > 5) {
      return;
    }
    updateForm("interestIds", values);
  };

  const disabled = interestIds.length < 3;

  const nextMessage = (() => {
    if (interestIds.length < 3) {
      return `${3 - interestIds.length} 개만 더!`;
    }
    return "다음으로";
  })();

  useFocusEffect(
    useCallback(() => updateStep(MyInfoSteps.INTEREST), [updateStep])
  );

  const onNext = () => {
    track("Profile_Interest");
    router.push("/my-info/mbti");
  };

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
            최근에 관심이 가는
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            활동이나 일이 있나요?
          </Text>
        </View>

        <View style={styles.indicatorContainer}>
          <StepIndicator
            length={5}
            step={interestIds.length}
            dotGap={4}
            dotSize={16}
            className="self-end"
          />
          <Divider.Horizontal />
        </View>

        <View className="flex-1 w-full flex px-4">
          <Loading.Lottie title="관심사를 불러오고 있어요" loading={isLoading}>
            <ChipSelector
              value={interestIds}
              options={
                preferences?.options.map((option) => ({
                  label: option.displayName,
                  value: option.id,
                  imageUrl: option?.imageUrl,
                })) || []
              }
              onChange={onChangeOption}
              multiple
              style={styles.chipSelector}
              align="center"
            />
          </Loading.Lottie>
        </View>
      </View>
      <Layout.TwoButtons
        disabledNext={disabled}
        content={{
          next: nextMessage,
        }}
        onClickNext={onNext}
        onClickPrevious={() => router.navigate("/my-info")}
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
    marginBottom: 30,
  },
  indicatorContainer: {
    width: "100%",
    rowGap: 10,
    paddingHorizontal: 32,
  },
  chipSelector: {
    marginTop: 12,
    paddingHorizontal: 24,
    justifyContent: "flex-start",
  },
});
