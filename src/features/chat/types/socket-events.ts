import type { Chat } from './chat';

export type ChatSocketEventName =
  | 'connected'
  | 'error'
  | 'newMessage'
  | 'chatRoomCreated'
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
  };
  chatHistory: { 
    chatRoomId: string; 
    messages: Chat[] 
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
  data: ChatSocketEventPayloads[T]
) => void;
