import type { ChatClientToServerEvents, ChatServerToClientEvents } from '../../types/chat-socket.types';
import type { Socket } from 'socket.io-client';

export const leaveChatRoomAction = (
  socket: Socket<ChatServerToClientEvents, ChatClientToServerEvents> | null,
  chatRoomId: string,
) => {
  socket?.emit('leaveChatRoom', { chatRoomId });
};

