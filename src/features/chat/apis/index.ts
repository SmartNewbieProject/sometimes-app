import { axiosClient } from '@/src/shared/libs';
import type { Chat, ChatResponse, ChatRoomDetail, ChatRoomListResponse } from '../types/chat';
import type {
	ChatRoomActivityStatus,
	ChatRoomActivitySummaryResponse,
	MarkActivityTrackedRequest,
	MarkActivityTrackedResponse,
} from '../types/chat-activity';

export const getChatRooms = ({
	pageParam,
}: {
	pageParam?: string;
}): Promise<ChatRoomListResponse> => {
	return axiosClient.get(`/chat/rooms/cursor${pageParam ? `?cursor=${pageParam}` : ''}`);
};

export const createChatRoom = ({
	matchId,
	matchLikeId,
}: {
	matchId: string;
	matchLikeId?: string;
}): Promise<{ chatRoomId: string }> => {
	return axiosClient.post('/chat/rooms', { matchId, matchLikeId });
};

export const getChatList = ({
	pageParam,
	chatRoomId,
}: {
	pageParam?: string;
	chatRoomId: string;
}): Promise<ChatResponse> => {
	return axiosClient.get(
		`/chat/rooms/${chatRoomId}/messages/cursor${pageParam ? `?cursor=${pageParam}` : ''}`,
	);
};

export const getChatRoomDetail = (chatRoomId: string): Promise<ChatRoomDetail> => {
	return axiosClient.get(`/chat/rooms/${chatRoomId}/details`);
};

export const leaveChatRoom = ({
	chatRoomId,
}: {
	chatRoomId: string;
}): Promise<{ message: string }> => {
	return axiosClient.delete(`/chat/rooms/${chatRoomId}/leave`);
};

export const enterChatRoom = ({
	chatRoomId,
}: {
	chatRoomId: string;
}): Promise<{ paymentConfirm: boolean }> => {
	return axiosClient.post(`/chat/rooms/${chatRoomId}/enter`, {});
};

export const snoozeChatRoom = ({
	snooze,
	chatRoomId,
}: {
	snooze: boolean;
	chatRoomId: string;
}): Promise<{ message: string }> => {
	return axiosClient.patch(`/chat/rooms/${chatRoomId}/snooze`, {
		snooze,
	});
};

export const getChatRoomActivityStatus = (
	chatRoomId: string,
): Promise<ChatRoomActivityStatus> => {
	return axiosClient.get(`/chat/rooms/${chatRoomId}/activity-status`);
};

export const markChatRoomActivityTracked = (
	chatRoomId: string,
	body: MarkActivityTrackedRequest,
): Promise<MarkActivityTrackedResponse> => {
	return axiosClient.post(`/v1/chat/rooms/${chatRoomId}/activity-tracked`, body);
};

export const getChatRoomActivitySummary = (
	needsTracking?: boolean,
): Promise<ChatRoomActivitySummaryResponse> => {
	const params = needsTracking !== undefined ? { needsTracking } : {};
	return axiosClient.get('/v1/chat/rooms/activity-summary', { params });
};

export interface ChatTip {
	question: string;
}

export interface ChatTipsResponse {
	tips: ChatTip[];
}

export const getChatTips = (chatRoomId: string): Promise<ChatTipsResponse> => {
	return axiosClient.get(`/chat/rooms/${chatRoomId}/tips`);
};
