import Interest from "@/src/features/interest";
import Loading from "@/src/features/loading";

import type { Preferences } from "@/src/features/interest/api";
import colors from "@/src/shared/constants/colors";
import { StepSlider } from "@/src/shared/ui";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

const { hooks, queries } = Interest;
const { useInterestForm } = hooks;

const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

function InterestDrinking() {
  const { drinking, updateForm } = useInterestForm();

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
    updateForm("drinking", preferences.options[currentIndex]);
  }, [currentIndex, updateForm, preferences]);
  const onChangeDrinking = (value: number) => {
    if (preferences?.options && preferences.options.length > value) {
      updateForm("drinking", preferences.options[value]);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>음주 선호도</Text>
      <View style={styles.wrapper}>
        <Loading.Lottie
          title="음주 선호도를 불러오고 있어요"
          loading={optionsLoading}
        >
          <StepSlider
            min={0}
            max={(preferences?.options.length ?? 1) - 1}
            step={1}
            showMiddle={false}
            key={`drinking-${currentIndex || "none"}`}
            defaultValue={currentIndex}
            value={currentIndex}
            firstLabelLeft={0}
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
    fontWeight: 600,
    lineHeight: 22,
  },
  container: {
    paddingHorizontal: 28,
    marginBottom: 24,
  },
});

export default InterestDrinking;
