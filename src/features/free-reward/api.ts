import { axiosClient } from '@shared/libs';
import type { FreeRewardStatusResponse } from './types';

export const fetchFreeRewardStatus = (): Promise<FreeRewardStatusResponse> =>
	axiosClient.get('/v1/event/free-rewards/status');
