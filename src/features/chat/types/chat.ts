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

export interface ChatRoomList {
	id: string;
	unreadCount: number;
	matchId: string;
	matchStatus: 'OPEN' | 'CLOSED' | 'PENDING';
	nickName: string;
	recentMessage: string;
	profileImages: string;
	recentDate: string;
}

export interface ChatRoomListResponse {
	chatRooms: ChatRoomList[];
	nextCursor: string | null;
	hasMore: boolean;
}
