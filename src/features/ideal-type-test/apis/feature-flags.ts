import axiosClient from '@/src/shared/libs/axios';
import type { FeatureFlagResponse } from '@/src/features/somemate/apis/feature-flags';

export const checkIdealTypeTestModalEnabled = async (): Promise<FeatureFlagResponse> => {
	return axiosClient.get('/feature-flags/ideal-type-test-modal');
};
