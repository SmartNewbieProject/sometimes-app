import colors from '@/src/shared/constants/colors';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import type { SlideComponent } from '../types';

const { width } = Dimensions.get('window');

const NOTIFICATION_ITEMS = [
	{ emoji: '💬', titleKey: 'notification_chat', bodyKey: 'notification_chat_body' },
	{ emoji: '💌', titleKey: 'notification_match', bodyKey: 'notification_match_body' },
] as const;

export const SlideNotification: SlideComponent = () => {
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.headline}>{t('features.onboarding.slides.notification.headline')}</Text>
				<Text style={styles.subtext}>{t('features.onboarding.slides.notification.subtext')}</Text>

				<View style={styles.illustrationArea}>
					{NOTIFICATION_ITEMS.map(({ emoji, titleKey, bodyKey }) => (
						<View key={titleKey} style={styles.notificationCard}>
							<View style={styles.notificationIcon}>
								<Text style={styles.notificationEmoji}>{emoji}</Text>
							</View>
							<View style={styles.notificationTextArea}>
								<Text style={styles.notificationTitle}>
									{t(`features.onboarding.slides.notification.${titleKey}`)}
								</Text>
								<Text style={styles.notificationBody}>
									{t(`features.onboarding.slides.notification.${bodyKey}`)}
								</Text>
							</View>
						</View>
					))}
				</View>
			</View>
		</View>
	);
};

const cardWidth = Math.min(width * 0.85, 340);

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
		width: cardWidth,
		gap: 12,
	},
	notificationCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#F5F0FF',
		borderRadius: 16,
		padding: 16,
		gap: 14,
	},
	notificationIcon: {
		width: 44,
		height: 44,
		borderRadius: 12,
		backgroundColor: colors.primaryPurple,
		justifyContent: 'center',
		alignItems: 'center',
	},
	notificationEmoji: {
		fontSize: 22,
	},
	notificationTextArea: {
		flex: 1,
		gap: 2,
	},
	notificationTitle: {
		fontSize: 14,
		fontFamily: 'Pretendard-Bold',
		color: colors.black,
	},
	notificationBody: {
		fontSize: 13,
		fontFamily: 'Pretendard-Regular',
		color: '#8E94A0',
	},
});
