import { TestQuestionsScreen } from '@/src/features/ideal-type-test/ui';
import { DefaultLayout } from '@/src/features/layout/ui';
import colors from '@/src/shared/constants/colors';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function MomentIdealTypeTestQuestionsScreen() {
	const router = useRouter();

	return (
		<DefaultLayout style={styles.layout}>
			<TestQuestionsScreen
				source="moment"
				onComplete={() => router.replace('/moment/ideal-type-test/result')}
				onRedirectToStart={() => router.replace('/moment/ideal-type-test')}
				onAbandon={() => router.back()}
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
