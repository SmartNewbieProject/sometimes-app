import { useQuery } from '@tanstack/react-query';
import { checkSupportChatEnabled } from '../apis/feature-flags';
import type { FeatureFlagResponse } from '@/src/features/somemate/apis/feature-flags';

export const SUPPORT_CHAT_ENABLED_KEY = ['support-chat', 'enabled'] as const;

export const useSupportChatEnabled = () => {
	return useQuery<FeatureFlagResponse>({
		queryKey: SUPPORT_CHAT_ENABLED_KEY,
		queryFn: checkSupportChatEnabled,
		staleTime: 1000 * 60 * 5,
	});
};
