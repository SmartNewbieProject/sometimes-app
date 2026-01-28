import {
	ArticleListScreen,
	AuthTabBar,
	type AuthTab,
} from '@/src/features/article/ui';
import { Stack, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function SometimesStoryScreen() {
	const router = useRouter();

	const handleTabChange = (tab: AuthTab) => {
		if (tab === 'login') {
			router.replace('/auth/login');
		}
	};

	return (
		<View style={styles.container}>
			<Stack.Screen options={{ headerShown: false }} />
			<ArticleListScreen />
			<AuthTabBar activeTab="story" onTabChange={handleTabChange} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
});
