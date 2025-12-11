import React, { useEffect } from "react";
import { View, StyleSheet, Image, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { GuideSection } from "./ui/guide-section";
import { QuestionCard } from "./ui/question-card/index";
import { RecentMoment } from "./ui/recent-moment";
import { HistorySection } from "./ui/history-section";
import colors from "@/src/shared/constants/colors";
import { useDailyQuestionQuery, useProgressStatusQuery } from "../../queries";
import type { UserProgressStatus } from "../../apis";
import { useMomentAnalytics } from "../../hooks/use-moment-analytics";

const { width } = Dimensions.get("window");

interface MyMomentPageProps {
  onBackPress?: () => void;
}

export const MyMomentPage: React.FC<MyMomentPageProps> = ({ onBackPress }) => {
  const { t } = useTranslation();
  const { data: dailyQuestion, isLoading: questionLoading, error: questionError } = useDailyQuestionQuery();
  const { data: progressStatus } = useProgressStatusQuery();
  const { trackMyMomentView, trackQuestionCardView, trackGuideRewardView } = useMomentAnalytics();

  useEffect(() => {
    if (!questionLoading && progressStatus) {
      const hasDailyQuestion = !!dailyQuestion?.question;
      const isResponded = !progressStatus.canProceed && progressStatus.hasTodayAnswer;
      trackMyMomentView({
        source: 'navigation',
        has_daily_question: hasDailyQuestion,
        is_responded: isResponded,
        is_blocked: !progressStatus.canProceed && !progressStatus.hasTodayAnswer,
      });

      if (isResponded) {
        trackGuideRewardView({ reward_type: 'gem' });
      }
    }
  }, [questionLoading, progressStatus, dailyQuestion]);

  // 응답 여부 확인 - 새로운 API 필드 기반으로 분기
  const getQuestionCardState = () => {
    if (!progressStatus) {
      return { responded: false, blocked: false, blockedReason: null, blockedMessage: null };
    }

    // 로깅 추가 for debugging
    console.log('🔍 Progress Status:', progressStatus);

    // 답변 가능 여부 확인 (canProceed를 최우선으로 확인)
    // canProceed가 false일 때만 hasTodayAnswer를 확인하여 "답변 완료" 상태로 표시
    if (!progressStatus.canProceed) {
      console.log('🚫 Cannot proceed - checking if already answered');

      // 답변을 완료했는데 진행이 불가능한 경우 (오늘 답변 완료)
      if (progressStatus.hasTodayAnswer) {
        console.log('✅ Already answered today and cannot proceed');
        return {
          responded: true,
          blocked: false,
          blockedReason: null,
          blockedMessage: null
        };
      }

      // 데일리 질문이 없어서 진행 불가능한 경우
      if (!progressStatus.hasDailyQuestion) {
        console.log('❌ No daily question available');
        return {
          responded: false,
          blocked: true,
          blockedReason: "no_question",
          blockedMessage: t('features.moment.my_moment.blocked_messages.no_question')
        };
      }

      // 기타 진행 불가능 사유
      return {
        responded: false,
        blocked: true,
        blockedReason: "not_allowed",
        blockedMessage: t('features.moment.my_moment.blocked_messages.not_allowed')
      };
    }

    // canProceed가 true인 경우: 답변 가능 상태 (hasTodayAnswer와 관계없이)
    console.log('✅ Can proceed - allowing to answer');
    return { responded: false, blocked: false, blockedReason: null, blockedMessage: null };
  };

  const questionCardState = getQuestionCardState();
  console.log('📊 Final Question Card State:', questionCardState);

  if (questionLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryPurple} />
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
        <GuideSection responded={questionCardState.responded} />
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
