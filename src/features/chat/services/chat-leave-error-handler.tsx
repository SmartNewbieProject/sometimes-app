import i18n from '@/src/shared/libs/i18n';
import { commonHandlers } from '@/src/shared/services/common-error-handler';
import type { ErrorHandler } from '@/src/types/error-handler';
import { Text } from 'react-native';

const handleChatRoomForbidden: ErrorHandler = {
	handle: (error, { showModal, router }) => {
		const errorMessage =
			error?.error ||
			error?.message ||
			i18n.t('features.chat.services.error_handlers.no_access_permission');
		showModal({
			title: i18n.t('features.chat.services.error_handlers.notification'),
			children: <Text>{errorMessage}</Text>,
			primaryButton: {
				text: i18n.t('features.chat.services.error_handlers.confirm'),
				onClick: () => router.push('/chat'),
			},
		});
	},
};

const handlerChatRoomNotFound: ErrorHandler = {
	handle: (error, { router, showModal }) => {
		const errorMessage =
			error?.error ||
			error?.message ||
			i18n.t('features.chat.services.error_handlers.chat_room_not_found');
		showModal({
			title: i18n.t('features.chat.services.error_handlers.permission_error'),
			children: <Text>{errorMessage}</Text>,
			primaryButton: {
				text: i18n.t('features.chat.services.error_handlers.confirm'),
				onClick: () => router.push('/chat'),
			},
		});
	},
};

export const chatLeaveErrorHandlers: Record<number | string, ErrorHandler> = {
	...commonHandlers,
	403: handleChatRoomForbidden,
	404: handlerChatRoomNotFound,
};
