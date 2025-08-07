import { axiosClient } from '@/src/shared/libs';

export function getILiked() {
	return axiosClient.get('/v1/matching/interactions/i-liked');
}
