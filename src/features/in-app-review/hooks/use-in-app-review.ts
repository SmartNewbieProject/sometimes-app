import { useCallback } from 'react';
import * as StoreReview from 'expo-store-review';
import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';
import { useModal } from '@/src/shared/hooks/use-modal';
import { checkReviewEligibility } from '../libs/review-eligibility-checker';
import { saveReviewRequest, saveDismissal } from '../libs/review-storage';
import { REVIEW_CONFIG } from '../constants/review-config';
import type { TriggerReviewOptions } from '../types';
import { devLogWithTag } from '@/src/shared/utils';

export const useInAppReview = () => {
	const { trackEvent } = useMixpanel();
	const { showModal } = useModal();

	const requestReview = useCallback(
		async (options: TriggerReviewOptions) => {
			const { triggerType, delayMs = REVIEW_CONFIG.DEFAULT_DELAY_MS } = options;

			try {
				const eligibility = await checkReviewEligibility();

				trackEvent('IN_APP_REVIEW_ELIGIBLE', {
					trigger_type: triggerType,
					can_request: eligibility.canRequest,
					reason: eligibility.reason,
				});

				if (!eligibility.canRequest) {
					devLogWithTag('InAppReview', 'Not eligible:', eligibility.reason);
					return;
				}

				const isAvailable = await StoreReview.isAvailableAsync();
				if (!isAvailable) {
					devLogWithTag('InAppReview', 'Store review not available');
					return;
				}

				// Pre-prompt 모달 표시
				setTimeout(() => {
					trackEvent('IN_APP_REVIEW_PRE_PROMPT_SHOWN', {
						trigger_type: triggerType,
					});

					showModal({
						title: '썸타임에 대한 당신만의 반응을 남겨주세요!',
						children:
							'완벽하진 않지만 대학생 여러분을 위해 계속 노력하고 있어요. 좋았던 점, 아쉬웠던 점 솔직하게 남겨주시면 더 나은 썸타임 만드는 데 쓸게요!',
						primaryButton: {
							text: '리뷰 남기기',
							onClick: async () => {
								trackEvent('IN_APP_REVIEW_PRE_PROMPT_RESPONSE', {
									trigger_type: triggerType,
									response: 'accepted',
								});

								await StoreReview.requestReview();
								await saveReviewRequest(triggerType);

								trackEvent('IN_APP_REVIEW_REQUESTED', {
									trigger_type: triggerType,
								});
							},
						},
						secondaryButton: {
							text: '나중에',
							onClick: async () => {
								trackEvent('IN_APP_REVIEW_PRE_PROMPT_RESPONSE', {
									trigger_type: triggerType,
									response: 'declined',
								});
								await saveDismissal();
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
