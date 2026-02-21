import type { ExternalMatchInfo } from '@/src/types/user';

export type SomeStatus = 'PENDING' | 'OPEN' | 'REJECTED' | 'IN_CHAT';

export type ILiked = {
	likeId?: string;
	age: number;
	connectionId: string;
	instagram: string | null;
	isMutualLike: boolean;
	likedAt: string;
	letter: string | null;
	mainProfileUrl: string;
	mainProfileThumbnail?: string | null;
	nickname: string;
	matchId: string;
	universityName: string;
	universityCode?: string;
	departmentName?: string;
	viewedAt: string | null;
	matchExpiredAt: string;
	isExpired: boolean;
	deletedAt: string | null;
	status: SomeStatus | string;
	external?: ExternalMatchInfo | null;
};

export type LikedMe = {
	likeId?: string;
	status: SomeStatus | string;
	likedAt: string;
	letterContent?: string | null;
	hasLetter?: boolean;
	instagram: string | null;
	matchExpiredAt: string;
	isExpired: boolean;
	mainProfileUrl: string;
	mainProfileThumbnail?: string | null;
	nickname: string;
	matchId: string;
	universityName: string;
	universityCode?: string;
	departmentName?: string;
	age: number;
	viewedAt: string | null;
	deletedAt: string | null;
	connectionId: string;
	isMutualLike: boolean;
	external?: ExternalMatchInfo | null;
	isGlobalMatch?: boolean;
	targetCountry?: 'kr' | 'jp';
};

export type SendLikeRequest = {
	letter?: string;
};
