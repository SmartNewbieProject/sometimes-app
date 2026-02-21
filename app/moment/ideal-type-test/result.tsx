import { useShareTestResult } from '@/src/features/ideal-type-test/hooks/use-share-test-result';
import { useTestProgress } from '@/src/features/ideal-type-test/hooks/use-test-progress';
import { TestResultScreen } from '@/src/features/ideal-type-test/ui';
import { DefaultLayout } from '@/src/features/layout/ui';
import colors from '@/src/shared/constants/colors';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

export default function MomentIdealTypeTestResultScreen() {
	const router = useRouter();
	const { t } = useTranslation();
	const { result, sessionId, clear } = useTestProgress();

	const { shareNative } = useShareTestResult({
		resultName: result?.name || '',
		resultEmoji: result?.emoji || '',
		resultId: result?.id || '',
		sessionId,
	});

	return (
		<DefaultLayout style={styles.layout}>
			<TestResultScreen
				source="moment"
				ctaText={t('features.ideal-type-test.result.confirm_button')}
				onCtaPress={() => {
					clear();
					router.replace('/moment');
				}}
				showShareButton
				onSharePress={shareNative}
				showDismissButton={false}
				onRedirectToStart={() => router.replace('/moment/ideal-type-test')}
			/>
		</DefaultLayout>
	);
}

const styles = StyleSheet.create({
	layout: {
		flex: 1,
		backgroundColor: colors.white,
		overflow: 'hidden',
	},
});
