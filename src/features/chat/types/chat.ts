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

interface Partner {
	profileImage: string;
	name: string;
	university: string;
	department: string;
}

export interface ChatRoom {
	id: string;
	lastMessage: string;
	lastMessageAt: string;
	unreadCount: number;
	partner: Partner;
}
