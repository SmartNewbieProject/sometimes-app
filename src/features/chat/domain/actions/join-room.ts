import type { ChatClientToServerEvents, ChatServerToClientEvents } from '../../types/chat-socket.types';
import type { Socket } from 'socket.io-client';

export const joinRoomAction = (
  socket: Socket<ChatServerToClientEvents, ChatClientToServerEvents> | null,
  chatRoomId: string,
) => {
  socket?.emit('joinRoom', { chatRoomId });
};