import type { ChatClientToServerEvents, ChatServerToClientEvents } from '../../types/chat-socket.types';
import type { Socket } from 'socket.io-client';

export const sendMessageAction = (
  socket: Socket<ChatServerToClientEvents, ChatClientToServerEvents> | null,
  payload: { to: string; content: string; chatRoomId: string },
) => {
  socket?.emit('sendMessage', payload);
};

