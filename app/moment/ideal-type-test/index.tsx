import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { useRetakeEligibility } from '@/src/features/ideal-type-test/hooks/use-retake-eligibility';
import type { LanguageCode } from '@/src/features/ideal-type-test/types';
import { TestStartScreen } from '@/src/features/ideal-type-test/ui';
import { DefaultLayout } from '@/src/features/layout/ui';
import colors from '@/src/shared/constants/colors';
import { Header } from '@/src/shared/ui/header';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

export default function MomentIdealTypeTestStartScreen() {
	const router = useRouter();
	const { i18n } = useTranslation();
	const { isAuthorized } = useAuth();
	const currentLang = (i18n.language?.startsWith('ja') ? 'ja' : 'ko') as LanguageCode;
	const { canRetake, daysUntilRetake } = useRetakeEligibility({
		lang: currentLang,
		enabled: isAuthorized,
	});

	return (
		<DefaultLayout style={styles.layout}>
			<Header showBackButton showLogo={false} />
			<TestStartScreen
				source="moment"
				onNavigateToQuestions={() => router.push('/moment/ideal-type-test/questions')}
				onNavigateToResult={() => router.push('/moment/ideal-type-test/result')}
				onGoBack={() => router.back()}
				retakeRestriction={{ canRetake, daysUntilRetake }}
			/>
		</DefaultLayout>
	);
}

const styles = StyleSheet.create({
	layout: {
		flex: 1,
		backgroundColor: colors.white,
	},
});
