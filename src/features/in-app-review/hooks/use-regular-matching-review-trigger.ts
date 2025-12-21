import { useEffect, useRef } from 'react';
import { useInAppReview } from './use-in-app-review';
import { hasRequestedWithTrigger } from '../libs/review-storage';

interface UseRegularMatchingReviewTriggerOptions {
	hasViewedMatch: boolean;
	matchType?: 'open' | 'waiting' | 'not-found' | 'rematching' | 'pending-approval';
	enabled?: boolean;
}

export const useRegularMatchingReviewTrigger = (
	options: UseRegularMatchingReviewTriggerOptions,
) => {
	const { hasViewedMatch, matchType, enabled = true } = options;
	const { requestReview } = useInAppReview();
	const hasTriggeredRef = useRef(false);

	useEffect(() => {
		const checkAndTrigger = async () => {
			if (!enabled || !hasViewedMatch || hasTriggeredRef.current) {
				return;
			}

			if (matchType !== 'open') {
				return;
			}

			const alreadyRequested = await hasRequestedWithTrigger('regular_matching');
			if (alreadyRequested) {
				return;
			}

			hasTriggeredRef.current = true;
			await requestReview({ triggerType: 'regular_matching' });
		};

		checkAndTrigger();
	}, [hasViewedMatch, matchType, enabled, requestReview]);
};
