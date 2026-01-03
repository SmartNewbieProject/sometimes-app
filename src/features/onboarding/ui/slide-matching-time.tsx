import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '@/src/shared/constants/colors';
import { useCountdownTimer } from '../hooks/use-countdown-timer';
import type { SlideComponent } from '../types';

const { width } = Dimensions.get('window');
const MAX_IMAGE_SIZE = 280;
const imageSize = Math.min(width * 0.6, MAX_IMAGE_SIZE);

export const SlideMatchingTime: SlideComponent = () => {
	const { t } = useTranslation();
	const { countdownParts } = useCountdownTimer();

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.headline}>{t('features.onboarding.slides.matchingTime.headline')}</Text>
				<Text style={styles.subtext}>{t('features.onboarding.slides.matchingTime.subtext')}</Text>

				<View style={styles.illustrationArea}>
					<Image
						source={require('@/assets/images/onboarding/matching_calendar.png')}
						style={styles.image}
						resizeMode="contain"
					/>
				</View>

				<View style={styles.countdownBox}>
					<Text style={styles.countdownLabel}>
						{t('features.onboarding.slides.matchingTime.countdownLabel')}
					</Text>
					<Text style={styles.countdownText}>
						{`${String(countdownParts.days).padStart(2, '0')}일 ${String(countdownParts.hours).padStart(2, '0')}시간 ${String(countdownParts.minutes).padStart(2, '0')}분`}
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
		paddingTop: 80,
	},
	content: {
		width: '100%',
		alignItems: 'center',
	},
	headline: {
		fontSize: 26,
		fontFamily: 'Pretendard-Bold',
		color: colors.black,
		textAlign: 'center',
		marginBottom: 12,
		lineHeight: 36,
	},
	subtext: {
		fontSize: 16,
		fontFamily: 'Pretendard-Regular',
		color: '#8E94A0',
		textAlign: 'center',
		marginBottom: 40,
		lineHeight: 24,
	},
	illustrationArea: {
		width: imageSize,
		height: imageSize,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
	},
	image: {
		width: '100%',
		height: '100%',
	},
	countdownBox: {
		width: '100%',
		backgroundColor: '#F3F0FF',
		borderRadius: 16,
		paddingVertical: 20,
		alignItems: 'center',
		marginTop: 20,
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
