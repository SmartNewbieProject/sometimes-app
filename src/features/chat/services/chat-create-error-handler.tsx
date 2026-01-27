import { JP_IDENTITY_REQUIRED_MESSAGE } from '@/src/features/jp-identity/types';
import i18n from '@/src/shared/libs/i18n';
import type { ModalOptions } from '@/src/shared/providers/modal-provider';
import { commonHandlers } from '@/src/shared/services/common-error-handler';
import type { AxiosError } from 'axios';
import type { useRouter } from 'expo-router';
import { Text } from 'react-native';
import type { ErrorHandler } from '../../../types/error-handler';

const handleConflict: ErrorHandler = {
	handle: (error, { router, showModal }) => {
		const errorMessage =
			error.error ||
			error.message ||
			i18n.t('features.chat.services.error_handlers.chat_already_exists');
		showModal({
			title: i18n.t('features.chat.services.error_handlers.notification'),
			children: <Text>{errorMessage}</Text>,
			primaryButton: {
				text: i18n.t('features.chat.services.error_handlers.go_to_chat_list'),
				onClick: () => router.push('/chat'),
			},
		});
	},
};

const handleForbidden: ErrorHandler = {
	handle: (error, { router, showModal }) => {
		const errorMessage =
			error.error || error.message || i18n.t('features.chat.services.error_handlers.general_error');
		const isJapanese = i18n.language === 'ja';

		if (errorMessage === JP_IDENTITY_REQUIRED_MESSAGE) {
			showModal({
				title: i18n.t('features.chat.services.jp_identity.verification_required_title'),
				children: (
					<Text>{i18n.t('features.chat.services.jp_identity.verification_required_message')}</Text>
				),
				primaryButton: {
					text: i18n.t('features.chat.services.jp_identity.go_to_verification'),
					onClick: () => router.push('/jp-identity'),
				},
				secondaryButton: {
					text: i18n.t('features.chat.services.jp_identity.later'),
					onClick: () => {},
				},
				buttonLayout: isJapanese ? 'vertical' : 'horizontal',
			});
			return;
		}

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

export const errorHandlers: Record<number | string, ErrorHandler> = {
	...commonHandlers,
	403: handleForbidden,
	409: handleConflict,
};
