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
		
		// 이미 초기화된 소켓이 있으면 재사용
		if (state.isInitialized && state.socket) {
			return state.socket;
		}
		
		// 기존 소켓 정리
		if (state.socket) {
			state.socket.disconnect();
		}

		// 새로운 소켓 생성
		const newSocket = io(url, { 
			transports: ['websocket'], 
			withCredentials: true, 
			auth: { token } 
		});
		
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


