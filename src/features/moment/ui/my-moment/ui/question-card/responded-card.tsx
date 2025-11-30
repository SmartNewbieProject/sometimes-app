import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text } from "@/src/shared/ui";
import colors, { semanticColors } from "@/src/shared/constants/colors";

export const RespondedCard = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/moment/envelope-heart.png")}
        style={styles.icon}
        resizeMode="contain"
      />
      <View style={styles.contentContainer}>
        <Text size="md" weight="bold" textColor="black" style={styles.title}>
          오늘의 질문에 답변했어요
        </Text>
        <Text size="12" weight="normal" textColor="gray">
          내일 새로운 질문으로 만나요!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.moreLightPurple, // Light purple background
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
    borderColor: "#E2D5FF",
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
