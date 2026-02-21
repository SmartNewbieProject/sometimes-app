import { useMatchLoading } from '@/src/features/idle-match-timer/hooks/use-match-loading';
import { RematchLoading } from '@/src/features/idle-match-timer/ui/rematching';
import { PurpleGradient } from '@/src/shared/ui';
import { ImageBackground } from 'expo-image';
import { Suspense, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { useFirstGlobalMatch } from '../hooks/use-first-global-match';
import { useGlobalMatching } from '../queries';
import { isOpenGlobalMatch } from '../types';
import { GlobalFirstMatch } from './global-first-match';
import { GlobalNav } from './global-nav';
import { GlobalNotFound } from './global-not-found';
import { GlobalPartnerCard } from './global-partner-card';
import { GlobalPendingApproval } from './global-pending-approval';

const LoadingSkeleton = () => (
	<View style={[styles.container, { height: 350 }]}>
		<PurpleGradient />
	</View>
);

function GlobalMatchingTimerContent() {
	const { match, isError, refetch } = useGlobalMatching();
	const [width, setWidth] = useState(0);
	const rematchingLoading = useMatchLoading((s) => s.rematchingLoading);
	const { isFirstGlobalMatch } = useFirstGlobalMatch();
	const [selectedPreferenceIds, setSelectedPreferenceIds] = useState<string[] | null>(null);

	const onLayout = (event: LayoutChangeEvent) => {
		setWidth(event.nativeEvent.layout.width);
	};

	const isPartnerView = isOpenGlobalMatch(match);
	const isNotFound = !match || isError || match.type === 'not-found';
	const showFirstMatch = isFirstGlobalMatch && isNotFound;
	const shouldShowGradient = !isPartnerView || isError;

	if (rematchingLoading) {
		return (
			<View>
				<View style={[styles.container, { height: width || 350 }]}>
					<RematchLoading />
				</View>
			</View>
		);
	}

	const notFoundContent = isFirstGlobalMatch ? <GlobalFirstMatch /> : <GlobalNotFound />;

	const renderContent = () => {
		if (isError || !match) {
			return notFoundContent;
		}

		switch (match.type) {
			case 'open':
				return isOpenGlobalMatch(match) ? <GlobalPartnerCard match={match} /> : notFoundContent;
			case 'not-found':
				return notFoundContent;
			case 'pending-approval':
				return <GlobalPendingApproval />;
			default:
				return notFoundContent;
		}
	};

	const containerHeight =
		match?.type === 'not-found' || match?.type === 'pending-approval' ? 400 : width || 350;

	if (showFirstMatch) {
		return (
			<View>
				<View onLayout={onLayout} style={[styles.container, { aspectRatio: 1 }]}>
					<GlobalFirstMatch onPreferenceSelected={setSelectedPreferenceIds} />
				</View>
				<GlobalNav match={match} preferenceOptionIds={selectedPreferenceIds} />
			</View>
		);
	}

	if (shouldShowGradient) {
		return (
			<View>
				<View onLayout={onLayout} style={[styles.container, { height: containerHeight }]}>
					<PurpleGradient />
					{renderContent()}
				</View>
				<GlobalNav match={match} />
			</View>
		);
	}

	const mainImageUrl = match.partner?.mainProfileImageUrl;

	return (
		<View>
			<ImageBackground
				source={{ uri: mainImageUrl ?? '' }}
				onLayout={onLayout}
				style={[styles.container, { height: containerHeight }]}
			>
				{renderContent()}
			</ImageBackground>
			<GlobalNav match={match} />
		</View>
	);
}

export default function GlobalMatchingTimer() {
	return (
		<Suspense fallback={<LoadingSkeleton />}>
			<GlobalMatchingTimerContent />
		</Suspense>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		overflow: 'hidden',
		borderRadius: 20,
	},
});
