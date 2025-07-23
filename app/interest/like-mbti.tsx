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

function LikeMbti() {
  const router = useRouter();
  const [mbtiValue, setMbtiValue] = useState<string>("");
  const { goodMbti, updateForm } = useInterestForm();
  const { updateStep } = useInterestStep();
  useFocusEffect(
    useCallback(() => updateStep(InterestSteps.GOODMBTI), [updateStep])
  );
  const onUpdateMbti = (mbti: string) => {
    updateForm("goodMbti", mbti);
  };

  const nextMessage = (() => {
    if (!goodMbti) {
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
            당신이 만나고 싶은 MBTI 유형은?
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
          onClickNext={() => router.push("/interest/bad-mbti")}
          onClickPrevious={() => router.navigate("/interest/age")}
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

export default LikeMbti;
