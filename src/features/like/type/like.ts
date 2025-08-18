export type ILiked = {
	age: number;
	connectionId: string;
	instagram: string | null;
	isMutualLike: boolean;
	likedAt: string;
	mainProfileUrl: string;
	nickname: string;
	universityName: string;
	viewedAt: string | null;
	deletedAt: string | null;
	status: string;
};

export type LikedMe = {
	status: string;
	likedAt: string;
	instagram: string | null;
	mainProfileUrl: string;
	nickname: string;
	universityName: string;
	age: number;
	viewedAt: string | null;
	deletedAt: string | null;
	connectionId: string;
	isMutualLike: boolean;
};
