import type { TokenResponse } from '@/src/types/auth';
import axios from 'axios';
import { router } from 'expo-router';
import { env } from './env';
import { eventBus } from './event-bus';
import { isJapanese } from './local';
import { storage } from './store';
import { tryCatch } from './try-catch';

const getCountryCode = (): string => (isJapanese() ? 'jp' : 'kr');

/**
 * 요청별 X-Country 헤더를 4단계 우선순위로 결정
 * 1. 수동 설정된 헤더 (config.headers에 이미 존재)
 * 2. URL 경로 기반 자동 감지 (/jp/* → jp)
 * 3. 로컬 저장된 유저 국가 (로그인 후 저장됨)
 * 4. 기기 언어 fallback
 */
const resolveCountry = async (
	config: import('axios').InternalAxiosRequestConfig,
): Promise<string> => {
	// 1순위: 수동 설정된 헤더 존중
	const manual = config.headers['X-Country'] || config.headers['x-country'];
	if (manual) return String(manual);

	// 2순위: URL 경로 기반 자동 감지
	const url = config.url || '';
	if (url.startsWith('/jp/')) return 'jp';

	// 3순위: 로컬 저장된 유저 국가
	const storedCountry = await storage.getItem('user-country');
	if (storedCountry && (storedCountry === 'kr' || storedCountry === 'jp')) {
		return storedCountry;
	}

	// 4순위: 기기 언어 fallback
	return getCountryCode();
};

let refreshTokenPromise: Promise<string> | null = null;
let isNetworkDisabled = false;
let isLoggingOut = false;
const detach = (token: string) => token.replaceAll('"', '');
const TokenErrorExceptPaths = ['/community'];

const AUTH_PATHS = ['/auth', '/onboarding'];

export enum ErrorCode {
	REGION_NOT_ALLOWED = 'REGION_NOT_ALLOWED',
}

const refresh = async () => {
	if (refreshTokenPromise) {
		return refreshTokenPromise;
	}

	refreshTokenPromise = (async () => {
		try {
			const refreshToken = await storage.getItem('refresh-token');
			if (!refreshToken) throw new Error('No refresh token');

			const { accessToken, refreshToken: newRefreshToken } = await temporaryAxiosClient
				.post<TokenResponse>('/auth/refresh', { refreshToken: detach(refreshToken) })
				.then((response) => response.data);

			await storage.setItem('access-token', accessToken);
			await storage.setItem('refresh-token', newRefreshToken);

			// 토큰 갱신 이벤트 발생
			eventBus.emit('auth:tokensUpdated', { accessToken, refreshToken: newRefreshToken });

			isLoggingOut = false;
			return accessToken;
		} finally {
			refreshTokenPromise = null;
		}
	})();

	return refreshTokenPromise;
};

// API_URL 검증 및 fallback
const FALLBACK_API_URL = 'https://api.some-in-univ.com/api';
let API_URL = env.API_URL;

// API_URL이 비어있거나 치환되지 않은 경우 fallback 사용
if (!API_URL || API_URL.includes('${') || API_URL.includes('EXPO_PUBLIC_')) {
	console.error('[axios.ts] ❌ Invalid API_URL detected:', API_URL);
	console.error('[axios.ts] ⚠️ Using fallback:', FALLBACK_API_URL);
	API_URL = FALLBACK_API_URL;
}

console.log('=================================');
console.log('[API 설정] baseURL:', API_URL);
console.log('=================================');

const axiosClient = axios.create({
	baseURL: API_URL,
	timeout: 20000,
	headers: {
		'Content-Type': 'application/json',
	},
});

const temporaryAxiosClient = axios.create({
	baseURL: API_URL,
	timeout: 20000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// temporaryAxiosClient에도 동일한 multi-priority X-Country 설정
temporaryAxiosClient.interceptors.request.use(async (config) => {
	config.headers['X-Country'] = await resolveCountry(config);
	return config;
});

// 클라이언트 에러 리포트 전송 (fire-and-forget)
const reportClientError = async (error: any) => {
	try {
		const accessToken = await storage.getItem('access-token');
		if (!accessToken || accessToken === 'null') return;

		await temporaryAxiosClient.post(
			'/client-error-reports',
			{
				errorMessage: JSON.stringify({
					method: error.config?.method?.toUpperCase(),
					url: error.config?.url,
					status: error.response?.status,
					responseData: error.response?.data,
					message: error.message,
					code: error.code,
					timestamp: new Date().toISOString(),
				}),
			},
			{
				headers: {
					Authorization: `Bearer ${detach(accessToken)}`,
				},
			},
		);
	} catch {
		// fire-and-forget: 전송 실패는 무시
	}
};

// 요청 인터셉터
axiosClient.interceptors.request.use(
	async (config) => {
		if (isNetworkDisabled) {
			return Promise.reject(new Error('Network requests are disabled due to REGION_NOT_ALLOWED'));
		}

		// Multi-tenant 지원: 4단계 우선순위로 국가 코드 헤더 설정
		config.headers['X-Country'] = await resolveCountry(config);

		// 디버깅: 요청 정보 로깅
		console.log(
			`[API 요청] ${config.method?.toUpperCase()} ${config.url} [${config.headers['X-Country']}]`,
		);
		if (config.data) {
			console.log(
				'[API 요청 데이터]',
				typeof config.data === 'string' ? config.data : JSON.stringify(config.data, null, 2),
			);
		}

		// 인증 불필요 API 목록 (로그인, 회원가입 관련)
		const noAuthRequiredPaths = [
			'/auth/login',
			'/auth/signup',
			'/auth/sms/send',
			'/auth/oauth/kakao',
			'/auth/oauth/apple',
			'/auth/check/phone-number',
			'/auth/check/phone-number/blacklist',
			'/jp/auth/login',
			'/jp/auth/signup',
			'/jp/auth/sms/send',
			'/jp/auth/sms/verify',
			'/universities',
			'/sometime-articles',
			'/feature-flags',
			'/v1/ideal-type-test',
		];

		const isNoAuthRequired = noAuthRequiredPaths.some((path) => config.url?.startsWith(path));

		if (isNoAuthRequired) {
			console.log('[axios] 인증 불필요 API:', config.url);
			return config;
		}

		const accessToken = await storage.getItem('access-token');
		if (accessToken && accessToken !== 'null') {
			config.headers.Authorization = `Bearer ${accessToken?.replaceAll('"', '')}`;
		} else {
			console.log('[axios] 토큰 없음, Authorization 헤더 생략:', config.url);
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// 응답 인터셉터
axiosClient.interceptors.response.use(
	(response) => {
		// { success: boolean, data: T } 형태의 응답 처리
		if (
			response.data &&
			typeof response.data === 'object' &&
			'success' in response.data &&
			'data' in response.data
		) {
			return response.data.data; // data 필드만 반환
		}
		return response.data;
	},
	async (error) => {
		// 디버깅: 에러 응답 로깅
		console.error(`[API 에러] ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
		console.error(`[API 에러] 상태 코드: ${error.response?.status}`);
		console.error(`[API 에러] 응답 데이터:`, error.response?.data);
		console.error(`[API 에러] 에러 메시지: ${error.message}`);
		console.error(`[API 에러] 에러 코드: ${error.code}`);

		const data = error?.response?.data;
		const status = error?.response?.status;

		// 5xx 서버 에러 리포트 (fire-and-forget)
		if (status >= 500 && error.config?.url !== '/client-error-reports') {
			reportClientError(error);
		}

		// 502/503 서버 점검 모달
		if (status === 502 || status === 503) {
			eventBus.emit('server:maintenance', {
				type: status === 503 ? 'maintenance' : 'temporary',
				config: error.config,
			});
			return Promise.reject({ ...error.response?.data, status });
		}

		if (status === 403 && data?.code === ErrorCode.REGION_NOT_ALLOWED) {
			isNetworkDisabled = true;
			router.push('/commingsoon');
			return;
		}

		if (status === 401) {
			if (isLoggingOut) {
				return Promise.reject(error);
			}

			try {
				const newAccessToken = await refresh();
				error.config.headers.Authorization = `Bearer ${newAccessToken}`;

				return await tryCatch(
					async () => {
						const result = await temporaryAxiosClient(error.config);
						// { success: boolean, data: T } 형태의 응답 처리
						if (
							result.data &&
							typeof result.data === 'object' &&
							'success' in result.data &&
							'data' in result.data
						) {
							return result.data.data;
						}
						return result.data;
					},
					async (error) => {
						if (isLoggingOut) return;
						isLoggingOut = true;

						console.log({ refreshError: error });
						storage.removeItem('access-token');
						storage.removeItem('refresh-token');
						eventBus.emit('auth:logout');

						const currentPath = await storage.getItem('current-path');
						const isAuthPage = AUTH_PATHS.some((path) => currentPath?.includes(path));
						if (!isAuthPage) {
							eventBus.emit('auth:loginRequired');
						}
						console.error(error);
					},
				);
			} catch (refreshError) {
				if (isLoggingOut) {
					return Promise.reject(refreshError);
				}
				isLoggingOut = true;

				const currentPath = await storage.getItem('current-path');
				console.table({
					currentPath,
				});

				const justPropagateError = TokenErrorExceptPaths.some((path) =>
					currentPath?.includes(path),
				);
				if (justPropagateError) {
					isLoggingOut = false;
					return Promise.reject(refreshError);
				}

				storage.removeItem('access-token');
				storage.removeItem('refresh-token');
				// 로그아웃 이벤트 발생
				eventBus.emit('auth:logout');

				const isAuthPage = AUTH_PATHS.some((path) => currentPath?.includes(path));
				if (!isAuthPage) {
					eventBus.emit('auth:loginRequired');
				}
				return Promise.reject(refreshError);
			}
		}

		const payload = {
			...error.response?.data,
			status: error.response?.status,
		};

		return Promise.reject(payload);
	},
);

export const resetAuthState = () => {
	isLoggingOut = false;
};

export default axiosClient;
