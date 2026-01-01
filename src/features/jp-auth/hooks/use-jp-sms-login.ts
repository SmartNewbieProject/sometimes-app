/**
 * JP SMS 인증 훅
 *
 * 단계:
 * 1. phone_input - 전화번호 입력
 * 2. code_verification - SMS 인증코드 입력
 *
 * 성공 시:
 * - 기존 회원: 토큰 저장 → 홈으로 이동
 * - 신규 회원: AsyncStorage에 정보 저장 → JP 프로필 입력으로 이동
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { useModal } from '@/src/shared/hooks/use-modal';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { checkPhoneNumberBlacklist } from '@/src/features/signup/apis';
import { sendJpSms, verifyJpSms, jpLogin } from '../apis';
import { formatJpPhoneForApi } from '../utils/phone-format';
import type { JpAuthStep, JpLoginResponse, JpCertificationInfo } from '../types';

const TIMER_SECONDS = 180; // 3분

// 테스트용 기본 전화번호 (개발 환경에서만 사용)
const TEST_DEFAULT_PHONE = __DEV__ ? '010-2655-4276' : '';

interface UseJpSmsLoginOptions {
  onError?: (error: Error) => void;
  onSuccess?: (isNewUser: boolean) => void;
}

interface UseJpSmsLoginReturn {
  step: JpAuthStep;
  isLoading: boolean;
  error: string | null;
  phoneNumber: string;
  verificationCode: string;
  remainingSeconds: number;
  setPhoneNumber: (value: string) => void;
  setVerificationCode: (value: string) => void;
  sendSmsCode: () => Promise<void>;
  verifySmsCode: () => Promise<void>;
  resendCode: () => Promise<void>;
  goBack: () => void;
  clearError: () => void;
  reset: () => void;
}

export const useJpSmsLogin = ({
  onError,
  onSuccess,
}: UseJpSmsLoginOptions = {}): UseJpSmsLoginReturn => {
  const [step, setStep] = useState<JpAuthStep>('phone_input');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState(TEST_DEFAULT_PHONE);
  const [verificationCode, setVerificationCode] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(TIMER_SECONDS);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { updateToken } = useAuth();
  const { showModal } = useModal();

  const clearError = useCallback(() => setError(null), []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setRemainingSeconds(TIMER_SECONDS);

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          stopTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopTimer]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const reset = useCallback(() => {
    setStep('phone_input');
    setPhoneNumber('');
    setVerificationCode('');
    setError(null);
    setIsLoading(false);
    stopTimer();
    setRemainingSeconds(TIMER_SECONDS);
  }, [stopTimer]);

  const sendSmsCode = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const formattedPhone = formatJpPhoneForApi(phoneNumber);

      mixpanelAdapter.track('Signup_JP_SMS_Send_Started', {
        env: process.env.EXPO_PUBLIC_TRACKING_MODE,
      });

      await sendJpSms({ phoneNumber: formattedPhone });

      mixpanelAdapter.track('Signup_JP_SMS_Send_Completed', {
        env: process.env.EXPO_PUBLIC_TRACKING_MODE,
      });

      setStep('code_verification');
      startTimer();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'SMS送信に失敗しました';
      setError(errorMessage);
      onError?.(new Error(errorMessage));

      mixpanelAdapter.track('Signup_JP_SMS_Send_Failed', {
        error: errorMessage,
        env: process.env.EXPO_PUBLIC_TRACKING_MODE,
      });
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber, startTimer, onError]);

  const processLoginResult = useCallback(
    async (loginResult: JpLoginResponse) => {
      console.log('[JP SMS] processLoginResult 시작, isNewUser:', loginResult.isNewUser);
      const formattedPhone = formatJpPhoneForApi(phoneNumber);

      if (loginResult.isNewUser) {
        console.log('[JP SMS] 신규 회원 플로우 시작');
        try {
          console.log('[JP SMS] 블랙리스트 체크 시작:', formattedPhone);
          const { isBlacklisted } = await checkPhoneNumberBlacklist(formattedPhone);
          console.log('[JP SMS] 블랙리스트 체크 결과:', isBlacklisted);

          if (isBlacklisted) {
            mixpanelAdapter.track('Signup_PhoneBlacklist_Failed', {
              phone: formattedPhone,
              env: process.env.EXPO_PUBLIC_TRACKING_MODE,
            });

            showModal({
              title: '登録制限',
              children:
                '報告受付またはプロフィール情報不適合等の理由により登録が制限されました。',
              primaryButton: {
                text: '確認',
                onClick: () => router.replace('/'),
              },
            });
            return;
          }
        } catch (err) {
          console.error('[JP SMS] ❌ 블랙리스트 체크 오류:', err);
        }

        // 신규 회원: 토큰이 있으면 저장 (회원가입 중 API 호출용 임시 토큰)
        if (loginResult.accessToken && loginResult.refreshToken) {
          console.log('[JP SMS] 임시 토큰 저장 시작');
          await updateToken(loginResult.accessToken, loginResult.refreshToken);
          console.log('[JP SMS] 임시 토큰 저장 완료');
        } else {
          console.log('[JP SMS] 토큰 없음 (신규 회원은 회원가입 완료 후 토큰 발급)');
        }

        const certInfo: JpCertificationInfo = {
          phone: formattedPhone,
          loginType: 'jp_sms',
          country: 'JP',
        };

        console.log('[JP SMS] AsyncStorage에 certification info 저장');
        await AsyncStorage.setItem('signup_certification_info', JSON.stringify(certInfo));

        mixpanelAdapter.track('Signup_Route_Entered', {
          screen: 'JpProfile',
          platform: 'jp_sms',
          env: process.env.EXPO_PUBLIC_TRACKING_MODE,
        });

        console.log('[JP SMS] jp-profile 페이지로 이동');
        router.push('/auth/signup/jp-profile');
        onSuccess?.(true);
      } else {
        console.log('[JP SMS] 기존 회원 플로우 시작');
        await updateToken(loginResult.accessToken, loginResult.refreshToken);

        mixpanelAdapter.track('Login_Completed', {
          platform: 'jp_sms',
          env: process.env.EXPO_PUBLIC_TRACKING_MODE,
        });

        console.log('[JP SMS] 홈으로 이동');
        router.replace('/home');
        onSuccess?.(false);
      }
    },
    [phoneNumber, showModal, updateToken, onSuccess]
  );

  const verifySmsCode = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const formattedPhone = formatJpPhoneForApi(phoneNumber);

      console.log('[JP SMS] 1. Verify 시작:', formattedPhone);
      mixpanelAdapter.track('Signup_JP_SMS_Verify_Started', {
        env: process.env.EXPO_PUBLIC_TRACKING_MODE,
      });

      await verifyJpSms({
        phoneNumber: formattedPhone,
        code: verificationCode,
      });
      console.log('[JP SMS] 2. Verify 성공');

      mixpanelAdapter.track('Signup_JP_SMS_Verify_Completed', {
        env: process.env.EXPO_PUBLIC_TRACKING_MODE,
      });

      console.log('[JP SMS] 3. Login API 호출 시작');
      let loginResult: JpLoginResponse;

      try {
        loginResult = await jpLogin({ phoneNumber: formattedPhone });
        console.log('[JP SMS] 4. Login API 응답 (기존 회원):', loginResult);
      } catch (err: any) {
        // 401 오류 = 신규 회원 (DB에 계정 없음)
        if (err?.status === 401) {
          console.log('[JP SMS] 4. 401 응답 → 신규 회원으로 처리');
          loginResult = {
            accessToken: '',
            refreshToken: '',
            tokenType: 'Bearer',
            expiresIn: 0,
            roles: [],
            isNewUser: true,
          };
        } else {
          // 다른 오류는 그대로 throw
          throw err;
        }
      }

      console.log('[JP SMS] 5. processLoginResult 시작');
      await processLoginResult(loginResult);
      console.log('[JP SMS] 6. processLoginResult 완료');

      stopTimer();
    } catch (err) {
      console.error('[JP SMS] ❌ 에러 발생:', err);
      console.error('[JP SMS] ❌ 에러 상세:', {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });

      const errorMessage =
        err instanceof Error ? err.message : '認証コードが正しくありません';
      setError(errorMessage);
      onError?.(new Error(errorMessage));

      mixpanelAdapter.track('Signup_JP_SMS_Verify_Failed', {
        error: errorMessage,
        env: process.env.EXPO_PUBLIC_TRACKING_MODE,
      });
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber, verificationCode, processLoginResult, stopTimer, onError]);

  const resendCode = useCallback(async () => {
    setVerificationCode('');
    await sendSmsCode();
  }, [sendSmsCode]);

  const goBack = useCallback(() => {
    if (step === 'code_verification') {
      setStep('phone_input');
      setVerificationCode('');
      setError(null);
      stopTimer();
    }
  }, [step, stopTimer]);

  return {
    step,
    isLoading,
    error,
    phoneNumber,
    verificationCode,
    remainingSeconds,
    setPhoneNumber,
    setVerificationCode,
    sendSmsCode,
    verifySmsCode,
    resendCode,
    goBack,
    clearError,
    reset,
  };
};
