import type { FeatureFlagResponse } from '@/src/features/somemate/apis/feature-flags';
import axiosClient from '@/src/shared/libs/axios';

export const checkGlobalMatchingEnabled = async (): Promise<FeatureFlagResponse> => {
	return axiosClient.get('/feature-flags/global-matching');
};
