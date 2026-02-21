import { ArticleDetail } from '@/src/features/article/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { BottomNavigation, HeaderWithNotification, Text } from '@/src/shared/ui';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function CommunityArticleDetailScreen() {
	const { slug } = useLocalSearchParams<{ slug: string }>();

	return (
		<View style={styles.container}>
			<HeaderWithNotification
				centerContent={
					<Text weight="bold" textColor="black">
						썸타임 이야기
					</Text>
				}
			/>

			<View style={styles.articleContainer}>
				<ArticleDetail
					idOrSlug={slug}
					returnPath="/community?category=__sometime_story__"
				/>
			</View>

			<BottomNavigation />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: semanticColors.surface.background,
	},
	articleContainer: {
		flex: 1,
	},
});
