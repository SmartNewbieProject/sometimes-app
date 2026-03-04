export type RewardKey =
	| 'welcomeReward'
	| 'instagramRegistration'
	| 'universityVerification'
	| 'referralInvitee'
	| 'communityFirstPost';

export interface RewardEligibility {
	eligible: boolean;
	reason: 'ALREADY_RECEIVED' | 'ALREADY_PARTICIPATED' | null;
	gemsAmount: number;
}

export interface FreeRewardStatusResponse {
	rewards: Record<RewardKey, RewardEligibility>;
}
