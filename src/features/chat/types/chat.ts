export interface Chat {
	id: string;
	chatRoomId: string;
	senderId: string;
	messageType: string;
	mediaUrl?: string;
	isRead: boolean;
	content: string;
	createdAt: string;
	isMe: boolean;
	updatedAt: string;
}
