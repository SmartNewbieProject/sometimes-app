export interface MatchData {
	userId: string;
	nickname: string;
	age: number;
	university: string;
	region: {
		city: string;
		district: string;
	};
	distance: number;
	profileImage: string;
	bio: string;
	interests: string[];
	commonInterests: string[];
}

export interface BadgeData {
	icon: string;
	text: string;
	distance?: string;
}

export interface ExpansionData {
	level: number;
	fromRegion: string;
	toRegion: string;
	badge: BadgeData;
}

// 백엔드 재매칭 실패 응답 타입
export interface RematchNotFoundResponse {
	success: false;
	errorCode: 'USER_NOT_FOUND';
	message: string;
	details: {
		expansionSuggestion: ExpansionSuggestion;
	};
	timestamp: string;
}

export interface ExpansionSuggestion {
	available: boolean;
	currentRegion: CurrentRegion;
	expansionPath: ExpansionPath;
	nextAction: NextAction;
}

export interface CurrentRegion {
	code: string;
	name: string;
	cluster: string;
}

export interface ExpansionPath {
	steps: ExpansionStep[];
	summary: string;
	icon: string;
}

export interface ExpansionStep {
	level: number;
	targetCluster: string;
	targetRegions: string[];
	displayText: string;
}

export interface NextAction {
	endpoint: string;
	method: string;
	buttonText: string;
}

// 확장 매칭 성공 응답
export interface ExternalMatchSuccessResponse {
	success: true;
	data: {
		matchId: string;
		match: MatchData;
		expansion: ExpansionData;
	};
}

export interface ExternalMatchErrorResponse {
	success: false;
	error: {
		code: string;
		message: string;
		suggestions?: string[];
		retryAfter?: number;
	};
}

export type ExternalMatchResponse =
	| ExternalMatchSuccessResponse
	| ExternalMatchErrorResponse;

// 지역 확장 매칭 요청 파라미터
export interface ExternalMatchParams {
	userId?: string; // JWT 토큰으로 인증되면 optional
	context?: {
		previousMatchAttempts?: number;
		lastMatchedRegion?: string;
	};
}

export type LoadingState = 'idle' | 'normal' | 'rematch' | 'external';
