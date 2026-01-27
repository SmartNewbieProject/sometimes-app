import { commonHandlers } from '@/src/shared/services/common-error-handler';
import type { ErrorHandler } from '@/src/types/error-handler';
import { Text } from 'react-native';

const handleInsufficientGems: ErrorHandler = {
	handle: (error, { router, showModal }) => {
		showModal({
			title: '구슬이 부족해요',
			children: <Text>좋아요를 보내려면 5구슬이 필요해요.</Text>,
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

const handleMustRevealFirst: ErrorHandler = {
	handle: (error, { showModal }) => {
		showModal({
			title: '알림',
			children: <Text>먼저 프로필을 공개해야 해요.</Text>,
			primaryButton: {
				text: '확인',
				onClick: () => {},
			},
		});
	},
};

const handleAlreadyLiked: ErrorHandler = {
	handle: (error, { showModal }) => {
		showModal({
			title: '알림',
			children: <Text>이미 좋아요를 보낸 사용자예요.</Text>,
			primaryButton: {
				text: '확인',
				onClick: () => {},
			},
		});
	},
};

export const likeErrorHandlers: Record<number | string, ErrorHandler> = {
	...commonHandlers,
	400: handleMustRevealFirst,
	402: handleInsufficientGems,
	409: handleAlreadyLiked,
};
