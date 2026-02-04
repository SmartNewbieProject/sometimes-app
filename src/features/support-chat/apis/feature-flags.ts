import type { FeatureFlagResponse } from '@/src/features/somemate/apis/feature-flags';
import axiosClient from '@/src/shared/libs/axios';

export const checkSupportChatEnabled = async (): Promise<FeatureFlagResponse> => {
	return axiosClient.get('/feature-flags/support-chat');
};
