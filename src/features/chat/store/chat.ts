import { type Socket, io } from 'socket.io-client';
import { create } from 'zustand';
import type { Chat } from '../types/chat';
import type {
	ChatClientToServerEvents,
	ChatServerToClientEvents,
} from '../types/chat-socket.types';

interface ChatState {
	socket: Socket<ChatServerToClientEvents, ChatClientToServerEvents> | null;
	connected: boolean;
	initSocket: (
		url: string,
		token: string,
	) => Socket<ChatServerToClientEvents, ChatClientToServerEvents>;
	setConnected: (v: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
	socket: null,
	connected: false,
	setConnected: (v) => set({ connected: v }),
	initSocket: (url, token) => {
		let s = get().socket as Socket<ChatServerToClientEvents, ChatClientToServerEvents>;

		if (!s) {
			s = io(url, { transports: ['websocket'], withCredentials: true, auth: { token } });
			set({ socket: s });
		}
		return s;
	},
}));

// getter for current store state (for internal use)
const get = () => useChatStore.getState();
