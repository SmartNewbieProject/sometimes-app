import { MIXPANEL_EVENTS } from '@/src/shared/constants/mixpanel-events';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { devLogWithTag, devWarn, logError } from '@/src/shared/utils';
import { uriToBase64 } from '@/src/shared/utils/image';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { type Subscription, fromEvent } from 'rxjs';
import { type Socket, io } from 'socket.io-client';
import { buildChatSocketUrl } from '../domain/utils/build-socket-url';
import { type RNFileLike, fileToBase64Payload } from '../domain/utils/file-to-base64';
import type { Chat } from '../types/chat';
import { generateTempId } from '../utils/generate-temp-id';
import { compressImage, isImageTooLarge } from '../utils/image-compression';
import { chatEventBus } from './chat-event-bus';

declare const globalThis: {
	__socketManagerSubscriptions?: Subscription[];
};

class SocketConnectionManager {
	private socket: Socket | null = null;
	private currentUrl: string | null = null;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 20;
	private reconnectDelay = 1000;
	private isReconnecting = false;
	private lastSuccessfulSend: number = Date.now();
	private isInitialized = false;

	// Health Check 관련 속성 (서버 pingInterval: 35초, pingTimeout: 25초와 동기화)
	private healthCheckInterval: ReturnType<typeof setInterval> | null = null;
	private lastPongReceived: number = Date.now();
	private readonly HEALTH_CHECK_INTERVAL = 35000; // 35초마다 ping (서버와 동일)
	private readonly STALE_CONNECTION_THRESHOLD = 60000; // 60초 (모바일 네트워크 지연 대응)

	private pendingMessages: {
		event: string;
		payload: any;
		callback?: (response: any) => void;
	}[] = [];

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	private uploadImagePromise(payload: any): Promise<Chat> {
		return new Promise((resolve, reject) => {
			if (!this.socket) {
				return reject(new Error('Socket not connected'));
			}
			this.socket.emit(
				'uploadImage',
				payload,
				(response: {
					success: boolean;
					serverMessage: Chat;
					error?: string;
				}) => {
					if (response?.success) {
						resolve(response.serverMessage);
					} else {
						reject(new Error(response?.error || 'Upload failed'));
					}
				},
			);
		});
	}

	private timeoutPromise(ms: number, message: string): Promise<never> {
		return new Promise((_, reject) => {
			setTimeout(() => {
				reject(new Error(message));
			}, ms);
		});
	}

	private queueMessage(event: string, payload: any, callback?: (response: any) => void) {
		this.pendingMessages.push({ event, payload, callback });
	}

	private isSocketHealthy(): boolean {
		if (!this.socket) {
			devLogWithTag('Socket Health', 'Socket is null');
			return false;
		}

		// 기본 연결 상태 체크
		if (!this.socket.connected) {
			devLogWithTag('Socket Health', 'Socket not connected');
			return false;
		}

		// Socket.io engine의 transport 레벨 상태 체크
		try {
			const engineState = (this.socket as any).io?.engine?.readyState;
			if (engineState && engineState !== 'open') {
				devLogWithTag('Socket Health', `Engine not open: ${engineState}`);
				return false;
			}
		} catch (error) {
			devWarn('Failed to check engine state:', error);
		}

		// Health Check 기반 stale 연결 체크
		const timeSinceLastPong = Date.now() - this.lastPongReceived;
		if (timeSinceLastPong > this.STALE_CONNECTION_THRESHOLD) {
			devLogWithTag(
				'Socket Health',
				`Stale connection detected: ${timeSinceLastPong}ms since last pong (threshold: ${this.STALE_CONNECTION_THRESHOLD}ms)`,
			);

			// Health check 실패 이벤트 발생
			chatEventBus.emit({
				type: 'SOCKET_HEALTH_CHECK_FAILED',
				payload: { lastActivity: this.lastPongReceived },
			});

			return false;
		}

		return true;
	}

	private processPendingMessages() {
		if (!this.socket?.connected) return;

		while (this.pendingMessages.length > 0) {
			const message = this.pendingMessages.shift();
			if (message) {
				devLogWithTag('Socket', `Processing queued: ${message.event}`);
				if (message.callback) {
					this.socket.emit(message.event, message.payload, message.callback);
				} else {
					this.socket.emit(message.event, message.payload);
				}
			}
		}
	}

	/**
	 * Health Check 시작 - 25초마다 ping 전송
	 * 서버로부터 pong 응답을 받으면 lastPongReceived 갱신
	 */
	private startHealthCheck() {
		// 기존 interval 정리
		this.stopHealthCheck();

		devLogWithTag(
			'Socket Health',
			`Starting health check (interval: ${this.HEALTH_CHECK_INTERVAL}ms)`,
		);

		// 초기값 설정
		this.lastPongReceived = Date.now();

		// pong 응답 리스너 등록
		this.socket?.on('pong', () => {
			this.lastPongReceived = Date.now();
			devLogWithTag('Socket Health', 'Pong received');
		});

		// 주기적 ping 전송
		this.healthCheckInterval = setInterval(() => {
			if (this.socket?.connected) {
				devLogWithTag('Socket Health', 'Sending ping...');
				this.socket.emit('ping');
			} else {
				devLogWithTag('Socket Health', 'Socket not connected, skipping ping');
			}
		}, this.HEALTH_CHECK_INTERVAL);
	}

	/**
	 * Health Check 중지
	 */
	private stopHealthCheck() {
		if (this.healthCheckInterval) {
			clearInterval(this.healthCheckInterval);
			this.healthCheckInterval = null;
			devLogWithTag('Socket Health', 'Health check stopped');
		}

		// pong 리스너 제거
		this.socket?.off('pong');
	}

	/**
	 * 재연결 시도 - Socket.IO 내장 재연결에 위임
	 * Socket.IO의 reconnection: true 설정이 자동으로 재시도를 관리함
	 * 이 메서드는 소켓이 null인 경우에만 새 연결을 요청
	 */
	private attemptReconnect() {
		if (this.isReconnecting) {
			devLogWithTag('Socket', 'Already reconnecting (Socket.IO handling)...');
			return;
		}

		// 소켓이 null이면 새 연결 필요
		if (!this.socket) {
			devLogWithTag('Socket', 'Socket is null, requesting new connection...');
			chatEventBus.emit({
				type: 'SOCKET_CONNECTION_NEEDED',
				payload: {},
			});
			return;
		}

		// Socket.IO 내장 재연결에 위임
		// reconnection: true 설정으로 Socket.IO가 자동으로 재시도함
		devLogWithTag('Socket', 'Delegating reconnection to Socket.IO...');
		if (!this.socket.connected) {
			this.socket.connect();
		}
	}

	initialize() {
		if (this.isInitialized) {
			devLogWithTag('Socket', 'Already initialized, skipping...');
			return;
		}

		this.cleanupSubscriptions();

		devLogWithTag('Socket', 'Initializing socket manager...');
		globalThis.__socketManagerSubscriptions = [];

		this.setupConnectionHandlers();
		this.setupMessageHandlers();
		this.setupRoomHandlers();
		this.setupImageUploadHandlers();
		this.isInitialized = true;
		devLogWithTag('Socket', 'Socket manager initialized');
	}

	cleanup() {
		devLogWithTag('Socket', 'Cleaning up socket manager...');

		this.stopHealthCheck();
		this.cleanupSubscriptions();

		if (this.socket) {
			this.disconnectSocket();
		}

		this.reconnectAttempts = 0;
		this.isReconnecting = false;
		this.pendingMessages = [];
		this.isInitialized = false;

		devLogWithTag('Socket', 'Socket manager cleanup complete');
	}

	private cleanupSubscriptions() {
		if (globalThis.__socketManagerSubscriptions?.length) {
			devLogWithTag(
				'Socket',
				`Cleaning up ${globalThis.__socketManagerSubscriptions.length} subscriptions...`,
			);
			globalThis.__socketManagerSubscriptions.forEach((sub) => sub.unsubscribe());
			globalThis.__socketManagerSubscriptions = [];
		}
	}

	private addSubscription(subscription: Subscription) {
		globalThis.__socketManagerSubscriptions?.push(subscription);
	}

	private setupConnectionHandlers() {
		devLogWithTag('Socket', 'Setting up connection handlers...');
		this.addSubscription(
			chatEventBus.on('CONNECTION_REQUESTED').subscribe(({ payload }) => {
				devLogWithTag('Socket', 'CONNECTION_REQUESTED received');
				devLogWithTag('Socket', 'URL:', payload.url);
				devLogWithTag('Socket', 'Token exists:', !!payload.token);

				if (!payload.url || !payload.token) {
					logError('Socket connection failed: Missing URL or token');
					return;
				}

				this.connect(payload.url, payload.token);
			}),
		);
		devLogWithTag('Socket', 'Connection handlers ready');
	}

	private setupMessageHandlers() {
		this.addSubscription(
			chatEventBus.on('MESSAGES_READ_REQUESTED').subscribe(({ payload }) => {
				this.socket?.emit('readMessages', { chatRoomId: payload.chatRoomId });
			}),
		);

		this.addSubscription(
			chatEventBus.on('MESSAGE_SEND_REQUESTED').subscribe(({ payload }) => {
				this.handleMessageSend(payload);
			}),
		);

		this.addSubscription(
			chatEventBus.on('MESSAGE_RETRY_REQUESTED').subscribe(({ payload }) => {
				this.handleMessageRetry(payload);
			}),
		);
	}

	private setupRoomHandlers() {
		this.addSubscription(
			chatEventBus.on('CHAT_ROOM_JOIN_REQUESTED').subscribe(({ payload }) => {
				devLogWithTag('Chat Room', `Joining: ${payload.chatRoomId}`);
				this.socket?.emit('joinRoom', { chatRoomId: payload.chatRoomId });
			}),
		);

		this.addSubscription(
			chatEventBus.on('CHAT_ROOM_LEAVE_REQUESTED').subscribe(({ payload }) => {
				devLogWithTag('Chat Room', `Leaving: ${payload.chatRoomId}`);
				this.socket?.emit('leaveRoom', { chatRoomId: payload.chatRoomId });
			}),
		);
	}

	private setupImageUploadHandlers() {
		this.addSubscription(
			chatEventBus.on('IMAGE_OPTIMISTIC_ADDED').subscribe(async ({ payload }) => {
				await this.handleImageUpload(payload);
			}),
		);
	}

	private handleMessageSend(payload: any, retryCount = 0) {
		const MAX_RETRIES = 3;
		const RETRY_DELAY_MS = 1500;

		devLogWithTag('Socket', 'Sending message:', { tempId: payload.tempId, retryCount });

		// 연결 상태 심층 체크
		if (!this.isSocketHealthy()) {
			devLogWithTag('Socket', `Socket unhealthy (retry ${retryCount}/${MAX_RETRIES})...`);

			// 재연결 시도
			this.attemptReconnect();

			// 최대 재시도 횟수 이내라면 자동 재시도
			if (retryCount < MAX_RETRIES) {
				devLogWithTag('Socket', `Scheduling retry in ${RETRY_DELAY_MS}ms...`);
				setTimeout(() => {
					this.handleMessageSend(payload, retryCount + 1);
				}, RETRY_DELAY_MS);
				return;
			}

			// 최대 재시도 후 실패 처리
			devLogWithTag('Socket', 'Max retries reached, emitting failure...');
			chatEventBus.emit({
				type: 'MESSAGE_SEND_FAILED',
				payload: {
					success: false,
					error: 'Socket not connected after retries',
					tempId: payload.tempId,
				},
			});
			return;
		}

		const MESSAGE_TIMEOUT_MS = 10000;
		let isResolved = false;

		const timeout = setTimeout(() => {
			if (isResolved) return;
			isResolved = true;
			devLogWithTag('Socket', 'Message timeout:', { tempId: payload.tempId });
			chatEventBus.emit({
				type: 'MESSAGE_SEND_FAILED',
				payload: {
					success: false,
					error: 'Timeout',
					tempId: payload.tempId,
				},
			});
		}, MESSAGE_TIMEOUT_MS);

		this.socket?.emit(
			'sendMessage',
			payload,
			(response: { success: boolean; serverMessage: Chat; error?: string }) => {
				if (isResolved) return;
				isResolved = true;
				clearTimeout(timeout);

				devLogWithTag('Socket', 'Message response:', { success: response?.success });

				if (response?.success) {
					this.emitMessageSuccess(response.serverMessage, payload.tempId);
				} else {
					this.handleMessageFailure(response?.error, payload);
				}
			},
		);
	}

	private emitMessageSuccess(serverMessage: Chat, tempId: string) {
		// 성공적인 전송 시간 기록
		this.lastSuccessfulSend = Date.now();

		// KPI 이벤트: 채팅 메시지 전송
		mixpanelAdapter.track(MIXPANEL_EVENTS.CHAT_MESSAGE_SENT, {
			chat_id: serverMessage.chatRoomId,
			message_type: serverMessage.messageType || 'text',
			timestamp: Date.now(),
			env: process.env.EXPO_PUBLIC_TRACKING_MODE || 'production',
		});

		chatEventBus.emit({
			type: 'MESSAGE_SEND_SUCCESS',
			payload: {
				success: true,
				serverMessage,
				tempId,
			},
		});
	}

	private handleMessageRetry(payload: { message: any; to: string }) {
		const { message, to } = payload;
		devLogWithTag('Socket', 'Retrying message:', { tempId: message.tempId, to });

		// 메시지 재전송 (handleMessageSend 내부에서 상태 관리)
		this.handleMessageSend({
			to,
			chatRoomId: message.chatRoomId,
			senderId: message.senderId,
			content: message.content,
			tempId: message.tempId,
		});
	}

	private handleMessageFailure(error: string | undefined, payload: any) {
		devLogWithTag('Socket', 'Message failed:', { error, tempId: payload.tempId });

		// 항상 실패 이벤트 발생 → UI에 실패 상태 표시
		chatEventBus.emit({
			type: 'MESSAGE_SEND_FAILED',
			payload: {
				success: false,
				error: error || 'Unknown error',
				tempId: payload.tempId,
			},
		});

		// 소켓 연결 끊김이 원인이면 재연결 시도
		if (!this.socket?.connected) {
			devLogWithTag('Socket', 'Connection lost, attempting reconnect...');
			this.attemptReconnect();
		}
	}

	private async handleImageUpload(
		payload: { options: any; optimisticMessage: Chat },
		retryCount = 0,
	) {
		const MAX_RETRIES = 3;
		const RETRY_DELAY_MS = 1500;

		const { options, optimisticMessage } = payload;
		const { tempId } = optimisticMessage;

		// 연결 상태 심층 체크 (텍스트 메시지와 동일하게)
		if (!this.isSocketHealthy()) {
			devLogWithTag(
				'Socket',
				`Socket unhealthy for image upload (retry ${retryCount}/${MAX_RETRIES})...`,
			);
			this.attemptReconnect();

			// 최대 재시도 횟수 이내라면 자동 재시도
			if (retryCount < MAX_RETRIES) {
				devLogWithTag('Socket', `Scheduling image upload retry in ${RETRY_DELAY_MS}ms...`);
				setTimeout(() => {
					this.handleImageUpload(payload, retryCount + 1);
				}, RETRY_DELAY_MS);
				return;
			}

			// 최대 재시도 후 실패 처리
			devLogWithTag('Socket', 'Max retries reached for image upload, emitting failure...');
			this.emitImageUploadFailure('Socket not connected after retries', tempId!);
			return;
		}

		try {
			const imageData = await this.prepareImageData(options.file);
			const serverMessage = await this.uploadImage({
				to: options.to,
				chatRoomId: options.chatRoomId,
				imageData: imageData.base64,
				mimeType: imageData.mimeType,
				tempId,
			});

			this.emitImageUploadSuccess(serverMessage, tempId!);
		} catch (error) {
			this.emitImageUploadFailure((error as Error).message, tempId!);
		}
	}

	private async prepareImageData(file: any): Promise<{ base64: string; mimeType: string }> {
		let base64: string;
		let mimeType = 'image/jpeg';

		if (typeof file === 'object' && 'uri' in file) {
			const base64Result = await uriToBase64(file.uri);
			base64 = base64Result || '';
		} else if (typeof file === 'string') {
			base64 = file;
		} else {
			const result = await fileToBase64Payload(file as RNFileLike);
			base64 = result.base64;
			mimeType = result.mimeType;
		}

		if (isImageTooLarge(base64, 5 * 1024 * 1024)) {
			base64 = await compressImage(base64, {
				maxWidth: 800,
				maxHeight: 800,
				quality: 0.7,
				format: 'jpeg',
			}).catch((compressionError) => {
				devWarn('common.이미지_압축_실패_원본_사용', compressionError);
				return base64;
			});
		}

		return { base64, mimeType };
	}

	private async uploadImage(payload: any): Promise<Chat> {
		return Promise.race([
			this.uploadImagePromise(payload),
			this.timeoutPromise(30000, 'Upload timeout'),
		]);
	}

	private emitImageUploadSuccess(serverMessage: Chat, tempId: string) {
		// 성공적인 전송 시간 기록
		this.lastSuccessfulSend = Date.now();

		chatEventBus.emit({
			type: 'IMAGE_UPLOAD_SUCCESS',
			payload: { success: true, serverMessage, tempId },
		});
	}

	private emitImageUploadFailure(error: string, tempId: string) {
		chatEventBus.emit({
			type: 'IMAGE_UPLOAD_FAILED',
			payload: { success: false, error, tempId },
		});
	}

	private connect(url: string, token: string) {
		devLogWithTag('Socket', '=== CONNECT START ===');
		devLogWithTag('Socket', 'Base URL:', url);
		devLogWithTag('Socket', 'Token length:', token ? token.length : 0);

		const socketUrl = buildChatSocketUrl(url, '', token);
		devLogWithTag('Socket', 'Built Socket URL:', socketUrl);

		devLogWithTag('Socket', 'Current state:', {
			hasSocket: !!this.socket,
			currentUrl: this.currentUrl,
			isConnected: this.socket?.connected,
			isInitialized: this.isInitialized,
		});

		if (this.socket && this.currentUrl !== socketUrl) {
			devLogWithTag('Socket', 'URL changed, disconnecting old socket...');
			this.disconnectSocket();
		}

		if (this.socket && this.currentUrl === socketUrl && this.socket.connected) {
			devLogWithTag('Socket', 'Socket already connected, reusing...');
			return this.socket;
		}

		if (this.socket && !this.socket.connected) {
			devLogWithTag('Socket', 'Socket exists but not connected, cleaning up...');
			this.disconnectSocket();
		}

		devLogWithTag('Socket', 'Creating new socket connection...');
		try {
			this.createSocketConnection(socketUrl, token);
			this.registerSocketListeners();
			devLogWithTag('Socket', 'Socket created:', {
				connected: this.socket?.connected,
				id: this.socket?.id,
			});
			devLogWithTag('Socket', '=== CONNECT END ===');
		} catch (error) {
			logError('Failed to create socket:', error);
			devLogWithTag('Socket', 'Socket creation failed:', error);
			devLogWithTag('Socket', '=== CONNECT FAILED ===');
		}
	}

	private disconnectSocket() {
		this.socket?.removeAllListeners();
		this.socket?.disconnect();
		this.socket = null;
		this.currentUrl = null;
	}

	private createSocketConnection(socketUrl: string, token: string) {
		// 모바일 환경에서는 polling 우선 (네트워크 안정성), 웹에서는 websocket 우선
		const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
		const transports = isMobile
			? ['polling', 'websocket'] // 모바일: polling 우선 (WiFi↔LTE 전환 시 안정적)
			: ['websocket', 'polling']; // 웹: websocket 우선

		const options = {
			transports,
			upgrade: true, // polling → websocket 자동 업그레이드
			withCredentials: true,
			secure: process.env.NODE_ENV === 'production',
			rejectUnauthorized: true,
			auth: { token: `Bearer ${token}` },

			// 재연결 설정 (ALB timeout 3600초 대응)
			reconnection: true,
			reconnectionAttempts: 20, // 5 → 20 (더 많은 재시도)
			reconnectionDelay: 1000, // 첫 재연결 1초 후
			reconnectionDelayMax: 5000, // 최대 5초 간격
			randomizationFactor: 0.5, // jitter 추가 (thundering herd 방지)

			timeout: 25000, // 연결 타임아웃 25초 (모바일 네트워크 지연 대응)
			forceNew: !!this.socket,
		};

		devLogWithTag('Socket', 'Creating socket with options:', {
			url: socketUrl,
			transports: options.transports,
			withCredentials: options.withCredentials,
			secure: options.secure,
			hasAuth: !!options.auth,
			timeout: options.timeout,
		});

		this.socket = io(socketUrl, options);
		this.currentUrl = socketUrl;

		devLogWithTag('Socket', 'Socket instance created');
	}

	private registerSocketListeners() {
		if (!this.socket) return;

		this.registerConnectHandler();
		this.registerDisconnectHandler();
		this.registerErrorHandler();
		this.registerMessageListeners();
		this.registerManagerEventHandlers();
	}

	private registerManagerEventHandlers() {
		if (!this.socket?.io) return;

		// 재연결 성공
		this.socket.io.on('reconnect', (attempt) => {
			devLogWithTag('Socket', `Reconnected after ${attempt} attempts`);
			this.reconnectAttempts = 0;
			this.isReconnecting = false;
			chatEventBus.emit({
				type: 'SOCKET_CONNECTED',
				payload: { reconnected: true, attempts: attempt },
			});
		});

		// 재연결 시도
		this.socket.io.on('reconnect_attempt', (attempt) => {
			devLogWithTag('Socket', `Reconnect attempt: ${attempt}`);
		});

		// 재연결 실패 (모든 시도 소진)
		this.socket.io.on('reconnect_failed', () => {
			devLogWithTag('Socket', 'All reconnection attempts failed');
			chatEventBus.emit({
				type: 'SOCKET_RECONNECT_FAILED',
				payload: { error: 'All reconnection attempts exhausted' },
			});
		});

		// 재연결 에러
		this.socket.io.on('reconnect_error', (error) => {
			devLogWithTag('Socket', 'Reconnect error:', error.message);
		});
	}

	private registerConnectHandler() {
		this.socket?.on('connect', () => {
			devLogWithTag('Socket', 'Connected successfully');
			this.reconnectAttempts = 0;
			this.isReconnecting = false;
			this.lastSuccessfulSend = Date.now();
			this.lastPongReceived = Date.now(); // Health check 초기화
			chatEventBus.emit({ type: 'SOCKET_CONNECTED', payload: {} });
			this.processPendingMessages();
			this.startHealthCheck(); // Health check 시작
		});
	}

	private registerDisconnectHandler() {
		this.socket?.on('disconnect', (reason) => {
			devLogWithTag('Socket', 'Disconnected:', reason);
			this.stopHealthCheck(); // Health check 중지
			chatEventBus.emit({ type: 'SOCKET_DISCONNECTED', payload: { reason } });

			// 'io server disconnect' → 서버가 강제로 끊음 (수동 재연결 필요)
			if (reason === 'io server disconnect') {
				devLogWithTag('Socket', 'Server disconnected, manual reconnect needed');
				this.socket?.connect(); // 수동 재연결
				return;
			}

			// 'transport close', 'ping timeout' → Socket.IO가 자동 재연결 시도함
			// 추가적인 수동 재연결 로직은 불필요 (Socket.IO 내장 재연결 사용)
		});
	}

	private registerErrorHandler() {
		this.socket?.on('connect_error', (error) => {
			logError('Socket connection error:', error.message);
			devLogWithTag('Socket', 'Connection failed:', error.message);
			chatEventBus.emit({
				type: 'SOCKET_DISCONNECTED',
				payload: { reason: `connect_error: ${error.message}` },
			});
		});

		this.socket?.on('error', (error: { message?: string }) => {
			logError('Socket error:', error);
			devLogWithTag('Socket', 'Error:', error);

			const errorMessage = error?.message || '';
			const isSessionClosed =
				errorMessage.includes('Client was closed') || errorMessage.includes('not queryable');

			if (isSessionClosed) {
				devLogWithTag('Socket', 'Server session closed detected, forcing reconnect...');
				this.forceReconnect();
			}
		});
	}

	private forceReconnect() {
		devLogWithTag('Socket', 'Force reconnecting due to server session closed...');

		this.disconnectSocket();
		this.reconnectAttempts = 0;
		this.isReconnecting = false;

		chatEventBus.emit({
			type: 'SOCKET_DISCONNECTED',
			payload: { reason: 'server_session_closed' },
		});
	}

	private registerMessageListeners() {
		this.socket?.on('newMessage', (chat) => {
			chatEventBus.emit({ type: 'MESSAGE_RECEIVED', payload: chat });
		});

		this.socket?.on('readMessages', (chatRoomId) => {
			chatEventBus.emit({ type: 'MESSAGES_READ', payload: chatRoomId });
		});

		this.socket?.on('messageUpdated', (payload) => {
			chatEventBus.emit({ type: 'IMAGE_UPLOAD_STATUS_CHANGED', payload });
		});
	}

	public resetReconnection() {
		this.reconnectAttempts = 0;
		this.isReconnecting = false;
	}

	public clearPendingMessages() {
		this.pendingMessages = [];
	}

	public getConnectionStatus() {
		return {
			connected: this.socket?.connected || false,
			reconnectAttempts: this.reconnectAttempts,
			isReconnecting: this.isReconnecting,
			pendingMessagesCount: this.pendingMessages.length,
		};
	}

	public get isConnected(): boolean {
		return this.socket?.connected || false;
	}

	public get isModuleInitialized(): boolean {
		return this.isInitialized;
	}
}

export const socketConnectionManager = new SocketConnectionManager();
