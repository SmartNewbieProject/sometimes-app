import { storage } from '@/src/shared/libs';
import { env } from '@/src/shared/libs/env';
import { isJapanese } from '@/src/shared/libs/local';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type Socket, io } from 'socket.io-client';
import { createSession, getMySessions, getSessionMessages } from '../apis';
import type {
	BotMessageChunkEvent,
	BotMessageDoneEvent,
	MessageMetadata,
	NewMessageEvent,
	SessionClosedEvent,
	SessionStatus,
	SessionStatusChangedEvent,
	SupportChatMessage,
	SupportChatSession,
	TypingEvent,
} from '../types';

interface UseSupportChatOptions {
	onStatusChange?: (newStatus: SessionStatus) => void;
	onSessionClosed?: (event: SessionClosedEvent) => void;
	onError?: (error: string) => void;
}

interface StreamingState {
	isStreaming: boolean;
	text: string;
	messageId?: string;
	metadata?: MessageMetadata;
}

interface UseSupportChatReturn {
	session: SupportChatSession | null;
	messages: SupportChatMessage[];
	status: SessionStatus | null;
	isConnected: boolean;
	isLoading: boolean;
	isTyping: boolean;
	streaming: StreamingState;
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
	const [streaming, setStreaming] = useState<StreamingState>({
		isStreaming: false,
		text: '',
	});
	const [error, setError] = useState<string | null>(null);

	const queryClient = useQueryClient();
	const socketRef = useRef<Socket | null>(null);
	const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const optionsRef = useRef(options);
	const streamingDoneMessageIdRef = useRef<string | null>(null);

	useEffect(() => {
		optionsRef.current = options;
	}, [options]);

	const getLanguage = () => (isJapanese() ? 'ja' : 'ko');

	const initSession = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const existingSessions = await getMySessions();
			const activeSession = existingSessions.sessions?.find(
				(s) => !['resolved', 'user_closed', 'admin_resolved'].includes(s.status),
			);

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
				transports: ['polling', 'websocket'],
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
				setError('연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
				setIsConnected(false);
			});

			newSocket.on('new_message', (message: NewMessageEvent) => {
				console.log('[SupportChat] New message:', message.senderType);
				// 스트리밍으로 이미 처리된 봇 메시지는 중복 추가하지 않음
				if (message.senderType === 'bot' && streamingDoneMessageIdRef.current === message.id) {
					streamingDoneMessageIdRef.current = null;
					return;
				}
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

			newSocket.on('bot_message_chunk', (data: BotMessageChunkEvent) => {
				if (data.sessionId !== session.sessionId) return;
				setStreaming((prev) => ({
					...prev,
					isStreaming: true,
					text: prev.text + data.chunk,
				}));
			});

			newSocket.on('bot_message_done', (data: BotMessageDoneEvent) => {
				if (data.sessionId !== session.sessionId) return;
				console.log('[SupportChat] Streaming done:', data.messageId);
				streamingDoneMessageIdRef.current = data.messageId;
				setStreaming((prev) => {
					// 스트리밍된 텍스트를 정식 메시지로 messages에 추가
					const finalText = prev.text;
					setMessages((msgs) => [
						...msgs,
						{
							id: data.messageId,
							sessionId: data.sessionId,
							senderType: 'bot',
							content: finalText,
							metadata: data.metadata,
							createdAt: new Date().toISOString(),
						},
					]);
					return { isStreaming: false, text: '', messageId: undefined, metadata: undefined };
				});
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

			newSocket.on('session_closed', (data: SessionClosedEvent) => {
				console.log('[SupportChat] Session closed:', data);
				if (data.sessionId === session.sessionId) {
					const newStatus = data.closedByType === 'admin' ? 'admin_resolved' : 'user_closed';
					setStatus(newStatus as SessionStatus);
					setSession((prev) => (prev ? { ...prev, status: newStatus as SessionStatus } : null));
					optionsRef.current?.onSessionClosed?.(data);
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
			if (!content.trim()) return;
			if (!socketRef.current?.connected || !session?.sessionId) {
				setError('연결이 불안정합니다. 잠시 후 다시 시도해주세요.');
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
		streaming,
		error,
		initSession,
		sendMessage,
		setTyping,
		disconnect,
	};
}
