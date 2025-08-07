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
