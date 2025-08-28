import { axiosClient } from '@/src/shared/libs';
import type { Chat, ChatResponse, ChatRoomDetail, ChatRoomListResponse } from '../types/chat';

export const getChatRooms = ({
	pageParam,
}: {
	pageParam?: string;
}): Promise<ChatRoomListResponse> => {
	return axiosClient.get(`/chat/rooms/cursor${pageParam ? `?cursor=${pageParam}` : ''}`);
};

export const createChatRoom = ({
	matchId,
}: {
	matchId: string;
}): Promise<{ chatRoomId: string }> => {
	return axiosClient.post('/chat/rooms', { matchId });
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
