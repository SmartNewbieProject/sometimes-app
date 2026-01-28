import { useArticles } from '@/src/features/article/queries';
import type { ArticleCategory, ArticleListItem } from '@/src/features/article/types';
import colors from '@/src/shared/constants/colors';
import type React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SometimeArticleCard } from './sometime-article-card';

interface SometimeArticleListProps {
	category?: ArticleCategory;
	ListHeaderComponent?: React.ReactElement;
	embedded?: boolean;
}

export const SometimeArticleList = ({
	category,
	ListHeaderComponent,
	embedded,
}: SometimeArticleListProps) => {
	const { articles, isLoading, isLoadingMore, hasNextPage, loadMore, refresh } = useArticles({
		category,
	});

	const handleEndReached = () => {
		if (hasNextPage && !isLoadingMore) {
			loadMore();
		}
	};

	const renderItem = ({ item }: { item: ArticleListItem }) => (
		<SometimeArticleCard article={item} embedded={embedded} />
	);

	const renderFooter = () => {
		if (!isLoadingMore) return null;
		return (
			<View style={styles.footer}>
				<ActivityIndicator size="small" color={colors.brand.primary} />
			</View>
		);
	};

	const renderEmpty = () => {
		if (isLoading) return null;
		return (
			<View style={styles.empty}>
				<Text style={styles.emptyText}>아직 등록된 글이 없어요</Text>
			</View>
		);
	};

	if (isLoading) {
		return (
			<View style={styles.loading}>
				<ActivityIndicator size="large" color={colors.brand.primary} />
			</View>
		);
	}

	return (
		<FlatList
			data={articles}
			renderItem={renderItem}
			keyExtractor={(item) => item.id}
			contentContainerStyle={[styles.list, embedded && styles.listEmbedded]}
			showsVerticalScrollIndicator={false}
			onEndReached={handleEndReached}
			onEndReachedThreshold={0.5}
			ListHeaderComponent={ListHeaderComponent}
			ListFooterComponent={renderFooter}
			ListEmptyComponent={renderEmpty}
			refreshControl={
				<RefreshControl refreshing={false} onRefresh={refresh} tintColor={colors.brand.primary} />
			}
		/>
	);
};

const styles = StyleSheet.create({
	list: {
		paddingTop: 20,
		paddingBottom: 40,
	},
	listEmbedded: {
		paddingTop: 16,
		paddingBottom: 100,
	},
	loading: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	footer: {
		paddingVertical: 20,
	},
	empty: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 60,
	},
	emptyText: {
		fontSize: 16,
		color: colors.text.muted,
	},
});
