import { axiosClient } from '@/src/shared/libs';
import type { ILiked, LikedMe } from '../type/like';

export function getILiked(): Promise<ILiked[]> {
	return axiosClient.get('/v1/matching/interactions/i-liked');
}

export function getLIkedMe(): Promise<LikedMe[]> {
	return axiosClient.get('/v1/matching/interactions/liked-me');
}
