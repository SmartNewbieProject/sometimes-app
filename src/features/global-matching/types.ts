import type { Dayjs } from 'dayjs';

export type GlobalCountryCode = 'KR' | 'JP';
export type GlobalCountryCodeLower = 'kr' | 'jp';

export type GlobalMatchingStatus = {
	isEnabled: boolean;
	targetCountry: GlobalCountryCode | null;
	onboardingCompleted: boolean;
	preferenceCount?: number;
	profileTranslated?: boolean;
	lastMatchedAt?: string | null;
};

export type CompleteOnboardingRequest = {
	preferenceOptionIds?: string[];
};

export type CompleteOnboardingResponse = GlobalMatchingStatus;

export type GlobalMatchViewType = 'open' | 'not-found' | 'pending-approval';

export type ServerGlobalPartner = {
	id: string;
	userId: string;
	name: string;
	nameOriginal: string;
	introduction: string;
	introductionOriginal: string;
	age: number;
	university: string;
	universityOriginal: string;
	department: string;
	mainProfileImageUrl: string;
	mainProfileThumbnail: string;
	keywords: string[];
	keywordsOriginal: string[];
	country: GlobalCountryCodeLower;
	connectionId: string;
	isLikeSended: number;
	matchScore: number;
	preferences: { typeName: string; selectedOptions: { id: string; displayName: string }[] }[];
	characteristics: { typeName: string; selectedOptions: { id: string; displayName: string }[] }[];
};

export type GlobalPartner = ServerGlobalPartner;

export type ServerGlobalMatchDetails = {
	id: string | null;
	type: GlobalMatchViewType;
	connectionId: string | null;
	endOfView: string | null;
	matchedAt: string | null;
	canLetter: boolean;
	partner: ServerGlobalPartner | null;
};

export type GlobalMatchDetails = {
	id: string | null;
	type: GlobalMatchViewType;
	connectionId: string | null;
	endOfView: Dayjs | null;
	matchedAt: string | null;
	canLetter: boolean;
	partner: GlobalPartner | null;
};

export type OpenGlobalMatch = GlobalMatchDetails & {
	type: 'open';
	partner: GlobalPartner;
	endOfView: Dayjs;
	id: string;
	connectionId: string;
};

export type NotFoundGlobalMatch = GlobalMatchDetails & {
	type: 'not-found';
};

export type PendingApprovalGlobalMatch = GlobalMatchDetails & {
	type: 'pending-approval';
};

export const isOpenGlobalMatch = (match: GlobalMatchDetails): match is OpenGlobalMatch =>
	match.type === 'open' && match.partner !== null && match.endOfView !== null;

export const isNotFoundGlobalMatch = (match: GlobalMatchDetails): match is NotFoundGlobalMatch =>
	match.type === 'not-found';

export const isPendingApprovalGlobalMatch = (
	match: GlobalMatchDetails,
): match is PendingApprovalGlobalMatch => match.type === 'pending-approval';

export type GlobalLikeResponse = {
	success: boolean;
	gemsConsumed: number;
};

export type GlobalAcceptResponse = {
	success: boolean;
	chatRoomId: string;
};

// BE: GET /global-matching/preferences/options 응답
export type GlobalPreferenceCategory = {
	typeName: string;
	typeKey?: string;
	typeCode?: string;
	optionId: string;
	multiple: boolean;
	optionDisplayName: string;
	maximumChoiceCount: number;
	imageUrl: string | null;
	options?: GlobalPreferenceOption[];
};

export type GlobalPreferenceOption = {
	id: string;
	displayName: string;
	key?: string;
	imageUrl?: string | null;
};
