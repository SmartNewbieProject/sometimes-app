import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Text } from "@/src/shared/ui";
import colors, { semanticColors } from "@/src/shared/constants/colors";
import { router } from "expo-router";
import { WeeklyProgress } from "../../../apis";
import { MomentReport } from "../../../types";

interface MomentStatusCardProps {
  weeklyProgress?: WeeklyProgress | null;
  isLoading: boolean;
  latestReport?: MomentReport | null;
  reportLoading?: boolean;
}

export const MomentStatusCard: React.FC<MomentStatusCardProps> = ({
  weeklyProgress,
  isLoading,
  latestReport,
  reportLoading = false,
}) => {
  // 최신 보고서 데이터가 있는 경우 보고서 내용 표시
  if (latestReport && !reportLoading) {
    const weekInfo = `${latestReport.year}년 ${latestReport.weekNumber}주차`;
    const keywords = latestReport.keywords.slice(0, 3).map(k => `#${k}`);

    return (
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.9}
        onPress={() => router.push("/moment/moment-report")}
      >
        <View style={styles.contentContainer}>
          <Text size="12" weight="normal" textColor="white" style={styles.subtitle}>
            {weekInfo}
          </Text>
          <Text size="20" weight="bold" textColor="white" style={styles.title}>
            {latestReport.title}
          </Text>
          {latestReport.subTitle && (
            <Text size="13" weight="medium" textColor="white" style={styles.subTitle}>
              {latestReport.subTitle}
            </Text>
          )}
          {keywords.length > 0 && (
            <View style={styles.keywordsContainer}>
              {keywords.map((keyword, index) => (
                <View key={index} style={styles.keywordChip}>
                  <Text size="12" weight="medium" textColor="purple">
                    {keyword.replace("##", "#")}
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
  }

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
          <Text size="13" weight="normal" textColor="white" style={styles.description}>
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

  // 로딩 중이거나 기타 상황
  if (isLoading || reportLoading) {
    return null;
  }

  // fallback 처리 - 기존 로직으로 돌아가지 않음
  return null;
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
    marginBottom: 8,
  },
  subTitle: {
    marginBottom: 8,
    opacity: 0.9,
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