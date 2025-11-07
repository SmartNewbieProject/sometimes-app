import { Image } from "expo-image";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect } from "react";
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
  }, []);

  const arrowAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateXAnim.value }],
    };
  });

  const reports = [
    {
      id: "03",
      title: "썸타입 #03 - 김정표현이 풍부해진 하루",
      date: "2025년 10월 15일 오후 09:37",
      isStarred: false,
    },
    {
      id: "02",
      title: "썸타입 #02 - 긍정형 대화 비율 상승",
      date: "2025년 10월 13일 오후 08:21",
      isStarred: true,
    },
    {
      id: "01",
      title: "썸타입 #01 - 새로운 목표에 대한 대화",
      date: "2025년 10월 10일 오후 09:11",
      isStarred: false,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/chat/somemate")}>
          <ChevronLeft width={20} height={20} />
        </Pressable>
        <Text style={styles.headerTitle}>나의 썸타입</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.topCard}>
          <Image
            source={require("@assets/images/somemate_miho.png")}
            style={styles.heartIcon}
            contentFit="contain"
          />
          <Text style={styles.topCardTitle}>나의 썸타입 모음</Text>
          <Text style={styles.topCardDescription}>
            지금까지 생성된 리포트를 한 눈에 볼 수 있어요!
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>생성된 썸타입 : </Text>
              <Text style={styles.statValue}>3개</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>마지막 업데이트 : </Text>
              <Text style={styles.statValue}>2025. 10. 15</Text>
            </View>
          </View>
        </View>

        {reports.map((report) => (
          <Pressable
            key={report.id}
            style={styles.reportCard}
            onPress={() => {
              // TODO: 리포트 상세 페이지로 이동
              console.log("Navigate to report detail:", report.id);
            }}
          >
            <View style={styles.reportLeft}>
              <Image
                source={
                  report.isStarred
                    ? require("@assets/images/filled_kid_star.png")
                    : require("@assets/images/kid_star.png")
                }
                style={styles.starIcon}
                contentFit="contain"
              />
            </View>
            <View style={styles.reportContent}>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportDate}>{report.date}</Text>
            </View>
            <Animated.View style={arrowAnimatedStyle}>
              <ChevronRight width={20} height={20} color="#7A4AE2" />
            </Animated.View>
          </Pressable>
        ))}
      </ScrollView>
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
  reportTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Pretendard-Bold",
    color: "#7A4AE2",
    marginBottom: 6,
  },
  reportDate: {
    fontSize: 14,
    color: "#999",
  },
});

