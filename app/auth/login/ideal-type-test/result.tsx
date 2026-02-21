import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { useTestProgress } from '@/src/features/ideal-type-test/hooks/use-test-progress';
import { useTestSession } from '@/src/features/ideal-type-test/hooks/use-test-session';
import { AuthBottomSheet, TestResultScreen } from '@/src/features/ideal-type-test/ui';
import { DefaultLayout } from '@/src/features/layout/ui';
import colors from '@/src/shared/constants/colors';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { SlideInUp } from 'react-native-reanimated';

export default function AuthIdealTypeTestResultScreen() {
	const router = useRouter();
	const { t } = useTranslation();
	const { isAuthorized } = useAuth();
	const { sessionId, clear } = useTestProgress();
	const { clearSession } = useTestSession();
	const [showAuthSheet, setShowAuthSheet] = useState(false);

	const handleCta = () => {
		if (isAuthorized) {
			clear();
			router.replace('/home');
		} else {
			setShowAuthSheet(true);
		}
	};

	const handleDismiss = async () => {
		clear();
		await clearSession();
		router.back();
	};

	return (
		<DefaultLayout style={styles.layout}>
			<TestResultScreen
				source="auth"
				ctaText={t('features.ideal-type-test.result.save_and_match_button')}
				onCtaPress={handleCta}
				showDismissButton
				onDismiss={handleDismiss}
				onRedirectToStart={() => router.replace('/auth/login/ideal-type-test')}
			>
				{showAuthSheet && (
					<View style={styles.overlay}>
						<Pressable style={styles.overlayBackdrop} onPress={() => setShowAuthSheet(false)} />
						<Animated.View entering={SlideInUp.duration(300)} style={styles.sheetWrapper}>
							<AuthBottomSheet
								sessionId={sessionId}
								onClose={() => setShowAuthSheet(false)}
								onAuthComplete={() => {
									clear();
									setShowAuthSheet(false);
								}}
							/>
						</Animated.View>
					</View>
				)}
			</TestResultScreen>
		</DefaultLayout>
	);
}

const styles = StyleSheet.create({
	layout: {
		flex: 1,
		backgroundColor: colors.white,
		overflow: 'hidden',
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		zIndex: 100,
		justifyContent: 'flex-end',
	},
	overlayBackdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	sheetWrapper: {
		width: '100%',
	},
});
