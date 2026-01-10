import { axiosClient } from '@/src/shared/libs';
import type { InteractionInstragram } from '../type';

export const postInteractionInstagram = (connectionId: string): Promise<InteractionInstragram> => {
	return axiosClient.post(`/v1/matching/interactions/instagram/${connectionId}`, {});
};

export interface UpdateInstagramIdRequest {
	instagramId: string;
}

export interface UpdateInstagramIdResponse {
	success: boolean;
	rewarded: boolean;
}

export const updateInstagramId = (
	request: UpdateInstagramIdRequest,
): Promise<UpdateInstagramIdResponse> => {
	return axiosClient.patch('/user/me/instagram', request);
};
