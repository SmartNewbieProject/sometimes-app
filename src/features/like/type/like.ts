export type ILiked = {
	age: number;
	connectionId: string;
	instagram: string | null;
	isMutualLike: boolean;
	likedAt: string;
	mainProfileUrl: string;
	nickname: string;
	universityName: string;

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
	connectionId: string;
	isMutualLike: boolean;
};
