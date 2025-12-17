import React from "react";
import { semanticColors } from '../../../shared/constants/colors';
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";


function FindPartner() {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <View style={styles.seeMore}>
        <Text style={styles.seeMoreText}>{t("features.idle-match-timer.ui.find-partner.button_more")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 340,
    height: 300,
    backgroundColor: semanticColors.surface.background,
    borderRadius: 24,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  seeMore: {
    position: "absolute",
    right: 0,
    top: 0,
    height: "100%",
    width: 100,
    backgroundColor: semanticColors.brand.primary,
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  seeMoreText: {
    color: semanticColors.text.inverse,
    fontFamily: "Pretendard-Bold",
    fontWeight: 700,
    fontSize: 16,
  },
});

export default FindPartner;
