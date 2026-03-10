import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { likeLetterApi } from '../api';

const INITIAL_POLL_INTERVAL_MS = 500; // 처음 5회는 빠르게 폴링
const POLL_INTERVAL_MS = 2000;
const FAST_POLL_COUNT = 5;
const MAX_POLLS = 60; // 최대 2분

export const useLetterPrompts = (connectionId: string) => {
	const pollCountRef = useRef(0);
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ['letter-questions', connectionId],
		queryFn: () => likeLetterApi.getLetterQuestions(connectionId),
		enabled: !!connectionId,
		staleTime: 0,
		retry: 0, // 에러 시 즉시 재시도 없이 refetchInterval에 위임
		refetchInterval: (query) => {
			if (pollCountRef.current >= MAX_POLLS) return false;
			const status = query.state.data?.status;
			// completed / failed 일 때만 폴링 중단, 그 외(pending·null·에러)는 계속
			if (status === 'completed' || status === 'failed') return false;
			pollCountRef.current += 1;
			// 처음 몇 회는 빠르게 폴링 (캐시 시드 감지 + 빠른 응답 대응)
			return pollCountRef.current <= FAST_POLL_COUNT ? INITIAL_POLL_INTERVAL_MS : POLL_INTERVAL_MS;
		},
	});

	// 앱 포그라운드 복귀 시 pending 상태면 폴링 재개
	useEffect(() => {
		const handleAppStateChange = (nextState: AppStateStatus) => {
			if (nextState !== 'active') return;
			const cached = queryClient.getQueryData<{ status: string }>([
				'letter-questions',
				connectionId,
			]);
			if (cached?.status !== 'completed' && cached?.status !== 'failed') {
				pollCountRef.current = 0;
				queryClient.invalidateQueries({ queryKey: ['letter-questions', connectionId] });
			}
		};

		const subscription = AppState.addEventListener('change', handleAppStateChange);
		return () => subscription.remove();
	}, [connectionId, queryClient]);

	return {
		...query,
		questions: query.data?.status === 'completed' ? query.data.questions : [],
		isPending: query.data?.status === 'pending',
		isFailed: query.data?.status === 'failed',
		isTimedOut: pollCountRef.current >= MAX_POLLS && query.data?.status !== 'completed',
	};
};
