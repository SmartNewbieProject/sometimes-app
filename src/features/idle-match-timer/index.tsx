import { useProfileDetailsQuery } from '@/src/features/auth/queries';
import { useQueryClient } from '@tanstack/react-query';
import { useStorage } from '@/src/shared/hooks/use-storage';
import { dayUtils } from '@/src/shared/libs';
import { Suspense, useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ErrorBoundary } from 'react-error-boundary';
import { useMatchLoading } from './hooks';
import { useSecondaryMatch } from './hooks/use-secondary-match';
import { useLatestMatchingV31 } from './queries/use-latest-matching-v31';
import type { MatchDetails, OpenMatch } from './types';
import { Error, LoadingSkeleton, Waiting } from './ui';
import { Container } from './ui/container';
import { InteractionNavigation } from './ui/nav';
import { NotFound } from './ui/not-found';
import { Partner } from './ui/partner';
import { PendingApproval } from './ui/pending-approval';
import { ProfilePhotoRejected } from './ui/profile-photo-rejected';
import { RematchLoading } from './ui/rematching';

const createDefaultWaitingMatch = (): MatchDetails => ({
	type: 'waiting',
	untilNext: dayUtils.create().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
	partner: null,
	id: null,
	endOfView: null,
	connectionId: null,
});

function IdleMatchTimerContent() {
	const { primary, secondary, refetch } = useLatestMatchingV31();
	const match = primary;
	const { value: accessToken } = useStorage<string | null>({
		key: 'access-token',
		initialValue: null,
	});
	const { data: profileDetails } = useProfileDetailsQuery(accessToken ?? null);
	const { rematchingLoading, finishRematching, loading: realRematchingLoading } = useMatchLoading();
	const setSecondary = useSecondaryMatch((s) => s.setSecondary);
	const setNotFoundMatch = useSecondaryMatch((s) => s.setNotFoundMatch);

	// secondary 변경 시 전역 store 동기화 (home의 floating PeekSheet에서 사용)
	useEffect(() => {
		setSecondary(secondary ?? null);
		return () => setSecondary(null);
	}, [secondary, setSecondary]);

	// not-found + untilNext → PeekSheet에 다음 매칭 시간 노출
	useEffect(() => {
		if (match?.type === 'not-found' && match.untilNext) {
			setNotFoundMatch(match);
		} else {
			setNotFoundMatch(null);
		}
		return () => setNotFoundMatch(null);
	}, [match?.type, match?.untilNext, setNotFoundMatch]);

	useEffect(() => {
		if (rematchingLoading) {
			const timer = setTimeout(() => {
				if (realRematchingLoading) {
					const interval = setInterval(() => {
						if (!realRematchingLoading) {
							clearInterval(interval);
							finishRematching();
						}
					}, 100);
				} else {
					finishRematching();
				}
			}, 4000);

			return () => clearTimeout(timer);
		}
	}, [rematchingLoading, realRematchingLoading, finishRematching]);

	// 프로필 사진 거절 상태 체크 (최우선)
	if (profileDetails?.status === 'rejected') {
		return (
			<View style={styles.container}>
				<Container gradientMode>
					<ProfilePhotoRejected />
				</Container>
			</View>
		);
	}

	if (rematchingLoading) {
		return (
			<View style={styles.container}>
				<Container gradientMode>
					<RematchLoading />
				</Container>
			</View>
		);
	}

	const renderContent = () => {
		if (!match) {
			return (
				<Waiting
					match={
						createDefaultWaitingMatch() as MatchDetails & { type: 'waiting'; untilNext: string }
					}
					onTimeEnd={refetch}
				/>
			);
		}

		switch (match.type) {
			case 'open':
			case 'rematching':
				return (
					<Partner
						match={match as OpenMatch}
						category={match.category}
						showCategoryBadge={!!secondary}
					/>
				);
			case 'pending-approval':
				return (
					<PendingApproval
						match={
							match as MatchDetails & {
								type: 'pending-approval';
								untilNext: string;
								approvalStatus: 'pending' | 'approved' | 'rejected';
							}
						}
						onTimeEnd={refetch}
					/>
				);
			case 'not-found':
				return <NotFound failureCode={match.failureCode} failureReason={match.failureReason} />;
			case 'waiting':
				return (
					<Waiting
						match={match as MatchDetails & { type: 'waiting'; untilNext: string }}
						onTimeEnd={refetch}
					/>
				);
			default:
				return (
					<Waiting
						match={
							createDefaultWaitingMatch() as MatchDetails & { type: 'waiting'; untilNext: string }
						}
						onTimeEnd={refetch}
					/>
				);
		}
	};

	const isPartnerView = match?.type === 'open' || match?.type === 'rematching';
	const shouldShowGradient = !isPartnerView;

	return (
		<View>
			<View style={styles.container}>
				<Container gradientMode={shouldShowGradient} category={match?.category}>
					{renderContent()}
				</Container>
			</View>
			<InteractionNavigation match={match} />
		</View>
	);
}

function MatchingErrorFallback({ resetErrorBoundary }: { resetErrorBoundary: () => void }) {
	return (
		<View style={styles.container}>
			<Container gradientMode>
				<Error onRetry={resetErrorBoundary} />
			</Container>
		</View>
	);
}

export default function IdleMatchTimer() {
	const queryClient = useQueryClient();
	const handleReset = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ['latest-matching-v31'] });
	}, [queryClient]);

	return (
		<ErrorBoundary FallbackComponent={MatchingErrorFallback} onReset={handleReset}>
			<Suspense fallback={<LoadingSkeleton />}>
				<IdleMatchTimerContent />
			</Suspense>
		</ErrorBoundary>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',

		alignSelf: 'center',

		flex: 1,
		borderRadius: 20,
		display: 'flex',
		flexDirection: 'column',
	},
});
