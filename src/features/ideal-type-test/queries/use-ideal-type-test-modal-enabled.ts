import { useQuery } from '@tanstack/react-query';
import type { FeatureFlagResponse } from '@/src/features/somemate/apis/feature-flags';
import { checkIdealTypeTestModalEnabled } from '../apis/feature-flags';

export const IDEAL_TYPE_TEST_MODAL_ENABLED_KEY = ['ideal-type-test', 'modal', 'enabled'] as const;

export const useIdealTypeTestModalEnabled = () => {
	return useQuery<FeatureFlagResponse>({
		queryKey: IDEAL_TYPE_TEST_MODAL_ENABLED_KEY,
		queryFn: checkIdealTypeTestModalEnabled,
		staleTime: 1000 * 60 * 5, // 5분
		retry: false, // 피처플래그 실패 시 재시도 안함
	});
};
