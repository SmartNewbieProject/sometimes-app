import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { useInAppReview } from './use-in-app-review';
import { hasRequestedWithTrigger } from '../libs/review-storage';
import { REVIEW_CONFIG } from '../constants/review-config';

interface UseSignupDaysReviewTriggerOptions {
	userCreatedAt: string | null | undefined;
	enabled?: boolean;
}

export const useSignupDaysReviewTrigger = (options: UseSignupDaysReviewTriggerOptions) => {
	const { userCreatedAt, enabled = true } = options;
	const { requestReview } = useInAppReview();
	const hasTriggeredRef = useRef(false);

	useEffect(() => {
		const checkAndTrigger = async () => {
			if (!enabled || !userCreatedAt || hasTriggeredRef.current) {
				return;
			}

			const daysSinceSignup = dayjs().diff(dayjs(userCreatedAt), 'day');
			if (daysSinceSignup < REVIEW_CONFIG.MIN_DAYS_SINCE_SIGNUP) {
				return;
			}

			const alreadyRequested = await hasRequestedWithTrigger('signup_3_days');
			if (alreadyRequested) {
				return;
			}

			hasTriggeredRef.current = true;
			await requestReview({ triggerType: 'signup_3_days' });
		};

		checkAndTrigger();
	}, [userCreatedAt, enabled, requestReview]);
};
