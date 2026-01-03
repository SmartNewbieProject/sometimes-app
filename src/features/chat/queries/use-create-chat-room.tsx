import { useModal } from '@/src/shared/hooks/use-modal';
import { useTranslation } from 'react-i18next';
import { Text } from '@/src/shared/ui';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createChatRoom } from '../apis';
import { errorHandlers } from '../services/chat-create-error-handler';
import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';
import { storage } from '@/src/shared/libs/store';

function useCreateChatRoom() {
	const { t } = useTranslation();
	const router = useRouter();
	const { showModal, showErrorModal, hideModal } = useModal();
	const { chatEvents } = useMixpanel();

	return useMutation({
		mutationFn: createChatRoom,
		onSuccess: async ({ chatRoomId, partnerId }: { chatRoomId: string; partnerId?: string }) => {
			// KPI 이벤트: 채팅 시작 (시간 차이 계산 포함)
			if (partnerId) {
				try {
					// Match_Accepted 시각 조회
					const matchAcceptedTimeStr = await storage.getItem(`match_accepted_time_${partnerId}`);

					if (matchAcceptedTimeStr) {
						const matchAcceptedTime = parseInt(matchAcceptedTimeStr, 10);
						const now = Date.now();
						const timeSinceMatchAccepted = Math.floor((now - matchAcceptedTime) / 1000); // 초 단위

						// 확장된 이벤트 트래킹 (time_since_match_accepted 포함)
						chatEvents.trackChatStarted(partnerId, 'mutual_like', timeSinceMatchAccepted);

						console.log(`[Analytics] Chat started ${timeSinceMatchAccepted}s after Match_Accepted`);

						// 저장된 시각 삭제 (일회성)
						await storage.removeItem(`match_accepted_time_${partnerId}`);
					} else {
						// Match_Accepted 시각이 없는 경우 (이전 매칭 또는 데이터 누락)
						chatEvents.trackChatStarted(partnerId, 'mutual_like');
					}
				} catch (error) {
					console.error('[Analytics] Failed to calculate time since match accepted:', error);
					// 에러가 발생해도 기본 이벤트는 전송
					chatEvents.trackChatStarted(partnerId, 'mutual_like');
				}
			}

			router.push(`/chat/${chatRoomId}`);
		},
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		onError: (error: any) => {
			console.error('채팅방 생성 실패:', error);
			hideModal();

			if (!error) {
				showErrorModal(t('common.네트워크_연결을_확인해주세요'), 'announcement');
				return;
			}

			const status = error?.status ?? error?.statusCode;
			const handler = errorHandlers[status] || errorHandlers.default;

			handler.handle(error, { router, showModal, showErrorModal });
		},
	});
}

export default useCreateChatRoom;
