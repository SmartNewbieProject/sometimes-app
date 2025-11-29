import paymentApis from '../api';
import type { RevenuePeriodQuery, RevenuePeriodResponse } from '../types';

/**
 * 특정 사용자의 기간별 결제 금액 조회 API 함수
 * @param userId 사용자 ID
 * @param query 기간 쿼리 파라미터 (from, to)
 * @returns 기간별 결제 데이터
 */
export const fetchRevenueByPeriod = (
  userId: string,
  query: RevenuePeriodQuery = {}
): Promise<RevenuePeriodResponse> => {
  return paymentApis.getRevenueByPeriod(userId, query);
};

/**
 * 현재 로그인한 사용자의 기간별 결제 금액 조회 API 함수
 * @param query 기간 쿼리 파라미터 (from, to)
 * @returns 기간별 결제 데이터
 */
export const fetchMyRevenueByPeriod = (query: RevenuePeriodQuery = {}): Promise<RevenuePeriodResponse> => {
  // TODO: 현재 사용자 ID 가져오는 로직 필요
  // const { user } = useAuth();
  // const userId = user?.id;

  const userId = null; // user?.id

  return fetchRevenueByPeriod(userId!, query);
};

/**
 * 특정 사용자의 당월 결제 금액 조회 API 함수
 * @param userId 사용자 ID
 * @returns 당월 결제 데이터
 */
export const fetchCurrentMonthRevenue = (userId: string): Promise<RevenuePeriodResponse> => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const query: RevenuePeriodQuery = {
    from: firstDay.toISOString().split('T')[0],
    to: lastDay.toISOString().split('T')[0],
  };

  return fetchRevenueByPeriod(userId, query);
};

/**
 * 현재 로그인한 사용자의 당월 결제 금액 조회 API 함수
 * @returns 당월 결제 데이터
 */
export const fetchMyCurrentMonthRevenue = (): Promise<RevenuePeriodResponse> => {
  const userId = null; // user?.id

  return fetchCurrentMonthRevenue(userId!);
};