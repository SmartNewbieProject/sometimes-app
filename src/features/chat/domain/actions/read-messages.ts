import type { ChatClientToServerEvents, ChatServerToClientEvents } from '../../types/chat-socket.types';
import type { Socket } from 'socket.io-client';

export const readMessagesAction = (
  socket: Socket<ChatServerToClientEvents, ChatClientToServerEvents> | null,
  chatRoomId: string,
) => {
  socket?.emit('readMessages', { chatRoomId });
};

