import { create } from 'zustand';
import { appBadgeManager } from '@/src/shared/libs/app-badge-manager';
import { Notification } from '../types/notification';

interface NotificationStore {
  unreadCount: number;
  lastNotification: Notification | null;
  setUnreadCount: (count: number) => void;
  setLastNotification: (notification: Notification | null) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  lastNotification: null,

  setUnreadCount: (count: number) => {
    const newCount = Math.max(0, count);
    appBadgeManager.setNotificationCount(newCount);
    set({ unreadCount: newCount });
  },

  setLastNotification: (notification: Notification | null) =>
    set({
      lastNotification: notification,
    }),

  incrementUnreadCount: () =>
    set((state) => {
      const newCount = state.unreadCount + 1;
      appBadgeManager.setNotificationCount(newCount);
      return { unreadCount: newCount };
    }),

  decrementUnreadCount: () =>
    set((state) => {
      const newCount = Math.max(0, state.unreadCount - 1);
      appBadgeManager.setNotificationCount(newCount);
      return { unreadCount: newCount };
    }),

  reset: () => {
    appBadgeManager.setNotificationCount(0);
    set({
      unreadCount: 0,
      lastNotification: null,
    });
  },
}));