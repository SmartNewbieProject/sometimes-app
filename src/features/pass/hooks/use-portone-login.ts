import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/src/features/auth';
import { PortOneAuthService } from '../services/portone-auth.service';
import { PortOneLoginService } from '../services/portone-login.service';

interface UsePortOneLoginOptions {
  onError?: (error: Error) => void;
  onSuccess?: (isNewUser: boolean) => void;
}

interface UsePortOneLoginReturn {
  isLoading: boolean;
  error: string | null;
  startPortOneLogin: () => Promise<void>;
  clearError: () => void;
}

/**
 * PortOne 본인인증을 통한 로그인 플로우를 관리하는 커스텀 훅
 */
export const usePortOneLogin = ({
  onError,
  onSuccess,
}: UsePortOneLoginOptions = {}): UsePortOneLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { loginWithPass } = useAuth();
  const authService = new PortOneAuthService(); // config 없이 생성
  const loginService = new PortOneLoginService();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const startPortOneLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 환경변수 검증
      console.log('=== 환경변수 검증 ===');
      console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
      console.log('EXPO_PUBLIC_STORE_ID:', process.env.EXPO_PUBLIC_STORE_ID);
      console.log('EXPO_PUBLIC_PASS_CHANNEL_KEY:', process.env.EXPO_PUBLIC_PASS_CHANNEL_KEY);
      
      if (!process.env.EXPO_PUBLIC_API_URL) {
        throw new Error('EXPO_PUBLIC_API_URL 환경변수가 설정되지 않았습니다. 서버 연결을 확인해주세요.');
      }

      const authResponse = await authService.requestIdentityVerification();
      
      if (!authResponse.identityVerificationId) {
        throw new Error('본인인증 ID를 받지 못했습니다.');
      }

      const loginResult = await loginWithPass(authResponse.identityVerificationId);

      if (loginResult.isNewUser) {
        router.push({
          pathname: '/auth/signup/terms',
          params: {
            certificationInfo: JSON.stringify(loginResult.certificationInfo),
          },
        });
        onSuccess?.(true);
      } else {
        router.replace('/home');
        onSuccess?.(false);
      }
    } catch (err) {
      let errorMessage = 'PortOne 로그인 중 오류가 발생했습니다.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        console.error('에러 객체의 keys:', Object.keys(err));
        console.error('에러 객체 전체:', JSON.stringify(err));
        
        if ('message' in err && typeof err.message === 'string') {
          errorMessage = err.message;
        } else if ('status' in err) {
          errorMessage = `서버 오류 (HTTP Status: ${err.status})`;
          if ('data' in err && err.data) {
            errorMessage += ` - ${JSON.stringify(err.data)}`;
          }
        } else {
          errorMessage = `예상치 못한 에러: ${JSON.stringify(err)}`;
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      console.error('최종 에러 메시지:', errorMessage);
      setError(errorMessage);
      onError?.(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [authService, loginService, loginWithPass, onError, onSuccess]);

  return {
    isLoading,
    error,
    startPortOneLogin,
    clearError,
  };
};
