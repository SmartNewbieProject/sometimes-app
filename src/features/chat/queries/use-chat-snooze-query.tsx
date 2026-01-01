import { useModal } from '@/src/shared/hooks/use-modal';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { snoozeChatRoom } from '../apis';
import { chatSnoozeErrorHandlers } from '../services/chat-snooze-error-handler';

function useChatSnoozeQuery() {
	const { t } = useTranslation();
	const { showErrorModal, showModal, hideModal } = useModal();
	const router = useRouter();
	return useMutation({
		mutationFn: snoozeChatRoom,
		onSuccess: () => {},
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		onError: (error: any) => {
			console.error('채팅방 알림 제어 실패:', error);
			hideModal();

			if (!error) {
				showErrorModal(t('common.네트워크_연결을_확인해주세요'), 'announcement');
				return;
			}

			const status = error?.status ?? error?.statusCode;
			const handler = chatSnoozeErrorHandlers[status] || chatSnoozeErrorHandlers.default;

			handler.handle(error, { router, showModal, showErrorModal });
		},
	});
}

export default useChatSnoozeQuery;
