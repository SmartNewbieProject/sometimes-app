import { Image } from "expo-image";
import React from "react";
import {
  type ImageStyle,
  type StyleProp,
  StyleSheet,
  Text,
  View,
} from "react-native";

function MatchingStatus() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>썸타임 매칭 현황</Text>
      <View style={styles.contentContainer}>
        <Card
          title="매칭 성공률"
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
          title="이번 주 새 매칭"
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
    fontFamily: "Pretendard-SemiBold",
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
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 30,
    marginTop: 6,
    marginBottom: 2,
  },
  cardTitle: {
    color: "#363636",
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Pretendard-Light",
    lineHeight: 16,
    marginTop: 2,
  },
});

export default MatchingStatus;
