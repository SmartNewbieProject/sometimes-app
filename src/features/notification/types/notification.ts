export interface Notification {
  id: string;
  userId: string;
  type: 'reward' | 'general' | 'contact';
  subType: NotificationSubType;
  title: string;
  content: string;
  isRead: boolean;
  deepLink?: string;
  redirectUrl?: string;
  data?: Record<string, any>;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
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