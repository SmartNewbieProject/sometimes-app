import { useEffect } from 'react';
import { Platform } from 'react-native';
import { usePathname } from 'expo-router';
import { GA_TRACKING_ID, sendEvent, sendPageView } from '@/src/shared/utils';

/**
 * 이벤트 페이지에서 사용할 애널리틱스 훅
 * 페이지 뷰 및 이벤트 액션을 추적합니다.
 * 
 * @param pageName 현재 페이지 이름 (pre-signup 등)
 * @returns 이벤트 추적 함수
 */
export const useEventAnalytics = (pageName: string) => {
  const pathname = usePathname();
  
  // 페이지 로드 시 페이지 뷰 및 이벤트 추적
  useEffect(() => {
    if (Platform.OS === 'web') {
      // 페이지 뷰 추적
      sendPageView(pathname);
      
      // 이벤트 페이지 뷰 이벤트 추적
      sendEvent('event_page_view', 'event', pageName);
    }
  }, [pathname, pageName]);
  
  /**
   * 이벤트 페이지에서 특정 액션 이벤트 추적
   * 
   * @param action 액션 이름 (예: 'button_click', 'form_submit')
   * @param label 추가 정보 (선택 사항)
   */
  const trackEventAction = (action: string, label?: string) => {
    if (Platform.OS === 'web') {
      sendEvent(action, 'event', `${pageName}${label ? `:${label}` : ''}`);
    }
  };
  
  return { trackEventAction };
};
