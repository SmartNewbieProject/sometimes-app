import type { Socket } from 'socket.io-client';
import type {
  ChatClientToServerEvents,
  ChatServerToClientEvents,
} from '../types/chat-socket.types';
import type {
  CreateChatRoomPayload,
  GetChatHistoryPayload,
} from '../types/socket-payload.interface';
import {
  createChatRoomAction,
  getChatHistoryAction,
  leaveChatRoomAction,
  readMessagesAction,
  sendMessageAction,
  stopTypingAction,
  typingAction,
  uploadImageAction,
} from './actions';

export type ChatSocket = Socket<
  ChatServerToClientEvents,
  ChatClientToServerEvents
> | null;

export type ChatEventActions = {
  sendMessage: (payload: { to: string; content: string; chatRoomId: string }) => void;
  createChatRoom: (payload: CreateChatRoomPayload) => void;
  getChatHistory: (payload: GetChatHistoryPayload) => void;
  leaveChatRoom: (chatRoomId: string) => void;
  typing: (to: string, chatRoomId: string) => void;
  stopTyping: (to: string, chatRoomId: string) => void;
  uploadImage: (to: string, chatRoomId: string, file: File | Blob | string) => Promise<void>;
  readMessages: (chatRoomId: string) => void;
};

export const createChatEventActions = (
  getSocket: () => ChatSocket,
): ChatEventActions => ({
  sendMessage: (payload) => sendMessageAction(getSocket(), payload),
  createChatRoom: (payload) => createChatRoomAction(getSocket(), payload),
  getChatHistory: (payload) => getChatHistoryAction(getSocket(), payload),
  leaveChatRoom: (chatRoomId) => leaveChatRoomAction(getSocket(), chatRoomId),
  typing: (to, chatRoomId) => typingAction(getSocket(), to, chatRoomId),
  stopTyping: (to, chatRoomId) => stopTypingAction(getSocket(), to, chatRoomId),
  uploadImage: async (to, chatRoomId, file) => {
    await uploadImageAction(getSocket(), to, chatRoomId, file);
  },
  readMessages: (chatRoomId) => readMessagesAction(getSocket(), chatRoomId),
});

