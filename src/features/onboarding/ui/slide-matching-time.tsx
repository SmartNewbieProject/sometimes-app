import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '@/src/shared/constants/colors';
import { useCountdownTimer } from '../hooks/use-countdown-timer';
import type { SlideComponent } from '../types';

const { width } = Dimensions.get('window');

export const SlideMatchingTime: SlideComponent = () => {
	const { t } = useTranslation();
	const { countdownParts } = useCountdownTimer();

	return (
		<View style={styles.container}>
			{/* flex:1 — 텍스트 헤더 영역 */}
			<View style={styles.headerArea}>
				<Text style={styles.headline}>{t('features.onboarding.slides.matchingTime.headline')}</Text>
				<Text style={styles.subtext}>{t('features.onboarding.slides.matchingTime.subtext')}</Text>
			</View>

			{/* flex:2 — 일러스트 영역 */}
			<View style={styles.illustrationArea}>
				<Image
					source={require('@/assets/images/onboarding/matching_calendar.png')}
					style={styles.image}
					resizeMode="contain"
				/>
			</View>

			{/* flex:1 — 카운트다운 영역 */}
			<View style={styles.countdownArea}>
				<View style={styles.countdownBox}>
					<Text style={styles.countdownLabel}>
						{t('features.onboarding.slides.matchingTime.countdownLabel')}
					</Text>
					<Text style={styles.countdownText}>
						{t('features.onboarding.countdown.format', {
							days: String(countdownParts.days).padStart(2, '0'),
							hours: String(countdownParts.hours).padStart(2, '0'),
							minutes: String(countdownParts.minutes).padStart(2, '0'),
						})}
					</Text>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.white,
		paddingHorizontal: 24,
		paddingTop: 16,
	},
	headerArea: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		maxHeight: 140,
	},
	headline: {
		fontSize: 26,
		fontFamily: 'Pretendard-Bold',
		color: colors.black,
		textAlign: 'center',
		marginBottom: 10,
		lineHeight: 36,
	},
	subtext: {
		fontSize: 16,
		fontFamily: 'Pretendard-Regular',
		color: '#8E94A0',
		textAlign: 'center',
		lineHeight: 24,
	},
	illustrationArea: {
		flex: 2,
		alignItems: 'center',
		justifyContent: 'center',
		maxHeight: Math.min(width * 0.7, 280),
	},
	image: {
		width: '100%',
		height: '100%',
	},
	countdownArea: {
		flex: 1,
		justifyContent: 'center',
		maxHeight: 110,
		paddingBottom: 8,
	},
	countdownBox: {
		width: '100%',
		backgroundColor: '#F3F0FF',
		borderRadius: 16,
		paddingVertical: 18,
		alignItems: 'center',
	},
	countdownLabel: {
		fontSize: 14,
		fontFamily: 'Pretendard-Medium',
		color: '#8E94A0',
		marginBottom: 8,
	},
	countdownText: {
		fontSize: 28,
		fontFamily: 'Pretendard-Bold',
		color: colors.primaryPurple,
	},
});
