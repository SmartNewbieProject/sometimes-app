import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, FlatList } from "react-native";
import { Text } from "@/src/shared/ui";
import colors, { semanticColors } from "@/src/shared/constants/colors";
import Svg, { Path, Circle, Line, Polygon } from "react-native-svg";
import { router } from "expo-router";
import { useReportHistoryInfiniteQuery, useAnswerHistoryInfiniteQuery } from "../../queries";
import type { ReportHistoryItem, AnswerHistoryItem } from "../../apis";
import { formatWeekDisplay } from "@/src/shared/utils/date-utils";

const { width } = Dimensions.get("window");
// Card dimensions: 353x232 ratio (maintaining aspect ratio)
const CHART_MARGIN = 22;
const CHART_PADDING = 20;
const Y_AXIS_WIDTH = 30;
// Calculate card width based on screen width minus margins
const cardWidth = width - (CHART_MARGIN * 2);
// Maintain 353:232 aspect ratio for the chart area
const chartHeight = 140;

export const MyMomentRecordPage = () => {
  const [chartWidth, setChartWidth] = useState(0);

  // API 데이터 조회
  const {
    data: reportHistoryData,
    isLoading: reportLoading,
    fetchNextPage: fetchNextReports,
    hasNextPage: hasNextReports
  } = useReportHistoryInfiniteQuery();

  const {
    data: answerHistoryData,
    isLoading: answerLoading
  } = useAnswerHistoryInfiniteQuery();

  // 실제 데이터 사용
  const reportHistory = reportHistoryData?.pages.flatMap(page => page.reports) || [];
  const answerHistory = answerHistoryData?.pages.flatMap(page => page.answers) || [];

  // 차트 데이터 생성
  const generateChartData = () => {
    if (reportHistory.length === 0) {
      return { dataPoints: [0], labels: ["데이터 없음"] };
    }

    const recentReports = reportHistory.slice(-4); // 최근 4개 주차
    const dataPoints = recentReports.map(report => report.sentimentScore || 0);
    const labels = recentReports.map(report => formatWeekDisplay(report.weekNumber, report.year));

    return { dataPoints, labels };
  };

  const { dataPoints, labels } = generateChartData();
  const maxValue = Math.max(...dataPoints, 100);
  const minValue = 0;
  const xStep = chartWidth > 0 ? chartWidth / (dataPoints.length - 1) : 0;

  const getY = (value: number) => {
    return chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
  };

  // Create path for line chart
  const pathData = dataPoints
    .map((value, index) => {
      const x = index * xStep;
      const y = getY(value);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // 로딩 상태 처리
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
      {/* Growth Trend Section */}
      <View style={styles.chartSection}>
        <Text size="18" weight="bold" textColor="purple" style={styles.chartTitle}>
          나의 성장 트렌드
        </Text>
        <Text size="12" weight="normal" textColor="purple" style={styles.chartSubtitle}>
          {reportHistory.length > 0
            ? `최근 ${reportHistory.length}주간의 모먼트 변화를 보여줘요!`
            : "아직 모먼트 기록이 없어요. 오늘의 질문에 답변해보세요!"
          }
        </Text>

        <View style={styles.chartContainer}>
          <View style={styles.yAxisLabels}>
            <Text size="10" weight="normal" textColor="gray">100</Text>
            <Text size="10" weight="normal" textColor="gray">50</Text>
            <Text size="10" weight="normal" textColor="gray">0</Text>
          </View>

          <View
            style={styles.chartWrapper}
            onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
          >
            {chartWidth > 0 && (
              <>
                <Svg width={chartWidth} height={chartHeight}>
                  {/* Grid lines - horizontal at 0, 50, 100 */}
                  <Line x1="0" y1="0" x2={chartWidth} y2="0" stroke="#E0E0E0" strokeWidth="1" />
                  <Line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="#E0E0E0" strokeWidth="1" />
                  <Line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#E0E0E0" strokeWidth="1" />

                  {/* Vertical grid lines */}
                  {dataPoints.map((_, index) => {
                    const x = index * xStep;
                    return (
                      <Line
                        key={`vline-${index}`}
                        x1={x}
                        y1="0"
                        x2={x}
                        y2={chartHeight}
                        stroke="#E0E0E0"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Line chart */}
                  <Path
                    d={pathData}
                    stroke={semanticColors.brand.primary}
                    strokeWidth="3"
                    fill="none"
                  />

                  {/* Data points */}
                  {dataPoints.map((value, index) => {
                    const x = index * xStep;
                    const y = getY(value);
                    return (
                      <Circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="5"
                        fill={semanticColors.brand.primary}
                      />
                    );
                  })}
                </Svg>

                {/* X-axis labels */}
                <View style={styles.xAxisLabels}>
                  {labels.map((label, index) => (
                    <Text key={index} size="10" weight="normal" textColor="gray" style={styles.xLabel}>
                      {label}
                    </Text>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Timeline Section */}
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
    backgroundColor: colors.moreLightPurple,
    borderRadius: 20,
    padding: CHART_PADDING,
    marginHorizontal: CHART_MARGIN,
    marginTop: 20,
    marginBottom: 10,
  },
  chartTitle: {
    marginBottom: 4,
  },
  chartSubtitle: {
    marginBottom: 20,
    opacity: 0.8,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  yAxisLabels: {
    width: Y_AXIS_WIDTH,
    height: chartHeight,
    justifyContent: "space-between",
    paddingRight: 8,
  },
  chartWrapper: {
    flex: 1,
  },
  xAxisLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  xLabel: {
    // Removed flex: 1 and textAlign: center to allow space-between to handle alignment
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
