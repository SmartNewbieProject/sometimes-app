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
	isInitialized: boolean;
	disconnectSocket: () => void;
	initSocket: (
		url: string,
		token: string,
	) => Socket<ChatServerToClientEvents, ChatClientToServerEvents>;
	setConnected: (v: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
	socket: null,
	connected: false,
	isInitialized: false,
	setConnected: (v) => set({ connected: v }),
	initSocket: (url, token) => {
		const state = get();

		if (state.isInitialized && state.socket) {
			return state.socket;
		}

		if (state.socket) {
			state.socket.disconnect();
		}

		const newSocket = io(url, {
			transports: ['websocket'],
			withCredentials: true,
			secure: process.env.NODE_ENV === 'production',
			rejectUnauthorized: true,
			auth: { token },
		});
		console.log('check store', newSocket);
		set({ socket: newSocket, isInitialized: true });
		return newSocket;
	},
	disconnectSocket: () => {
		const currentSocket = get().socket;
		if (currentSocket) {
			currentSocket.disconnect();
		}
		set({ socket: null, connected: false, isInitialized: false });
	},
}));
