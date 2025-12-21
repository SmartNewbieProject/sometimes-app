import { useEffect, useRef } from 'react';
import { useInAppReview } from './use-in-app-review';
import { hasRequestedWithTrigger } from '../libs/review-storage';
import { REVIEW_CONFIG } from '../constants/review-config';

interface UseChatActivityReviewTriggerOptions {
	myMessageCount: number;
	partnerMessageCount: number;
	enabled?: boolean;
}

export const useChatActivityReviewTrigger = (options: UseChatActivityReviewTriggerOptions) => {
	const { myMessageCount, partnerMessageCount, enabled = true } = options;
	const { requestReview } = useInAppReview();
	const hasTriggeredRef = useRef(false);

	useEffect(() => {
		const checkAndTrigger = async () => {
			if (!enabled || hasTriggeredRef.current) {
				return;
			}

			const isMutualConversation =
				myMessageCount >= REVIEW_CONFIG.CHAT_MESSAGE_THRESHOLD &&
				partnerMessageCount >= REVIEW_CONFIG.CHAT_MESSAGE_THRESHOLD;

			if (!isMutualConversation) {
				return;
			}

			const alreadyRequested = await hasRequestedWithTrigger('chat_10_messages');
			if (alreadyRequested) {
				return;
			}

			hasTriggeredRef.current = true;
			await requestReview({ triggerType: 'chat_10_messages' });
		};

		checkAndTrigger();
	}, [myMessageCount, partnerMessageCount, enabled, requestReview]);
};
