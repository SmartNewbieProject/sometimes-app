import type { ChatClientToServerEvents, ChatServerToClientEvents } from '../../types/chat-socket.types';
import type { Socket } from 'socket.io-client';

export const typingAction = (
  socket: Socket<ChatServerToClientEvents, ChatClientToServerEvents> | null,
  to: string,
  chatRoomId: string,
) => {
  socket?.emit('typing', { to, chatRoomId });
};

export const stopTypingAction = (
  socket: Socket<ChatServerToClientEvents, ChatClientToServerEvents> | null,
  to: string,
  chatRoomId: string,
) => {
  socket?.emit('stopTyping', { to, chatRoomId });
};

