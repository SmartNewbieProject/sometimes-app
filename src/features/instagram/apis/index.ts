import { axiosClient } from '@/src/shared/libs';
import type { InteractionInstragram } from '../type';

export const postInteractionInstagram = (connectionId: string): Promise<InteractionInstragram> => {
	return axiosClient.post(`/v1/matching/interactions/instagram/${connectionId}`, {});
};
