import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback } from "react";
import ChevronLeft from "@assets/icons/chevron-left.svg";
import { useReport } from "../queries/use-ai-chat";
import { Image } from "expo-image";
import { BottomNavigation } from "@/src/shared/ui/navigation";

export default function SomemateReportDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ reportId?: string }>();
  const reportId = params.reportId || "";

  const { data: report, isLoading, refetch } = useReport(reportId);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.push("/chat/somemate-report")}>
            <ChevronLeft width={20} height={20} />
          </Pressable>
          <Text style={styles.headerTitle}>썸타임 리포트</Text>
          <View style={{ width: 20 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7A4AE2" />
        </View>
        <BottomNavigation />
      </View>
    );
  }

  if (!report || !report.reportData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.push("/chat/somemate-report")}>
            <ChevronLeft width={20} height={20} />
          </Pressable>
          <Text style={styles.headerTitle}>썸타임 리포트</Text>
          <View style={{ width: 20 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Image
            source={require("@assets/images/somemate_miho.png")}
            style={styles.processingImage}
            contentFit="contain"
          />
          <Text style={styles.processingTitle}>리포트 분석 중이에요</Text>
          <Text style={styles.processingText}>
            미호가 열심히 분석하고 있어요.{'\n'}
            잠시만 기다려주세요!
          </Text>
        </View>
        <BottomNavigation />
      </View>
    );
  }

  const { reportData } = report;

  if (!reportData.analysisByCategory || reportData.analysisByCategory.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.push("/chat/somemate-report")}>
            <ChevronLeft width={20} height={20} />
          </Pressable>
          <Text style={styles.headerTitle}>썸타임 리포트</Text>
          <View style={{ width: 20 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>리포트 데이터가 없습니다.</Text>
        </View>
        <BottomNavigation />
      </View>
    );
  }

  const categoryAnalysis = reportData.analysisByCategory[0];

  const cleanMarkdown = (text: string) => {
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/```json\n?|```/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();
  };

  const parseAnalysisData = (summary: string) => {
    try {
      const cleanedSummary = summary.replace(/```json\n?|```/g, '').trim();
      const parsed = JSON.parse(cleanedSummary);
      return {
        values: parsed.values || [],
        summary: cleanMarkdown(parsed.summary || ''),
      };
    } catch {
      return {
        values: [],
        summary: cleanMarkdown(summary),
      };
    }
  };

  const parseInsights = (insights: string[]) => {
    return insights
      .filter(insight => insight && insight.trim())
      .map(insight => {
        try {
          const cleaned = insight
            .replace(/```json\n?|```|\n/g, '')
            .replace(/^"|"$/g, '')
            .replace(/",$/g, '')
            .trim();
          return cleanMarkdown(cleaned);
        } catch {
          return cleanMarkdown(insight);
        }
      })
      .filter(insight => insight.length > 0);
  };

  const analysisData = parseAnalysisData(categoryAnalysis.summary);
  const values = analysisData.values;
  const categorySummary = analysisData.summary;
  const cleanInsights = parseInsights(categoryAnalysis.insights);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/chat/somemate-report")}>
          <ChevronLeft width={20} height={20} />
        </Pressable>
        <Text style={styles.headerTitle}>썸타임 리포트</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <Text style={styles.reportTitle}>{reportData.title}</Text>
          <Text style={styles.reportDate}>{reportData.generatedAt}</Text>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{report.category}</Text>
          </View>

          <Image
            source={require("@assets/images/somemate_miho.png")}
            style={styles.mihoImage}
            contentFit="contain"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📝</Text>
            <Text style={styles.sectionTitle}>전체 요약</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.summaryText}>{cleanMarkdown(reportData.overallSummary)}</Text>
          </View>
        </View>

        {values.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>✨</Text>
              <Text style={styles.sectionTitle}>성격 특성</Text>
            </View>
            {values.map((value: any, index: number) => (
              <View key={index} style={styles.valueCard}>
                <Text style={styles.valueName}>{value.name}</Text>
                <Text style={styles.valueDescription}>{value.description}</Text>
              </View>
            ))}
          </View>
        )}

        {cleanInsights.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>💡</Text>
              <Text style={styles.sectionTitle}>인사이트</Text>
            </View>
            {cleanInsights.map((insight, index) => (
              <View key={index} style={styles.insightCard}>
                <View style={styles.insightNumber}>
                  <Text style={styles.insightNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        )}

        {categorySummary && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🎯</Text>
              <Text style={styles.sectionTitle}>카테고리 분석</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.summaryText}>{categorySummary}</Text>
            </View>
          </View>
        )}
      </ScrollView>
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    width: "100%",
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Pretendard-Bold",
    color: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
  },
  processingImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Pretendard-Bold",
    color: "#7A4AE2",
    marginBottom: 12,
  },
  processingText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerCard: {
    backgroundColor: "#F7F3FF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8DEFF",
  },
  reportTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Pretendard-Bold",
    color: "#7A4AE2",
    marginBottom: 8,
    textAlign: "center",
  },
  reportDate: {
    fontSize: 14,
    color: "#999",
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: "#7A4AE2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  mihoImage: {
    width: 80,
    height: 80,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Pretendard-Bold",
    color: "#000",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#333",
  },
  valueCard: {
    backgroundColor: "#F7F3FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8DEFF",
  },
  valueName: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Pretendard-Bold",
    color: "#7A4AE2",
    marginBottom: 8,
  },
  valueDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666",
  },
  insightCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  insightNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#7A4AE2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  insightNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: "#333",
  },
});

