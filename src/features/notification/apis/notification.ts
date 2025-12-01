import { axiosClient } from '@/src/shared/libs';

export interface Notification {
  id: string;
  userId: string;
  type: 'reward' | 'general';
  subType: NotificationSubType;
  title: string;
  content: string;
  isRead: boolean;
  deepLink?: string;
  data?: object;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationSubType =
  | 'profile_view'
  | 'match_success'
  | 'new_profile'
  | 'chat_message'
  | 'chat_room_created'
  | 'system'
  | 'community_comment'
  | 'community_like'
  | 'match_like'
  | 'match_connection'
  | 'user_approval'
  | 'user_rejection'
  | 'profile_image_approved'
  | 'profile_image_rejected'
  | 'roulette_reminder';

export interface NotificationListResponse {
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface UnreadCountResponse {
  data: {
    unreadCount: number;
  };
}

export interface ReadCountResponse {
  data: {
    readCount: number;
  };
}

export interface MarkAsReadBatchDto {
  notificationIds: string[];
}

export interface DeleteNotificationsBatchDto {
  notificationIds: string[];
}

export const getNotifications = async (params?: {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: 'general' | 'reward';
}): Promise<NotificationListResponse> => {
  return axiosClient.get('/notifications', { params });
};

export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  return axiosClient.get('/notifications/unread-count');
};

export const getReadCount = async (): Promise<ReadCountResponse> => {
  return axiosClient.get('/notifications/read-count');
};

export const markAsRead = async (id: string): Promise<{ message: string }> => {
  return axiosClient.patch(`/notifications/${id}/read`);
};

export const markAllAsRead = async (): Promise<{ message: string; data?: { count: number } }> => {
  return axiosClient.patch('/notifications/read-all');
};

export const markAsReadBatch = async (data: MarkAsReadBatchDto): Promise<{ message: string }> => {
  return axiosClient.patch('/notifications/batch/read', data);
};

export const deleteNotification = async (id: string): Promise<{ message: string }> => {
  return axiosClient.delete(`/notifications/${id}`);
};

export const deleteAllRead = async (): Promise<{ message: string }> => {
  return axiosClient.post('/notifications/readed');
};

export const deleteNotificationsBatch = async (data: DeleteNotificationsBatchDto): Promise<{ message: string }> => {
  return axiosClient.delete('/notifications/batch', { data });
};