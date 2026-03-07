import { queryClient } from '@/src/shared/config/query';
import { useModal } from '@/src/shared/hooks/use-modal';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { enterChatRoom } from '../apis';
import { chatEnterErrorHandlers } from '../services/chat-enter-error-handler';
import { updateChatRoomDetailCache, updateChatRoomListCache, updateGemCache } from '../utils/chat-cache';

function useChatRockQuery(chatRoomId: string, gemCost = 0) {
	const { t } = useTranslation();
	const router = useRouter();
	const { showModal, showErrorModal, hideModal } = useModal();
	return useMutation({
		mutationFn: () => enterChatRoom({ chatRoomId }),
		onSuccess: async () => {
			if (gemCost > 0) {
				updateGemCache(queryClient, (oldGem) => ({
					...oldGem,
					totalGem: Math.max(0, oldGem.totalGem - gemCost),
				}));
			}

			updateChatRoomListCache(queryClient, chatRoomId, (room) => ({
				...room,
				paymentConfirm: true,
			}));
			updateChatRoomDetailCache(queryClient, chatRoomId, (detail) => ({
				...detail,
				paymentConfirm: true,
			}));
			router.push(`/chat/${chatRoomId}`);
		},
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		onError: (error: any) => {
			console.error('채팅방 결제 실패:', error);
			hideModal();

			if (!error) {
				showErrorModal(t('common.네트워크_연결을_확인해주세요'), 'announcement');
				return;
			}
			const status = error.status ?? error.statusCode;
			const handler = chatEnterErrorHandlers[status] || chatEnterErrorHandlers.default;

			handler.handle(error, { router, showModal, showErrorModal });
		},
	});
}

export default useChatRockQuery;
