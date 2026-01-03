import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as StoreReview from 'expo-store-review';
import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';
import { useModal } from '@/src/shared/hooks/use-modal';
import { checkReviewEligibility } from '../libs/review-eligibility-checker';
import { saveReviewRequest, saveDismissal } from '../libs/review-storage';
import { REVIEW_CONFIG } from '../constants/review-config';
import type { TriggerReviewOptions } from '../types';
import { devLogWithTag } from '@/src/shared/utils';

export const useInAppReview = () => {
	const { t } = useTranslation();

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
						title: t('features.in-app-review.hooks.썸타임에_대한_당신만의_반응을_남겨주세요'),
						children: t(
							'features.in-app-review.hooks.완벽하진_않지만_대학생_여러분을_위해_계속_노력하고_있',
						),
						primaryButton: {
							text: t('features.in-app-review.hooks.리뷰_남기기'),
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
							text: t('features.in-app-review.hooks.나중에'),
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
