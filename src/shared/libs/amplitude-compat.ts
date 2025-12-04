/**
 * Amplitude 호환 레이어
 *
 * 기존 Amplitude import를 사용하는 파일들을 위한 호환성 래퍼
 * 내부적으로 Mixpanel API를 호출합니다.
 */

import { Mixpanel } from 'mixpanel-react-native';

/**
 * Amplitude track 함수와 호환되는 Mixpanel wrapper
 * @param eventName - 이벤트 이름
 * @param properties - 이벤트 속성
 */
export const track = (
  eventName: string,
  properties?: Record<string, any>
): void => {
  try {
    // Mixpanel 이벤트 전송
    Mixpanel.track(eventName, properties || {});

    // 개발 환경에서 로그 출력
    if (process.env.EXPO_PUBLIC_TRACKING_MODE === 'development') {
      console.log(`[Amplitude Compat → Mixpanel] Event tracked:`, {
        event: eventName,
        properties,
      });
    }
  } catch (error) {
    console.error('[Amplitude Compat] Error tracking event:', error);
  }
};

/**
 * Amplitude identify 함수와 호환되는 Mixpanel wrapper
 * @param userId - 사용자 ID
 */
export const setUserId = (userId: string): void => {
  try {
    Mixpanel.identify(userId);

    if (process.env.EXPO_PUBLIC_TRACKING_MODE === 'development') {
      console.log(`[Amplitude Compat → Mixpanel] User identified:`, userId);
    }
  } catch (error) {
    console.error('[Amplitude Compat] Error identifying user:', error);
  }
};

/**
 * Amplitude identify 함수와 호환되는 Mixpanel wrapper
 * @param properties - 사용자 속성
 */
export const identify = (properties: Record<string, any>): void => {
  try {
    Mixpanel.getPeople().set(properties);

    if (process.env.EXPO_PUBLIC_TRACKING_MODE === 'development') {
      console.log(`[Amplitude Compat → Mixpanel] User properties set:`, properties);
    }
  } catch (error) {
    console.error('[Amplitude Compat] Error setting user properties:', error);
  }
};

// 기본 export
export default {
  track,
  setUserId,
  identify,
};
