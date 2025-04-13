import axios from 'axios';
import { storage } from './store';
import { TokenResponse } from '@/src/types/auth';
import { tryCatch } from './try-catch';
import { router } from 'expo-router';

const refresh = async () => {
  const refreshToken = await storage.getItem('refresh-token');
  const { accessToken, refreshToken: newRefreshToken } = await axiosClient.post('/auth/refresh', { refreshToken }) as TokenResponse;
  await storage.setItem('access-token', accessToken);
  await storage.setItem('refresh-token', newRefreshToken);
  return accessToken;
};

const axiosClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
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
    config.headers.Authorization = `Bearer ${accessToken}`;
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
      const accessToken = await storage.getItem('access-token');
      if (accessToken) {
        const newAcessToken = await refresh();
        error.config.headers.Authorization = `Bearer ${newAcessToken}`;

        return await tryCatch(async () => {
          const result = await temporaryAxiosClient(error.config);
          return result.data;
        }, (error) => {
          storage.removeItem('access-token');
          storage.removeItem('refresh-token');
          console.error(error);
          router.push('/auth/login');
        });
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
