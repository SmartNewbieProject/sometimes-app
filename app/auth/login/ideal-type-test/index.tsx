import { TestStartScreen } from '@/src/features/ideal-type-test/ui';
import { DefaultLayout } from '@/src/features/layout/ui';
import colors from '@/src/shared/constants/colors';
import { Header } from '@/src/shared/ui/header';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function AuthIdealTypeTestStartScreen() {
	const router = useRouter();

	return (
		<DefaultLayout style={styles.layout}>
			<Header showBackButton showLogo={false} />
			<TestStartScreen
				source="auth"
				onNavigateToQuestions={() => router.push('/auth/login/ideal-type-test/questions')}
				onNavigateToResult={() => router.push('/auth/login/ideal-type-test/result')}
				onGoBack={() => router.back()}
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
