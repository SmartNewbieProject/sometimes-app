import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text } from "@/src/shared/ui";
import colors from "@/src/shared/constants/colors";
import { router } from "expo-router";

interface UnrespondedCardProps {
  blocked?: boolean;
  blockedReason?: string | null;
  blockedMessage?: string | null;
}

export const UnrespondedCard = ({ blocked = false, blockedReason = null, blockedMessage = null }: UnrespondedCardProps) => {
  const questionDate = "2025. 10. 24 (금)";

  // blocked 상태에 따른 다른 콘텐츠 생성
  const getCardContent = () => {
    if (blocked && blockedReason === "previous_day_not_answered") {
      return {
        title: "이전 질문에 먼저 답변해야 해요!",
        subtitle: "순서대로 질문에 답변해주세요",
        buttonText: "이전 질문으로 가기",
        onPress: () => router.push("/moment/question-detail?previous=true")
      };
    }

    if (blocked) {
      return {
        title: "오늘의 질문에 답변했어요!",
        subtitle: questionDate,
        buttonText: "",
        onPress: () => {} // blocked 상태에서는 아무 동작 안 함
      };
    }

    return {
      title: "오늘의 질문이 도착했어요!",
      subtitle: questionDate,
      buttonText: "",
      onPress: () => router.push("/moment/question-detail")
    };
  };

  const cardContent = getCardContent();

  return (
    <TouchableOpacity
      style={[styles.container, blocked && styles.blockedContainer]}
      activeOpacity={0.9}
      onPress={cardContent.onPress}
    >
      <Image
        source={blocked ? require("@/assets/images/moment/envelope-heart.png") : require("@/assets/images/moment/envelope.png")}
        style={styles.icon}
        resizeMode="contain"
      />
      <View style={styles.contentContainer}>
        <Text size="md" weight="bold" textColor="black" style={styles.title}>
          {cardContent.title}
        </Text>
        <Text size="12" weight="normal" textColor="gray">
          {cardContent.subtitle}
        </Text>
        {blocked && blockedReason === "previous_day_not_answered" && (
          <Text size="11" weight="normal" textColor="purple" style={styles.blockedMessage}>
            {blockedMessage || "이전 질문을 먼저 완료해주세요"}
          </Text>
        )}
      </View>
      {!blocked && (
        <View style={styles.button}>
          <Image
            source={require("@/assets/images/moment/go-to-answer.png")}
            style={styles.buttonImage}
            resizeMode="contain"
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 20,
    paddingRight: 20,
    paddingLeft: 70,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
    shadowColor: "#E2D5FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 4,
    position: "relative",
  },
  blockedContainer: {
    backgroundColor: "#F9F7FF",
    borderColor: "#E2D5FF",
    borderWidth: 1,
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
  blockedMessage: {
    marginTop: 6,
    opacity: 0.8,
  },
  button: {
    padding: 0,
  },
  buttonImage: {
    width: 80,
    height: 24,
  },
});
