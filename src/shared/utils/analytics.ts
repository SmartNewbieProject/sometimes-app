import { Platform } from 'react-native';

/**
 * Google Analytics 추적 ID
 */
export const GA_TRACKING_ID = 'G-4MQNN7Q3J3';

/**
 * 페이지 뷰 이벤트를 Google Analytics로 전송
 */
export const sendPageView = (path: string) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: path,
    });
  }
};

/**
 * 이벤트를 Google Analytics로 전송
 */
export const sendEvent = (action: string, category: string, label?: string, value?: number) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

/**
 * 사용자 속성을 Google Analytics로 전송
 */
export const setUserProperty = (name: string, value: string) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_properties', { [name]: value });
  }
};
