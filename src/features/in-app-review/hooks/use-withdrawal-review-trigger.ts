import { useCallback } from 'react';
import { useInAppReview } from './use-in-app-review';
import { hasRequestedWithTrigger } from '../libs/review-storage';

type WithdrawalReason =
	| 'FOUND_PARTNER'
	| 'POOR_MATCHING'
	| 'PRIVACY_CONCERN'
	| 'SAFETY_CONCERN'
	| 'TECHNICAL_ISSUES'
	| 'INACTIVE_USAGE'
	| 'DISSATISFIED_SERVICE'
	| 'OTHER';

export const useWithdrawalReviewTrigger = () => {
	const { requestReview } = useInAppReview();

	const triggerIfFoundPartner = useCallback(
		async (reason: WithdrawalReason) => {
			if (reason !== 'FOUND_PARTNER') {
				return;
			}

			const alreadyRequested = await hasRequestedWithTrigger('withdrawal_found_partner');
			if (alreadyRequested) {
				return;
			}

			await requestReview({ triggerType: 'withdrawal_found_partner' });
		},
		[requestReview],
	);

	return { triggerIfFoundPartner };
};
