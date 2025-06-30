import axios from 'axios';
import { storage } from './store';
import type { TokenResponse } from '@/src/types/auth';
import { tryCatch } from './try-catch';
import { router } from 'expo-router';
import { eventBus } from './event-bus';

let refreshTokenPromise: Promise<string> | null = null;
const detach = (token: string) => token.replaceAll('\"', '');
const TokenErrorExceptPaths = [
  '/community',
];

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
        .then(response => response.data);

      await storage.setItem('access-token', accessToken);
      await storage.setItem('refresh-token', newRefreshToken);

      // 토큰 갱신 이벤트 발생
      eventBus.emit('auth:tokensUpdated', { accessToken, refreshToken: newRefreshToken });

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
    return response.data;
  },
  async (error) => {
    if (error.status === 401) {
      try {
        const newAccessToken = await refresh();
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;

        return await tryCatch(async () => {
          const result = await temporaryAxiosClient(error.config);
          return result.data;
        }, (error) => {
          console.log({ refreshError: error })
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
