import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Text } from "@/src/shared/ui";
import colors, { semanticColors } from "@/src/shared/constants/colors";
import { router } from "expo-router";
import { WeeklyProgress } from "../../../apis";
import type { LatestReport } from "../../../types";

interface MomentStatusCardProps {
  weeklyProgress?: WeeklyProgress | null;
  isLoading: boolean;
  latestReport?: LatestReport | null;
  reportLoading?: boolean;
  reportError?: any;
}

export const MomentStatusCard: React.FC<MomentStatusCardProps> = ({
  weeklyProgress,
  isLoading,
  latestReport,
  reportLoading,
  reportError,
}) => {

  // 로딩 중이면 표시하지 않음
  if (isLoading || reportLoading) {
    return null;
  }

  // 최신 리포트가 있는 경우 - 리포트 데이터로 표시 (이번 주 진행률과 관계없이)
  if (latestReport) {
    const weekInfo = latestReport.week && latestReport.year
      ? `${latestReport.year}년 ${latestReport.week}주차`
      : null;

    // 키워드가 없을 때 빈 배열로 처리
    const keywords = latestReport.keywords?.length > 0
      ? latestReport.keywords.slice(0, 3).map(k => `#${k}`)
      : [];

    // userTitles에서 첫 번째 타이틀 사용
    const firstTitle = latestReport.userTitles?.[0];
    const title = firstTitle?.title || latestReport.persona || "모먼트 분석 완료";
    const subTitle = firstTitle?.subTitle || "";

    // summaryText를 description으로 사용
    const description = latestReport.summaryText?.length > 50
      ? latestReport.summaryText.slice(0, 68) + "..."
      : latestReport.summaryText || "";

    return (
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.9}
        onPress={() => router.push(`/moment/weekly-report?week=${latestReport.week}&year=${latestReport.year}`)}
      >
        <View style={styles.contentContainer}>
          <Text size="12" weight="normal" textColor="white" style={styles.subtitle}>
            나의 최근 모먼트 {weekInfo && `(${weekInfo})`}
          </Text>
          <Text size="20" weight="bold" textColor="white" style={styles.title}>
            {title}
          </Text>
          {subTitle && (
            <Text size="13" weight="normal" textColor="white" style={{ opacity: 0.9, marginBottom: 4 }}>
              {subTitle}
            </Text>
          )}
          <Text size="12" weight="normal" textColor="white" style={{ marginBottom: 8 }}>
            {description}
          </Text>

          {keywords.length > 0 && (
            <View style={styles.keywordsContainer}>
              {keywords.map((keyword, index) => (
                <View key={index} style={styles.keywordChip}>
                  <Text size="12" weight="medium" textColor="purple">
                    {keyword?.replaceAll("##", "#")}
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

  // latestReport도 없고 weeklyProgress도 없거나 completionRate가 0인 경우 - 신규 유저
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
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: semanticColors.brand.primary,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    maxHeight: 200,
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
    marginBottom: 4,
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