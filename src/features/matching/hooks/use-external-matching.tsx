import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { matchingApi } from '../apis';
import type { ExternalMatchParams, ExternalMatchResponse } from '../types';
import { queryClient } from '@/src/shared/config/query';
import { devLogWithTag, logError } from '@/src/shared/utils';
import { useModal } from '@/src/shared/hooks/use-modal';
import { useTracking } from '@/src/shared/hooks';
import { ExpandRegionEmptyState } from '../ui';
import { useRef } from 'react';

export const useExternalMatching = () => {
	const { showModal, hideModal } = useModal();
	const tracker = useTracking();
	const matchingStartTime = useRef<number | null>(null);

	const externalMatchMutation = useMutation<
		ExternalMatchResponse,
		Error,
		ExternalMatchParams
	>({
		mutationFn: async (params: ExternalMatchParams) => {
			devLogWithTag('외부 매칭 API', '요청', { context: params.context });
			try {
				const result = await matchingApi.externalMatch(params);
				devLogWithTag('외부 매칭 API', '응답', { success: !!result });
				return result;
			} catch (error: any) {
				// axios 인터셉터가 error.response.data를 펼쳐서 반환함
				// 따라서 error.errorCode로 직접 접근
				devLogWithTag('외부 매칭 API', '에러 발생', {
					errorCode: error.errorCode,
					message: error.message,
					status: error.status
				});

				// USER_NOT_FOUND 에러는 Empty State 모달 표시 후 특별한 응답 반환
				if (error.errorCode === 'USER_NOT_FOUND') {
					devLogWithTag('외부 매칭 API', 'USER_NOT_FOUND - Empty State 표시');

					showModal({
						children: (
							<ExpandRegionEmptyState
								onDismiss={hideModal}
							/>
						),
						dismissable: true,
					});

					// 특별한 응답 반환 (handled 플래그로 구분)
					return { handled: true } as any;
				}

				// 다른 에러는 그대로 throw
				throw error;
			}
		},
		onError: (error: any) => {
			// 여기는 USER_NOT_FOUND가 아닌 다른 에러만 도달
			logError('[외부 매칭] Error:', error);
		},
		retry: false, // USER_NOT_FOUND는 재시도 불필요
	});

	const startExternalMatch = async (
		params: {
			context?: ExternalMatchParams['context'];
			userId?: string;
			onComplete?: () => void;
		}
	) => {
		// 매칭 시작 시간 기록
		matchingStartTime.current = Date.now();

		// 대기열 진입 tracking
		tracker.trackMatchingQueueJoined({
			matching_type: 'auto',
		});

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

			// USER_NOT_FOUND가 처리된 경우 조용히 종료
			if ((data as any)?.handled) {
				devLogWithTag('외부 매칭', 'USER_NOT_FOUND 처리됨 - 조용히 종료');

				// 대기 포기 tracking
				if (matchingStartTime.current) {
					const waitTimeSeconds = Math.floor((Date.now() - matchingStartTime.current) / 1000);
					tracker.trackMatchingQueueAbandoned(waitTimeSeconds, {
						matching_type: 'auto',
					});
				}

				if (params.onComplete) {
					params.onComplete();
				}
				return;
			}

			// 매칭 성공 - 대기 시간 tracking
			if (matchingStartTime.current) {
				const waitTimeSeconds = Math.floor((Date.now() - matchingStartTime.current) / 1000);
				tracker.trackMatchingQueueTime(waitTimeSeconds, false, {
					matching_type: 'auto',
				});
			}

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
		} catch (error: any) {
			// USER_NOT_FOUND는 이미 mutationFn에서 처리됨
			// 여기 도달한 에러는 다른 종류의 에러만
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
