import { commonHandlers } from '@/src/shared/services/common-error-handler';
import i18n from '@/src/shared/libs/i18n';
import type { ErrorHandler } from '@/src/types/error-handler';
import { Text } from 'react-native';

const handleBadRequest: ErrorHandler = {
	handle: (error, { showModal }) => {
		const errorMessage = i18n.t('common.잘못된_요청입니다');
		showModal({
			title: i18n.t('common.알림'),
			children: <Text>{errorMessage}</Text>,
			primaryButton: { text: i18n.t('common.확인'), onClick: () => {} },
		});
	},
};

const handleChatRoomForbidden: ErrorHandler = {
	handle: (error, { showModal, router }) => {
		const errorMessage =
			error?.error || error?.message || i18n.t('common.채팅방_접근_권한이_존재하지_않습니다');
		showModal({
			title: i18n.t('common.알림'),
			children: <Text>{errorMessage}</Text>,
			primaryButton: { text: i18n.t('common.확인'), onClick: () => router.push('/chat') },
		});
	},
};

export const chatSnoozeErrorHandlers: Record<number | string, ErrorHandler> = {
	...commonHandlers,
	400: handleBadRequest,
	403: handleChatRoomForbidden,
};
