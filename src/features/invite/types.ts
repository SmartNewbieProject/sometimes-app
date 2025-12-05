export type DeviceType = 'ios' | 'android' | 'web';
export type SignupMethod = 'kakao' | 'apple' | 'email';
export type InviteReferrer = 'kakao' | 'instagram' | 'facebook' | 'twitter' | 'direct' | 'other';

export interface RecordClickRequest {
	referrer?: InviteReferrer;
	deviceType?: DeviceType;
	sessionId?: string;
}

export interface RecordClickResponse {
	clickId: string;
	recordedAt: string;
}

export interface RecordConversionRequest {
	invitedUserId: string;
	clickId?: string;
	signupMethod?: SignupMethod;
}

export interface RecordConversionResponse {
	conversionId: string;
	inviterId: string;
	invitedUserId: string;
	convertedAt: string;
}

export interface InviteStatsQuery {
	fromDate?: string;
	toDate?: string;
	includeDaily?: boolean;
	includeList?: boolean;
}

export interface DailyStat {
	date: string;
	clicks: number;
	conversions: number;
}

export interface ConvertedUser {
	userId: string;
	nickname: string;
	convertedAt: string;
}

export interface InviteStatsSummary {
	totalClicks: number;
	totalConversions: number;
	conversionRate: number;
}

export interface InviteStatsResponse {
	inviteCode: string;
	period: {
		from: string;
		to: string;
	};
	summary: InviteStatsSummary;
	dailyStats?: DailyStat[];
	convertedUsers?: ConvertedUser[];
}
