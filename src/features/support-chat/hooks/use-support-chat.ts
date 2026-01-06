import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { storage } from '@/src/shared/libs';
import { env } from '@/src/shared/libs/env';
import { isJapanese } from '@/src/shared/libs/local';
import { createSession, getMySessions, getSessionMessages } from '../apis';
import type {
	SupportChatMessage,
	SessionStatus,
	NewMessageEvent,
	SessionStatusChangedEvent,
	TypingEvent,
	SupportChatSession,
} from '../types';

interface UseSupportChatOptions {
	onStatusChange?: (newStatus: SessionStatus) => void;
	onError?: (error: string) => void;
}

interface UseSupportChatReturn {
	session: SupportChatSession | null;
	messages: SupportChatMessage[];
	status: SessionStatus | null;
	isConnected: boolean;
	isLoading: boolean;
	isTyping: boolean;
	error: string | null;
	initSession: () => Promise<void>;
	sendMessage: (content: string) => void;
	setTyping: (isTyping: boolean) => void;
	disconnect: () => void;
}

export function useSupportChat(options?: UseSupportChatOptions): UseSupportChatReturn {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [session, setSession] = useState<SupportChatSession | null>(null);
	const [messages, setMessages] = useState<SupportChatMessage[]>([]);
	const [status, setStatus] = useState<SessionStatus | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isTyping, setIsTypingState] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const queryClient = useQueryClient();
	const socketRef = useRef<Socket | null>(null);
	const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const optionsRef = useRef(options);

	useEffect(() => {
		optionsRef.current = options;
	}, [options]);

	const getLanguage = () => (isJapanese() ? 'ja' : 'ko');

	const initSession = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const existingSessions = await getMySessions();
			const activeSession = existingSessions.sessions?.find((s) => s.status !== 'resolved');

			if (activeSession) {
				const messagesResponse = await getSessionMessages(activeSession.sessionId);

				setSession({
					sessionId: activeSession.sessionId,
					status: messagesResponse.status,
					language: activeSession.language,
					createdAt: activeSession.createdAt,
					messages: messagesResponse.messages,
				});
				setMessages(messagesResponse.messages || []);
				setStatus(messagesResponse.status);
			} else {
				const response = await createSession({ language: getLanguage() });

				setSession({
					sessionId: response.sessionId,
					status: response.status,
					language: response.language,
					createdAt: response.createdAt,
					messages: response.messages,
				});
				setMessages(response.messages || []);
				setStatus(response.status);

				queryClient.invalidateQueries({ queryKey: ['support-chat', 'sessions'] });
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
			setError(errorMessage);
			optionsRef.current?.onError?.(errorMessage);
		} finally {
			setIsLoading(false);
		}
	}, [queryClient]);

	useEffect(() => {
		if (!session?.sessionId) return;

		const connectSocket = async () => {
			const accessToken = await storage.getItem('access-token');
			if (!accessToken) {
				setError('No access token');
				return;
			}

			const wsUrl = env.SERVER_URL || env.API_URL?.replace('/api', '') || '';

			const newSocket = io(`${wsUrl}/support-chat`, {
				auth: { token: `Bearer ${accessToken.replace(/"/g, '')}` },
				transports: ['websocket'],
				reconnection: true,
				reconnectionAttempts: 5,
				reconnectionDelay: 1000,
			});

			newSocket.on('connect', () => {
				console.log('[SupportChat] Connected');
				setIsConnected(true);
				setError(null);

				newSocket.emit(
					'join_session',
					{ sessionId: session.sessionId },
					(response: { success: boolean; error?: string }) => {
						if (!response.success) {
							console.error('[SupportChat] Failed to join session:', response.error);
							setError(response.error || 'Failed to join session');
						}
					},
				);
			});

			newSocket.on('disconnect', (reason) => {
				console.log('[SupportChat] Disconnected:', reason);
				setIsConnected(false);
			});

			newSocket.on('connect_error', (err) => {
				console.error('[SupportChat] Connection error:', err.message);
				setError(`Connection error: ${err.message}`);
				setIsConnected(false);
			});

			newSocket.on('new_message', (message: NewMessageEvent) => {
				console.log('[SupportChat] New message:', message.senderType);
				setMessages((prev) => [
					...prev,
					{
						id: message.id,
						sessionId: message.sessionId,
						senderType: message.senderType,
						content: message.content,
						metadata: message.metadata,
						createdAt: message.createdAt,
					},
				]);
			});

			newSocket.on('session_status_changed', (data: SessionStatusChangedEvent) => {
				console.log('[SupportChat] Status changed:', data.oldStatus, '->', data.newStatus);
				setStatus(data.newStatus);
				setSession((prev) => (prev ? { ...prev, status: data.newStatus } : null));
				optionsRef.current?.onStatusChange?.(data.newStatus);
			});

			newSocket.on('typing', (data: TypingEvent) => {
				if (data.sessionId === session.sessionId) {
					setIsTypingState(data.isTyping);
				}
			});

			socketRef.current = newSocket;
			setSocket(newSocket);
		};

		connectSocket();

		return () => {
			if (socketRef.current) {
				socketRef.current.removeAllListeners();
				socketRef.current.disconnect();
				socketRef.current = null;
			}
		};
	}, [session?.sessionId]);

	const sendMessage = useCallback(
		(content: string) => {
			if (!socketRef.current || !session?.sessionId || !content.trim()) {
				return;
			}

			socketRef.current.emit(
				'send_message',
				{
					sessionId: session.sessionId,
					content: content.trim(),
				},
				(response: { success: boolean; error?: string }) => {
					if (!response.success) {
						console.error('[SupportChat] Failed to send message:', response.error);
						setError(response.error || 'Failed to send message');
					}
				},
			);
		},
		[session?.sessionId],
	);

	const setTyping = useCallback(
		(typing: boolean) => {
			if (!socketRef.current || !session?.sessionId) return;

			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}

			socketRef.current.emit('typing', {
				sessionId: session.sessionId,
				isTyping: typing,
			});

			if (typing) {
				typingTimeoutRef.current = setTimeout(() => {
					socketRef.current?.emit('typing', {
						sessionId: session.sessionId,
						isTyping: false,
					});
				}, 3000);
			}
		},
		[session?.sessionId],
	);

	const disconnect = useCallback(() => {
		if (socketRef.current) {
			socketRef.current.removeAllListeners();
			socketRef.current.disconnect();
			socketRef.current = null;
			setSocket(null);
			setIsConnected(false);
		}
	}, []);

	useEffect(() => {
		return () => {
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}
		};
	}, []);

	return {
		session,
		messages,
		status,
		isConnected,
		isLoading,
		isTyping,
		error,
		initSession,
		sendMessage,
		setTyping,
		disconnect,
	};
}
