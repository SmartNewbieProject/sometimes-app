import { useAuth } from "@/src/features/auth";
import Layout from "@/src/features/layout";
import Loading from "@/src/features/loading";
import MyInfo from "@/src/features/my-info";
import type { Preferences } from "@/src/features/my-info/api";
import { ImageResources } from "@/src/shared/libs";
import { Divider, PalePurpleGradient, Text } from "@/src/shared/ui";
import { ChipSelector, StepIndicator } from "@/src/widgets";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Image, StyleSheet, View } from "react-native";

const { hooks, services, queries } = MyInfo;
const { useMyInfoForm, useMyInfoStep } = hooks;
const { MyInfoSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

export default function DatingStyleSelectionScreen() {
  const { my } = useAuth();
  const { datingStyleIds, updateForm } = useMyInfoForm();
  const {
    data: preferencesArray = [
      {
        typeName: "",
        options: [],
      },
    ],
    isLoading,
  } = usePreferenceOptionsQuery();

  console.log(
    "result",
    preferencesArray?.find(
      (item) => item.typeName === PreferenceKeys.DATING_STYLE
    )
  );
  const preferences: Preferences =
    preferencesArray?.find(
      (item) => item.typeName === PreferenceKeys.DATING_STYLE
    ) ?? preferencesArray[0];

  const onChangeOption = (values: string[]) => {
    if (values.length > 3) {
      return;
    }
    updateForm("datingStyleIds", values);
  };

  const nextMessage = (() => {
    if (datingStyleIds.length < 1) {
      return `${1 - datingStyleIds.length} 개만 더!`;
    }
    return "다음으로";
  })();

  const disabled = datingStyleIds.length < 1;

  useFocusEffect(
    useCallback(
      () => useMyInfoStep.getState().updateStep(MyInfoSteps.DATING_STYLE),
      []
    )
  );

  const handleNextButton = () => {
    router.navigate("/my-info/drinking");
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
            당신에게 가장 잘 맞는
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            연애 스타일은 무엇인가요?
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
          <Loading.Lottie
            title="연애 스타일 옵션 불러오고 있어요"
            loading={isLoading}
          >
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
        onClickPrevious={() => router.navigate("/my-info/personality")}
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
