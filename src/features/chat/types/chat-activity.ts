/**
 * 채팅방 24시간 활성화 추적 관련 타입 정의
 * Revenue KPI - 채팅방 지속률 측정용
 */

export type Activity24hStatus = 'inactive' | 'active' | 'mutual' | 'one_sided';

export interface ActivityStatusDetail {
  isActive: boolean;
  hasMyMessage: boolean;
  hasPartnerMessage: boolean;
  isMutualConversation: boolean;
  myMessageCount: number;
  partnerMessageCount: number;
  totalMessageCount: number;
  lastMessageAt: string | null;
  firstResponseTime: number | null;
}

export interface TrackingInfo {
  alreadyTracked: boolean;
  shouldTrack: boolean;
}

export interface ChatRoomActivityStatus {
  chatRoomId: string;
  matchId: string;
  createdAt: string;
  is24hPassed: boolean;
  activityStatus: ActivityStatusDetail;
  tracking: TrackingInfo;
}

export interface ChatRoomActivitySummaryItem {
  chatRoomId: string;
  matchId: string;
  partnerId: string;
  createdAt: string;
  is24hPassed: boolean;
  isActive: boolean;
  isMutualConversation: boolean;
  shouldTrack: boolean;
}

export interface ActivitySummary {
  totalRooms: number;
  needsTrackingCount: number;
  activeCount: number;
  mutualConversationCount: number;
}

export interface ChatRoomActivitySummaryResponse {
  rooms: ChatRoomActivitySummaryItem[];
  summary: ActivitySummary;
}

export interface MarkActivityTrackedRequest {
  trackedAt: string;
  activityStatus: Activity24hStatus;
}

export interface MarkActivityTrackedResponse {
  success: boolean;
}
