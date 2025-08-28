import type {
  SendMessagePayload,
  CreateChatRoomPayload,
  GetChatHistoryPayload,
  LeaveChatRoomPayload,
  TypingPayload,
  UploadImagePayload,
  RemoteMessagePayload,
  ReadMessagesPayload,
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

  newMessage: (payload: {
    messageId: string;
    from: string;
    content: string;
    messageType: ChatMessageType;
    mediaUrl?: string;
    chatRoomId: string;
    timestamp: string; // ISO
  }) => void;

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
}

export interface ChatClientToServerEvents {
  sendMessage: (payload: SendMessagePayload) => void;
  createChatRoom: (payload: CreateChatRoomPayload) => void;
  getChatHistory: (payload: GetChatHistoryPayload) => void;
  leaveChatRoom: (payload: LeaveChatRoomPayload) => void;
  typing: (payload: TypingPayload) => void;
  stopTyping: (payload: TypingPayload) => void;
  uploadImage: (payload: UploadImagePayload) => void;
  remoteMessage: (payload: RemoteMessagePayload) => void;
  readMessages: (payload: ReadMessagesPayload) => void;
}
