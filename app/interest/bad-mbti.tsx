import Interest from "@/src/features/interest";
import { PreferenceKeys } from "@/src/features/interest/queries";
import Layout from "@/src/features/layout";
import { useMbti } from "@/src/features/mypage/hooks";
import { PalePurpleGradient, Text } from "@/src/shared/ui";
import { MbtiSelector } from "@/src/widgets/mbti-selector";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

const { ui, hooks, services, queries } = Interest;
const { useInterestStep, useInterestForm } = hooks;
const { InterestSteps } = services;
const { usePreferenceOptionsQuery } = queries;

function BadMbti() {
  const router = useRouter();
  const [mbtiValue, setMbtiValue] = useState<string>("");
  const { badMbti, updateForm } = useInterestForm();
  const { updateStep } = useInterestStep();
  useFocusEffect(
    useCallback(() => updateStep(InterestSteps.BADMBTI), [updateStep])
  );
  const onUpdateMbti = (mbti: string) => {
    console.log("mbti", mbti);
    updateForm("badMbti", mbti);
  };

  const nextMessage = (() => {
    if (!badMbti) {
      return "상관없어요";
    }
    return "다음으로";
  })();

  return (
    <Layout.Default>
      <PalePurpleGradient />
      <View style={styles.contentContainer}>
        <Image
          source={require("@assets/images/everybody-happy.png")}
          style={{ width: 81, height: 81, marginLeft: 28 }}
        />
        <View style={styles.topContainer}>
          <Text weight="semibold" size="20" textColor="black">
            당신이 싫어하는 MBTI 유형은?
          </Text>
        </View>
        <View style={styles.bar} />

        <MbtiSelector
          value={mbtiValue}
          onChange={onUpdateMbti}
          onBlur={() => {}}
        />
        <Layout.TwoButtons
          disabledNext={false}
          content={{
            next: nextMessage,
          }}
          onClickNext={() => router.navigate("/interest/dating-style")}
          onClickPrevious={() => router.navigate("/interest/like-mbti")}
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
});

export default BadMbti;
