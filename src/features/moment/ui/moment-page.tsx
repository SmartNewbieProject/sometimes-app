import colors from '@/src/shared/constants/colors';
import { useMixpanel } from '@/src/shared/hooks';
import { Button, Text } from '@/src/shared/ui';
import { router, useFocusEffect } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useQueryClient } from '@tanstack/react-query';
import { MOMENT_NAVIGATION_ITEMS } from '../constants/navigation-data';
import { useMomentAnalytics } from '../hooks/use-moment-analytics';
import { prefetchDailyQuestion, useMomentSlidesQuery } from '../queries';
import { useOnboardingStatusQuery } from '../queries/onboarding';
import { useMomentOnboardingEnabled } from '../queries/use-moment-onboarding-enabled';
import { MomentHeader } from './moment-header';
import { MomentNavigationMenu } from './navigation-menu';
import { MomentSlides } from './slides';

export const MomentPage = () => {
	const { t } = useTranslation();
	const { data: slides = [], isLoading: slidesLoading } = useMomentSlidesQuery();
	const { momentEvents, featureEvents } = useMixpanel();
	const queryClient = useQueryClient();
	const { trackMomentHomeView } = useMomentAnalytics();

	const { data: featureFlag } = useMomentOnboardingEnabled();
	const { data: onboardingStatus } = useOnboardingStatusQuery(featureFlag?.enabled ?? false);

	const isOnboardingEnabled = featureFlag?.enabled ?? false;
	const needsOnboarding = onboardingStatus?.needsOnboarding ?? false;
	const hasSkipped = onboardingStatus?.hasSkipped ?? false;

	useEffect(() => {
		if (isOnboardingEnabled && needsOnboarding && !hasSkipped) {
			router.replace('/moment/onboarding');
		}
	}, [isOnboardingEnabled, needsOnboarding, hasSkipped]);

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

				{/* 건너뛰기 후 돌아온 유저를 위한 CTA 배너 */}
				{isOnboardingEnabled && needsOnboarding && hasSkipped && (
					<Pressable
						style={styles.onboardingBanner}
						onPress={() => router.push('/moment/onboarding')}
					>
						<View style={styles.bannerContent}>
							<Sparkles size={18} color={colors.primaryPurple} />
							<View style={styles.bannerTextContainer}>
								<Text size="15" weight="semibold" textColor="black">
									{t('features.moment.onboarding.intro.title')}
								</Text>
								<Text size="13" weight="normal" textColor="gray">
									{t('features.moment.onboarding.intro.subtitle')}
								</Text>
							</View>
						</View>
						<Text size="13" weight="semibold" style={{ color: colors.primaryPurple }}>
							{t('features.moment.onboarding.intro.start_button')}
						</Text>
					</Pressable>
				)}

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
	onboardingBanner: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#F8F5FF',
		marginHorizontal: 16,
		marginTop: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#E8DEFF',
	},
	bannerContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		flex: 1,
	},
	bannerTextContainer: {
		flex: 1,
		gap: 2,
	},
});
