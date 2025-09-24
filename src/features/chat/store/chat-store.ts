import { create } from 'zustand';
import { chatEventBus } from '../services/chat-event-bus';

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

interface ChatState {
	connectionStatus: ConnectionStatus;
}

export const useChatStore = create<ChatState>(() => ({
	connectionStatus: 'disconnected',
}));

chatEventBus.on('SOCKET_CONNECTED').subscribe(() => {
	useChatStore.setState({ connectionStatus: 'connected' });
});
chatEventBus.on('SOCKET_DISCONNECTED').subscribe(() => {
	useChatStore.setState({ connectionStatus: 'disconnected' });
});
chatEventBus.on('CONNECTION_REQUESTED').subscribe(() => {
	useChatStore.setState({ connectionStatus: 'connecting' });
});
