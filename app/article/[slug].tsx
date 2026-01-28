import { ArticleDetail } from '@/src/features/article/ui';
import { useLocalSearchParams } from 'expo-router';

export default function ArticleDetailScreen() {
	const { slug, returnPath } = useLocalSearchParams<{ slug: string; returnPath?: string }>();

	return <ArticleDetail idOrSlug={slug} returnPath={returnPath} />;
}
