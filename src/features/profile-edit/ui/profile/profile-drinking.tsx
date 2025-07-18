import Loading from "@/src/features/loading";
import MyInfo from "@/src/features/my-info";
import type { Preferences } from "@/src/features/my-info/api";
import colors from "@/src/shared/constants/colors";
import { StepSlider } from "@/src/shared/ui";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

const { hooks, services, queries } = MyInfo;
const { useMyInfoForm, useMyInfoStep } = hooks;

const { MyInfoSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

function ProfileDrinking() {
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
    updateForm("drinking", preferences.options[currentIndex]);
  }, [currentIndex, updateForm, preferences]);

  const onChangeDrinking = (value: number) => {
    if (preferences?.options && preferences.options.length > value) {
      updateForm("drinking", preferences.options[value]);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>음주 빈도</Text>
      <View style={styles.wrapper}>
        <Loading.Lottie
          title="음주 여부를 불러오고 있어요"
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

export default ProfileDrinking;
