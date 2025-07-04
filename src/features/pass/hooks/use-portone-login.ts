import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/src/features/auth';
import { PortOneAuthService } from '../services/portone-auth.service';
import { isAdult } from '../utils';
import type { PortOneIdentityVerificationRequest, PortOneIdentityVerificationResponse } from '../types';


interface UsePortOneLoginOptions {
  onError?: (error: Error) => void;
  onSuccess?: (isNewUser: boolean) => void;
}

interface UsePortOneLoginReturn {
  isLoading: boolean;
  error: string | null;
  startPortOneLogin: () => Promise<void>;
  clearError: () => void;
  showMobileAuth: boolean;
  mobileAuthRequest: PortOneIdentityVerificationRequest | null;
  handleMobileAuthComplete: (response: PortOneIdentityVerificationResponse) => void;
  handleMobileAuthError: (error: Error) => void;
}

// 환경변수 검증을 모듈 레벨에서 수행
const validateEnvironmentVariables = () => {
  const requiredEnvVars = {
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    EXPO_PUBLIC_STORE_ID: process.env.EXPO_PUBLIC_STORE_ID,
    EXPO_PUBLIC_PASS_CHANNEL_KEY: process.env.EXPO_PUBLIC_PASS_CHANNEL_KEY,
  };

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      throw new Error(`${key} 환경변수가 설정되지 않았습니다.`);
    }
  }
};

/**
 * PortOne 본인인증을 통한 로그인 플로우를 관리하는 커스텀 훅
 */
export const usePortOneLogin = ({
  onError,
  onSuccess,
}: UsePortOneLoginOptions = {}): UsePortOneLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMobileAuth, setShowMobileAuth] = useState(false);
  const [mobileAuthRequest, setMobileAuthRequest] = useState<PortOneIdentityVerificationRequest | null>(null);

  const { loginWithPass } = useAuth();
  const authService = new PortOneAuthService();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 공통 로그인 처리 함수
  const processLoginResult = useCallback(async (identityVerificationId: string) => {
    const loginResult = await loginWithPass(identityVerificationId);

    if (loginResult.isNewUser) {
      if (loginResult.certificationInfo?.birthday) {
        const { birthday } = loginResult.certificationInfo;

        if (!isAdult(birthday)) {
          router.push({ pathname: '/auth/age-restriction' as any });
          return;
        }
      }

      router.push({
        pathname: '/auth/signup/university',
        params: {
          certificationInfo: JSON.stringify(loginResult.certificationInfo),
        },
      });
      onSuccess?.(true);
    } else {
      router.replace('/home');
      onSuccess?.(false);
    }
  }, [loginWithPass, onSuccess]);

  // 모바일 PASS 인증 완료 핸들러
  const handleMobileAuthComplete = useCallback(async (response: PortOneIdentityVerificationResponse) => {
    try {
      if (!response.identityVerificationId) {
        throw new Error('본인인증 ID를 받지 못했습니다.');
      }

      await processLoginResult(response.identityVerificationId);
      setShowMobileAuth(false);
      setMobileAuthRequest(null);
    } catch (error) {
      console.error('모바일 본인인증 완료 처리 중 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '로그인 처리 중 오류가 발생했습니다.';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [processLoginResult, onError]);

  // 모바일 PASS 인증 오류 핸들러
  const handleMobileAuthError = useCallback((error: Error) => {
    console.error('모바일 본인인증 오류:', error);
    setError(error.message);
    setShowMobileAuth(false);
    setMobileAuthRequest(null);
    setIsLoading(false);
    onError?.(error);
  }, [onError]);

  const handleWebAuth = useCallback(async () => {
    const authResponse = await authService.requestIdentityVerification();

    if (!authResponse.identityVerificationId) {
      throw new Error('본인인증 ID를 받지 못했습니다.');
    }

    await processLoginResult(authResponse.identityVerificationId);
  }, [authService, processLoginResult]);

  const handleMobileAuth = useCallback(() => {
    // 모바일에서는 컴포넌트 방식으로 PASS 인증 표시
    const request: PortOneIdentityVerificationRequest = {
      storeId: process.env.EXPO_PUBLIC_STORE_ID as string,
      channelKey: process.env.EXPO_PUBLIC_PASS_CHANNEL_KEY as string,
      identityVerificationId: `cert_${Date.now()}`,
    };

    setMobileAuthRequest(request);
    setShowMobileAuth(true);
  }, []);

  const startPortOneLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      validateEnvironmentVariables();

      if (Platform.OS === 'web') {
        await handleWebAuth();
      } else {
        handleMobileAuth();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '로그인 처리 중 오류가 발생했습니다.';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
      setIsLoading(false);
    }
  }, [handleWebAuth, handleMobileAuth, onError]);

  return {
    isLoading,
    error,
    startPortOneLogin,
    clearError,
    showMobileAuth,
    mobileAuthRequest,
    handleMobileAuthComplete,
    handleMobileAuthError,
  };
};
