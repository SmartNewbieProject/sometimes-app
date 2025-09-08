import type { Socket } from 'socket.io-client';
import type {
	ChatClientToServerEvents,
	ChatServerToClientEvents,
} from '../../types/chat-socket.types';

export const readMessagesAction = (
	socket: Socket<ChatServerToClientEvents, ChatClientToServerEvents> | null,
	chatRoomId: string,
) => {
	console.log('check read message');
	socket?.emit('readMessages', { chatRoomId });
};
