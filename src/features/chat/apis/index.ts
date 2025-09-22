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
