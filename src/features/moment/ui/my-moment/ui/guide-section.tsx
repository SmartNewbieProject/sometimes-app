import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "@/src/shared/ui";
import colors from "@/src/shared/constants/colors";
import { semanticColors } from "@/src/shared/constants/semantic-colors";

interface GuideSectionProps {
  responded?: boolean;
}

export const GuideSection = ({ responded = false }: GuideSectionProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          <Text size="18" weight="semibold" textColor="black" style={styles.label}>
            {t('features.moment.my_moment.guide.every_night')}
          </Text>
          <Text size="20" weight="bold" textColor="purple" style={styles.time}>
            {t('features.moment.my_moment.guide.at_midnight')}
          </Text>
        </View>

        <Text size="12" weight="normal" textColor="gray" style={styles.description}>
          {t('features.moment.my_moment.guide.description_1')}{"\n"}
          {t('features.moment.my_moment.guide.description_2')} <Text size="12" weight="bold" textColor="purple">{t('features.moment.my_moment.guide.every_sunday')}</Text> {t('features.moment.my_moment.guide.report_generated')}
        </Text>

        {responded && (
          <View style={styles.rewardContainer}>
            <Image
              source={require("@/assets/images/promotion/home-banner/gem.png")}
              style={styles.gemIcon}
              resizeMode="contain"
            />
            <Text size="12" weight="medium" textColor="purple">
              {t('features.moment.my_moment.question_card.reward_received')}
            </Text>
          </View>
        )}
      </View>
      <Image
        source={require("@/assets/images/moment/miho-mailbox.png")}
        style={styles.character}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
    minHeight: 180,
    position: "relative",
  },
  textContainer: {
    flex: 1,
    paddingBottom: 20,
    zIndex: 10,
    justifyContent: "flex-start",
    marginTop: 10,
  },
  label: {
    fontSize: 24,
  },
  time: {
    fontSize: 32,
  },
  description: {
    lineHeight: 18,
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },
  gemIcon: {
    width: 18,
    height: 18,
  },
  character: {
    width: 180,
    height: 160,
    position: "absolute",
    bottom: 0,
    right: -20,
    zIndex: 1,
  },
});
