import paymentApis from '../api';
import type { TotalRevenueResponse } from '../types';

/**
 * 특정 사용자의 총 결제 금액 조회 API 함수
 * @param userId 사용자 ID
 * @returns 총 결제 금액, 거래 횟수, 평균 결제액 등
 */
export const fetchTotalRevenue = (userId: string): Promise<TotalRevenueResponse> => {
  return paymentApis.getTotalRevenue(userId);
};

/**
 * 현재 로그인한 사용자의 총 결제 금액 조회 API 함수
 * @returns 총 결제 금액 정보
 */
export const fetchMyTotalRevenue = (): Promise<TotalRevenueResponse> => {
  // TODO: 현재 사용자 ID 가져오는 로직 필요
  // const { user } = useAuth();
  // const userId = user?.id;

  const userId = null; // user?.id

  return fetchTotalRevenue(userId!);
};