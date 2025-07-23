import Layout from "@/src/features/layout";
import MyInfo from "@/src/features/my-info";
import { useMbti } from "@/src/features/mypage/hooks";
import { PalePurpleGradient, Text } from "@/src/shared/ui";
import { MbtiSelector } from "@/src/widgets/mbti-selector";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Image, StyleSheet, View } from "react-native";

const { hooks, services, queries } = MyInfo;
const { useMyInfoForm, useMyInfoStep } = hooks;
const { MyInfoSteps } = services;

function MbtiSectionScreen() {
  const router = useRouter();
  const { mbti, updateForm } = useMyInfoForm();
  const { updateStep } = useMyInfoStep();
  const { isLoading, updateMbti, isUpdating } = useMbti();

  useFocusEffect(useCallback(() => updateStep(MyInfoSteps.MBTI), [updateStep]));
  const onUpdateMbti = (mbti: string) => {
    updateForm("mbti", mbti);
  };

  const handleNextButton = () => {
    updateMbti(mbti as string);
    router.push("/my-info/personality");
  };

  return (
    <Layout.Default>
      <PalePurpleGradient />
      <View style={styles.contentContainer}>
        <Image
          source={require("@assets/images/details.png")}
          style={{ width: 81, height: 81, marginLeft: 28 }}
        />
        <View style={styles.topContainer}>
          <Text weight="semibold" size="20" textColor="black">
            당신의 MBTI 유형은 무엇인가요?
          </Text>
        </View>
        <View style={styles.bar} />

        <MbtiSelector value={mbti} onChange={onUpdateMbti} onBlur={() => {}} />
        <Layout.TwoButtons
          disabledNext={!mbti}
          onClickNext={handleNextButton}
          onClickPrevious={() => router.navigate("/my-info/interest")}
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

export default MbtiSectionScreen;
