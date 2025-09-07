import type { Chat } from './chat';
import type {
	CreateChatRoomPayload,
	GetChatHistoryPayload,
	LeaveChatRoomPayload,
	ReadMessagesPayload,
	RemoteMessagePayload,
	SendMessagePayload,
	TypingPayload,
	UploadImagePayload,
} from './socket-payload.interface';

export type ChatMessageType = 'text' | 'image' | 'emoji';

export interface ChatMessage {
	id: string;
	chatRoomId: string;
	senderId: string;
	content: string;
	messageType: ChatMessageType;
	mediaUrl?: string;
	isRead?: boolean;
	createdAt: string;
	updatedAt: string;
	isMe?: boolean;
}

export interface ChatServerToClientEvents {
	connected: (payload: { status: 'success'; userId: string }) => void;
	error: (payload: { message: string }) => void;

	newMessage: (payload: Chat) => void;

	chatRoomCreated: (payload: {
		chatRoomId: string;
		matchId: string;
		timestamp?: string;
	}) => void;

	chatHistory: (payload: { chatRoomId: string; messages: ChatMessage[] }) => void;
	chatRoomLeft: (payload: { chatRoomId: string }) => void;

	userTyping: (payload: { from: string; chatRoomId: string }) => void;
	userStoppedTyping: (payload: { from: string; chatRoomId: string }) => void;

	messagesRead: (payload: { chatRoomId: string; readerId: string }) => void;
	imageUploadStatus: (payload: {
		id: string;
		chatRoomId: string;
		uploadStatus: 'uploading' | 'completed' | 'failed';
		mediaUrl?: string;
	}) => void;
}

export interface ChatClientToServerEvents {
	sendMessage: (payload: SendMessagePayload, callback: (response: { success: boolean; serverMessage?: Chat; error?: string }) => void) => void;
	createChatRoom: (payload: CreateChatRoomPayload) => void;
	getChatHistory: (payload: GetChatHistoryPayload) => void;
	leaveChatRoom: (payload: LeaveChatRoomPayload) => void;
	typing: (payload: TypingPayload) => void;
	stopTyping: (payload: TypingPayload) => void;
	uploadImage: (payload: UploadImagePayload, callback: (response: { success: boolean; serverMessage?: Chat; error?: string }) => void) => void;
	remoteMessage: (payload: RemoteMessagePayload) => void;
	readMessages: (payload: ReadMessagesPayload) => void;
}
