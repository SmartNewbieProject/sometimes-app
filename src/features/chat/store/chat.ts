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
	currentUrl: string | null;
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
	currentUrl: null,
	setConnected: (v) => set({ connected: v }),
	initSocket: (url, token) => {
		const state = get();

		if (state.socket && state.currentUrl !== url) {
			state.socket.removeAllListeners();
			state.socket.disconnect();
			set({ socket: null, isInitialized: false, currentUrl: null });
		}

		if (state.socket && state.currentUrl === url && state.socket.connected) {
			return state.socket;
		}

		if (state.socket && !state.socket.connected) {
			state.socket.removeAllListeners();
			state.socket.disconnect();
		}

		const newSocket = io(url, {
			transports: ['websocket', 'polling'],
			withCredentials: true,
			secure: process.env.NODE_ENV === 'production',
			rejectUnauthorized: true,
			auth: { token },

			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			timeout: 20000,

			// 중복 연결 방지를 위한 고유 식별자
			forceNew: !!state.socket,
		});

		set({ socket: newSocket, isInitialized: true, currentUrl: url });
		return newSocket;
	},
	disconnectSocket: () => {
		const currentSocket = get().socket;
		if (currentSocket) {
			currentSocket.removeAllListeners();
			currentSocket.disconnect();
		}
		set({ socket: null, connected: false, isInitialized: false, currentUrl: null });
	},
}));
