import { axiosClient } from '@/src/shared/libs';

export function deleteRejectLike(connectionId: string): Promise<{ success: boolean }> {
	return axiosClient.delete(`/v1/matching/interactions/reject/${connectionId}`);
}

export function deleteByeLike(connectionId: string): Promise<{ success: boolean }> {
	return axiosClient.delete(`/v1/matching/interactions/bye/${connectionId}`);
}
