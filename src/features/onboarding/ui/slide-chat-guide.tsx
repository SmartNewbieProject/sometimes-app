import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '@/src/shared/constants/colors';
import type { SlideComponent } from '../types';

const { width } = Dimensions.get('window');
const MAX_IMAGE_SIZE = 350;
const imageSize = Math.min(width * 0.9, MAX_IMAGE_SIZE);

export const SlideChatGuide: SlideComponent = () => {
	const { t, i18n } = useTranslation();

	const isJapanese = i18n.language === 'ja';

	const imageSource = isJapanese
		? require('@/assets/images/onboarding/chat_guide_jp.webp')
		: require('@/assets/images/onboarding/chat_guide_kr.webp');

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.headline}>{t('features.onboarding.slides.chatGuide.headline')}</Text>
				<Text style={styles.subtext}>{t('features.onboarding.slides.chatGuide.subtext')}</Text>

				<View style={styles.illustrationArea}>
					<Image source={imageSource} style={styles.image} resizeMode="contain" />
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
		marginTop: 20,
	},
	image: {
		width: '100%',
		height: '100%',
	},
});
