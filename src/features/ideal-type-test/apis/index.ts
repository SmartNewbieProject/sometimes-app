import { axiosClient } from '@/src/shared/libs';
import type {
	LanguageCode,
	MyResultResponse,
	SessionStatusResponse,
	StartTestRequest,
	StartTestResponse,
	StatsResponse,
	SubmitAnswerRequest,
	SubmitAnswerResponse,
	TestResultResponse,
} from '../types';

// API 기본 경로
const BASE_PATH = '/api/v1/ideal-type-test';

/**
 * 테스트 시작
 * POST /api/v1/ideal-type-test/start
 *
 * @param request - 테스트 시작 요청 (source: 'web' | 'mobile')
 * @param lang - 언어 코드 (ko, ja). 기본값: ko
 * @returns 세션 ID, 질문 목록, 만료 시간
 */
export const startTest = (
	request?: StartTestRequest,
	lang: LanguageCode = 'ko',
): Promise<StartTestResponse> => {
	const params = new URLSearchParams();
	if (lang) {
		params.append('lang', lang);
	}

	const queryString = params.toString();
	const url = `${BASE_PATH}/start${queryString ? `?${queryString}` : ''}`;
	return axiosClient.post(url, request || {});
};

/**
 * 답변 제출
 * POST /api/v1/ideal-type-test/answer
 *
 * @param request - 세션 ID와 답변 목록
 * @param lang - 언어 코드 (ko, ja). 기본값: ko
 * @returns 진행 상태 또는 완료 시 결과
 */
export const submitAnswer = (
	request: SubmitAnswerRequest,
	lang: LanguageCode = 'ko',
): Promise<SubmitAnswerResponse> => {
	const params = new URLSearchParams();
	if (lang) {
		params.append('lang', lang);
	}

	const queryString = params.toString();
	const url = `${BASE_PATH}/answer${queryString ? `?${queryString}` : ''}`;
	return axiosClient.post(url, request);
};

/**
 * 세션 상태 조회
 * GET /api/v1/ideal-type-test/session/:sessionId
 *
 * @param sessionId - 세션 ID
 * @param lang - 언어 코드 (ko, ja). 기본값: ko
 * @returns 세션 상태 및 결과 (완료된 경우)
 */
export const getSessionStatus = (
	sessionId: string,
	lang: LanguageCode = 'ko',
): Promise<SessionStatusResponse> => {
	const params = new URLSearchParams();
	if (lang) {
		params.append('lang', lang);
	}

	const queryString = params.toString();
	const url = `${BASE_PATH}/session/${sessionId}${queryString ? `?${queryString}` : ''}`;
	return axiosClient.get(url);
};

/**
 * 테스트 결과 조회
 * GET /api/v1/ideal-type-test/result/:sessionId
 *
 * @param sessionId - 세션 ID
 * @param lang - 언어 코드 (ko, ja). 기본값: ko
 * @returns 테스트 결과
 */
export const getTestResult = (
	sessionId: string,
	lang: LanguageCode = 'ko',
): Promise<TestResultResponse> => {
	const params = new URLSearchParams();
	if (lang) {
		params.append('lang', lang);
	}

	const queryString = params.toString();
	const url = `${BASE_PATH}/result/${sessionId}${queryString ? `?${queryString}` : ''}`;
	return axiosClient.get(url);
};

/**
 * 결과 타입 통계 조회
 * GET /api/v1/ideal-type-test/stats/:resultTypeId
 *
 * @param resultTypeId - 결과 타입 ID
 * @returns 통계 (전체 중 비율 및 개수)
 */
export const getStats = (resultTypeId: string): Promise<StatsResponse> => {
	return axiosClient.get(`${BASE_PATH}/stats/${resultTypeId}`);
};

/**
 * 내 결과 조회 (인증 필요)
 * GET /api/v1/users/me/ideal-type-result
 *
 * @param lang - 언어 코드 (ko, ja). 기본값: ko
 * @returns 사용자의 테스트 결과
 */
export const getMyResult = (lang: LanguageCode = 'ko'): Promise<MyResultResponse> => {
	const params = new URLSearchParams();
	if (lang) {
		params.append('lang', lang);
	}

	const queryString = params.toString();
	const url = `/api/v1/users/me/ideal-type-result${queryString ? `?${queryString}` : ''}`;
	return axiosClient.get(url);
};

/**
 * 테스트 재시도 (인증 필요)
 * POST /api/v1/users/me/ideal-type-result/retake
 *
 * @param lang - 언어 코드 (ko, ja). 기본값: ko
 * @returns 새로운 테스트 세션 시작
 */
export const retakeTest = (lang: LanguageCode = 'ko'): Promise<StartTestResponse> => {
	const params = new URLSearchParams();
	if (lang) {
		params.append('lang', lang);
	}

	const queryString = params.toString();
	const url = `/api/v1/users/me/ideal-type-result/retake${queryString ? `?${queryString}` : ''}`;
	return axiosClient.post(url, {});
};

/**
 * 결과 삭제 (인증 필요)
 * DELETE /api/v1/users/me/ideal-type-result
 *
 * @returns void (204 No Content)
 */
export const deleteMyResult = (): Promise<void> => {
	return axiosClient.delete('/api/v1/users/me/ideal-type-result');
};

const apis = {
	startTest,
	submitAnswer,
	getSessionStatus,
	getTestResult,
	getStats,
	getMyResult,
	retakeTest,
	deleteMyResult,
};

export default apis;
