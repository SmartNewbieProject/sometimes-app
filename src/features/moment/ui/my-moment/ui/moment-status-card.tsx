import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Text } from "@/src/shared/ui";
import colors, { semanticColors } from "@/src/shared/constants/colors";
import { router } from "expo-router";
import type { WeeklyProgress } from "../../../queries";

interface MomentStatusCardProps {
  weeklyProgress?: WeeklyProgress | null;
  isLoading: boolean;
}

export const MomentStatusCard: React.FC<MomentStatusCardProps> = ({
  weeklyProgress,
  isLoading,
}) => {
  // 데이터가 없거나 completionRate가 0일 때는 모먼트 기록 유도 메시지 표시
  if (!weeklyProgress || weeklyProgress.completionRate === 0) {
    return (
      <View style={[styles.container, styles.disabledContainer]}>
        <View style={styles.contentContainer}>
          <Text size="12" weight="normal" textColor="white" style={styles.subtitle}>
            나의 최근 모먼트
          </Text>
          <Text size="20" weight="bold" textColor="white" style={styles.title}>
            첫 모먼트를 기다려요
          </Text>
          <Text size="14" weight="normal" textColor="white" style={styles.description}>
            오늘의 질문에 답변하고 나만의 성장 리포트를 만들어보세요!
          </Text>
        </View>
        <Image
          source={require("@/assets/images/moment/clipboard.png")}
          style={[styles.illustration, styles.disabledIllustration]}
          resizeMode="contain"
        />
      </View>
    );
  }

  // 로딩 중이면 표시하지 않음
  if (isLoading) {
    return null;
  }

  // 데이터가 있는 경우 - 모먼트 카드 렌더링
  const weekInfo = weeklyProgress && weeklyProgress.year && weeklyProgress.weekOfYear
    ? `${weeklyProgress.year}년 ${weeklyProgress.weekOfYear}주차`
    : null;

  // 키워드가 없을 때 빈 배열로 처리
  const keywords = weeklyProgress?.keywords?.length > 0
    ? weeklyProgress.keywords.slice(0, 3).map(k => `#${k}`)
    : [];

  // 타이틀 생성 (keywords 기반 또는 기본값)
  const generateTitle = () => {
    if (!weeklyProgress) return "모먼트 분석 중...";

    // completionRate 기반으로 다른 타이틀
    if (weeklyProgress.completionRate >= 80) {
      return "적극적인 참여자";
    } else if (weeklyProgress.completionRate >= 50) {
      return "꾸준한 성장자";
    } else if (weeklyProgress.completionRate > 0) {
      return "새로운 시작";
    } else {
      return "첫 모먼트를 기다려요";
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={() => router.push("/moment/moment-report")}
    >
      <View style={styles.contentContainer}>
        <Text size="12" weight="normal" textColor="white" style={styles.subtitle}>
          나의 최근 모먼트 {weekInfo && `(${weekInfo})`}
        </Text>
        <Text size="20" weight="bold" textColor="white" style={styles.title}>
          {generateTitle()}
        </Text>
        {keywords.length > 0 && (
          <View style={styles.keywordsContainer}>
            {keywords.map((keyword, index) => (
              <View key={index} style={styles.keywordChip}>
                <Text size="12" weight="medium" textColor="purple">
                  {keyword}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <Image
        source={require("@/assets/images/moment/clipboard.png")}
        style={styles.illustration}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: semanticColors.brand.primary,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    height: 130,
    minHeight: 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    position: "relative",
  },
  contentContainer: {
    flex: 1,
    zIndex: 1,
    paddingRight: 80, // Space for image
  },
  subtitle: {
    opacity: 0.8,
    marginBottom: 4,
  },
  title: {
    marginBottom: 12,
  },
  keywordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  keywordChip: {
    backgroundColor: colors.white, // White background as per image
    borderRadius: 6, // Slightly squared rounded corners
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  illustration: {
    width: 90,
    height: 90,
    position: "absolute",
    right: 10,
    bottom: -10, // Bottom right positioning
    transform: [{ rotate: '-5deg' }],
  },
  disabledContainer: {
    opacity: 0.7,
  },
  disabledIllustration: {
    opacity: 0.6,
  },
  description: {
    marginTop: 8,
    opacity: 0.9,
    lineHeight: 18,
  },
});