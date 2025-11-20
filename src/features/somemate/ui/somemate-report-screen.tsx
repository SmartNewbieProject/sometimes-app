import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useCallback } from "react";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import ChevronLeft from "@assets/icons/chevron-left.svg";
import { Svg, Path } from "react-native-svg";
import { useReports } from "../queries/use-ai-chat";
import { BottomNavigation } from "@/src/shared/ui/navigation";
import { CategoryBadge } from "./category-badge";

const ChevronRight = ({ width = 24, height = 24, color = "#7A4AE2" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 4L16 12L8 20"
      stroke={color}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function SomemateReportScreen() {
  const insets = useSafeAreaInsets();
  const translateXAnim = useSharedValue(0);
  const { data: reportsData, isLoading, refetch } = useReports();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    translateXAnim.value = withRepeat(
      withTiming(3, {
        duration: 400,
        easing: Easing.out(Easing.circle),
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      true
    );
  }, [translateXAnim]);

  const arrowAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateXAnim.value }],
    };
  });

  const reports = reportsData?.reports || [];
  const totalCount = reportsData?.totalCount || 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? '오후' : '오전';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

    return `${year}년 ${month}월 ${day}일 ${period} ${String(displayHours).padStart(2, '0')}:${minutes}`;
  };

  const lastUpdateDate = reports.length > 0
    ? new Date(reports[0].createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\. /g, '. ')
    : '-';

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.push("/chat")}>
            <ChevronLeft width={20} height={20} />
          </Pressable>
          <Text style={styles.headerTitle}>나의 썸타임</Text>
          <View style={{ width: 20 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7A4AE2" />
        </View>
        <BottomNavigation />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/chat")}>
          <ChevronLeft width={20} height={20} />
        </Pressable>
        <Text style={styles.headerTitle}>나의 썸타임</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.topCard}>
          <Image
            source={require("@assets/images/somemate_miho.png")}
            style={styles.heartIcon}
            contentFit="contain"
          />
          <Text style={styles.topCardTitle}>나의 썸타임 모음</Text>
          <Text style={styles.topCardDescription}>
            지금까지 생성된 리포트를 한 눈에 볼 수 있어요!
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>생성된 썸타임 : </Text>
              <Text style={styles.statValue}>{totalCount}개</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>마지막 업데이트 : </Text>
              <Text style={styles.statValue}>{lastUpdateDate}</Text>
            </View>
          </View>
        </View>

        {reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>아직 생성된 리포트가 없어요</Text>
            <Text style={styles.emptySubText}>미호와 대화를 나눈 후 분석을 받아보세요!</Text>
          </View>
        ) : (
          reports.map((report, index) => (
            <Pressable
              key={report.id}
              style={styles.reportCard}
              onPress={() => {
                router.push(`/chat/somemate-report-detail?reportId=${report.id}`);
              }}
            >
              <View style={styles.reportLeft}>
                <Image
                  source={require("@assets/images/kid_star.png")}
                  style={styles.starIcon}
                  contentFit="contain"
                />
              </View>
              <View style={styles.reportContent}>
                <View style={styles.reportTitleRow}>
                  <Text style={styles.reportTitle}>
                    {report.reportData?.title || `썸타임 #${String(totalCount - index).padStart(2, '0')}`}
                  </Text>
                  <CategoryBadge category={report.category} />
                </View>
                <Text style={styles.reportDate}>{formatDate(report.createdAt)}</Text>
                {report.status === 'processing' && (
                  <Text style={styles.processingBadge}>분석 중</Text>
                )}
              </View>
              <Animated.View style={arrowAnimatedStyle}>
                <ChevronRight width={20} height={20} color="#7A4AE2" />
              </Animated.View>
            </Pressable>
          ))
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
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  topCard: {
    backgroundColor: "#F7F3FF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8DEFF",
  },
  heartIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  topCardTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Pretendard-Bold",
    color: "#000",
    marginBottom: 12,
  },
  topCardDescription: {
    fontSize: 15,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  statsContainer: {
    width: "100%",
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7A4AE2",
    fontFamily: "Pretendard-Bold",
  },
  reportCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
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
  reportLeft: {
    marginRight: 16,
  },
  starIcon: {
    width: 28,
    height: 28,
  },
  reportContent: {
    flex: 1,
  },
  reportTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Pretendard-Bold",
    color: "#7A4AE2",
    flex: 1,
  },
  reportDate: {
    fontSize: 14,
    color: "#999",
  },
  processingBadge: {
    fontSize: 12,
    color: "#7A4AE2",
    fontWeight: "600",
    marginTop: 4,
  },
});

