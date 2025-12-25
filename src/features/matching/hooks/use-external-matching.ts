import { useMutation } from '@tanstack/react-query';
import { matchingApi } from '../apis';
import type { ExternalMatchParams, ExternalMatchResponse } from '../types';
import { queryClient } from '@/src/shared/config/query';
import { devLogWithTag, logError } from '@/src/shared/utils';

export const useExternalMatching = () => {
	const externalMatchMutation = useMutation<
		ExternalMatchResponse,
		Error,
		ExternalMatchParams
	>({
		mutationFn: async (params: ExternalMatchParams) => {
			devLogWithTag('외부 매칭 API', '요청:', { context: params.context });
			const result = await matchingApi.externalMatch(params);
			devLogWithTag('외부 매칭 API', '응답:', { success: !!result });
			return result;
		},
		onError: (error) => {
			logError('[외부 매칭] Error:', error);
		},
		retry: 1,
		retryDelay: 3000,
	});

	const startExternalMatch = async (
		params: {
			context?: ExternalMatchParams['context'];
			userId?: string;
			onComplete?: () => void;
		}
	) => {
		// JWT 토큰으로 인증되므로 userId는 optional
		// 서버가 토큰에서 userId를 추출함
		const apiParams: ExternalMatchParams = {
			context: params.context,
		};

		if (params.userId) {
			apiParams.userId = params.userId;
		}

		try {
			const data = await externalMatchMutation.mutateAsync(apiParams);

			// 쿼리 갱신
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["latest-matching-v2"] }),
				queryClient.invalidateQueries({ queryKey: ["gem", "current"] }),
				queryClient.invalidateQueries({ queryKey: ["matching-first"] }),
			]);
			await queryClient.refetchQueries({ queryKey: ["latest-matching-v2"] });

			devLogWithTag('외부 매칭', '완료');

			// 쿼리 갱신 완료 후 콜백 실행
			if (params.onComplete) {
				params.onComplete();
			}
		} catch (error) {
			logError('[외부 매칭] Error:', error);
			throw error;
		}
	};

	return {
		startExternalMatch,
		isLoading: externalMatchMutation.isPending,
		data: externalMatchMutation.data,
		error: externalMatchMutation.error,
		reset: externalMatchMutation.reset,
	};
};
