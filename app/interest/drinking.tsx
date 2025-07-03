import { useAuth } from "@/src/features/auth";
import Loading from "@/src/features/loading";
import { Selector } from "@/src/widgets/selector";
import Interest from "@features/interest";
import Layout from "@features/layout";
import { PalePurpleGradient, StepSlider, Text } from "@shared/ui";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Image, StyleSheet, View } from "react-native";

const { hooks, services, queries } = Interest;
const { useInterestStep, useInterestForm } = hooks;

const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

export default function DrinkingSelectionScreen() {
  const { updateStep } = useInterestStep();
  const { drinking, updateForm } = useInterestForm();
  const { my } = useAuth();
  const {
    data: preferences = {
      id: "",
      options: [],
    },
    isLoading: optionsLoading,
  } = usePreferenceOptionsQuery(Keys.DRINKING);
  const index = preferences?.options.findIndex(
    (item) => item.id === drinking?.id
  );

  const currentIndex = index !== undefined && index !== -1 ? index : 0;
  const onChangeDrinking = (value: number) => {
    if (preferences?.options && preferences.options.length > value) {
      updateForm("drinking", preferences.options[value]);
    }
  };

  const handleNextButton = () => {
    if (!drinking) {
      updateForm("drinking", preferences.options[currentIndex]);
    }
    router.navigate("/interest/smoking");
  };

  useFocusEffect(
    useCallback(() => updateStep(InterestSteps.DRIKNING), [updateStep])
  );

  const handleBackButton = () => {
    if (my?.gender === "MALE") {
      router.navigate("/interest/dating-style");
    } else {
      router.navigate("/interest/military");
    }
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
});
