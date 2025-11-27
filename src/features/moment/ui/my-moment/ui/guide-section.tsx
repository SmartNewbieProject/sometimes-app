import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text } from "@/src/shared/ui";
import colors, { semanticColors } from "@/src/shared/constants/colors";

export const GuideSection = () => {
  return (
    <View style={styles.container}>
      {/* Removed paw prints from here as it's now in the page background */}
      <View style={styles.textContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          <Text size="18" weight="semibold" textColor="black" style={styles.label}>
            매일 밤
          </Text>
          <Text size="20" weight="bold" textColor="purple" style={styles.time}>
            12시
          </Text>
        </View>

        <Text size="13" weight="normal" textColor="gray" style={styles.description}>
          미호가 우체통에 오늘의 질문을 넣어놔요!{"\n"}
          오늘의 질문에 답하면, <Text size="13" weight="bold" textColor="purple">매주 일요일</Text> 리포트가 생성되요
        </Text>
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
    height: 180,
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
  character: {
    width: 160,
    height: 140,
    position: "absolute",
    bottom: 60,
    right: -20,
    zIndex: 1, // Lower than text
  },
});
