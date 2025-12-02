
import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  type ImageStyle,
  type StyleProp,
  StyleSheet,
  Text,
  View,
} from "react-native";

function MatchingStatus() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t("features.home.ui.matching_status.title")}
      </Text>
      <View style={styles.contentContainer}>
        <Card
          title={t("features.home.ui.matching_status.success_rate")}
          statistics={"89%"}
          imageUri={require("@assets/images/chart-arrow.png")}
          imageStyle={{ width: 35, height: 26, marginBottom: 7, marginTop: 6 }}
        />
        <View style={{ alignItems: "center", height: 86 }}>
          {Array.from({ length: 14 }).map((_, index) => (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              style={{
                width: 2,
                height: 4,
                borderRadius: 2,
                backgroundColor: "#DFC7FF", // 연보라
                marginVertical: 1,
              }}
            />
          ))}
        </View>
        <Card
          title={t("features.home.ui.matching_status.new_matches_this_week")}
          statistics={"2,847"}
          imageUri={require("@assets/images/new.png")}
          imageStyle={{ width: 37.5, height: 37.5, marginBottom: 0 }}
        />
      </View>
    </View>
  );
}

interface CardProps {
  title: string;
  statistics: string;
  imageUri: string;
  imageStyle: StyleProp<ImageStyle>;
}

function Card({ title, statistics, imageUri, imageStyle }: CardProps) {
  return (
    <View style={styles.cardContainer}>
      <Image source={imageUri} style={imageStyle} />
      <Text style={styles.cardStatistics}>{statistics}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: "#F6F2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#1F1F1F",
    textAlign: "center",
    fontSize: 18,
    fontFamily: "semibold",
    fontWeight: 600,
    lineHeight: 21.6,
    marginBottom: 12,
  },
  contentContainer: {
    flexDirection: "row",
    gap: 48,
    alignItems: "center",
  },
  cardContainer: {
    alignItems: "center",
  },
  cardStatistics: {
    color: "#313131",
    textAlign: "center",
    fontSize: 26,
    fontFamily: "semibold",
    fontWeight: 600,
    lineHeight: 30,
    marginTop: 6,
    marginBottom: 2,
  },
  cardTitle: {
    color: "#363636",
    textAlign: "center",
    fontSize: 14,
    fontFamily: "light",

    fontWeight: 300,
    lineHeight: 16,
    marginTop: 2,
  },
});

export default MatchingStatus;