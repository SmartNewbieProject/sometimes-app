import dayjs from 'dayjs';
import { REVIEW_CONFIG } from '../constants/review-config';
import { getRequestCount, getLastRequestDate } from './review-storage';
import type { ReviewEligibilityResult } from '../types';

export const checkReviewEligibility = async (
	userCreatedAt?: string,
): Promise<ReviewEligibilityResult> => {
	const requestCount = await getRequestCount();
	if (requestCount >= REVIEW_CONFIG.MAX_REQUEST_COUNT) {
		return {
			canRequest: false,
			reason: 'max_request_count_reached',
		};
	}

	const lastRequestDate = await getLastRequestDate();
	if (lastRequestDate) {
		const daysSinceLastRequest = dayjs().diff(dayjs(lastRequestDate), 'day');
		if (daysSinceLastRequest < REVIEW_CONFIG.MIN_REQUEST_INTERVAL_DAYS) {
			return {
				canRequest: false,
				reason: 'request_too_soon',
			};
		}
	}

	if (userCreatedAt) {
		const daysSinceSignup = dayjs().diff(dayjs(userCreatedAt), 'day');
		if (daysSinceSignup < REVIEW_CONFIG.MIN_DAYS_SINCE_SIGNUP) {
			return {
				canRequest: false,
				reason: 'user_too_new',
			};
		}
	}

	return { canRequest: true };
};
