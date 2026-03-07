import type { CurrentGem } from '@/src/features/payment/api';
import { dayUtils } from '@/src/shared/libs';
import { devLogWithTag, devWarn } from '@/src/shared/utils';
import type { QueryClient } from '@tanstack/react-query';
import type { Subscription } from 'rxjs';
import type { Chat, ChatRoomDetail, ChatRoomList, ChatRoomListResponse } from '../types/chat';
import { chatEventBus } from './chat-event-bus';

declare const globalThis: {
	__queryCacheManagerSubscriptions?: Subscription[];
};

class QueryCacheManager {
	private queryClient: QueryClient | null = null;

	initialize(queryClient: QueryClient) {
		this.cleanupSubscriptions();

		this.queryClient = queryClient;
		globalThis.__queryCacheManagerSubscriptions = [];

		this.addSubscription(
			chatEventBus.on('MESSAGE_OPTIMISTIC_ADDED').subscribe(({ payload }) => {
				this.addOptimisticMessageToCache(payload.chatRoomId, payload);
			}),
		);

		this.addSubscription(
			chatEventBus.on('IMAGE_OPTIMISTIC_ADDED').subscribe(({ payload }) => {
				this.addOptimisticMessageToCache(
					payload.optimisticMessage.chatRoomId,
					payload.optimisticMessage,
				);
			}),
		);

		this.addSubscription(
			chatEventBus.on('MESSAGE_SEND_SUCCESS').subscribe(({ payload }) => {
				this.replaceMessageInCache(
					payload.serverMessage.chatRoomId,
					// biome-ignore lint/style/noNonNullAssertion: <explanation>
					payload.serverMessage.tempId!,
					payload.serverMessage,
				);
				this.updateChatRoomPreview(payload.serverMessage.chatRoomId, payload.serverMessage, {
					resetUnread: true,
				});
			}),
		);

		this.addSubscription(
			chatEventBus.on('MESSAGES_READ_REQUESTED').subscribe(({ payload }) => {
				this.markRoomAsReadInCache(payload.chatRoomId);
			}),
		);

		this.addSubscription(
			chatEventBus.on('MESSAGE_SEND_FAILED').subscribe(({ payload }) => {
				this.markMessageAsFailedInCache(payload.tempId, payload.error);
			}),
		);

		this.addSubscription(
			chatEventBus.on('MESSAGE_RECEIVED').subscribe(({ payload }) => {
				this.addReceivedMessageToCache(payload.chatRoomId, payload);
			}),
		);

		this.addSubscription(
			chatEventBus.on('MESSAGES_READ').subscribe(({ payload }) => {
				this.markOutgoingMessagesAsReadInCache(payload.chatRoomId);
			}),
		);

		this.addSubscription(
			chatEventBus.on('IMAGE_UPLOAD_FAILED').subscribe(({ payload }) => {
				this.markMessageAsFailedInCache(payload.tempId, payload.error);
			}),
		);

		this.addSubscription(
			chatEventBus.on('IMAGE_UPLOAD_STATUS_CHANGED').subscribe(({ payload }) => {
				if (payload.uploadStatus === 'completed' && payload.mediaUrl && payload.id) {
					this.updateImageUrlInCache(payload.chatRoomId, payload.id, payload.mediaUrl);
				}
			}),
		);

		this.addSubscription(
			chatEventBus.on('IMAGE_UPLOAD_SUCCESS').subscribe(({ payload }) => {
				devLogWithTag('Chat Cache', 'Image upload success');
				this.replaceOptimisticMessageInCache(payload.tempId, payload.serverMessage);
				this.updateChatRoomPreview(payload.serverMessage.chatRoomId, payload.serverMessage, {
					resetUnread: true,
				});
			}),
		);

		this.addSubscription(
			chatEventBus.on('MESSAGE_RETRY_REQUESTED').subscribe(({ payload }) => {
				const tempId = payload.message.tempId;
				if (tempId) {
					devLogWithTag('Chat Cache', 'Message retry requested:', tempId);
					this.markMessageAsRetryingInCache(tempId);
				}
			}),
		);

		this.addSubscription(
			chatEventBus.on('CHAT_ROOM_CREATED').subscribe(({ payload }) => {
				if (payload.chatRoom) {
					this.upsertChatRoomInCache(payload.chatRoom);
					return;
				}

				this.queryClient?.invalidateQueries({
					queryKey: ['chat-room'],
					refetchType: 'active',
				});
			}),
		);

		this.addSubscription(
			chatEventBus.on('CHAT_ROOM_META_UPDATED').subscribe(({ payload }) => {
				this.applyChatRoomMetaUpdate(payload);
			}),
		);

		devLogWithTag('Chat Cache', 'QueryCacheManager initialized');
	}

	private cleanupSubscriptions() {
		if (globalThis.__queryCacheManagerSubscriptions?.length) {
			devLogWithTag(
				'Chat Cache',
				`Cleaning up ${globalThis.__queryCacheManagerSubscriptions.length} subscriptions...`,
			);
			for (const sub of globalThis.__queryCacheManagerSubscriptions) {
				sub.unsubscribe();
			}
			globalThis.__queryCacheManagerSubscriptions = [];
		}
	}

	private addSubscription(subscription: Subscription) {
		globalThis.__queryCacheManagerSubscriptions?.push(subscription);
	}

	private addOptimisticMessageToCache(chatRoomId: string, message: Chat) {
		this.queryClient?.setQueryData(
			['chat-list', chatRoomId],
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			(oldData: any) => {
				if (!oldData) {
					return {
						pages: [{ messages: [message] }],
						pageParams: [undefined],
					};
				}

				const updatedPages = oldData.pages.map(
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					(page: any, index: number) => {
						if (index === 0) {
							return {
								...page,
								messages: [message, ...page.messages],
							};
						}
						return page;
					},
				);

				return {
					...oldData,
					pages: updatedPages,
				};
			},
		);
	}

	private replaceMessageInCache(chatRoomId: string, tempId: string, serverMessage: Chat) {
		this.queryClient?.setQueryData(
			['chat-list', chatRoomId],
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			(oldData: any) => {
				if (!oldData) return oldData;

				const updatedPages = oldData.pages.map(
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					(page: any) => ({
						...page,
						messages: page.messages.map((message: Chat) =>
							message.tempId === tempId || message.id === tempId
								? {
										...serverMessage,
										optimistic: false,
										sendingStatus: 'sent',
									}
								: message,
						),
					}),
				);

				return {
					...oldData,
					pages: updatedPages,
				};
			},
		);
	}

	private markMessageAsRetryingInCache(tempId: string) {
		const queries = this.queryClient?.getQueryCache().findAll({
			queryKey: ['chat-list'],
			predicate: (query) => {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				const data = query.state.data as any;
				if (!data?.pages) return false;
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				return data.pages.some((page: any) =>
					page.messages.some((msg: Chat) => msg.tempId === tempId),
				);
			},
		});

		// biome-ignore lint/complexity/noForEach: <explanation>
		queries?.forEach((query) => {
			const chatRoomId = query.queryKey[1];
			this.queryClient?.setQueryData(
				['chat-list', chatRoomId],
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				(oldData: any) => {
					if (!oldData) return oldData;
					const updatedPages = oldData.pages.map(
						// biome-ignore lint/suspicious/noExplicitAny: <explanation>
						(page: any) => ({
							...page,
							messages: page.messages.map((message: Chat) =>
								message.tempId === tempId || message.id === tempId
									? {
											...message,
											sendingStatus: 'sending' as const,
										}
									: message,
							),
						}),
					);
					return { ...oldData, pages: updatedPages };
				},
			);
		});
	}

	private markMessageAsFailedInCache(tempId: string, error?: string) {
		const queries = this.queryClient?.getQueryCache().findAll({
			queryKey: ['chat-list'],
			predicate: (query) => {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				const data = query.state.data as any;
				if (!data?.pages) return false;
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				return data.pages.some((page: any) =>
					page.messages.some((msg: Chat) => msg.tempId === tempId),
				);
			},
		});

		// biome-ignore lint/complexity/noForEach: <explanation>
		queries?.forEach((query) => {
			const chatRoomId = query.queryKey[1];
			this.queryClient?.setQueryData(
				['chat-list', chatRoomId],
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				(oldData: any) => {
					if (!oldData) return oldData;
					const updatedPages = oldData.pages.map(
						// biome-ignore lint/suspicious/noExplicitAny: <explanation>
						(page: any) => ({
							...page,
							messages: page.messages.map((message: Chat) =>
								message.tempId === tempId || message.id === tempId
									? {
											...message,
											sendingStatus: 'failed' as const,
											uploadStatus:
												message.messageType === 'image'
													? ('failed' as const)
													: message.uploadStatus,
										}
									: message,
							),
						}),
					);
					return { ...oldData, pages: updatedPages };
				},
			);
		});

		if (error) {
			console.error('Message send failed2:', error);
		}
	}

	private addReceivedMessageToCache(chatRoomId: string, message: Chat) {
		let messageInserted = false;

		this.queryClient?.setQueryData(
			['chat-list', chatRoomId],
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			(oldData: any) => {
				if (!oldData) return oldData;

				const messageExists = oldData.pages.some(
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					(page: any) => page.messages.some((msg: Chat) => msg.id === message.id),
				);
				if (messageExists) return oldData;
				messageInserted = true;

				const updatedPages = oldData.pages.map(
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					(page: any, index: number) => {
						if (index === 0) {
							return {
								...page,
								messages: [message, ...page.messages],
							};
						}
						return page;
					},
				);
				return {
					...oldData,
					pages: updatedPages,
				};
			},
		);

		if (!chatRoomId || !message) {
			devWarn('Invalid chat message received');
			return;
		}

		if (!messageInserted) {
			return;
		}

		this.updateChatRoomPreview(chatRoomId, message, { incrementUnread: true });
	}

	private markRoomAsReadInCache(chatRoomId: string) {
		const chatRoomQueryKey = ['chat-room'];

		this.queryClient?.setQueryData<{
			pages: ChatRoomListResponse[];
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			pageParams: any[];
		}>(chatRoomQueryKey, (oldData) => {
			if (!oldData) return oldData;
			devLogWithTag('Chat Cache', 'Marking as read:', chatRoomId);
			const updatedPages = oldData.pages.map((page) => ({
				...page,
				chatRooms: page.chatRooms.map((room) =>
					room.id === chatRoomId ? { ...room, unreadCount: 0 } : room,
				),
			}));

			return {
				...oldData,
				pages: updatedPages,
			};
		});

		this.queryClient?.invalidateQueries({
			queryKey: ['notifications', 'unread-count'],
		});
	}

	private replaceOptimisticMessageInCache(tempId: string, serverMessage: Chat) {
		this.queryClient?.setQueryData(
			['chat-list', serverMessage.chatRoomId],
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			(oldData: any) => {
				if (!oldData) return oldData;

				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				const updatedPages = oldData.pages.map((page: any) => ({
					...page,
					messages: page.messages.map((message: Chat) =>
						message.tempId === tempId || message.id === tempId
							? { ...serverMessage, optimistic: false, sendingStatus: 'sent' }
							: message,
					),
				}));

				return {
					...oldData,
					pages: updatedPages,
				};
			},
		);
	}

	private markOutgoingMessagesAsReadInCache(chatRoomId: string) {
		this.queryClient?.setQueryData(
			['chat-list', chatRoomId],
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			(oldData: any) => {
				if (!oldData) return oldData;

				const updatedPages = oldData.pages.map(
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					(page: any) => ({
						...page,
						messages: page.messages.map((message: Chat) =>
							message.isMe && !message.optimistic ? { ...message, isRead: true } : message,
						),
					}),
				);

				return {
					...oldData,
					pages: updatedPages,
				};
			},
		);
	}

	private updateChatRoomPreview(
		chatRoomId: string,
		message: Pick<Chat, 'content' | 'createdAt' | 'messageType'>,
		options?: { incrementUnread?: boolean; resetUnread?: boolean },
	) {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		this.queryClient?.setQueryData(['chat-room'], (oldData: any) => {
			if (!oldData) {
				return oldData;
			}

			let roomFound = false;

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			const pages = oldData.pages.map((page: any) => {
				if (!page.chatRooms || !Array.isArray(page.chatRooms)) {
					return page;
				}

				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				const updatedChatRooms = page.chatRooms.map((room: any) => {
					if (room.id !== chatRoomId) {
						return room;
					}

					roomFound = true;

					const nextUnreadCount = options?.resetUnread
						? 0
						: options?.incrementUnread
							? (room.unreadCount || 0) + 1
							: room.unreadCount || 0;

					return {
						...room,
						recentMessage: message.messageType === 'image' ? '' : message.content,
						recentDate: message.createdAt || dayUtils.create().format(),
						unreadCount: nextUnreadCount,
					};
				});

				return {
					...page,
					chatRooms: updatedChatRooms,
				};
			});

			if (!roomFound) {
				devWarn(`Chat room ${chatRoomId} not found in cache`);
			}

			return {
				...oldData,
				pages,
			};
		});
	}

	private applyChatRoomMetaUpdate(payload: {
		chatRoomId: string;
		hasLeft?: boolean;
		roomActivation?: boolean;
		canRefund?: boolean;
		paymentConfirm?: boolean;
		refundedGems?: number;
		totalGems?: number;
	}) {
		this.queryClient?.setQueryData<ChatRoomDetail>(
			['chat-detail', payload.chatRoomId],
			(oldData) => {
				if (!oldData) return oldData;

				return {
					...oldData,
					hasLeft: payload.hasLeft ?? oldData.hasLeft,
					roomActivation: payload.roomActivation ?? oldData.roomActivation,
					canRefund: payload.canRefund ?? oldData.canRefund,
					paymentConfirm: payload.paymentConfirm ?? oldData.paymentConfirm,
				};
			},
		);

		this.queryClient?.setQueryData<{
			pages: ChatRoomListResponse[];
			pageParams: unknown[];
		}>(['chat-room'], (oldData) => {
			if (!oldData) return oldData;

			const updatedPages = oldData.pages.map((page) => ({
				...page,
				chatRooms: page.chatRooms.map((room) =>
					room.id === payload.chatRoomId
						? {
								...room,
								roomActivation: payload.roomActivation ?? room.roomActivation,
								canRefund: payload.canRefund ?? room.canRefund,
								paymentConfirm: payload.paymentConfirm ?? room.paymentConfirm,
							}
						: room,
				),
			}));

			return {
				...oldData,
				pages: updatedPages,
			};
		});

		if (typeof payload.totalGems === 'number') {
			const totalGems = payload.totalGems;
			this.queryClient?.setQueryData<CurrentGem>(['gem', 'current'], (oldData) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					totalGem: totalGems,
				};
			});
		}
	}

	private upsertChatRoomInCache(chatRoom: ChatRoomList) {
		this.queryClient?.setQueryData<{
			pages: ChatRoomListResponse[];
			pageParams: unknown[];
		}>(['chat-room'], (oldData) => {
			if (!oldData) {
				return {
					pages: [
						{
							chatRooms: [chatRoom],
							nextCursor: null,
							hasMore: false,
						},
					],
					pageParams: [undefined],
				};
			}

			const updatedPages = oldData.pages.map((page) => ({
				...page,
				chatRooms: page.chatRooms.filter((room) => room.id !== chatRoom.id),
			}));

			const [firstPage, ...restPages] = updatedPages;

			return {
				...oldData,
				pages: [
					{
						...firstPage,
						chatRooms: [chatRoom, ...firstPage.chatRooms],
					},
					...restPages,
				],
			};
		});
	}

	private updateImageUrlInCache(chatRoomId: string, messageId: string, mediaUrl: string) {
		this.queryClient?.setQueryData(
			['chat-list', chatRoomId],
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			(oldData: any) => {
				if (!oldData) {
					return oldData;
				}

				const updatedPages = oldData.pages.map(
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					(page: any) => ({
						...page,
						messages: page.messages.map((message: Chat) => {
							if (message.id === messageId) {
								return {
									...message,
									mediaUrl,
									uploadStatus: 'completed' as const,
								};
							}
							return message;
						}),
					}),
				);

				return {
					...oldData,
					pages: updatedPages,
				};
			},
		);
	}

	cleanup() {
		devLogWithTag('Chat Cache', 'Cleaning up QueryCacheManager...');
		this.cleanupSubscriptions();
		this.queryClient = null;
	}
}

export const queryCacheManager = new QueryCacheManager();
