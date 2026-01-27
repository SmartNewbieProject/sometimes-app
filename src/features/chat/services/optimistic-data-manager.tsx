import { dayUtils } from '@/src/shared/libs';
import { devLogWithTag } from '@/src/shared/utils';
import type { Subscription } from 'rxjs';
import type { Chat } from '../types/chat';
import { generateTempId } from '../utils/generate-temp-id';
import { chatEventBus } from './chat-event-bus';

declare const globalThis: {
	__optimisticDataManagerSubscriptions?: Subscription[];
};

class OptimisticDataManager {
	initialize() {
		this.cleanupSubscriptions();
		globalThis.__optimisticDataManagerSubscriptions = [];

		this.addSubscription(
			chatEventBus.on('MESSAGE_SEND_REQUESTED').subscribe(({ payload }) => {
				const optimisticMessage: Chat = {
					id: payload.tempId,
					tempId: payload.tempId,
					chatRoomId: payload.chatRoomId,
					senderId: payload.senderId,
					messageType: 'text',
					content: payload.content,
					createdAt: dayUtils.create().format(),
					updatedAt: dayUtils.create().format(),
					isMe: true,
					isRead: false,
					sendingStatus: 'sending',
					optimistic: true,
				};

				chatEventBus.emit({
					type: 'MESSAGE_OPTIMISTIC_ADDED',
					payload: optimisticMessage,
				});
			}),
		);

		this.addSubscription(
			chatEventBus.on('IMAGE_UPLOAD_REQUESTED').subscribe(({ payload }) => {
				const optimisticMessage: Chat = {
					id: payload.tempId,
					tempId: payload.tempId,
					chatRoomId: payload.chatRoomId,
					senderId: payload.senderId,
					messageType: 'image',
					content: '',
					createdAt: dayUtils.create().format(),
					updatedAt: dayUtils.create().format(),
					isMe: true,
					isRead: false,
					sendingStatus: 'sending',
					uploadStatus: 'uploading',
					optimistic: true,
					mediaUrl:
						typeof payload.file === 'object' && 'uri' in payload.file
							? payload.file.uri
							: typeof payload.file === 'string'
								? `data:image/jpeg;base64,${payload.file}`
								: '',
				};

				chatEventBus.emit({
					type: 'IMAGE_OPTIMISTIC_ADDED',
					payload: { optimisticMessage: optimisticMessage, options: payload },
				});
			}),
		);

		devLogWithTag('Optimistic', 'OptimisticDataManager initialized');
	}

	private cleanupSubscriptions() {
		if (globalThis.__optimisticDataManagerSubscriptions?.length) {
			devLogWithTag(
				'Optimistic',
				`Cleaning up ${globalThis.__optimisticDataManagerSubscriptions.length} subscriptions...`,
			);
			globalThis.__optimisticDataManagerSubscriptions.forEach((sub) => sub.unsubscribe());
			globalThis.__optimisticDataManagerSubscriptions = [];
		}
	}

	private addSubscription(subscription: Subscription) {
		globalThis.__optimisticDataManagerSubscriptions?.push(subscription);
	}

	cleanup() {
		devLogWithTag('Optimistic', 'Cleaning up OptimisticDataManager...');
		this.cleanupSubscriptions();
	}
}

export const optimisticDataManager = new OptimisticDataManager();
