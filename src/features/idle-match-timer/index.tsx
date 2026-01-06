import { dayUtils } from '@/src/shared/libs';
import { Suspense, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useMatchLoading } from './hooks';
import { useLatestMatching } from './queries';
import { useProfileDetailsQuery } from '@/src/features/auth/queries';
import { useStorage } from '@/src/shared/hooks/use-storage';
import type { MatchDetails, OpenMatch } from './types';
import { Waiting, Error, LoadingSkeleton } from './ui';
import { Container } from './ui/container';
import { InteractionNavigation } from './ui/nav';
import { NotFound } from './ui/not-found';
import { Partner } from './ui/partner';
import { RematchLoading } from './ui/rematching';
import { PendingApproval } from './ui/pending-approval';
import { ProfilePhotoRejected } from './ui/profile-photo-rejected';

const createDefaultWaitingMatch = (): MatchDetails => ({
	type: 'waiting',
	untilNext: dayUtils.create().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
	partner: null,
	id: null,
	endOfView: null,
	connectionId: null,
});

function IdleMatchTimerContent() {
	const { match, isError, refetch } = useLatestMatching();
	const { value: accessToken } = useStorage<string | null>({
		key: 'access-token',
		initialValue: null,
	});
	const { data: profileDetails } = useProfileDetailsQuery(accessToken ?? null);
	const { rematchingLoading, finishRematching, loading: realRematchingLoading } = useMatchLoading();

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
		if (isError) {
			return <Error />;
		}

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
				return <Partner match={match as OpenMatch} />;
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
				return <NotFound />;
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
	const shouldShowGradient = !isPartnerView || isError;

	return (
		<View>
			<View style={styles.container}>
				<Container gradientMode={shouldShowGradient}>{renderContent()}</Container>
			</View>
			<InteractionNavigation match={match} />
		</View>
	);
}

export default function IdleMatchTimer() {
	return (
		<Suspense fallback={<LoadingSkeleton />}>
			<IdleMatchTimerContent />
		</Suspense>
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
