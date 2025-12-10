import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from "react-native";
import { Text } from "@/src/shared/ui";
import colors, { semanticColors } from "@/src/shared/constants/colors";
import { router } from "expo-router";
import { useReportHistoryInfiniteQuery } from "../../queries";
import { formatWeekDisplay } from "@/src/shared/utils/date-utils";
import { GrowthChart } from "../growth-chart";

const CHART_MARGIN = 22;

export const MyMomentRecordPage = () => {
  const {
    data: reportHistoryData,
    isLoading: reportLoading,
    fetchNextPage: fetchNextReports,
    hasNextPage: hasNextReports
  } = useReportHistoryInfiniteQuery();

  const reportHistory = reportHistoryData?.pages.flatMap(page => page.reports) || [];

  if (reportLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryPurple} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.chartSection}>
        <GrowthChart reports={reportHistory} maxWeeks={5} />
      </View>

      <View style={styles.timelineSection}>
        {reportHistory.length > 0 ? (
          <FlatList
            data={reportHistory}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineCard}>
                  <Text size="12" weight="normal" textColor="gray" style={styles.dateText}>
                    {formatWeekDisplay(item.weekNumber, item.year)}
                  </Text>
                  <Text size="18" weight="bold" textColor="black" style={styles.cardTitle}>
                    {item.title || "모먼트 분석 결과"}
                  </Text>
                  {item.keywords.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {item.keywords.slice(0, 3).map((keyword, index) => (
                        <View key={index} style={styles.tag}>
                          <Text size="12" weight="medium" textColor="purple">
                            {keyword}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.detailLink}
                    onPress={() => router.push({
                      pathname: "/moment/weekly-report",
                      params: {
                        week: item.weekNumber,
                        year: item.year,
                      }
                    })}
                  >
                    <Text size="13" weight="medium" textColor="black">
                      자세히 보기 {'>'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            onEndReached={() => hasNextReports && fetchNextReports()}
            onEndReachedThreshold={0.1}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text size="16" weight="medium" textColor="gray" style={styles.emptyText}>
              아직 모먼트 기록이 없어요
            </Text>
            <Text size="14" weight="normal" textColor="gray">
              오늘의 질문에 답변하고 모먼트를 시작해보세요!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chartSection: {
    marginHorizontal: CHART_MARGIN,
    marginTop: 20,
    marginBottom: 10,
  },
  timelineSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 20,
    position: "relative",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: semanticColors.brand.primary,
    marginRight: 12,
    marginTop: 6,
    zIndex: 1,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    position: "relative",
  },
  dateText: {
    marginBottom: 8,
  },
  cardTitle: {
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: colors.moreLightPurple,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  detailLink: {
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginBottom: 8,
  },
});
