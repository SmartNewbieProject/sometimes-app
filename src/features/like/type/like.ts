export type ILiked = {
	age: number;
	connectionId: string;
	instagram: string | null;
	isMutualLike: boolean;
	likedAt: string;
	mainProfileUrl: string;
	nickname: string;
	matchId: string;
	universityName: string;
	viewedAt: string | null;
	matchExpiredAt: string;
	isExpired: string;
	deletedAt: string | null;
	status: string;
};

export type LikedMe = {
	status: string;
	likedAt: string;
	instagram: string | null;
	matchExpiredAt: string;
	isExpired: string;
	mainProfileUrl: string;
	nickname: string;
	matchId: string;
	universityName: string;
	age: number;
	viewedAt: string | null;
	deletedAt: string | null;
	connectionId: string;
	isMutualLike: boolean;
};
