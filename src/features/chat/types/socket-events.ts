import type { Chat, ChatRoomList } from './chat';

export type ChatSocketEventName =
	| 'connected'
	| 'error'
	| 'newMessage'
	| 'chatRoomCreated'
	| 'chatRoomMetaUpdated'
	| 'chatHistory'
	| 'chatRoomLeft'
	| 'userTyping'
	| 'userStoppedTyping'
	| 'messagesRead'
	| 'messageUpdated'
	| 'imageUploadStatus';

export interface ChatSocketEventPayloads {
	connected: { status: 'success'; userId: string };
	error: { message: string };
	newMessage: Chat;
	chatRoomCreated: {
		chatRoomId: string;
		matchId: string;
		timestamp?: string;
		chatRoom?: ChatRoomList;
	};
	chatRoomMetaUpdated: {
		chatRoomId: string;
		hasLeft?: boolean;
		roomActivation?: boolean;
		canRefund?: boolean;
		paymentConfirm?: boolean;
		refundedGems?: number;
		totalGems?: number;
	};
	chatHistory: {
		chatRoomId: string;
		messages: Chat[];
	};
	chatRoomLeft: { chatRoomId: string };
	userTyping: { from: string; chatRoomId: string };
	userStoppedTyping: { from: string; chatRoomId: string };
	messagesRead: { chatRoomId: string; readerId: string };
	messageUpdated: {
		chatRoomId: string;
		id: string;
		mediaUrl: string;
		updatedAt: string;
		uploadStatus: 'uploading' | 'completed' | 'failed';
	};
	imageUploadStatus: {
		id: string;
		chatRoomId: string;
		uploadStatus: 'uploading' | 'completed' | 'failed';
		mediaUrl?: string;
	};
}

export type EventCallback<T extends ChatSocketEventName> = (
	data: ChatSocketEventPayloads[T],
) => void;
