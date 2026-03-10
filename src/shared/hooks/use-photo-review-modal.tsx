import {
	confirmProfileImageReview,
	getProfileImageReviewStatus,
} from '@/src/features/mypage/apis';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, StyleSheet, View } from 'react-native';
import { semanticColors } from '../constants/semantic-colors';
import { eventBus } from '../libs/event-bus';
import { Text } from '../ui/text';
import { useModal } from './use-modal';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

const DEBOUNCE_MS = 3000;

type PhotoReviewPayload = {
	reviewStatus: 'approved' | 'rejected';
	rejectionReason?: string;
};

export function usePhotoReviewModal() {
	const { t } = useTranslation();
	const { showModal } = useModal();
	const queryClient = useQueryClient();
	const lastShownRef = useRef<number>(0);
	const showModalRef = useRef(showModal);
	const tRef = useRef(t);

	showModalRef.current = showModal;
	tRef.current = t;

	const showReviewModal = useCallback(
		async (payload: PhotoReviewPayload) => {
			const now = Date.now();
			if (now - lastShownRef.current < DEBOUNCE_MS) return;
			lastShownRef.current = now;

			const handleConfirm = async () => {
				try {
					await confirmProfileImageReview();
					queryClient.invalidateQueries({ queryKey: ['my-profile-details'] });
				} catch {
					// confirm 실패해도 모달은 닫기
				}
			};

			if (payload.reviewStatus === 'rejected') {
				showModalRef.current({
					title: tRef.current('shareds.hooks.photo_review_modal.rejected_title'),
					children: (
						<View>
							<Text style={styles.body} weight="medium" textColor="black">
								{tRef.current('shareds.hooks.photo_review_modal.rejected_body')}
							</Text>
							{payload.rejectionReason && (
								<View style={styles.reasonBox}>
									<Text style={styles.reasonLabel} weight="semibold" size="xs">
										{tRef.current('shareds.hooks.photo_review_modal.rejection_reason')}
									</Text>
									<Text style={styles.reasonText} weight="medium" size="sm">
										{payload.rejectionReason}
									</Text>
								</View>
							)}
						</View>
					),
					primaryButton: {
						text: tRef.current('shareds.hooks.photo_review_modal.reupload_button'),
						onClick: async () => {
							await handleConfirm();
							router.push('/profile/photo-management' as any);
						},
					},
					dismissable: false,
					hideCloseButton: true,
				});
			} else {
				showModalRef.current({
					title: tRef.current('shareds.hooks.photo_review_modal.approved_title'),
					children: (
						<Text style={styles.body} weight="medium" textColor="black">
							{tRef.current('shareds.hooks.photo_review_modal.approved_body')}
						</Text>
					),
					primaryButton: {
						text: tRef.current('shareds.hooks.photo_review_modal.confirm_button'),
						onClick: handleConfirm,
					},
				});
			}
		},
		[queryClient],
	);

	// 경로 A: 푸시 알림 포그라운드 수신 → eventBus
	useEffect(() => {
		const unsubscribe = eventBus.on('photo-review:result', (payload: PhotoReviewPayload) => {
			showReviewModal(payload);
		});
		return unsubscribe;
	}, [showReviewModal]);

	// 경로 B: AppState 'active' 복귀 → API 폴링
	useEffect(() => {
		const subscription = AppState.addEventListener('change', async (nextState) => {
			if (nextState !== 'active') return;

			try {
				const status = await getProfileImageReviewStatus();
				if (status.reviewStatus === 'approved' || status.reviewStatus === 'rejected') {
					showReviewModal({
						reviewStatus: status.reviewStatus,
						rejectionReason: status.rejectionReason ?? undefined,
					});
				}
			} catch {
				// API 실패 시 무시 (비로그인 등)
			}
		});

		return () => subscription.remove();
	}, [showReviewModal]);
}

const styles = StyleSheet.create({
	body: {
		textAlign: 'center',
		lineHeight: 22,
	},
	reasonBox: {
		marginTop: 12,
		backgroundColor: '#F5F5F5',
		borderRadius: 8,
		padding: 12,
	},
	reasonLabel: {
		color: semanticColors.text.muted,
		marginBottom: 4,
	},
	reasonText: {
		color: semanticColors.text.primary,
		lineHeight: 20,
	},
});
