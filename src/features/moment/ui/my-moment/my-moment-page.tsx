import colors from '@/src/shared/constants/colors';
import type React from 'react';
import { useEffect } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';
import { useMomentAnalytics } from '../../hooks/use-moment-analytics';
import { useDailyQuestionQuery, useProgressStatusQuery } from '../../queries';
import { ChallengeCard } from './ui/challenge-card/index';
import { GuideSection } from './ui/guide-section';
import { HistorySection } from './ui/history-section';
import { RecentMoment } from './ui/recent-moment';

const { width } = Dimensions.get('window');

interface MyMomentPageProps {
	onBackPress?: () => void;
}

export const MyMomentPage: React.FC<MyMomentPageProps> = ({ onBackPress }) => {
	const {
		data: dailyQuestion,
		isLoading: questionLoading,
		error: questionError,
	} = useDailyQuestionQuery();
	const { data: progressStatus } = useProgressStatusQuery();
	const { trackMyMomentView, trackGuideRewardView } = useMomentAnalytics();

	useEffect(() => {
		if (!questionLoading && progressStatus) {
			const hasDailyQuestion = !!dailyQuestion?.question;
			const isResponded = !progressStatus.canProceed && progressStatus.hasTodayAnswer;
			trackMyMomentView({
				source: 'navigation',
				has_daily_question: hasDailyQuestion,
				is_responded: isResponded,
				is_blocked: !progressStatus.canProceed && !progressStatus.hasTodayAnswer,
			});

			if (isResponded) {
				trackGuideRewardView({ reward_type: 'gem' });
			}
		}
	}, [questionLoading, progressStatus, dailyQuestion]);

	const isCompleted = (progressStatus?.answeredThisWeek ?? 0) >= 5;

	if (questionLoading) {
		return (
			<View style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primaryPurple} />
				</View>
			</View>
		);
	}

	if (questionError) {
		return (
			<View style={styles.container}>
				<View style={styles.errorContainer}>
					<Image
						source={require('@/assets/images/moment/paw-prints-top.webp')}
						style={styles.pawPrints}
						resizeMode="contain"
					/>
					<Image
						source={require('@/assets/images/moment/my-moment-bg.webp')}
						style={styles.background}
						resizeMode="stretch"
					/>
					<GuideSection />
					<ChallengeCard
						answeredThisWeek={0}
						dayOfWeek={1}
						canProceed={false}
						hasTodayAnswer={false}
					/>
					<RecentMoment />
					<HistorySection />
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				<Image
					source={require('@/assets/images/moment/paw-prints-top.webp')}
					style={styles.pawPrints}
					resizeMode="contain"
				/>
				<Image
					source={require('@/assets/images/moment/my-moment-bg.webp')}
					style={styles.background}
					resizeMode="stretch"
				/>
				<GuideSection responded={isCompleted} />
				<ChallengeCard
					answeredThisWeek={progressStatus?.answeredThisWeek ?? 0}
					dayOfWeek={progressStatus?.dayOfWeek ?? 1}
					canProceed={progressStatus?.canProceed ?? false}
					hasTodayAnswer={progressStatus?.hasTodayAnswer ?? false}
				/>
				<RecentMoment />
				<HistorySection />
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.momentBackground,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	errorContainer: {
		flex: 1,
	},
	pawPrints: {
		position: 'absolute',
		top: 0,
		left: 20,
		width: 120,
		height: 100,
		zIndex: 0, // Above background color, below content? Or just decoration.
		opacity: 0.6,
	},
	background: {
		position: 'absolute',
		top: 70, // Moved down as requested
		left: 0,
		right: 0,
		width: '100%',
		height: width * 1.2,
		zIndex: 0,
	},
	scrollContent: {
		paddingTop: 40,
		paddingBottom: 100,
	},
});
