import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { likeLetterApi } from '../api';

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 15;

export const useLetterPrompts = (connectionId: string) => {
	const pollCountRef = useRef(0);
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ['letter-questions', connectionId],
		queryFn: () => likeLetterApi.getLetterQuestions(connectionId),
		enabled: !!connectionId,
		staleTime: 0,
		refetchInterval: (query) => {
			if (query.state.data?.status !== 'pending') return false;
			if (pollCountRef.current >= MAX_POLLS) return false;
			pollCountRef.current += 1;
			return POLL_INTERVAL_MS;
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
			if (cached?.status === 'pending') {
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
		isTimedOut: pollCountRef.current >= MAX_POLLS && query.data?.status === 'pending',
	};
};
