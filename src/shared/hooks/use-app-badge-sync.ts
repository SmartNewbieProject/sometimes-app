import { useEffect } from 'react';
import { useTotalUnreadCount } from '@/src/features/chat/queries/use-total-unread-count';
import { appBadgeManager } from '@/src/shared/libs/app-badge-manager';

export const useAppBadgeSync = () => {
  const chatUnreadCount = useTotalUnreadCount();

  useEffect(() => {
    appBadgeManager.setChatUnreadCount(chatUnreadCount);
  }, [chatUnreadCount]);
};
