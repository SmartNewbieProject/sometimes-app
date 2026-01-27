import { commonHandlers } from '@/src/shared/services/common-error-handler';
import type { ErrorHandler } from '@/src/types/error-handler';
import { Text } from 'react-native';

const handleInsufficientGems: ErrorHandler = {
	handle: (error, { router, showModal }) => {
		showModal({
			title: '구슬이 부족해요',
			children: <Text>프로필을 공개하려면 5구슬이 필요해요.</Text>,
			primaryButton: {
				text: '구슬 충전하기',
				onClick: () => router.push('/purchase/gem-store'),
			},
			secondaryButton: {
				text: '취소',
				onClick: () => {},
			},
		});
	},
};

const handleAlreadyRevealed: ErrorHandler = {
	handle: (error, { showModal }) => {
		showModal({
			title: '알림',
			children: <Text>이미 공개된 프로필이에요.</Text>,
			primaryButton: {
				text: '확인',
				onClick: () => {},
			},
		});
	},
};

const handleUserNotFound: ErrorHandler = {
	handle: (error, { showModal }) => {
		showModal({
			title: '알림',
			children: <Text>탈퇴하거나 휴면 상태인 사용자입니다.</Text>,
			primaryButton: {
				text: '확인',
				onClick: () => {},
			},
		});
	},
};

export const revealErrorHandlers: Record<number | string, ErrorHandler> = {
	...commonHandlers,
	400: handleAlreadyRevealed,
	402: handleInsufficientGems,
	404: handleUserNotFound,
};
