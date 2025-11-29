import { useMutation } from '@tanstack/react-query';
import paymentApis from '../api';
import type { FinalizeLTVDto, FinalizeLTVResponse } from '../types';
import { useKpiAnalytics } from '@/src/shared/hooks/use-kpi-analytics';

/**
 * 사용자 탈퇴 시 LTV 정산 처리 훅
 * 탈퇴 과정에서 사용자의 총 결제 금액을 집계하여 서버로 전송
 * @param userId 사용자 ID
 * @returns LTV 정산 처리 함수 및 상태
 */
export const useFinalizeLTV = (userId: string) => {
  const { trackEvent } = useKpiAnalytics('revenue');

  return useMutation({
    mutationFn: (data: FinalizeLTVDto) => paymentApis.finalizeLTV(userId, data),
    onSuccess: (response: FinalizeLTVResponse) => {
      // 서버에서 계산한 LTV 데이터로 Amplitude 이벤트 전송
      const { finalLTV, amplitudeEvent } = response.data;

      // 탈퇴 사용자 LTV 정산 이벤트 전송
      trackEvent('user_lifetime_value_finalized', {
        user_id: userId,
        total_revenue: finalLTV.totalRevenue,
        transaction_count: finalLTV.transactionCount,
        lifetime_days: finalLTV.lifetimeDays,
        churn_reason: data.deletionReason,
        ltv_category: finalLTV.ltvScore,
        monthly_arpu: finalLTV.monthlyARPU,
        average_transaction: finalLTV.averageTransactionValue,
        signup_date: finalLTV.signupDate,
        churn_date: finalLTV.churnDate,
      });

      console.log('✅ LTV 정산 완료:', {
        userId,
        totalRevenue: finalLTV.totalRevenue,
        transactionCount: finalLTV.transactionCount,
        lifetimeDays: finalLTV.lifetimeDays,
        ltvScore: finalLTV.ltvScore,
      });
    },
    onError: (error) => {
      console.error('❌ LTV 정산 실패:', error);

      // LTV 정산 실패 시에도 탈퇴 이벤트는 전송
      trackEvent('user_churn_ltv_calculation_failed', {
        user_id: userId,
        error: error.message,
        churn_reason: data?.deletionReason,
      });
    },
  });
};

/**
 * 현재 로그인한 사용자의 LTV 정산 처리 훅
 * 회원탈퇴 페이지에서 사용
 * @returns LTV 정산 처리 함수 및 상태
 */
export const useMyFinalizeLTV = () => {
  // TODO: 현재 사용자 ID 가져오는 로직 필요
  // const { user } = useAuth();
  // const userId = user?.id;

  // Currently disabled as no user is available
  return undefined;
};