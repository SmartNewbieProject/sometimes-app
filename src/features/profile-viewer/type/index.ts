// Core types based on API documentation

// 좋아요 상호작용 상태
export enum ViewerInteractionStatus {
	LIKE_SENT = 'LIKE_SENT', // 내가 좋아요 보냄
	LIKED_ME = 'LIKED_ME', // 상대가 좋아요 보냄
	MATCHING = 'MATCHING', // 상호 좋아요 (매칭)
}

export interface ProfileViewerHint {
	universityName: string;
	age: number;
	blurredImageUrl?: string;
}

export interface NextFreeUnlock {
	summaryId: string;
	freeUnlockAt: string | null; // null = 지금 가능, ISO8601
	canUnlockFreeNow: boolean;
	hint: ProfileViewerHint;
}

export interface ProfileViewerProfile {
	id: string;
	name: string;
	age: number;
	gender: string;
	introduction?: string;
	mbti?: string;
}

export interface ProfileViewerItem {
	summaryId: string;
	viewCount: number;
	viewCountDisplay: string; // "3회" or "5회 이상"
	lastViewAt: string; // ISO8601
	isRevealed: boolean;
	hint: ProfileViewerHint;
	canUnlockFree: boolean; // true if >24h passed
	isLiked: boolean;

	// Interaction status
	interactionStatus?: ViewerInteractionStatus;
	likedMeAt?: string;

	// Only present if revealed
	viewerId?: string;
	profile?: ProfileViewerProfile;
	matchId?: string;
}

// API Request/Response types
export interface GetViewersParams {
	page?: number;
	limit?: number;
}

export interface GetViewersResponse {
	viewers: ProfileViewerItem[];
	totalCount: number;
	unreviewedCount: number;
	nextFreeUnlock: NextFreeUnlock | null;
}

export interface ViewerCountsResponse {
	totalCount: number;
	unreviewedCount: number;
}

export interface RevealCostResponse {
	cost: number;
}

export interface HomeSummaryResponse {
	viewerCount: number;
	previewImages: string[];
}

export interface RevealViewerResponse {
	success: boolean;
	profile: ProfileViewerProfile;
	viewerId: string;
	gemBalance: number;
	matchId: string;
	wasFreeUnlock: boolean;
}

export interface LikeViewerRequest {
	letterContent?: string; // Max 100 chars
}

export interface LikeViewerResponse {
	success: boolean;
	gemBalance: number;
}
