import { queryClient } from '@/src/shared/config/query';
import { useChatStore } from '@/src/features/chat/store/chat';
import { useMatchingModeStore } from '@/src/features/global-matching/stores/matching-mode-store';
import { useNotificationStore } from '@/src/features/notification/store/notification-store';
import { mixpanelAdapter } from './mixpanel';
import { getCountryFromLocale } from './country-detector';
import { storage } from './store';

export const resetAppState = () => {
  // 1. 쿼리 캐시 즉시 클리어 (이전 유저 데이터 참조 방지)
  queryClient.cancelQueries();
  queryClient.clear();

  // 2. 소켓 연결 해제
  useChatStore.getState().disconnectSocket();

  // 3. 스토어 초기화
  useNotificationStore.getState().reset();
  useMatchingModeStore.setState({ mode: 'DOMESTIC', isInitialized: false });
  storage.removeItem('matching-mode');

  // 4. 로그아웃 시 누락되던 storage 키 정리
  storage.removeItem('current-path');
  storage.removeItem('previous-path');

  // 5. Mixpanel 사용자 식별 초기화 (로그아웃)
  mixpanelAdapter.reset();

  // reset() 후 Super Properties가 사라지므로 country 재등록
  const country = getCountryFromLocale();
  mixpanelAdapter.registerSuperProperties({ country });
  console.log('[Mixpanel] Reset and re-registered country:', country);
};
