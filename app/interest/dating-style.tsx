import { useAuth } from "@/src/features/auth";
import Layout from "@/src/features/layout";
import Loading from "@/src/features/loading";
import { ImageResources } from "@/src/shared/libs";
import { Divider, PalePurpleGradient, Text } from "@/src/shared/ui";
import { ChipSelector, StepIndicator } from "@/src/widgets";
import Interest from "@features/interest";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Image, StyleSheet, View } from "react-native";

const { hooks, services, queries } = Interest;
const { useInterestStep, useInterestForm } = hooks;
const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

export default function DatingStyleSelectionScreen() {
  const { my } = useAuth();
  const { datingStyleIds, updateForm } = useInterestForm();
  const { data: preferences, isLoading } = usePreferenceOptionsQuery(
    PreferenceKeys.DATING_STYLE
  );

  const onChangeOption = (values: string[]) => {
    if (values.length > 5) {
      return;
    }
    console.log(values, "values");
    updateForm("datingStyleIds", values);
  };

  const nextMessage = (() => {
    if (datingStyleIds.length < 1) {
      return `${1 - datingStyleIds.length} 개만 더 선택해주세요`;
    }
    return "다음으로";
  })();

  const disabled = datingStyleIds.length < 1;

  useFocusEffect(
    useCallback(
      () => useInterestStep.getState().updateStep(InterestSteps.DATING_STYLE),
      []
    )
  );

  const handleNextButton = () => {
    if (my?.gender === "FEMALE") {
      router.navigate("/interest/military");
    } else {
      router.navigate("/interest/military");
    }
  };

  return (
    <Layout.Default>
      <PalePurpleGradient />
      <View style={styles.contentContainer}>
        <Image
          source={{ uri: ImageResources.DATING_STYLE }}
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

        <View style={styles.indicatorContainer}>
          <StepIndicator
            length={3}
            step={datingStyleIds.length}
            dotGap={4}
            dotSize={16}
            className="self-end"
          />
          <Divider.Horizontal />
        </View>

        <View className="flex-1 w-full flex px-4 mt-2">
          <Loading.Lottie title="관심사를 불러오고 있어요" loading={isLoading}>
            <ChipSelector
              value={datingStyleIds}
              options={
                preferences?.options.map((option) => ({
                  label: option.displayName,
                  value: option.id,
                  imageUrl: option?.imageUrl,
                })) || []
              }
              onChange={onChangeOption}
              multiple
              align="center"
              style={styles.chipSelector}
            />
          </Loading.Lottie>
        </View>
      </View>

      <Layout.TwoButtons
        disabledNext={disabled}
        content={{
          next: nextMessage,
        }}
        onClickNext={handleNextButton}
        onClickPrevious={() => router.navigate("/interest/dating-style")}
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
