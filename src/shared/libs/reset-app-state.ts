import { queryClient } from '@/src/shared/config/query';
import { useChatStore } from '@/src/features/chat/store/chat';
import { useNotificationStore } from '@/src/features/notification/store/notification-store';

export const resetAppState = () => {
  queryClient.clear();

  useChatStore.getState().disconnectSocket();

  useNotificationStore.getState().reset();
};
