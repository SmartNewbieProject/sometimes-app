import Interest from "@/src/features/interest";
import { semanticColors } from '../../src/shared/constants/colors';
import { PreferenceKeys } from "@/src/features/interest/queries";
import Layout from "@/src/features/layout";
import { useMbti } from "@/src/features/mypage/hooks";
import { PalePurpleGradient, Text } from "@/src/shared/ui";
import { useTranslation } from 'react-i18next';
import { MbtiSelector } from "@/src/widgets/mbti-selector";
import { track } from "@/src/shared/libs/amplitude-compat";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

const { ui, hooks, services, queries } = Interest;
const { useInterestStep, useInterestForm } = hooks;
const { InterestSteps } = services;
const { usePreferenceOptionsQuery } = queries;

function BadMbti() {
  const { t } = useTranslation();
  const router = useRouter();
  const [mbtiValue, setMbtiValue] = useState<string>("");
  const { badMbti, updateForm } = useInterestForm();
  const { updateStep } = useInterestStep();
  useFocusEffect(
    useCallback(() => updateStep(InterestSteps.BADMBTI), [updateStep])
  );
  const onUpdateMbti = (mbti: string) => {
    updateForm("badMbti", mbti);
  };

  const nextMessage = (() => {
    if (!badMbti) {
      return t("apps.interest.bad_mbti.next_none");
    }
    return t("global.next");
  })();

  const onNext = () => {
    track("Interest_hateMbti", { env: process.env.EXPO_PUBLIC_TRACKING_MODE });
    router.push("/interest/personality");
  };

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
            {t("apps.interest.bad_mbti.title")}
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
          onClickNext={onNext}
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
    backgroundColor: semanticColors.surface.background,
    marginTop: 39,
    marginBottom: 30,
  },
});

export default BadMbti;
