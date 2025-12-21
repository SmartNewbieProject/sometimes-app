import { axiosClient } from '@/src/shared/libs';
import type {
	ExternalMatchParams,
	ExternalMatchResponse,
} from '../types';

export const externalMatch = (
	params: ExternalMatchParams,
): Promise<ExternalMatchResponse> => {
	return axiosClient.post('/v3/matching/rematch/expand-region', params);
};

export const matchingApi = {
	externalMatch,
};
