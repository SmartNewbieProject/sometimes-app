import colors from '@/src/shared/constants/colors';
import { useMixpanel } from '@/src/shared/hooks';
import { useFocusEffect } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useQueryClient } from '@tanstack/react-query';
import { MOMENT_NAVIGATION_ITEMS } from '../constants/navigation-data';
import { useMomentAnalytics } from '../hooks/use-moment-analytics';
import { prefetchDailyQuestion, useMomentSlidesQuery } from '../queries';
import { MomentHeader } from './moment-header';
import { MomentNavigationMenu } from './navigation-menu';
import { MomentSlides } from './slides';

export const MomentPage = () => {
	const { data: slides = [], isLoading: slidesLoading } = useMomentSlidesQuery();
	const { momentEvents, featureEvents } = useMixpanel();
	const queryClient = useQueryClient();
	const { trackMomentHomeView } = useMomentAnalytics();

	useFocusEffect(
		React.useCallback(() => {
			featureEvents.trackFeatureUsed('moment', 'navigation');
			trackMomentHomeView({ source: 'navigation' });

			queryClient.refetchQueries({ queryKey: ['moment', 'daily-question'] });
			queryClient.refetchQueries({ queryKey: ['moment', 'progress-status'] });
			queryClient.refetchQueries({ queryKey: ['moment', 'moment-slides'] });

			return () => {};
		}, [queryClient, trackMomentHomeView]),
	);

	return (
		<View style={styles.container}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<MomentHeader />

				{!slidesLoading && slides.length > 0 && (
					<MomentSlides items={slides} autoPlayInterval={5000} height={248} />
				)}

				<View style={styles.navigationContainer}>
					<MomentNavigationMenu
						items={MOMENT_NAVIGATION_ITEMS.slice(0, 2)}
						itemHeight={'lg'}
						itemsPerRow={2}
					/>

					<MomentNavigationMenu
						items={MOMENT_NAVIGATION_ITEMS.slice(3, 6)}
						itemHeight={'md'}
						itemsPerRow={3}
					/>
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.white,
		width: '100%',
	},
	scrollView: {
		flex: 1,
		width: '100%',
	},
	scrollContent: {
		flexGrow: 1,
		width: '100%',
		alignItems: 'center',
	},
	navigationContainer: {
		width: '100%',
		marginTop: 24,
		marginBottom: 48,
	},
});
