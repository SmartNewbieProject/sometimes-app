import { useEffect, useRef } from 'react';
import { useInAppReview } from './use-in-app-review';
import { hasRequestedWithTrigger } from '../libs/review-storage';

interface UseMutualMatchReviewTriggerOptions {
	isMutualMatch: boolean;
	enabled?: boolean;
}

export const useMutualMatchReviewTrigger = (options: UseMutualMatchReviewTriggerOptions) => {
	const { isMutualMatch, enabled = true } = options;
	const { requestReview } = useInAppReview();
	const hasTriggeredRef = useRef(false);

	useEffect(() => {
		const checkAndTrigger = async () => {
			if (!enabled || !isMutualMatch || hasTriggeredRef.current) {
				return;
			}

			const alreadyRequested = await hasRequestedWithTrigger('mutual_match');
			if (alreadyRequested) {
				return;
			}

			hasTriggeredRef.current = true;
			await requestReview({ triggerType: 'mutual_match' });
		};

		checkAndTrigger();
	}, [isMutualMatch, enabled, requestReview]);
};
