import { queryClient } from '@/src/shared/config/query';
import { useChatStore } from '@/src/features/chat/store/chat';
import { useNotificationStore } from '@/src/features/notification/store/notification-store';
import { mixpanelAdapter } from './mixpanel';
import { getCountryFromLocale } from './country-detector';

export const resetAppState = () => {
  queryClient.clear();

  useChatStore.getState().disconnectSocket();

  useNotificationStore.getState().reset();

  // Mixpanel 사용자 식별 초기화 (로그아웃)
  mixpanelAdapter.reset();

  // reset() 후 Super Properties가 사라지므로 country 재등록
  const country = getCountryFromLocale();
  mixpanelAdapter.registerSuperProperties({ country });
  console.log('[Mixpanel] Reset and re-registered country:', country);
};
