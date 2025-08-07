export type ILiked = {
	age: number;
	connectionId: string;
	instagram: string | null;
	isMutualLike: boolean;
	likedAt: string;
	mainProfileUrl: string;
	nickname: string;
	status: 'PENDING' | 'OPEN';
};

export type LikedMe = {
	status: string;
	likedAt: string;
	instagram: string;
	mainProfileUrl: string;
	nickname: string;
	age: number;
	connectionId: number;
	isMutualLike: boolean;
};
