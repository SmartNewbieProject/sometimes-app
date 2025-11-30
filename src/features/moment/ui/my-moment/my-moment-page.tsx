import React from "react";
import { View, StyleSheet, Image, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { GuideSection } from "./ui/guide-section";
import { RecentMoment } from "./ui/recent-moment";
import { HistorySection } from "./ui/history-section";
import colors from "@/src/shared/constants/colors";
import { useDailyQuestionQuery, useProgressStatusQuery } from "../../queries";
import type { UserProgressStatus } from "../../apis";
import { QuestionCard } from "./ui";

const { width } = Dimensions.get("window");

interface MyMomentPageProps {
  onBackPress?: () => void;
}

export const MyMomentPage: React.FC<MyMomentPageProps> = ({ onBackPress }) => {
  const { data: dailyQuestion, isLoading: questionLoading, error: questionError } = useDailyQuestionQuery();
  const { data: progressStatus } = useProgressStatusQuery();

  // 응답 여부 확인 - 다양한 상태 고려
  const getQuestionCardState = () => {
    if (!progressStatus) {
      return { responded: false, blocked: false, blockedReason: null, blockedMessage: null };
    }

    if (!progressStatus.canProceedToday) {
      return {
        responded: false,
        blocked: true,
        blockedReason: progressStatus.blockedReason || "unknown",
        blockedMessage: progressStatus.sequenceValidation?.suggestedAction || null
      };
    }

    if (progressStatus.hasActiveSession) {
      return { responded: true, blocked: false, blockedReason: null, blockedMessage: null };
    }

    return { responded: false, blocked: false, blockedReason: null, blockedMessage: null };
  };

  const questionCardState = getQuestionCardState();

  if (questionLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7A4AE2" />
        </View>
      </View>
    );
  }

  if (questionError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Image
            source={require("@/assets/images/moment/paw-prints-top.png")}
            style={styles.pawPrints}
            resizeMode="contain"
          />
          <Image
            source={require("@/assets/images/moment/my-moment-bg.png")}
            style={styles.background}
            resizeMode="stretch"
          />
          <GuideSection />
          <QuestionCard responded={false} />
          <RecentMoment />
          <HistorySection />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("@/assets/images/moment/paw-prints-top.png")}
          style={styles.pawPrints}
          resizeMode="contain"
        />
        <Image
          source={require("@/assets/images/moment/my-moment-bg.png")}
          style={styles.background}
          resizeMode="stretch"
        />
        <GuideSection />
        <QuestionCard
          responded={questionCardState.responded}
          blocked={questionCardState.blocked}
          blockedReason={questionCardState.blockedReason}
          blockedMessage={questionCardState.blockedMessage}
        />
        <RecentMoment />
        <HistorySection />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.momentBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
  },
  pawPrints: {
    position: "absolute",
    top: 0,
    left: 20,
    width: 120,
    height: 100,
    zIndex: 0, // Above background color, below content? Or just decoration.
    opacity: 0.6,
  },
  background: {
    position: "absolute",
    top: 70, // Moved down as requested
    left: 0,
    right: 0,
    width: "100%",
    height: width * 1.2,
    zIndex: 0,
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 100,
  },
});
