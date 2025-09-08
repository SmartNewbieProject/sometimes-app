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
  joinRoomAction,
  leaveChatRoomAction,
  leaveRoomAction,
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

import type { Chat } from '../types/chat';

export type ChatEventActions = {
  sendMessage: (payload: { to: string; content: string; chatRoomId: string; senderId: string }) => { optimisticMessage: Chat; promise: Promise<any> };
  createChatRoom: (payload: CreateChatRoomPayload) => void;
  getChatHistory: (payload: GetChatHistoryPayload) => void;
  leaveChatRoom: (chatRoomId: string) => void;
  joinRoom: (chatRoomId: string) => void;
  leaveRoom: (chatRoomId: string) => void;
  typing: (to: string, chatRoomId: string) => void;
  stopTyping: (to: string, chatRoomId: string) => void;
  uploadImage: (payload: { to: string; chatRoomId: string; senderId: string; file: any }) => Promise<{ optimisticMessage: Chat; promise: Promise<any> }>;
  readMessages: (chatRoomId: string) => void;
};

export const createChatEventActions = (
  getSocket: () => ChatSocket,
): ChatEventActions => ({
  sendMessage: (payload) => sendMessageAction(getSocket(), payload),
  createChatRoom: (payload) => createChatRoomAction(getSocket(), payload),
  getChatHistory: (payload) => getChatHistoryAction(getSocket(), payload),
  leaveChatRoom: (chatRoomId) => leaveChatRoomAction(getSocket(), chatRoomId),
  joinRoom: (chatRoomId) => joinRoomAction(getSocket(), chatRoomId),
  leaveRoom: (chatRoomId) => leaveRoomAction(getSocket(), chatRoomId),
  typing: (to, chatRoomId) => typingAction(getSocket(), to, chatRoomId),
  stopTyping: (to, chatRoomId) => stopTypingAction(getSocket(), to, chatRoomId),
  uploadImage: async (payload) => uploadImageAction(getSocket(), payload),
  readMessages: (chatRoomId) => readMessagesAction(getSocket(), chatRoomId),
});
