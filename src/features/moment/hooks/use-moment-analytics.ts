import { useCallback } from 'react';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import {
  MOMENT_EVENTS,
  MomentEventName,
  MomentPageViewProperties,
  MomentBannerProperties,
  MomentNavProperties,
  MomentQuestionCardProperties,
  MomentQuestionDetailProperties,
  MomentQuestionTypeToggleProperties,
  MomentQuestionAnswerProperties,
  MomentQuestionSubmitProperties,
  MomentReportProperties,
  MomentReportInsightProperties,
  MomentReportKeywordProperties,
  MomentReportSyncProperties,
  MomentHistoryProperties,
  MomentAIInspirationProperties,
} from '../constants/moment-events';

interface BaseEventProperties {
  env: string;
  timestamp: number;
}

const getBaseProperties = (): BaseEventProperties => ({
  env: process.env.EXPO_PUBLIC_TRACKING_MODE || 'development',
  timestamp: Date.now(),
});

const trackMomentEvent = (
  eventName: MomentEventName,
  properties: Record<string, any> = {}
) => {
  try {
    const eventProperties = {
      ...getBaseProperties(),
      ...properties,
    };

    mixpanelAdapter.track(eventName, eventProperties);

    if (process.env.EXPO_PUBLIC_TRACKING_MODE === 'development') {
      console.log('[Moment Analytics]', eventName, eventProperties);
    }
  } catch (error) {
    console.error('[Moment Analytics] Error:', error);
  }
};

export const useMomentAnalytics = () => {
  // ========== 페이지 진입 이벤트 ==========
  const trackMomentHomeView = useCallback((properties?: MomentPageViewProperties) => {
    trackMomentEvent(MOMENT_EVENTS.PAGE_MOMENT_HOME_VIEW, properties);
  }, []);

  const trackMyMomentView = useCallback((properties?: MomentPageViewProperties) => {
    trackMomentEvent(MOMENT_EVENTS.PAGE_MY_MOMENT_VIEW, properties);
  }, []);

  const trackQuestionDetailView = useCallback((properties: MomentQuestionDetailProperties) => {
    trackMomentEvent(MOMENT_EVENTS.PAGE_QUESTION_DETAIL_VIEW, properties);
  }, []);

  const trackWeeklyReportView = useCallback((properties: MomentReportProperties) => {
    trackMomentEvent(MOMENT_EVENTS.PAGE_WEEKLY_REPORT_VIEW, properties);
  }, []);

  const trackMyAnswersView = useCallback((properties?: { source?: string }) => {
    trackMomentEvent(MOMENT_EVENTS.PAGE_MY_ANSWERS_VIEW, properties);
  }, []);

  const trackMyMomentRecordView = useCallback((properties?: { source?: string }) => {
    trackMomentEvent(MOMENT_EVENTS.PAGE_MY_MOMENT_RECORD_VIEW, properties);
  }, []);

  // ========== 배너/슬라이드 이벤트 ==========
  const trackBannerSlideView = useCallback((properties: MomentBannerProperties) => {
    trackMomentEvent(MOMENT_EVENTS.BANNER_SLIDE_VIEW, properties);
  }, []);

  const trackBannerSlideClick = useCallback((properties: MomentBannerProperties) => {
    trackMomentEvent(MOMENT_EVENTS.BANNER_SLIDE_CLICK, properties);
  }, []);

  const trackBannerSlideSwipe = useCallback((properties: MomentBannerProperties) => {
    trackMomentEvent(MOMENT_EVENTS.BANNER_SLIDE_SWIPE, properties);
  }, []);

  // ========== 네비게이션 메뉴 이벤트 ==========
  const trackNavMyMomentClick = useCallback((properties?: MomentNavProperties) => {
    trackMomentEvent(MOMENT_EVENTS.NAV_MY_MOMENT_CLICK, properties);
  }, []);

  const trackNavDailyRouletteClick = useCallback((properties?: MomentNavProperties) => {
    trackMomentEvent(MOMENT_EVENTS.NAV_DAILY_ROULETTE_CLICK, properties);
  }, []);

  const trackNavSomemateClick = useCallback((properties?: MomentNavProperties) => {
    trackMomentEvent(MOMENT_EVENTS.NAV_SOMEMATE_CLICK, properties);
  }, []);

  const trackNavWeeklyReportClick = useCallback((properties?: MomentNavProperties) => {
    trackMomentEvent(MOMENT_EVENTS.NAV_WEEKLY_REPORT_CLICK, properties);
  }, []);

  const trackNavEventsClick = useCallback((properties?: MomentNavProperties) => {
    trackMomentEvent(MOMENT_EVENTS.NAV_EVENTS_CLICK, properties);
  }, []);

  const trackNavCheckinClick = useCallback((properties?: MomentNavProperties) => {
    trackMomentEvent(MOMENT_EVENTS.NAV_CHECKIN_CLICK, properties);
  }, []);

  // ========== 질문 카드 이벤트 ==========
  const trackQuestionCardView = useCallback((properties: MomentQuestionCardProperties) => {
    trackMomentEvent(MOMENT_EVENTS.QUESTION_CARD_VIEW, properties);
  }, []);

  const trackQuestionCardClick = useCallback((properties: MomentQuestionCardProperties) => {
    trackMomentEvent(MOMENT_EVENTS.QUESTION_CARD_CLICK, properties);
  }, []);

  const trackQuestionCardBlocked = useCallback((properties: MomentQuestionCardProperties) => {
    trackMomentEvent(MOMENT_EVENTS.QUESTION_CARD_BLOCKED, properties);
  }, []);

  // ========== 질문 상세 (퍼널) 이벤트 ==========
  const trackQuestionEnvelopeView = useCallback((properties: MomentQuestionDetailProperties) => {
    trackMomentEvent(MOMENT_EVENTS.QUESTION_ENVELOPE_VIEW, properties);
  }, []);

  const trackQuestionEnvelopeOpen = useCallback((properties: MomentQuestionDetailProperties) => {
    trackMomentEvent(MOMENT_EVENTS.QUESTION_ENVELOPE_OPEN, properties);
  }, []);

  const trackQuestionReadingStart = useCallback((properties: MomentQuestionDetailProperties) => {
    trackMomentEvent(MOMENT_EVENTS.QUESTION_READING_START, properties);
  }, []);

  const trackQuestionTypeToggle = useCallback((properties: MomentQuestionTypeToggleProperties) => {
    trackMomentEvent(MOMENT_EVENTS.QUESTION_TYPE_TOGGLE, properties);
  }, []);

  const trackQuestionAIInspirationClick = useCallback((properties: MomentAIInspirationProperties) => {
    trackMomentEvent(MOMENT_EVENTS.QUESTION_AI_INSPIRATION_CLICK, properties);
  }, []);

  const trackQuestionAIInspirationApply = useCallback((properties: MomentAIInspirationProperties) => {
    trackMomentEvent(MOMENT_EVENTS.QUESTION_AI_INSPIRATION_APPLY, properties);
  }, []);

  const trackQuestionTextInputStart = useCallback((properties: MomentQuestionDetailProperties) => {
    trackMomentEvent(MOMENT_EVENTS.QUESTION_TEXT_INPUT_START, properties);
  }, []);

  const trackQuestionOptionSelect = useCallback((properties: MomentQuestionAnswerProperties) => {
    trackMomentEvent(MOMENT_EVENTS.QUESTION_OPTION_SELECT, properties);
  }, []);

  const trackQuestionSubmitAttempt = useCallback((properties: MomentQuestionSubmitProperties) => {
    trackMomentEvent(MOMENT_EVENTS.QUESTION_SUBMIT_ATTEMPT, properties);
  }, []);

  const trackQuestionSubmitSuccess = useCallback((properties: MomentQuestionSubmitProperties) => {
    trackMomentEvent(MOMENT_EVENTS.QUESTION_SUBMIT_SUCCESS, properties);
  }, []);

  const trackQuestionSubmitFail = useCallback((properties: MomentQuestionSubmitProperties) => {
    trackMomentEvent(MOMENT_EVENTS.QUESTION_SUBMIT_FAIL, properties);
  }, []);

  const trackQuestionRewardView = useCallback((properties: MomentQuestionDetailProperties & { reward_type?: string; reward_amount?: number }) => {
    trackMomentEvent(MOMENT_EVENTS.QUESTION_REWARD_VIEW, properties);
  }, []);

  const trackQuestionCompleteBack = useCallback((properties: MomentQuestionDetailProperties) => {
    trackMomentEvent(MOMENT_EVENTS.QUESTION_COMPLETE_BACK, properties);
  }, []);

  // ========== 위클리 리포트 이벤트 ==========
  const trackReportChartView = useCallback((properties: MomentReportProperties & { chart_type?: string }) => {
    trackMomentEvent(MOMENT_EVENTS.REPORT_CHART_VIEW, properties);
  }, []);

  const trackReportInsightExpand = useCallback((properties: MomentReportInsightProperties) => {
    trackMomentEvent(MOMENT_EVENTS.REPORT_INSIGHT_EXPAND, properties);
  }, []);

  const trackReportInsightCollapse = useCallback((properties: MomentReportInsightProperties) => {
    trackMomentEvent(MOMENT_EVENTS.REPORT_INSIGHT_COLLAPSE, properties);
  }, []);

  const trackReportKeywordView = useCallback((properties: MomentReportKeywordProperties) => {
    trackMomentEvent(MOMENT_EVENTS.REPORT_KEYWORD_VIEW, properties);
  }, []);

  const trackReportProfileSyncClick = useCallback((properties: MomentReportSyncProperties) => {
    trackMomentEvent(MOMENT_EVENTS.REPORT_PROFILE_SYNC_CLICK, properties);
  }, []);

  const trackReportProfileSyncSuccess = useCallback((properties: MomentReportSyncProperties) => {
    trackMomentEvent(MOMENT_EVENTS.REPORT_PROFILE_SYNC_SUCCESS, properties);
  }, []);

  const trackReportProfileSyncFail = useCallback((properties: MomentReportSyncProperties) => {
    trackMomentEvent(MOMENT_EVENTS.REPORT_PROFILE_SYNC_FAIL, properties);
  }, []);

  // ========== 히스토리 이벤트 ==========
  const trackHistoryReportClick = useCallback((properties: MomentHistoryProperties) => {
    trackMomentEvent(MOMENT_EVENTS.HISTORY_REPORT_CLICK, properties);
  }, []);

  const trackHistoryAnswerClick = useCallback((properties: MomentHistoryProperties) => {
    trackMomentEvent(MOMENT_EVENTS.HISTORY_ANSWER_CLICK, properties);
  }, []);

  const trackHistoryScrollLoadMore = useCallback((properties: MomentHistoryProperties) => {
    trackMomentEvent(MOMENT_EVENTS.HISTORY_SCROLL_LOAD_MORE, properties);
  }, []);

  // ========== 가이드 섹션 이벤트 ==========
  const trackGuideRewardView = useCallback((properties?: { reward_type?: string }) => {
    trackMomentEvent(MOMENT_EVENTS.GUIDE_REWARD_VIEW, properties);
  }, []);

  return {
    // 페이지 진입
    trackMomentHomeView,
    trackMyMomentView,
    trackQuestionDetailView,
    trackWeeklyReportView,
    trackMyAnswersView,
    trackMyMomentRecordView,

    // 배너/슬라이드
    trackBannerSlideView,
    trackBannerSlideClick,
    trackBannerSlideSwipe,

    // 네비게이션 메뉴
    trackNavMyMomentClick,
    trackNavDailyRouletteClick,
    trackNavSomemateClick,
    trackNavWeeklyReportClick,
    trackNavEventsClick,
    trackNavCheckinClick,

    // 질문 카드
    trackQuestionCardView,
    trackQuestionCardClick,
    trackQuestionCardBlocked,

    // 질문 상세 퍼널
    trackQuestionEnvelopeView,
    trackQuestionEnvelopeOpen,
    trackQuestionReadingStart,
    trackQuestionTypeToggle,
    trackQuestionAIInspirationClick,
    trackQuestionAIInspirationApply,
    trackQuestionTextInputStart,
    trackQuestionOptionSelect,
    trackQuestionSubmitAttempt,
    trackQuestionSubmitSuccess,
    trackQuestionSubmitFail,
    trackQuestionRewardView,
    trackQuestionCompleteBack,

    // 위클리 리포트
    trackReportChartView,
    trackReportInsightExpand,
    trackReportInsightCollapse,
    trackReportKeywordView,
    trackReportProfileSyncClick,
    trackReportProfileSyncSuccess,
    trackReportProfileSyncFail,

    // 히스토리
    trackHistoryReportClick,
    trackHistoryAnswerClick,
    trackHistoryScrollLoadMore,

    // 가이드
    trackGuideRewardView,
  };
};
