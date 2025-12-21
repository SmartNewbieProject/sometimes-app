export type ReviewTriggerType =
	| 'mutual_match'
	| 'chat_10_messages'
	| 'signup_3_days'
	| 'regular_matching'
	| 'withdrawal_found_partner';

export interface ReviewTrackingData {
	requestCount: number;
	lastRequestDate: string | null;
	requestTriggers: ReviewTriggerType[];
}

export interface ReviewEligibilityResult {
	canRequest: boolean;
	reason?: string;
}

export interface TriggerReviewOptions {
	triggerType: ReviewTriggerType;
	delayMs?: number;
}
