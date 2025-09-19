import type { Chat, UploadImageOptions } from './chat';
import type { SendMessageOptions } from './socket-payload.interface';

export type ChatDomainEvent =
	// 메시지 전송 플로우
	| { type: 'MESSAGE_SEND_REQUESTED'; payload: SendMessageOptions & { tempId: string } }
	| { type: 'MESSAGE_OPTIMISTIC_ADDED'; payload: Chat }
	| {
			type: 'MESSAGE_SEND_SUCCESS';
			payload: { success: boolean; serverMessage: Chat; tempId: string };
	  }
	| { type: 'MESSAGE_SEND_FAILED'; payload: { success: boolean; error: string; tempId: string } }

	// 이미지 업로드 플로우
	| {
			type: 'IMAGE_UPLOAD_REQUESTED';

			payload: UploadImageOptions & { tempId: string };
	  }
	| { type: 'IMAGE_OPTIMISTIC_ADDED'; payload: Chat }
	| { type: 'IMAGE_UPLOAD_SUCCESS'; payload: { tempId: string; serverMessage: Chat } }
	| { type: 'IMAGE_UPLOAD_FAILED'; payload: { success: boolean; error: string; tempId: string } }
	| { type: 'IMAGE_URL_UPDATED'; payload: { messageId: string; mediaUrl: string } }

	// 실시간 메시지 수신 (소켓에서)
	| { type: 'MESSAGE_RECEIVED'; payload: Chat }
	| {
			type: 'IMAGE_UPLOAD_STATUS_CHANGED';
			payload: {
				id: string;
				chatRoomId: string;
				mediaUrl?: string;
				uploadStatus: 'uploading' | 'completed' | 'failed';
			};
	  }
	| { type: 'MESSAGE_UPDATED'; payload: { id: string; mediaUrl: string } }
	| { type: 'MESSAGES_READ_REQUESTED'; payload: { chatRoomId: string } }
	// 채팅방 관련
	| { type: 'CHAT_ROOM_JOINED'; payload: { chatRoomId: string } }
	| { type: 'CHAT_ROOM_LEFT'; payload: { chatRoomId: string } }
	| { type: 'MESSAGES_READ'; payload: { chatRoomId: string } }
	| { type: 'CHAT_ROOM_MARKED_AS_READ'; payload: { chatRoomId: string } }

	// 타이핑 상태
	| { type: 'TYPING_STARTED'; payload: { to: string; chatRoomId: string } }
	| { type: 'TYPING_STOPPED'; payload: { to: string; chatRoomId: string } }

	// 채팅방 목록 업데이트
	| { type: 'CHAT_ROOM_LIST_UPDATED'; payload: { chatRoomId: string; recentMessage?: Chat } }

	// 채팅방 입장/퇴장 요청
	| { type: 'CHAT_ROOM_JOIN_REQUESTED'; payload: { chatRoomId: string } }
	| { type: 'CHAT_ROOM_LEAVE_REQUESTED'; payload: { chatRoomId: string } }

	// 연결 상태
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	| { type: 'SOCKET_CONNECTED'; payload: {} }
	| { type: 'SOCKET_DISCONNECTED'; payload: { reason?: string } }
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	| { type: 'SOCKET_RECONNECTING'; payload: {} }
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	| { type: 'SOCKET_RECONNECTED'; payload: {} }

	// 에러 이벤트
	| { type: 'SOCKET_ERROR'; payload: { error: string } }
	| { type: 'PERMISSION_ERROR'; payload: { error: string; context: 'gallery' | 'camera' } }
	| { type: 'CONNECTION_REQUESTED'; payload: { url: string; token: string } };

// 타입 헬퍼들
export type ChatEventType = ChatDomainEvent['type'];

export type ChatEventPayload<T extends ChatEventType> = Extract<
	ChatDomainEvent,
	{ type: T }
>['payload'];

// 이벤트 그룹별 유니온 타입들
export type MessageEvents = Extract<
	ChatDomainEvent,
	| { type: 'MESSAGE_SEND_REQUESTED' }
	| { type: 'MESSAGE_OPTIMISTIC_ADDED' }
	| { type: 'MESSAGE_SEND_SUCCESS' }
	| { type: 'MESSAGE_SEND_FAILED' }
	| { type: 'MESSAGE_RECEIVED' }
>;

export type ImageUploadEvents = Extract<
	ChatDomainEvent,
	| { type: 'IMAGE_UPLOAD_REQUESTED' }
	| { type: 'IMAGE_OPTIMISTIC_ADDED' }
	| { type: 'IMAGE_UPLOAD_SUCCESS' }
	| { type: 'IMAGE_UPLOAD_FAILED' }
	| { type: 'IMAGE_URL_UPDATED' }
	| { type: 'IMAGE_UPLOAD_STATUS_CHANGED' }
>;

export type ChatRoomEvents = Extract<
	ChatDomainEvent,
	| { type: 'CHAT_ROOM_JOINED' }
	| { type: 'CHAT_ROOM_LEFT' }
	| { type: 'MESSAGES_READ' }
	| { type: 'CHAT_ROOM_MARKED_AS_READ' }
	| { type: 'CHAT_ROOM_LIST_UPDATED' }
>;

export type SocketEvents = Extract<
	ChatDomainEvent,
	| { type: 'SOCKET_CONNECTED' }
	| { type: 'SOCKET_DISCONNECTED' }
	| { type: 'SOCKET_RECONNECTING' }
	| { type: 'SOCKET_RECONNECTED' }
	| { type: 'SOCKET_ERROR' }
>;

export type TypingEvents = Extract<
	ChatDomainEvent,
	{ type: 'TYPING_STARTED' } | { type: 'TYPING_STOPPED' }
>;
