import { axiosClient } from '@/src/shared/libs';
import type { ILiked } from '../type/like';

export function getILiked(): Promise<ILiked[]> {
	return axiosClient.get('/v1/matching/interactions/i-liked');
}
