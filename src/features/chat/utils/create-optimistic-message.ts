import type { Chat } from '../types/chat';

export const createOptimisticMessage = (
	chatRoomId: string,
	content: string,
	senderId?: string,
): Chat => {
	return {
		id: `temp-${Date.now()}`,
		chatRoomId,
		senderId: senderId ?? 'me',
		messageType: 'text',
		isRead: false,
		content,
		createdAt: new Date().toISOString(),
		isMe: true,
		updatedAt: new Date().toISOString(),
	};
};
