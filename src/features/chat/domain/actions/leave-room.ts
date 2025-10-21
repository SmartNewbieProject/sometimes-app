import type { ChatClientToServerEvents, ChatServerToClientEvents } from '../../types/chat-socket.types';
import type { Socket } from 'socket.io-client';

export const leaveRoomAction = (
  socket: Socket<ChatServerToClientEvents, ChatClientToServerEvents> | null,
  chatRoomId: string,
) => {
  socket?.emit('leaveRoom', { chatRoomId });
};