import { useCallback } from 'react';
import * as StoreReview from 'expo-store-review';
import { useAmplitude } from '@/src/shared/hooks/use-amplitude';
import { useModal } from '@/src/shared/hooks/use-modal';
import { AMPLITUDE_EVENTS } from '@/src/shared/constants/amplitude-events';
import { checkReviewEligibility } from '../libs/review-eligibility-checker';
import { saveReviewRequest } from '../libs/review-storage';
import { REVIEW_CONFIG } from '../constants/review-config';
import type { TriggerReviewOptions } from '../types';

export const useInAppReview = () => {
	const { trackEvent } = useAmplitude();
	const { showModal } = useModal();

	const requestReview = useCallback(
		async (options: TriggerReviewOptions) => {
			const { triggerType, delayMs = REVIEW_CONFIG.DEFAULT_DELAY_MS } = options;

			try {
				const eligibility = await checkReviewEligibility();

				trackEvent(AMPLITUDE_EVENTS.IN_APP_REVIEW_ELIGIBLE, {
					trigger_type: triggerType,
					can_request: eligibility.canRequest,
					reason: eligibility.reason,
				});

				if (!eligibility.canRequest) {
					console.log(
						`[InAppReview] Not eligible: ${eligibility.reason}`,
					);
					return;
				}

				const isAvailable = await StoreReview.isAvailableAsync();
				if (!isAvailable) {
					console.log('[InAppReview] Store review not available');
					return;
				}

				// Pre-prompt 모달 표시
				setTimeout(() => {
					trackEvent(AMPLITUDE_EVENTS.IN_APP_REVIEW_PRE_PROMPT_SHOWN, {
						trigger_type: triggerType,
					});

					showModal({
						title: '썸타임에 대한 당신만의 반응을 남겨주세요!',
						children: '우리가 개인을 위한 맞춤 서비스를 지원할 수 있도록 도와주세요.',
						primaryButton: {
							text: '리뷰 남기기',
							onClick: async () => {
								trackEvent(AMPLITUDE_EVENTS.IN_APP_REVIEW_PRE_PROMPT_RESPONSE, {
									trigger_type: triggerType,
									response: 'accepted',
								});

								await StoreReview.requestReview();
								await saveReviewRequest(triggerType);

								trackEvent(AMPLITUDE_EVENTS.IN_APP_REVIEW_REQUESTED, {
									trigger_type: triggerType,
								});
							},
						},
						secondaryButton: {
							text: '나중에',
							onClick: () => {
								trackEvent(AMPLITUDE_EVENTS.IN_APP_REVIEW_PRE_PROMPT_RESPONSE, {
									trigger_type: triggerType,
									response: 'declined',
								});
							},
						},
					});
				}, delayMs);
			} catch (error) {
				console.error('[InAppReview] Error requesting review:', error);
			}
		},
		[trackEvent, showModal],
	);

	return { requestReview };
};
