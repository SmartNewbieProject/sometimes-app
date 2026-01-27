export enum ChatEventType {
	MESSAGE_SENT = 'chat.message.sent',
	ROOM_CREATED = 'chat.room.created',
	ROOM_LEFT = 'chat.room.left',
	USER_TYPING = 'chat.user.typing',
	USER_STOPPED_TYPING = 'chat.user.stopped_typing',
	IMAGE_UPLOADED = 'chat.image.uploaded',
	USER_ONLINE = 'chat.user.online',
	USER_OFFLINE = 'chat.user.offline',
	MESSAGES_READ = 'chat.messages.read',
}

export interface BaseChatEvent {
	type: ChatEventType;
	timestamp: Date;
	serverId?: string;
}

export interface MessageSentEvent extends BaseChatEvent {
	type: ChatEventType.MESSAGE_SENT;
	payload: {
		messageId: string;
		chatRoomId: string;
		senderId: string;
		receiverId: string;
		content: string;
		messageType: 'text' | 'image' | 'emoji';
		mediaUrl?: string;
	};
}

export interface RoomCreatedEvent extends BaseChatEvent {
	type: ChatEventType.ROOM_CREATED;
	payload: {
		chatRoomId: string;
		maleId: string;
		femaleId: string;
		matchId: string;
	};
}

export interface RoomLeftEvent extends BaseChatEvent {
	type: ChatEventType.ROOM_LEFT;
	payload: {
		chatRoomId: string;
		userId: string;
	};
}

export interface UserTypingEvent extends BaseChatEvent {
	type: ChatEventType.USER_TYPING | ChatEventType.USER_STOPPED_TYPING;
	payload: {
		chatRoomId: string;
		senderId: string;
		receiverId: string;
	};
}

export interface ImageUploadedEvent extends BaseChatEvent {
	type: ChatEventType.IMAGE_UPLOADED;
	payload: {
		messageId: string;
		chatRoomId: string;
		senderId: string;
		receiverId: string;
		imageUrl: string;
	};
}

export interface UserStatusEvent extends BaseChatEvent {
	type: ChatEventType.USER_ONLINE | ChatEventType.USER_OFFLINE;
	payload: {
		userId: string;
		serverId: string;
	};
}

export interface MessagesReadEvent extends BaseChatEvent {
	type: ChatEventType.MESSAGES_READ;
	payload: {
		chatRoomId: string;
		readerId: string;
	};
}

export type ChatEvent =
	| MessageSentEvent
	| RoomCreatedEvent
	| RoomLeftEvent
	| UserTypingEvent
	| ImageUploadedEvent
	| UserStatusEvent
	| MessagesReadEvent;
