import { useState, useCallback } from 'react';
import { useKpiAnalytics } from './use-kpi-analytics';
import { useNavigationEntryTracker } from './use-navigation-entry-tracker';
import { useUserPaymentContext, useGemQuotaTracker } from '@/src/features/payment/hooks/use-user-payment-context';
import { AMPLITUDE_KPI_EVENTS } from '@/src/shared/constants/amplitude-kpi-events';
import type { StoreEntryPointEventProperties } from '@/src/shared/constants/amplitude-kpi-events';

export interface StoreEntryData {
  trigger_component: string;
  trigger_screen: string;
  previous_payment_count: number;
  days_since_signup: number;
  remaining_quota: number;
  entry_timestamp: string;
}

export interface StoreAnalyticsData extends StoreEntryData {
  time_on_store_page: number;
  plans_viewed: string[];
  price_comparison_active: boolean;
}

/**
 * 결제 퍼널 추적을 위한 핵심 훅
 * 사용자가 젬 스토어에 진입하는 경로와 행동을 추적
 */
export const usePaymentFunnelTracking = () => {
  const [entryData, setEntryData] = useState<StoreEntryData | null>(null);
  const { trackEvent } = useKpiAnalytics('revenue');
  const { getPreviousScreen } = useNavigationEntryTracker();
  const { data: userContext } = useUserPaymentContext();
  const { remainingGems } = useGemQuotaTracker();

  /**
   * 젬 스토어 진입 트리거
   * @param componentName 진입을 유발한 컴포넌트 이름
   */
  const triggerStoreEntry = useCallback(async (componentName: string) => {
    try {
      // 네비게이션 추적 훅 연동
      const previousScreen = getPreviousScreen();

      // 사용자 결제 컨텍스트 데이터 연동
      const paymentData = {
        previousPaymentCount: userContext?.previous_payment_count || 0,
        daysSinceSignup: userContext?.days_since_signup || 0,
      };

      // 남은 젬 수량 추적 연동
      const gems = remainingGems;

      const newEntryData: StoreEntryData = {
        trigger_component: componentName,
        trigger_screen: previousScreen,
        previous_payment_count: paymentData.previousPaymentCount,
        days_since_signup: paymentData.daysSinceSignup,
        remaining_quota: gems,
        entry_timestamp: new Date().toISOString(),
      };

      setEntryData(newEntryData);

      console.log('✅ Store entry triggered:', {
        component: componentName,
        screen: previousScreen,
        timestamp: newEntryData.entry_timestamp,
        paymentContext: paymentData,
        remainingGems: gems,
      });
    } catch (error) {
      console.error('❌ Store entry tracking failed:', error);
    }
  }, [getPreviousScreen, userContext, remainingGems]);

  /**
   * 최종 결제 퍼널 이벤트 전송
   * @param pageBehaviorData 페이지 행동 데이터
   */
  const completeStoreFunnel = useCallback((pageBehaviorData: {
    timeOnStorePage: number;
    plansViewed: string[];
  }) => {
    if (!entryData) {
      console.warn('⚠️ No entry data available for funnel completion');
      return;
    }

    const eventData: StoreEntryPointEventProperties = {
      ...entryData,
      time_on_store_page: pageBehaviorData.timeOnStorePage,
      plans_viewed: pageBehaviorData.plansViewed,
      price_comparison_active: pageBehaviorData.plansViewed.length > 1,
      timestamp: Date.now(),
    };

    trackEvent(AMPLITUDE_KPI_EVENTS.STORE_ENTRY_POINT, eventData);

    console.log('✅ Store funnel event sent:', eventData);

    // 데이터 초기화
    setEntryData(null);
  }, [entryData, trackEvent]);

  /**
   * 진입 데이터 초기화
   */
  const clearEntryData = useCallback(() => {
    setEntryData(null);
  }, []);

  return {
    entryData,
    triggerStoreEntry,
    completeStoreFunnel,
    clearEntryData,
  };
};