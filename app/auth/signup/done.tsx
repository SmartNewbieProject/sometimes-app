import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { DefaultLayout, TwoButtons } from '@/src/features/layout/ui';
import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { MIXPANEL_EVENTS } from '@/src/shared/constants/mixpanel-events';

const celebrationImage = require('@assets/images/info-miho.png');

export default function SignupDoneScreen() {
	const { t } = useTranslation();
	const hasTracked = useRef(false);

	useEffect(() => {
		if (!hasTracked.current) {
			mixpanelAdapter.track(MIXPANEL_EVENTS.SIGNUP_COMPLETED, {
				env: process.env.EXPO_PUBLIC_TRACKING_MODE,
			});
			hasTracked.current = true;
		}
	}, []);

	const handleGoToService = () => {
		router.replace('/onboarding?source=signup');
	};

	return (
		<DefaultLayout style={styles.layout}>
			<View style={styles.content}>
				<Image source={celebrationImage} style={styles.image} resizeMode="contain" />

				<Text style={styles.title}>{t('apps.auth.sign_up.done.title')}</Text>
				<Text style={styles.subtitle}>{t('apps.auth.sign_up.done.subtitle')}</Text>
			</View>

			<View style={styles.buttonContainer}>
				<TwoButtons
					disabledNext={false}
					onClickNext={handleGoToService}
					content={{ next: t('apps.auth.sign_up.done.go_to_service') }}
					hidePrevious
				/>
			</View>
		</DefaultLayout>
	);
}

const styles = StyleSheet.create({
	layout: {
		flex: 1,
		backgroundColor: colors.white,
	},
	content: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 24,
	},
	image: {
		width: 180,
		height: 180,
		marginBottom: 32,
	},
	title: {
		fontSize: 28,
		fontFamily: 'Pretendard-Bold',
		color: colors.black,
		textAlign: 'center',
		marginBottom: 12,
	},
	subtitle: {
		fontSize: 16,
		fontFamily: 'Pretendard-Regular',
		color: colors.gray,
		textAlign: 'center',
		lineHeight: 24,
	},
	buttonContainer: {
		position: 'absolute',
		bottom: 0,
		width: '100%',
		backgroundColor: 'transparent',
	},
});
