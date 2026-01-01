import type { ErrorHandler } from '@/src/types/error-handler';
import i18n from '@/src/shared/libs/i18n';
import { Text } from 'react-native';

const handleBadRequest: ErrorHandler = {
	handle: (error, { showModal }) => {
		const errorMessage = error.error || i18n.t('common.잘못된_요청입니다');
		showModal({
			title: i18n.t('common.알림'),
			children: <Text>{errorMessage}</Text>,
			primaryButton: { text: i18n.t('common.확인'), onClick: () => {} },
		});
	},
};

const handleUnauthorized: ErrorHandler = {
	handle: (_, { router, showModal }) => {
		showModal({
			title: i18n.t('common.인증_오류'),
			children: <Text>로그인이 필요하거나 접근 권한이 없습니다.</Text>,
			primaryButton: {
				text: i18n.t('common.로그인_페이지로'),
				onClick: () => router.push('/auth/login'),
			},
		});
	},
};

const handleDefault: ErrorHandler = {
	handle: (_, { showErrorModal }) => {
		showErrorModal(
			i18n.t('common.서버에_문제가_발생했습니다_관리자에게_문의_바랍니다'),
			'announcement',
		);
	},
};

export const commonHandlers = {
	400: handleBadRequest,
	404: handleBadRequest,
	401: handleUnauthorized,
	default: handleDefault,
};
