import { useCallback } from 'react';
import { useNavigationEntryTracker } from '@/src/shared/hooks/use-navigation-entry-tracker';
import { useUserPaymentContext, useGemQuotaTracker } from './use-user-payment-context';
import { usePaymentFunnelContext } from '../providers/payment-funnel-provider';

/**
 * 결제 퍼널 분석을 위한 통합 인터페이스 훅
 * 여러 훅들을 조합하여 결제 퍼널 분석 데이터 제공
 */
export const usePaymentFunnelAnalytics = () => {
  const { getPreviousScreen } = useNavigationEntryTracker();
  const { data: userContext, isLoading } = useUserPaymentContext();
  const { remainingGems } = useGemQuotaTracker();
  const { setEntryData, trackPlanView, handleStoreExit } = usePaymentFunnelContext();

  /**
   * 스토어 진입 데이터 설정
   * @param componentName 트리거 컴포넌트 이름
   */
  const setupStoreEntry = useCallback((componentName: string) => {
    const entryData = {
      trigger_component: componentName,
      trigger_screen: getPreviousScreen(),
      previous_payment_count: userContext?.previous_payment_count || 0,
      days_since_signup: userContext?.days_since_signup || 0,
      remaining_quota: remainingGems,
      entry_timestamp: new Date().toISOString(),
    };

    setEntryData(entryData);

    console.log('🎯 Store entry analytics setup:', {
      component: componentName,
      screen: getPreviousScreen(),
      userContext: {
        previousPayments: userContext?.previous_payment_count || 0,
        daysSinceSignup: userContext?.days_since_signup || 0,
      },
      remainingGems,
    });

    return entryData;
  }, [getPreviousScreen, userContext, remainingGems, setEntryData]);

  /**
   * 플랜 조회 추적
   * @param planId 플랜 ID
   * @param planName 플랜 이름
   */
  const trackPlanInteraction = useCallback((planId: string, planName?: string) => {
    trackPlanView(`${planId}${planName ? `_${planName}` : ''}`);

    console.log('📦 Plan interaction tracked:', {
      planId,
      planName,
      totalGems: remainingGems,
      paymentHistory: userContext?.previous_payment_count || 0,
    });
  }, [trackPlanView, remainingGems, userContext]);

  /**
   * 사용자 결제 등급 분류
   */
  const getUserPaymentTier = useCallback((): 'new' | 'casual' | 'regular' | 'vip' => {
    const paymentCount = userContext?.previous_payment_count || 0;
    const totalSpent = userContext?.total_amount_spent || 0;

    if (paymentCount === 0) return 'new';
    if (paymentCount <= 2 && totalSpent < 50000) return 'casual';
    if (paymentCount <= 5 && totalSpent < 100000) return 'regular';
    return 'vip';
  }, [userContext]);

  /**
   * 구매 가능성 평가
   */
  const getPurchaseProbability = useCallback((): 'high' | 'medium' | 'low' => {
    const paymentCount = userContext?.previous_payment_count || 0;
    const daysSinceSignup = userContext?.days_since_signup || 0;
    const gemLevel = remainingGems > 50 ? 'high' : remainingGems > 10 ? 'medium' : 'low';

    // 신규 사용자이고 젬이 부족한 경우
    if (paymentCount === 0 && gemLevel === 'low' && daysSinceSignup < 30) {
      return 'high';
    }

    // 기존 구매 이력이 있는 사용자
    if (paymentCount > 0 && gemLevel === 'low') {
      return 'high';
    }

    // 젬이 충분한 사용자
    if (gemLevel === 'high') {
      return 'low';
    }

    return 'medium';
  }, [userContext, remainingGems]);

  return {
    // 데이터 상태
    userContext,
    isLoading,
    remainingGems,

    // 분석 함수
    setupStoreEntry,
    trackPlanInteraction,
    handleStoreExit,

    // 분석 메트릭
    getUserPaymentTier,
    getPurchaseProbability,
  };
};