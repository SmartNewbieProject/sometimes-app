import BulbIcon from "@assets/icons/bulb.svg";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

function ChatGuideBanner() {
  const { t } = useTranslation();

  const guideTexts = useMemo(() => [
    t('features.chat.ui.chat_guide_banner.guide_1'),
    t('features.chat.ui.chat_guide_banner.guide_2'),
    t('features.chat.ui.chat_guide_banner.guide_3'),
    t('features.chat.ui.chat_guide_banner.guide_4'),
    t('features.chat.ui.chat_guide_banner.guide_5'),
    t('features.chat.ui.chat_guide_banner.guide_6'),
  ], [t]);

  const guideList = getRandomItems(guideTexts, 2);
  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <BulbIcon />
        <Text style={styles.title}>{t('features.chat.ui.chat_guide_banner.title')}</Text>
      </View>
      <View style={styles.bottomContainer}>
        {guideList.map((item) => (
          <View key={item} style={styles.guideContainer}>
            <Text style={styles.guideText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: semanticColors.surface.background,
    borderRadius: 10,
    marginHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: semanticColors.text.muted,
  },
  topContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  title: {
    color: semanticColors.text.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  guideContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: semanticColors.surface.background,
  },
  guideText: {
    fontSize: 13,
    lineHeight: 20,
    color: semanticColors.text.muted,
  },
  bottomContainer: {
    marginTop: 12,
    gap: 4,
    paddingHorizontal: 7,
  },
});

function getRandomItems(arr: string[], count: number) {
  const uniqueArr = [...new Set(arr)];

  const result: string[] = [];

  while (result.length < count) {
    const randomIndex = Math.floor(Math.random() * uniqueArr.length);
    const randomItem = uniqueArr[randomIndex];

    if (!result.includes(randomItem)) {
      result.push(randomItem);
    }
  }

  return result;
}
export default ChatGuideBanner;
