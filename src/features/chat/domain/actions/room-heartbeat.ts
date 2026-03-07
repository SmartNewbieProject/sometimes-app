import type { Socket } from 'socket.io-client';
import type {
	ChatClientToServerEvents,
	ChatServerToClientEvents,
} from '../../types/chat-socket.types';

export const roomHeartbeatAction = (
	socket: Socket<ChatServerToClientEvents, ChatClientToServerEvents> | null,
	chatRoomId: string,
) => {
	socket?.emit('roomHeartbeat', { chatRoomId });
};
