import axiosClient from '@/src/shared/libs/axios';
import type { FeatureFlagResponse } from '@/src/features/somemate/apis/feature-flags';

export const checkSupportChatEnabled = async (): Promise<FeatureFlagResponse> => {
	return axiosClient.get('/feature-flags/support-chat');
};
