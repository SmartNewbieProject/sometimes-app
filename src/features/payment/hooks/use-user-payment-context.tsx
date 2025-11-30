import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/features/auth';
import { usePortoneStore } from './use-portone-store';
import { axiosClient } from '@/src/shared/libs';

export interface UserPaymentContextResponse {
  previous_payment_count: number;
  days_since_signup: number;
  total_gem_purchased: number;
  last_purchase_date: string | null;
  average_purchase_amount: number;
  total_amount_spent: number;
}

/**
 * 사용자 결제 컨텍스트 조회 API 함수
 * @param userId 사용자 ID
 * @returns 사용자 결제 컨텍스트 데이터
 */
export const fetchUserPaymentContext = async (userId: string): Promise<UserPaymentContextResponse> => {
  try {
    const response = await axiosClient.get(`/v1/users/${userId}/payment-context`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user payment context:', error);
    // API 실패 시 기본값 반환
    return {
      previous_payment_count: 0,
      days_since_signup: 0,
      total_gem_purchased: 0,
      last_purchase_date: null,
      average_purchase_amount: 0,
      total_amount_spent: 0,
    };
  }
};

/**
 * 현재 로그인한 사용자의 결제 컨텍스트를 조회하는 훅
 * @returns 결제 컨텍스트 데이터 및 쿼리 상태
 */
export const useUserPaymentContext = () => {
  const { profileDetails } = useAuth();
  const userId = profileDetails?.id?.toString();

  return useQuery({
    queryKey: ['user-payment-context', userId],
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID not found');
      }
      return fetchUserPaymentContext(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5분 캐시
    retry: 1,
  });
};

/**
 * 남은 젬 수량 추적 훅
 * 기존 usePortoneStore와 연동
 */
export const useGemQuotaTracker = () => {
  const { gemCount } = usePortoneStore();

  // usePortoneStore에서 gemCount를 가져옴
  const remainingGems = gemCount || 0;

  return {
    remainingGems,
    isGemInsufficient: remainingGems <= 0,
    gemLevel: remainingGems > 50 ? 'high' : remainingGems > 10 ? 'medium' : 'low',
  };
};