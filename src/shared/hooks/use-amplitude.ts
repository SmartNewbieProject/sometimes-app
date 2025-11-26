import { useCallback } from 'react';
import { track as amplitudeTrack, identify, setUserId } from '@amplitude/analytics-react-native';
import { AMPLITUDE_EVENTS } from '@/src/shared/constants/amplitude-events';
import type {
  UseAmplitudeReturn,
  AmplitudeTrackOptions,
  EventTypePropertiesMap,
} from './use-amplitude.types';

export const useAmplitude = (): UseAmplitudeReturn => {
  // 자동으로 공통 환경 변수 추가하는 track 함수
  const trackEvent = useCallback(
    <T extends keyof typeof AMPLITUDE_EVENTS>(
      eventName: T,
      properties: EventTypePropertiesMap[T] = {},
      options: AmplitudeTrackOptions = {}
    ) => {
      try {
        // 공통 환경 변수 자동 추가
        const eventProperties = {
          ...properties,
          env: process.env.EXPO_PUBLIC_TRACKING_MODE || 'development',
        };

        // 이벤트 유효성 검사 (옵션)
        if (options.validate && !AMPLITUDE_EVENTS[eventName]) {
          console.warn(`[Amplitude] Unknown event: ${eventName}`);
          return;
        }

        // Amplitude 이벤트 전송
        amplitudeTrack(AMPLITUDE_EVENTS[eventName], eventProperties);

        // 개발 환경에서 로그 출력
        if (process.env.EXPO_PUBLIC_TRACKING_MODE === 'development') {
          console.log(`[Amplitude] Event tracked:`, {
            event: AMPLITUDE_EVENTS[eventName],
            properties: eventProperties,
          });
        }
      } catch (error) {
        console.error('[Amplitude] Error tracking event:', error);
      }
    },
    []
  );

  // 사용자 속성 설정
  const setUserProperties = useCallback((properties: Record<string, any>) => {
    try {
      // Amplitude 사용자 속성 설정
      identify(properties);

      // 개발 환경에서 로그 출력
      if (process.env.EXPO_PUBLIC_TRACKING_MODE === 'development') {
        console.log(`[Amplitude] User properties set:`, properties);
      }
    } catch (error) {
      console.error('[Amplitude] Error setting user properties:', error);
    }
  }, []);

  // 사용자 식별
  const identifyUser = useCallback((userId: string) => {
    try {
      setUserId(userId);

      // 개발 환경에서 로그 출력
      if (process.env.EXPO_PUBLIC_TRACKING_MODE === 'development') {
        console.log(`[Amplitude] User identified:`, userId);
      }
    } catch (error) {
      console.error('[Amplitude] Error identifying user:', error);
    }
  }, []);

  return {
    trackEvent,
    setUserProperties,
    identifyUser,
  };
};

// 편의성을 위한 특정 카테고리별 이벤트 훅들
export const useSignupEvents = () => {
  const { trackEvent } = useAmplitude();

  return {
    trackSignupInit: (platform: 'pass' | 'kakao' | 'apple') =>
      trackEvent('Signup_Init', { platform }),
    trackSignupError: (error: string) =>
      trackEvent('Signup_Error', { error }),
    trackSignupComplete: () =>
      trackEvent('signup_complete'),
    trackSignupAgeCheckFailed: (birthday: string) =>
      trackEvent('Signup_AgeCheck_Failed', { birthday }),
    trackSignupPhoneBlacklistFailed: (phone: string) =>
      trackEvent('Signup_PhoneBlacklist_Failed', { phone }),
  };
};

export const usePaymentEvents = () => {
  const { trackEvent } = useAmplitude();

  return {
    trackFirstSale7: (who?: string) =>
      trackEvent('GemStore_FirstSale_7', { who }),
    trackFirstSale16: (who?: string) =>
      trackEvent('GemStore_FirstSale_16', { who }),
    trackFirstSale27: (who?: string) =>
      trackEvent('GemStore_FirstSale_27', { who }),
    trackPaymentSuccess: (result: any) =>
      trackEvent('GemStore_Payment_Success', { result }),
  };
};

export const useUserBehaviorEvents = () => {
  const { trackEvent } = useAmplitude();

  return {
    trackInterestHold: () =>
      trackEvent('Interest_Hold'),
    trackInterestStarted: (type: 'modal' = 'modal') =>
      trackEvent('Interest_Started', { type }),
    trackProfileStarted: () =>
      trackEvent('Profile_Started'),
  };
};