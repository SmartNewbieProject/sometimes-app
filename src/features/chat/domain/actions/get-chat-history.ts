import type { Socket } from 'socket.io-client';
import type {
	ChatClientToServerEvents,
	ChatServerToClientEvents,
} from '../../types/chat-socket.types';
import type { GetChatHistoryPayload } from '../../types/socket-payload.interface';

export const getChatHistoryAction = (
	socket: Socket<ChatServerToClientEvents, ChatClientToServerEvents> | null,
	payload: GetChatHistoryPayload,
) => {
	socket?.emit('getChatHistory', payload);
};
