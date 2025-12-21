import { useMutation } from '@tanstack/react-query';
import { matchingApi } from '../apis';
import type { ExternalMatchParams } from '../types';
import type { RematchResponseV3 } from '@/src/features/idle-match-timer/types-v3';
import { queryClient } from '@/src/shared/config/query';

export const useExternalMatching = () => {
	const externalMatchMutation = useMutation<
		RematchResponseV3, // 일반 재매칭과 동일한 응답 구조
		Error,
		ExternalMatchParams
	>({
		mutationFn: async (params: ExternalMatchParams) => {
			console.log('[외부 매칭 API] 요청 시작:', params);
			const result = await matchingApi.externalMatch(params);
			console.log('[외부 매칭 API] 응답 수신:', result);
			return result;
		},
		onError: (error) => {
			console.error('[외부 매칭 Mutation] onError 호출:', error);
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

			console.log('[외부 매칭] 쿼리 갱신 시작');

			// 쿼리 갱신
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["latest-matching-v2"] }),
				queryClient.invalidateQueries({ queryKey: ["gem", "current"] }),
				queryClient.invalidateQueries({ queryKey: ["matching-first"] }),
			]);
			await queryClient.refetchQueries({ queryKey: ["latest-matching-v2"] });

			console.log('[외부 매칭] 쿼리 갱신 완료');

			// 쿼리 갱신 완료 후 콜백 실행
			if (params.onComplete) {
				params.onComplete();
			}
		} catch (error) {
			console.error('[외부 매칭] 처리 중 오류:', error);
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
