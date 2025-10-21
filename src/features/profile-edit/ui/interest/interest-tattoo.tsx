import Interest from "@/src/features/interest";
import type { Preferences } from "@/src/features/interest/api";
import Loading from "@/src/features/loading";
import colors from "@/src/shared/constants/colors";
import { StepSlider } from "@/src/shared/ui";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

const { hooks, services, queries } = Interest;
const { useInterestForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

function InterestTattoo() {
  const { updateForm, clear: _, tattoo } = useInterestForm();
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
    preferencesArray?.find((item) => item.typeName === Keys.TATTOO) ??
    preferencesArray[0];
  const index = preferences?.options.findIndex(
    (item) => item.id === tattoo?.id
  );

  const currentIndex = index !== undefined && index !== -1 ? index : 0;
  useEffect(() => {
    if (optionsLoading) return;
    if (!tattoo && preferences.options[currentIndex]) {
      updateForm("tattoo", preferences.options[currentIndex]);
    }
  }, [optionsLoading, preferences.options, currentIndex, tattoo]);
  const onChangeTattoo = (value: number) => {
    if (preferences?.options && preferences.options.length > value) {
      updateForm("tattoo", preferences.options[value]);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>문신 선호도</Text>
      <View style={styles.wrapper}>
        <Loading.Lottie
          title="문신 선호도 옵션을 불러오고 있어요"
          loading={optionsLoading}
        >
          <StepSlider
            min={0}
            max={(preferences?.options.length ?? 1) - 1}
            step={1}
            showMiddle={true}
            key={`tattoo-${currentIndex || "none"}`}
            defaultValue={currentIndex}
            value={currentIndex}
            middleLabelLeft={-10}
            onChange={onChangeTattoo}
            options={
              preferences?.options
                .map((option) =>
                  option.displayName === "문신 없음"
                    ? { ...option, displayName: "작은 문신" }
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    paddingTop: 32,
  },
  title: {
    color: colors.black,
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    fontWeight: 600,
    lineHeight: 22,
  },
  container: {
    paddingHorizontal: 28,
    marginBottom: 24,
  },
});

export default InterestTattoo;
