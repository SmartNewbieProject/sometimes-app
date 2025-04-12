import axios from 'axios';

const axiosServer = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
axiosServer.interceptors.request.use(
  (config) => {
    // 여기에 토큰이나 다른 인증 정보를 추가할 수 있습니다
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosServer.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 에러 처리 로직을 여기에 추가할 수 있습니다
    return Promise.reject(error);
  }
);

export default axiosServer; 