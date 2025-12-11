import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "@/src/shared/ui";
import colors, { semanticColors } from "@/src/shared/constants/colors";

export const RespondedCard = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/moment/envelope-heart.png")}
        style={styles.icon}
        resizeMode="contain"
      />
      <View style={styles.contentContainer}>
        <Text size="md" weight="bold" textColor="black" style={styles.title}>
          {t('features.moment.my_moment.question_card.answered_today')}
        </Text>
        <Text size="12" weight="normal" textColor="gray">
          {t('features.moment.my_moment.question_card.see_you_tomorrow')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.moreLightPurple,
    borderRadius: 20,
    paddingVertical: 24,
    paddingRight: 20,
    paddingLeft: 70,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.lightPurple,
    position: "relative",
  },
  icon: {
    width: 73,
    height: 73,
    position: "absolute",
    top: -15,
    left: -10,
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
});
