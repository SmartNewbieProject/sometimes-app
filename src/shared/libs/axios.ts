import axios from 'axios';
import {storage} from './store';
import type {TokenResponse} from '@/src/types/auth';
import {tryCatch} from './try-catch';
import {router} from 'expo-router';
import {eventBus} from './event-bus';
import {env} from './env';

let refreshTokenPromise: Promise<string> | null = null;
let isNetworkDisabled = false;
const detach = (token: string) => token.replaceAll('\"', '');
const TokenErrorExceptPaths = [
  '/community',
];

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

      const {accessToken, refreshToken: newRefreshToken} = await temporaryAxiosClient
          .post<TokenResponse>('/auth/refresh', {refreshToken: detach(refreshToken)})
          .then(response => response.data);

      await storage.setItem('access-token', accessToken);
      await storage.setItem('refresh-token', newRefreshToken);

      // 토큰 갱신 이벤트 발생
      eventBus.emit('auth:tokensUpdated', {accessToken, refreshToken: newRefreshToken});

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
    'Content-Type': 'application/json'
  },
});

const temporaryAxiosClient = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
axiosClient.interceptors.request.use(
    async (config) => {
      if (isNetworkDisabled) {
        return Promise.reject(new Error('Network requests are disabled due to REGION_NOT_ALLOWED'));
      }

      // 디버깅: 요청 정보 로깅
      console.log(`[API 요청] ${config.method?.toUpperCase()} ${config.url}`);
      if (config.data) {
        console.log('[API 요청 데이터]', typeof config.data === 'string' ? config.data : JSON.stringify(config.data, null, 2));
      }

      // 로그인 요청에는 Authorization 헤더를 추가하지 않음
      if (config.url === '/auth/login') {
        return config;
      }
      const accessToken = await storage.getItem('access-token');
      config.headers.Authorization = `Bearer ${accessToken?.replaceAll('\"', '')}`;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

// 응답 인터셉터
axiosClient.interceptors.response.use(
    (response) => {
      // { success: boolean, data: T } 형태의 응답 처리
      if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
        return response.data.data; // data 필드만 반환
      }
      return response.data;
    },
    async (error) => {
      // 디버깅: 에러 응답 로깅
      console.error(`[API 에러] ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.error(`[API 에러] 상태 코드: ${error.response?.status}`);
      console.error(`[API 에러] 응답 데이터:`, error.response?.data);


      const data = error?.response?.data;
      const status = error?.response?.status;

      if (status === 403 && data?.code === ErrorCode.REGION_NOT_ALLOWED) {
        isNetworkDisabled = true;
        router.push('/commingsoon');
        return;
      }

      if (status === 401) {
        try {
          const newAccessToken = await refresh();
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;

          return await tryCatch(async () => {
            const result = await temporaryAxiosClient(error.config);
            // { success: boolean, data: T } 형태의 응답 처리
            if (result.data && typeof result.data === 'object' && 'success' in result.data && 'data' in result.data) {
              return result.data.data;
            }
            return result.data;
          }, (error) => {
            console.log({refreshError: error})
            storage.removeItem('access-token');
            storage.removeItem('refresh-token');
            eventBus.emit('auth:logout');
            console.error(error);
            router.push('/auth/login');
          });
        } catch (refreshError) {
          const currentPath = await storage.getItem('current-path');
          console.table({
            currentPath,
          });

          const justPropagateError = TokenErrorExceptPaths.some(path => currentPath?.includes(path));
          if (justPropagateError) {
            return Promise.reject(refreshError);
          }

          storage.removeItem('access-token');
          storage.removeItem('refresh-token');
          // 로그아웃 이벤트 발생
          eventBus.emit('auth:logout');
          router.push('/auth/login');
          return Promise.reject(refreshError);
        }
      }

      const payload = {
        ...error.response?.data,
        status: error.response?.status,
      };

      return Promise.reject(payload);
    }
);

export default axiosClient; 
