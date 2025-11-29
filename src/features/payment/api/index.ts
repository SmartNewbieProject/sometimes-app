import { axiosClient } from '@/src/shared/libs';
import type { Product } from 'expo-iap';
import type {
  PaymentBeforeHistory,
  PortOnePayment,
  TotalRevenueResponse,
  RevenueAnalyticsResponse,
  FinalizeLTVResponse,
  RevenuePeriodQuery,
  RevenuePeriodResponse,
  FinalizeLTVDto
} from '../types';

export enum GemReferenceType {
	PAYMENT = 'PAYMENT',
	PROFILE_OPEN = 'PROFILE_OPEN',
	LIKE_MESSAGE = 'LIKE_MESSAGE',
	CHAT_START = 'CHAT_START',
	REMATCHING = 'REMATCHING',
	PREMIUM_FILTER = 'PREMIUM_FILTER',
	OLD_REMATCHING = 'OLD_REMATCHING', // 사라질 녀석임
}

export type ConsumableGemFeature =
	| GemReferenceType.PROFILE_OPEN
	| GemReferenceType.LIKE_MESSAGE
	| GemReferenceType.CHAT_START
	| GemReferenceType.REMATCHING
	| GemReferenceType.OLD_REMATCHING;

export type CurrentGem = {
	totalGem: number;
};

export type GemDetails = {
	id: string;
	productName: string;
	gemAmount: number;
	bonusGems: number;
	totalGems: number;
	price: number;
	discountRate: number;
	sortOrder: number;
};

export type AppleVerifyGem = {
	success: true;
	grantedProductId: string;
	grantedQuantity: number;
};

export type AppleGemDetails = Product;

export type GemDetailsResponse = GemDetails[];

const savePaymentHistory = async (paymentHistory: PaymentBeforeHistory) =>
	axiosClient.post('/payments/history', paymentHistory);

const pay = (paymentDetails: PortOnePayment) =>
	axiosClient.post('/payments/confirm', paymentDetails);

const payGem = (paymentDetails: PortOnePayment) =>
	axiosClient.post('/v1/gem/confirm', paymentDetails);

const getCurrentGem = () => axiosClient.get('/v1/gem/current') as Promise<CurrentGem>;

const getAllGemProducts = () => axiosClient.get('/v1/gem/products') as Promise<GemDetailsResponse>;

const getFeatureCosts = () =>
	axiosClient.get('/v1/gem/features/cost') as Promise<Record<ConsumableGemFeature, number>>;

const postAppleVerifyPurchase = (transactionReceipt: string): Promise<AppleVerifyGem> => {
	return axiosClient.post('/iap/apple/verify-purchase', { transactionReceipt });
};

// 총 결제 금액 조회 API
const getTotalRevenue = (userId: string): Promise<TotalRevenueResponse> => {
	return axiosClient.get(`/v1/users/${userId}/total-revenue`);
};

// 상세 결제 분석 API
const getRevenueAnalytics = (userId: string): Promise<RevenueAnalyticsResponse> => {
	return axiosClient.get(`/v1/users/${userId}/revenue-analytics`);
};

// LTV 정산 API (탈퇴 시점)
const finalizeLTV = (userId: string, data: FinalizeLTVDto): Promise<FinalizeLTVResponse> => {
	return axiosClient.post(`/v1/users/${userId}/finalize-ltv`, data);
};

// 기간별 결제 금액 조회 API
const getRevenueByPeriod = (
	userId: string,
	query: RevenuePeriodQuery
): Promise<RevenuePeriodResponse> => {
	const params = new URLSearchParams();
	if (query.from) params.append('from', query.from);
	if (query.to) params.append('to', query.to);

	return axiosClient.get(`/v1/users/${userId}/revenue-by-period?${params.toString()}`);
};

const paymentApis = {
	saveHistory: savePaymentHistory,
	pay,
	getCurrentGem,
	getAllGemProducts,
	payGem,
	postAppleVerifyPurchase,
	getFeatureCosts,
	// 새로운 수익 분석 API
	getTotalRevenue,
	getRevenueAnalytics,
	finalizeLTV,
	getRevenueByPeriod,
};

export default paymentApis;
