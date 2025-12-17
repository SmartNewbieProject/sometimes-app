import { create } from 'zustand';
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

  setUnreadCount: (count: number) =>
    set({
      unreadCount: Math.max(0, count),
    }),

  setLastNotification: (notification: Notification | null) =>
    set({
      lastNotification: notification,
    }),

  incrementUnreadCount: () =>
    set((state) => ({
      unreadCount: state.unreadCount + 1,
    })),

  decrementUnreadCount: () =>
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  reset: () =>
    set({
      unreadCount: 0,
      lastNotification: null,
    }),
}));