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

export interface ChatRoomDetail {
	partnerId: string;
	roomActivation: boolean;
	createdAt: string;
	partner: Partner;
}

interface Partner {
	mainProfileImageUrl: string;
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

export interface ChatResponse {
	messages: Chat[];
	hasMore: boolean;
	nextCursor: string | null;
}
