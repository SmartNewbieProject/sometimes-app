import { queryClient } from '@/src/shared/config/query';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { useModal } from '@/src/shared/hooks/use-modal';
import { tryCatch } from '@/src/shared/libs';
import { Text } from '@/src/shared/ui';
import { useCashableModal } from '@shared/hooks';
import { useMutation } from '@tanstack/react-query';
import { HttpStatusCode } from 'axios';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import {
	determineFailureReason,
	predictFailureLikelihood,
} from '../../matching/utils/failure-analyzer';
import { MIXPANEL_EVENTS, LIKE_TYPES } from '@/src/shared/constants/mixpanel-events';
import { useTranslation } from 'react-i18next';
import { useAppInstallPrompt } from '@/src/features/app-install-prompt';
import { likeLetterApi } from '../api';

type LikeWithLetterParams = {
	connectionId: string;
	letter?: string;
};

const useLikeWithLetterMutation = () =>
	useMutation({
		mutationFn: ({ connectionId, letter }: LikeWithLetterParams) =>
			likeLetterApi.sendLike(connectionId, {
				letterContent: letter,
				isCustomLetter: !!letter,
			}),
		onMutate: async ({ connectionId, letter }) => {
			const likeType = letter ? LIKE_TYPES.SUPER : LIKE_TYPES.FREE;
			mixpanelAdapter.track(MIXPANEL_EVENTS.LIKE_SENT, {
				target_profile_id: connectionId,
				like_type: likeType,
				has_letter: !!letter,
				letter_length: letter?.length ?? 0,
				timestamp: new Date().toISOString(),
			});
		},
		onSuccess: async (_, { letter }) => {
			await queryClient.invalidateQueries({ queryKey: ['latest-matching'] });
			await queryClient.refetchQueries({ queryKey: ['latest-matching'] });
			await queryClient.invalidateQueries({ queryKey: ['gem', 'current'] });
			await queryClient.refetchQueries({ queryKey: ['liked', 'of-me'] });
			await queryClient.refetchQueries({ queryKey: ['liked', 'to-me'] });

			mixpanelAdapter.track(MIXPANEL_EVENTS.MATCHING_SUCCESS, {
				action_type: letter ? 'like_with_letter_success' : 'like_success',
				result: 'success',
				has_letter: !!letter,
				timestamp: new Date().toISOString(),
				user_context: {
					gem_balance: queryClient.getQueryData(['gem', 'current']),
					matching_stage: 'like_sent',
				},
			});
		},
		onError: async (error: any, { letter }) => {
			const failureReason = determineFailureReason(error);

			mixpanelAdapter.track(MIXPANEL_EVENTS.MATCHING_FAILURE, {
				action_type: letter ? 'like_with_letter_failed' : 'like_failed',
				failure_type: failureReason.type,
				failure_category: failureReason.category,
				has_letter: !!letter,
				user_action_required: failureReason.userAction,
				recoverable: failureReason.recoverable,
				severity: failureReason.severity,
				server_message: failureReason.serverMessage,
				http_status: failureReason.httpStatus,
				retry_available_at: failureReason.retryAvailableAt,
				wait_time_seconds: failureReason.waitTimeSeconds,
				timestamp: new Date().toISOString(),
			});

			const currentGemBalance = (queryClient.getQueryData(['gem', 'current']) as number) || 0;
			const failurePrediction = predictFailureLikelihood({
				currentGemBalance,
				ticketCount: 0,
				recentLikeCount: 0,
				recentMatchCount: 0,
				restrictionHistory: [],
				lastLikeTime: Date.now() - 3600000,
				timeOfDay: new Date().getHours(),
				isPeakTime: new Date().getHours() >= 20 && new Date().getHours() <= 23,
			});

			mixpanelAdapter.track('MATCHING_FAILURE_PREDICTION', {
				risk_score: failurePrediction.riskScore,
				primary_risk: failurePrediction.primaryRisk,
				is_high_risk: failurePrediction.isHighRisk,
				preventable: failurePrediction.preventable,
				predicted_server_message: failurePrediction.predictedServerMessage,
				recommendations: failurePrediction.recommendations,
			});
		},
	});

export function useLikeWithLetter() {
	const { showErrorModal, showModal, hideModal } = useModal();
	const { mutateAsync: likeWithLetter } = useLikeWithLetterMutation();
	const { show: showCashable } = useCashableModal();
	const { t } = useTranslation();
	const { showPromptForMatching } = useAppInstallPrompt();

	const performLikeWithLetter = async (
		connectionId: string,
		letter?: string,
		options?: { source?: 'home' | 'profile'; matchId?: string },
	) => {
		const { source = 'home', matchId } = options ?? {};

		await tryCatch(
			async () => {
				await likeWithLetter({ connectionId, letter });

				showModal({
					showLogo: true,
					showParticle: true,
					customTitle: (
						<View style={styles.modalTitleContainer}>
							<Image style={styles.particle1} source={require('@assets/images/particle1.png')} />
							<Image style={styles.particle2} source={require('@assets/images/particle2.png')} />
							<Image style={styles.particle3} source={require('@assets/images/particle3.png')} />
							<Text textColor="black" weight="bold" size="20">
								{letter ? '편지를 함께 보냈어요!' : '썸을 보냈어요!'}
							</Text>
						</View>
					),
					children: (
						<View style={styles.modalContent}>
							<Text textColor="disabled" size="12">
								{letter ? '매칭되면 채팅은 무료로 시작돼요' : '상대방도 관심을 보이면'}
							</Text>
							{!letter && (
								<Text textColor="disabled" size="12">
									바로 대화 시작할 수 있어!
								</Text>
							)}
						</View>
					),
					primaryButton: {
						text: '설레는 마음 전달 완료!',
						onClick: () => {
							hideModal();
							showPromptForMatching();
							if (source === 'profile' && matchId) {
								router.replace({ pathname: '/partner/view/[id]', params: { id: matchId } });
							} else {
								router.replace('/home');
							}
						},
					},
				});
			},
			(err) => {
				const failureReason = determineFailureReason(err);

				if (err.status === HttpStatusCode.Forbidden) {
					showCashable({
						textContent: t('hooks.지금_충전하고_마음에_드는_상대와_대화를_시작해보세요'),
					});
					return;
				}

				if (failureReason.type === 'TICKET_INSUFFICIENT') {
					showCashable({
						textContent: t('hooks.재매칭권이_필요합니다_지금_구매하고_계속_매칭을_즐겨'),
					});
					return;
				}

				if (failureReason.type === 'COMMUNICATION_RESTRICTED') {
					showErrorModal(
						t('hooks.현재_상대방과_소통이_제한되어_있습니다_잠시_후_다시'),
						'announcement',
					);
					return;
				}

				if (failureReason.type === 'DUPLICATE_LIKE') {
					showErrorModal(t('hooks.이미_좋아요를_보낸_상대방입니다'), 'announcement');
					return;
				}

				if (err.message?.includes('50자')) {
					showErrorModal('편지는 최대 50자까지 작성할 수 있습니다.', 'announcement');
					return;
				}

				if (err.message?.includes(t('hooks.부적절'))) {
					showErrorModal(t('hooks.부적절한_내용이_포함되어_있습니다'), 'announcement');
					return;
				}

				if (err.status === HttpStatusCode.Conflict) {
					if (err.error?.includes(t('hooks.소통이_제한'))) {
						showErrorModal(err.error, 'announcement');
						return;
					}
					showErrorModal(t('hooks.중복된_요청이거나_일시적인_문제가_발생했습니다'), 'announcement');
					return;
				}

				showErrorModal(err.error || t('hooks.오류가_발생했습니다'), 'error');
			},
		);
	};

	return {
		sendLikeWithLetter: performLikeWithLetter,
	};
}

const styles = StyleSheet.create({
	modalTitleContainer: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		width: '100%',
		position: 'relative',
	},
	particle1: {
		position: 'absolute',
		left: -6,
		bottom: -36,
		width: 66,
		height: 34,
	},
	particle2: {
		position: 'absolute',
		left: 10,
		top: -48,
		width: 52,
		height: 49,
	},
	particle3: {
		position: 'absolute',
		right: -20,
		top: -40,
		width: 105,
		height: 80,
	},
	modalContent: {
		flexDirection: 'column',
		width: '100%',
		alignItems: 'center',
		marginTop: 5,
	},
});
