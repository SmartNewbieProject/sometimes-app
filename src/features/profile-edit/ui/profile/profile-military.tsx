import Loading from "@/src/features/loading";
import MyInfo from "@/src/features/my-info";
import type { Preferences } from "@/src/features/my-info/api";
import colors from "@/src/shared/constants/colors";
import { StepSlider } from "@/src/shared/ui";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const { hooks, services, queries } = MyInfo;
const { useMyInfoForm } = hooks;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

function ProfileMilitary() {
  const { updateForm, clear: _, militaryStatus, ...form } = useMyInfoForm();

  const {
    data: preferencesArray = [{ typeName: "", options: [] }],
    isLoading: optionsLoading,
  } = usePreferenceOptionsQuery();
  const preferences: Preferences =
    preferencesArray?.find(
      (item) => item.typeName === PreferenceKeys.MILITARY_STATUS
    ) ?? preferencesArray[0];
  const index = preferences?.options.findIndex(
    (item) => item.id === militaryStatus?.id
  );

  const currentIndex = index !== undefined && index !== -1 ? index : 0;
  console.log("mili status", currentIndex);

  const onChangeOption = (value: number) => {
    if (preferences?.options && preferences.options.length > value) {
      updateForm("militaryStatus", preferences.options[value]);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>병역사항</Text>
      <View style={styles.wrapper}>
        <Loading.Lottie title="옵션을 불러오고 있어요" loading={optionsLoading}>
          <StepSlider
            key={`military-${currentIndex || "none"}`}
            min={0}
            defaultValue={currentIndex}
            max={(preferences?.options.length ?? 1) - 1}
            step={1}
            value={currentIndex}
            onChange={onChangeOption}
            middleLabelLeft={-15}
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

export default ProfileMilitary;
