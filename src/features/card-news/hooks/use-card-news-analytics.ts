/**
 * 카드뉴스 Mixpanel 분석 훅
 * 카드뉴스 기능의 사용자 행동 추적을 위한 전용 훅
 */
import { useCallback, useRef } from 'react';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import {
  CARD_NEWS_EVENTS,
  CARD_NEWS_ENTRY_SOURCES,
  type CardNewsEntrySource,
  type CardNewsNavigationMethod,
  type CardNewsExitMethod,
} from '../constants/card-news-events';

interface CardNewsSession {
  cardNewsId: string;
  cardNewsTitle: string;
  totalSections: number;
  entrySource: CardNewsEntrySource;
  startTime: number;
  cardStartTimes: Record<number, number>;
  currentSection: number;
}

export function useCardNewsAnalytics() {
  const sessionRef = useRef<CardNewsSession | null>(null);

  const trackEvent = useCallback((
    eventName: string,
    properties: Record<string, unknown> = {}
  ) => {
    const baseProperties = {
      timestamp: Date.now(),
      env: process.env.EXPO_PUBLIC_TRACKING_MODE || 'development',
    };

    mixpanelAdapter.track(eventName, {
      ...baseProperties,
      ...properties,
    });

    if (process.env.EXPO_PUBLIC_TRACKING_MODE === 'development') {
      console.log(`[CardNews Analytics] ${eventName}:`, properties);
    }
  }, []);

  const trackSectionViewed = useCallback((
    highlightCount: number,
    hasListItems: boolean,
    source: 'home' | 'deep_link' = 'home'
  ) => {
    trackEvent(CARD_NEWS_EVENTS.SECTION_VIEWED, {
      highlight_count: highlightCount,
      has_list_items: hasListItems,
      source,
    });
  }, [trackEvent]);

  const trackDetailEntered = useCallback((
    cardNewsId: string,
    cardNewsTitle: string,
    totalSections: number,
    entrySource: CardNewsEntrySource,
    positionInList?: number
  ) => {
    sessionRef.current = {
      cardNewsId,
      cardNewsTitle,
      totalSections,
      entrySource,
      startTime: Date.now(),
      cardStartTimes: { 0: Date.now() },
      currentSection: 0,
    };

    trackEvent(CARD_NEWS_EVENTS.DETAIL_ENTERED, {
      card_news_id: cardNewsId,
      card_news_title: cardNewsTitle,
      total_sections: totalSections,
      entry_source: entrySource,
      ...(positionInList !== undefined && { position_in_list: positionInList }),
    });
  }, [trackEvent]);

  const trackHighlightClicked = useCallback((
    cardNewsId: string,
    cardNewsTitle: string,
    position: number,
    wasAutoScrolled: boolean
  ) => {
    trackEvent(CARD_NEWS_EVENTS.HIGHLIGHT_CLICKED, {
      card_news_id: cardNewsId,
      card_news_title: cardNewsTitle,
      position,
      was_auto_scrolled: wasAutoScrolled,
    });
  }, [trackEvent]);

  const trackHighlightSwiped = useCallback((
    fromPosition: number,
    toPosition: number,
    direction: 'left' | 'right',
    swipeDurationMs: number
  ) => {
    trackEvent(CARD_NEWS_EVENTS.HIGHLIGHT_SWIPED, {
      from_position: fromPosition,
      to_position: toPosition,
      direction,
      swipe_duration_ms: swipeDurationMs,
    });
  }, [trackEvent]);

  const trackListItemClicked = useCallback((
    cardNewsId: string,
    cardNewsTitle: string,
    positionInList: number,
    publishedAt: string,
    readCount: number
  ) => {
    trackEvent(CARD_NEWS_EVENTS.LIST_ITEM_CLICKED, {
      card_news_id: cardNewsId,
      card_news_title: cardNewsTitle,
      position_in_list: positionInList,
      published_at: publishedAt,
      read_count: readCount,
    });
  }, [trackEvent]);

  const trackCardNavigated = useCallback((
    toSection: number,
    navigationMethod: CardNewsNavigationMethod
  ) => {
    const session = sessionRef.current;
    if (!session) return;

    const fromSection = session.currentSection;
    const previousCardStartTime = session.cardStartTimes[fromSection] || Date.now();
    const timeOnPreviousCard = Date.now() - previousCardStartTime;

    trackEvent(CARD_NEWS_EVENTS.CARD_NAVIGATED, {
      card_news_id: session.cardNewsId,
      from_section: fromSection,
      to_section: toSection,
      navigation_method: navigationMethod,
      time_on_previous_card_ms: timeOnPreviousCard,
    });

    session.currentSection = toSection;
    session.cardStartTimes[toSection] = Date.now();
  }, [trackEvent]);

  const trackCompleted = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;

    const totalReadingTime = Date.now() - session.startTime;
    const avgTimePerCard = Math.round(totalReadingTime / session.totalSections);

    trackEvent(CARD_NEWS_EVENTS.COMPLETED, {
      card_news_id: session.cardNewsId,
      card_news_title: session.cardNewsTitle,
      total_sections: session.totalSections,
      total_reading_time_ms: totalReadingTime,
      avg_time_per_card_ms: avgTimePerCard,
      entry_source: session.entrySource,
    });

    sessionRef.current = null;
  }, [trackEvent]);

  const trackExited = useCallback((exitMethod: CardNewsExitMethod) => {
    const session = sessionRef.current;
    if (!session) return;

    const totalReadingTime = Date.now() - session.startTime;
    const completionRate = (session.currentSection + 1) / session.totalSections;

    trackEvent(CARD_NEWS_EVENTS.EXITED, {
      card_news_id: session.cardNewsId,
      card_news_title: session.cardNewsTitle,
      exit_section: session.currentSection,
      total_sections: session.totalSections,
      completion_rate: Math.round(completionRate * 100) / 100,
      total_reading_time_ms: totalReadingTime,
      exit_method: exitMethod,
    });

    sessionRef.current = null;
  }, [trackEvent]);

  const trackRewardClaimed = useCallback((
    cardNewsId: string,
    rewardType: 'gem' | 'point',
    rewardAmount: number
  ) => {
    const session = sessionRef.current;
    const readingTime = session ? Date.now() - session.startTime : 0;

    trackEvent(CARD_NEWS_EVENTS.REWARD_CLAIMED, {
      card_news_id: cardNewsId,
      reward_type: rewardType,
      reward_amount: rewardAmount,
      reading_time_ms: readingTime,
    });
  }, [trackEvent]);

  const trackListEndReached = useCallback((
    totalItemsViewed: number,
    hasMore: boolean
  ) => {
    trackEvent(CARD_NEWS_EVENTS.LIST_END_REACHED, {
      total_items_viewed: totalItemsViewed,
      has_more: hasMore,
    });
  }, [trackEvent]);

  const trackFAQClicked = useCallback(() => {
    trackEvent(CARD_NEWS_EVENTS.FAQ_CLICKED, {
      source: 'card_news_home',
    });
  }, [trackEvent]);

  const getSession = useCallback(() => sessionRef.current, []);

  const hasActiveSession = useCallback(() => sessionRef.current !== null, []);

  return {
    trackSectionViewed,
    trackDetailEntered,
    trackHighlightClicked,
    trackHighlightSwiped,
    trackListItemClicked,
    trackCardNavigated,
    trackCompleted,
    trackExited,
    trackRewardClaimed,
    trackListEndReached,
    trackFAQClicked,
    getSession,
    hasActiveSession,
    ENTRY_SOURCES: CARD_NEWS_ENTRY_SOURCES,
  };
}
