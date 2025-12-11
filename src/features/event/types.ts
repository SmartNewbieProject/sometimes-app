export enum EventType {
	FIRST_SALE = 'FIRST_SALE',
	FIRST_SALE_7 = 'FIRST_SALE_7',
	FIRST_SALE_16 = 'FIRST_SALE_16',
	FIRST_SALE_27 = 'FIRST_SALE_27',
	COMMUNITY_FIRST_POST = 'COMMUNITY_FIRST_POST',
}

export type EventDetails = {
	eventType: EventType;
	expiredAt: string;
	currentAttempt: number;
	maxAttempt: number;
};

export type RouletteResponse = {
	prizeValue: number;
	prizeInfo: {
		name: string;
		description: string;
		imageUrl: string;
	};
};

export type RouletteEligibility = {
	canParticipate: boolean;
	remainingAttempts: number;
	nextResetTime: string;
};
