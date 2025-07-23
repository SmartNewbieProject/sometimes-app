import type { Preferences } from "@/src/features/interest/api";
import { PreferenceKeys } from "@/src/features/interest/queries";
import { usePreferenceOptionsQuery } from "@/src/features/interest/queries";
import type { AgeOptionData } from "@/src/features/interest/types";
import Layout from "@/src/features/layout";
import Loading from "@/src/features/loading";
import { environmentStrategy, platform } from "@/src/shared/libs";
import { PalePurpleGradient } from "@/src/shared/ui";
import Interest from "@features/interest";
import { Text } from "@shared/ui";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, Platform, StyleSheet, View } from "react-native";

const { ui, hooks, services } = Interest;
const { AgeSelector } = ui;
const { useInterestStep, useInterestForm } = hooks;
const { InterestSteps } = services;

export default function AgeSelectionScreen() {
  const { age, updateForm } = useInterestForm();
  const { updateStep } = useInterestStep();
  const [options, setOptions] = useState<AgeOptionData[]>([]);
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
    preferencesArray?.find((item) => item.typeName === PreferenceKeys.AGE) ??
    preferencesArray[0];

  useEffect(() => {
    if (preferences.typeName === "") {
      return;
    }
    const loaded = preferences.options.map((option) => ({
      value: option.id,
      label: option.displayName,
      image: (() => {
        switch (option.displayName) {
          case "동갑":
            return require("@assets/images/age/same.png");
          case "연하":
            return require("@assets/images/age/under.png");
          case "연상":
            return require("@assets/images/age/high.png");
          default:
            return require("@assets/images/age/nothing.png");
        }
      })(),
    })) as AgeOptionData[];

    setOptions(loaded);
  }, [preferences]);

  useFocusEffect(
    useCallback(() => updateStep(InterestSteps.AGE), [updateStep])
  );

  if (optionsLoading) {
    return <Loading.Page title="나이대 선호도를 불러오고 있어요" />;
  }

  return (
    <Layout.Default>
      <PalePurpleGradient />
      <View style={styles.contentContainer}>
        <Image
          source={require("@assets/images/peoples.png")}
          style={{ width: 81, height: 81, marginLeft: 28 }}
        />
        <View style={styles.topContainer}>
          <Text weight="semibold" size="20" textColor="black">
            선호하는 나이대를
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            선택해 주세요!
          </Text>
        </View>
        <View style={styles.bar} />
        <View style={[styles.ageContainer]}>
          <AgeSelector
            options={options}
            value={age}
            onChange={(age) => updateForm("age", age)}
          />
        </View>

        <Layout.TwoButtons
          disabledNext={!age}
          onClickNext={() => router.push("/interest/like-mbti")}
          onClickPrevious={() => {
            router.navigate("/interest");
          }}
        />
      </View>
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

    alignItems: "center",
  },
  bar: {
    marginHorizontal: 32,

    height: 0.5,
    backgroundColor: "#E7E9EC",
    marginTop: 15,
    marginBottom: 30,
  },
});
