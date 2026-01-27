import { commonHandlers } from '@/src/shared/services/common-error-handler';

import i18n from '@/src/shared/libs/i18n';
import { Text } from 'react-native';
import type { ErrorHandler } from '../../../types/error-handler';

const handleAuth: ErrorHandler = {
	handle: (error, { router, showModal }) => {
		const errorMessage = i18n.t('features.chat.services.error_handlers.auth_failed');
		showModal({
			title: i18n.t('features.chat.services.error_handlers.notification'),
			children: <Text>{errorMessage}</Text>,
			primaryButton: {
				text: i18n.t('features.chat.services.error_handlers.login'),
				onClick: () => router.push('/auth/login'),
			},
		});
	},
};

const handlePayment: ErrorHandler = {
	handle: (error, { router, showModal }) => {
		const errorMessage = i18n.t('features.chat.services.error_handlers.insufficient_funds');
		showModal({
			title: i18n.t('features.chat.services.error_handlers.notification'),
			children: <Text>{errorMessage}</Text>,
			primaryButton: {
				text: i18n.t('features.chat.services.error_handlers.go_to_purchase'),
				onClick: () => router.push('/purchase/gem-store'),
			},
			secondaryButton: {
				text: i18n.t('features.chat.services.error_handlers.cancel'),
				onClick: () => {},
			},
		});
	},
};

const handleNotFound: ErrorHandler = {
	handle: (error, { router, showModal }) => {
		const errorMessage = i18n.t('features.chat.services.error_handlers.chat_room_not_found');
		showModal({
			title: i18n.t('features.chat.services.error_handlers.notification'),
			children: <Text>{errorMessage}</Text>,
			primaryButton: {
				text: i18n.t('features.chat.services.error_handlers.confirm'),
				onClick: () => {},
			},
		});
	},
};

export const chatEnterErrorHandlers: Record<number | string, ErrorHandler> = {
	...commonHandlers,
	401: handleAuth,
	403: handlePayment,
	404: handleNotFound,
};
