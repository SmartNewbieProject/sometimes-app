import { uriToBase64 } from '@/src/shared/utils/image';
import { fromEvent } from 'rxjs';
import { type Socket, io } from 'socket.io-client';
import { buildChatSocketUrl } from '../domain/utils/build-socket-url';
import { type RNFileLike, fileToBase64Payload } from '../domain/utils/file-to-base64';
import type { Chat } from '../types/chat';
import { generateTempId } from '../utils/generate-temp-id';
import { compressImage, isImageTooLarge } from '../utils/image-compression';
import { chatEventBus } from './chat-event-bus';

class SocketConnectionManager {
	private socket: Socket | null = null;
	private currentUrl: string | null = null;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000;
	private isReconnecting = false;
	private pendingMessages: Array<{
		event: string;
		payload: any;
		callback?: (response: any) => void;
	}> = [];

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
					console.log('check2');
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

	private processPendingMessages() {
		if (!this.socket?.connected) return;

		while (this.pendingMessages.length > 0) {
			const message = this.pendingMessages.shift();
			if (message) {
				console.log(`Processing queued message: ${message.event}`);
				if (message.callback) {
					this.socket.emit(message.event, message.payload, message.callback);
				} else {
					this.socket.emit(message.event, message.payload);
				}
			}
		}
	}

	private attemptReconnect() {
		if (this.isReconnecting) {
			console.log('Already attempting to reconnect...');
			return;
		}

		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.error('Max reconnection attempts reached');
			chatEventBus.emit({
				type: 'SOCKET_RECONNECT_FAILED',
				payload: { error: 'Max reconnection attempts reached' },
			});
			return;
		}

		this.isReconnecting = true;
		this.reconnectAttempts++;

		console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

		chatEventBus.emit({
			type: 'SOCKET_RECONNECTING',
			payload: { attempt: this.reconnectAttempts },
		});

		setTimeout(() => {
			if (this.socket && !this.socket.connected) {
				this.socket.connect();
			}
			this.isReconnecting = false;
		}, this.reconnectDelay * this.reconnectAttempts);
	}

	initialize() {
		this.setupConnectionHandlers();
		this.setupMessageHandlers();
		this.setupRoomHandlers();
		this.setupImageUploadHandlers();
	}

	private setupConnectionHandlers() {
		chatEventBus.on('CONNECTION_REQUESTED').subscribe(({ payload }) => {
			this.connect(payload.url, payload.token);
		});
	}

	private setupMessageHandlers() {
		chatEventBus.on('MESSAGES_READ_REQUESTED').subscribe(({ payload }) => {
			this.socket?.emit('readMessages', { chatRoomId: payload.chatRoomId });
		});

		chatEventBus.on('MESSAGE_SEND_REQUESTED').subscribe(({ payload }) => {
			this.handleMessageSend(payload);
		});
	}

	private setupRoomHandlers() {
		chatEventBus.on('CHAT_ROOM_JOIN_REQUESTED').subscribe(({ payload }) => {
			console.log(`Joining room: ${payload.chatRoomId}`);
			this.socket?.emit('joinRoom', { chatRoomId: payload.chatRoomId });
		});

		chatEventBus.on('CHAT_ROOM_LEAVE_REQUESTED').subscribe(({ payload }) => {
			console.log(`Leaving room: ${payload.chatRoomId}`);
			this.socket?.emit('leaveRoom', { chatRoomId: payload.chatRoomId });
		});
	}

	private setupImageUploadHandlers() {
		chatEventBus.on('IMAGE_OPTIMISTIC_ADDED').subscribe(async ({ payload }) => {
			await this.handleImageUpload(payload);
		});
	}

	private handleMessageSend(payload: any) {
		console.log('payload1', payload);

		if (!this.socket?.connected) {
			console.warn('Socket not connected, attempting reconnection...');
			this.attemptReconnect();
			this.queueMessage('sendMessage', payload);
			return;
		}

		this.socket?.emit(
			'sendMessage',
			payload,
			(response: { success: boolean; serverMessage: Chat; error?: string }) => {
				console.log('payload2', payload, response);

				if (response?.success) {
					this.emitMessageSuccess(response.serverMessage, payload.tempId);
				} else {
					this.handleMessageFailure(response?.error, payload);
				}
			},
		);
	}

	private emitMessageSuccess(serverMessage: Chat, tempId: string) {
		chatEventBus.emit({
			type: 'MESSAGE_SEND_SUCCESS',
			payload: {
				success: true,
				serverMessage,
				tempId,
			},
		});
	}

	private handleMessageFailure(error: string | undefined, payload: any) {
		if (!this.socket?.connected) {
			console.warn('Message send failed due to disconnection, attempting reconnection...');
			this.attemptReconnect();
			this.queueMessage('sendMessage', payload);
		} else {
			chatEventBus.emit({
				type: 'MESSAGE_SEND_FAILED',
				payload: {
					success: false,
					error: error || 'Unknown error',
					tempId: payload.tempId,
				},
			});
		}
	}

	private async handleImageUpload(payload: { options: any; optimisticMessage: Chat }) {
		const { options, optimisticMessage } = payload;
		const { tempId } = optimisticMessage;

		if (!this.socket) {
			this.emitImageUploadFailure('Socket not connected', tempId!);
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
				console.warn('이미지 압축 실패, 원본 사용:', compressionError);
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
		const socketUrl = buildChatSocketUrl(url, '/chat', token);

		if (this.socket && this.currentUrl !== socketUrl) {
			this.disconnectSocket();
		}

		if (this.socket && this.currentUrl === socketUrl && this.socket.connected) {
			return this.socket;
		}

		if (this.socket && !this.socket.connected) {
			this.disconnectSocket();
		}

		this.createSocketConnection(socketUrl, token);
		this.registerSocketListeners();
	}

	private disconnectSocket() {
		this.socket?.removeAllListeners();
		this.socket?.disconnect();
		this.socket = null;
		this.currentUrl = null;
	}

	private createSocketConnection(socketUrl: string, token: string) {
		this.socket = io(socketUrl, {
			transports: ['websocket', 'polling'],
			withCredentials: true,
			secure: process.env.NODE_ENV === 'production',
			rejectUnauthorized: true,
			auth: { token: `Bearer ${token}` },
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			timeout: 20000,
			forceNew: !!this.socket,
		});
		this.currentUrl = socketUrl;
	}

	private registerSocketListeners() {
		if (!this.socket) return;

		this.registerConnectHandler();
		this.registerDisconnectHandler();
		this.registerMessageListeners();
	}

	private registerConnectHandler() {
		this.socket?.on('connect', () => {
			console.log('Socket connected');
			this.reconnectAttempts = 0;
			this.isReconnecting = false;
			chatEventBus.emit({ type: 'SOCKET_CONNECTED', payload: {} });
			this.processPendingMessages();
		});
	}

	private registerDisconnectHandler() {
		this.socket?.on('disconnect', (reason) => {
			console.log('Socket disconnected:', reason);
			chatEventBus.emit({ type: 'SOCKET_DISCONNECTED', payload: { reason } });

			const shouldReconnect = reason === 'io server disconnect' || reason === 'transport close';
			if (shouldReconnect) {
				console.warn('Unexpected disconnect, attempting reconnection...');
				this.attemptReconnect();
			}
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
}

export const socketConnectionManager = new SocketConnectionManager();
