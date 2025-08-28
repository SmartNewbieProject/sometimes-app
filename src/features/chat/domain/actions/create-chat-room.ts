import type { ChatClientToServerEvents, ChatServerToClientEvents } from '../../types/chat-socket.types';
import type { Socket } from 'socket.io-client';
import type { CreateChatRoomPayload } from '../../types/socket-payload.interface';

export const createChatRoomAction = (
  socket: Socket<ChatServerToClientEvents, ChatClientToServerEvents> | null,
  payload: CreateChatRoomPayload,
) => {
  socket?.emit('createChatRoom', payload);
};

