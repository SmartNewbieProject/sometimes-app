import paymentApis from '../api';
import type { RevenueAnalyticsResponse } from '../types';

/**
 * 특정 사용자의 상세 결제 분석 데이터 조회 API 함수
 * @param userId 사용자 ID
 * @returns 상품별/월별 수익 분석, LTV 관련 정보 등
 */
export const fetchRevenueAnalytics = (userId: string): Promise<RevenueAnalyticsResponse> => {
  return paymentApis.getRevenueAnalytics(userId);
};

/**
 * 현재 로그인한 사용자의 상세 결제 분석 데이터 조회 API 함수
 * @returns 상세 결제 분석 정보
 */
export const fetchMyRevenueAnalytics = (): Promise<RevenueAnalyticsResponse> => {
  // TODO: 현재 사용자 ID 가져오는 로직 필요
  // const { user } = useAuth();
  // const userId = user?.id;

  const userId = null; // user?.id

  return fetchRevenueAnalytics(userId!);
};