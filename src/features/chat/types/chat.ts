import type { RNFileLike } from '../domain/utils/file-to-base64';

export interface Chat {
	id: string;
	chatRoomId: string;
	senderId: string;
	messageType: string;
	mediaUrl?: string;
	uploadStatus?: 'uploading' | 'completed' | 'failed';
	isRead: boolean;
	content: string;
	createdAt: string;
	isMe: boolean;
	updatedAt: string;
	tempId?: string; // 임시 ID (서버 응답 전까지 사용)
	sendingStatus?: 'sending' | 'sent' | 'failed';
	optimistic?: boolean; // 낙관적으로 추가된 메시지 여부
}

export interface ChatRoomDetail {
	partnerId: string;
	roomActivation: boolean;
	createdAt: string;
	hasLeft?: boolean;
	snooze: boolean;
	partner: Partner;
}

export interface UploadImageOptions {
	to: string;
	chatRoomId: string;
	senderId: string;
	file: RNFileLike | { uri: string };
}

export interface Partner {
	mainProfileImageUrl: string;
	name: string;
	id: string;
	age: number;
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
	paymentConfirm: boolean;
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
