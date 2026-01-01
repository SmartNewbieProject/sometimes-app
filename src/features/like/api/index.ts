import { axiosClient } from '@/src/shared/libs';
import type { ILiked, LikedMe, SendLikeRequest } from '../type/like';

export function getILiked(): Promise<ILiked[]> {
	return axiosClient.get('/v1/matching/interactions/i-liked');
}

export function getLIkedMe(): Promise<LikedMe[]> {
	return axiosClient.get('/v1/matching/interactions/liked-me');
}

export function sendLike(connectionId: string, data?: SendLikeRequest): Promise<void> {
	return axiosClient.post(`/v1/matching/interactions/like/${connectionId}`, data ?? {});
}

export function rejectLike(connectionId: string): Promise<{ success: boolean }> {
	return axiosClient.delete(`/v1/matching/interactions/reject/${connectionId}`);
}

export function cancelLike(connectionId: string): Promise<void> {
	return axiosClient.delete(`/v1/matching/interactions/bye/${connectionId}`);
}
