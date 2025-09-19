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

	initialize() {
		chatEventBus.on('CONNECTION_REQUESTED').subscribe(({ payload }) => {
			this.connect(payload.url, payload.token);
		});

		chatEventBus.on('MESSAGES_READ_REQUESTED').subscribe(({ payload }) => {
			this.socket?.emit('readMessages', { chatRoomId: payload.chatRoomId });
		});
		chatEventBus.on('MESSAGE_SEND_REQUESTED').subscribe(({ payload }) => {
			console.log('payload1', payload);
			this.socket?.emit(
				'sendMessage',
				payload,
				(response: { success: boolean; serverMessage: Chat; error?: string }) => {
					console.log('payload2', payload, response);

					if (response?.success) {
						chatEventBus.emit({
							type: 'MESSAGE_SEND_SUCCESS',
							payload: {
								success: true,
								serverMessage: response.serverMessage,
								tempId: payload.tempId,
							},
						});
					} else {
						chatEventBus.emit({
							type: 'MESSAGE_SEND_FAILED',
							payload: {
								success: false,
								error: response?.error || 'Unknown error',
								tempId: payload.tempId,
							},
						});
					}
				},
			);
		});

		chatEventBus.on('CHAT_ROOM_JOIN_REQUESTED').subscribe(({ payload }) => {
			console.log(`Joining room: ${payload.chatRoomId}`);
			this.socket?.emit('joinRoom', { chatRoomId: payload.chatRoomId });
		});

		chatEventBus.on('CHAT_ROOM_LEAVE_REQUESTED').subscribe(({ payload }) => {
			console.log(`Leaving room: ${payload.chatRoomId}`);
			this.socket?.emit('leaveRoom', { chatRoomId: payload.chatRoomId });
		});

		chatEventBus.on('IMAGE_UPLOAD_REQUESTED').subscribe(async ({ payload }) => {
			if (!this.socket) {
				chatEventBus.emit({
					type: 'IMAGE_UPLOAD_FAILED',
					payload: { success: false, error: 'Socket not connected', tempId: payload.tempId },
				});
				return;
			}

			const { file } = payload;
			let base64: string;
			let mimeType = 'image/jpeg';

			if (typeof file === 'object' && 'uri' in file) {
				const base64Result = await uriToBase64(file.uri);
				base64 = base64Result || '';
				mimeType = 'image/jpeg'; // 기본값
			} else if (typeof file === 'string') {
				base64 = file;
				mimeType = 'image/jpeg';
			} else {
				const result = await fileToBase64Payload(file as RNFileLike);
				base64 = result.base64;
				mimeType = result.mimeType;
			}

			let finalImageData = base64;

			if (isImageTooLarge(base64, 5 * 1024 * 1024)) {
				try {
					finalImageData = await compressImage(base64, {
						maxWidth: 800,
						maxHeight: 800,
						quality: 0.7,
						format: 'jpeg',
					});
				} catch (compressionError) {
					console.warn('이미지 압축 실패, 원본 사용:', compressionError);
				}
			}
			const timeout = setTimeout(() => {
				chatEventBus.emit({
					type: 'IMAGE_UPLOAD_FAILED',
					payload: { success: false, error: 'Upload timeout', tempId: payload.tempId },
				});
				return;
			}, 30000);

			this.socket?.emit(
				'uploadImage',
				{
					to: payload.to,
					chatRoomId: payload.chatRoomId,
					imageData: finalImageData,
					mimeType,
					tempId: payload.tempId,
				},
				(response: {
					success: boolean;
					serverMessage: Chat;
					error?: string;
				}) => {
					clearTimeout(timeout);
					if (response?.success) {
						chatEventBus.emit({
							type: 'MESSAGE_SEND_SUCCESS',
							payload: {
								success: true,
								serverMessage: response.serverMessage,
								tempId: payload.tempId,
							},
						});
					} else {
						chatEventBus.emit({
							type: 'IMAGE_UPLOAD_FAILED',
							payload: {
								success: false,
								error: response?.error || 'Upload failed',
								tempId: payload.tempId,
							},
						});
					}
				},
			);
		});
	}

	private connect(url: string, token: string) {
		const socketUrl = buildChatSocketUrl(url, '/chat', token);
		if (this.socket && this.currentUrl !== socketUrl) {
			this.socket.removeAllListeners();
			this.socket.disconnect();
			this.socket = null;
			this.currentUrl = null;
		}

		if (this.socket && this.currentUrl === socketUrl && this.socket.connected) {
			return this.socket;
		}

		if (this.socket && !this.socket.connected) {
			this.socket.removeAllListeners();
			this.socket.disconnect();
		}
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

		this.registerSocketListeners(socketUrl, token);
	}

	private registerSocketListeners(url: string, token: string) {
		if (!this.socket) return;

		this.socket.on('connect', () => chatEventBus.emit({ type: 'SOCKET_CONNECTED', payload: {} }));
		this.socket.on('disconnect', (reason) => {
			chatEventBus.emit({ type: 'SOCKET_DISCONNECTED', payload: { reason } });
			chatEventBus.emit({ type: 'CONNECTION_REQUESTED', payload: { url, token } });
		});
		this.socket.on('newMessage', (chat) =>
			chatEventBus.emit({ type: 'MESSAGE_RECEIVED', payload: chat }),
		);
		this.socket.on('readMessages', (chatRoomId) => {
			chatEventBus.emit({ type: 'MESSAGES_READ', payload: chatRoomId });
		});
	}
}

export const socketConnectionManager = new SocketConnectionManager();
