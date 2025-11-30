import axios from 'axios';
import {storage} from './store';
import type {TokenResponse} from '@/src/types/auth';
import {tryCatch} from './try-catch';
import {router} from 'expo-router';
import {eventBus} from './event-bus';

let refreshTokenPromise: Promise<string> | null = null;
let isNetworkDisabled = false;
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
          .post<TokenResponse>('/auth/refresh', {refreshToken})
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

const axiosClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
});

const temporaryAxiosClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
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
      // 로그인 요청에는 Authorization 헤더를 추가하지 않음
      if (config.url === '/auth/login') {
        return config;
      }
      const accessToken = await storage.getItem('access-token');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

// 응답 인터셉터
axiosClient.interceptors.response.use(
    (response) => {
      return response.data;
    },
    async (error) => {
      const data = error?.response?.data;
      if (error.status === 403 && data.code === ErrorCode.REGION_NOT_ALLOWED) {
        isNetworkDisabled = true;
        router.push('/commingsoon');
        return;
      }

      if (error.status === 401) {
        try {
          const newAccessToken = await refresh();
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;

          return await tryCatch(async () => {
            const result = await temporaryAxiosClient(error.config);
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
