import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "@/src/shared/ui";
import colors from "@/src/shared/constants/colors";
import { router } from "expo-router";

interface UnrespondedCardProps {
  blocked?: boolean;
  blockedReason?: string | null;
  blockedMessage?: string | null;
}

export const UnrespondedCard = ({ blocked = false, blockedReason = null, blockedMessage = null }: UnrespondedCardProps) => {
  const { t } = useTranslation();

  // 오늘 날짜를 동적으로 생성
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];

    return `${year}. ${month}. ${day} (${dayOfWeek})`;
  };

  const questionDate = getTodayDate();

  // blocked 상태에 따른 다른 콘텐츠 생성
  const getCardContent = () => {
    if (blocked && blockedReason === "previous_day_not_answered") {
      return {
        title: t('features.moment.my_moment.question_card.previous_first'),
        subtitle: t('features.moment.my_moment.question_card.previous_first_subtitle'),
        buttonText: t('features.moment.my_moment.question_card.go_to_previous'),
        onPress: () => router.push("/moment/question-detail?previous=true")
      };
    }

    if (blocked) {
      return {
        title: t('features.moment.my_moment.question_card.today_answered'),
        subtitle: questionDate,
        buttonText: "",
        onPress: () => {} // blocked 상태에서는 아무 동작 안 함
      };
    }

    return {
      title: t('features.moment.my_moment.question_card.today_arrived'),
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
        source={blocked ? require("@/assets/images/moment/envelope-heart.webp") : require("@/assets/images/moment/envelope.webp")}
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
            {blockedMessage || t('features.moment.my_moment.question_card.complete_previous')}
          </Text>
        )}
      </View>
      {!blocked && (
        <View style={styles.button}>
          <Image
            source={require("@/assets/images/moment/go-to-answer.webp")}
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
