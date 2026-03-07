import colors from '@/src/shared/constants/colors';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useArticles } from '../queries';
import type { ArticleCategory, ArticleListItem } from '../types';
import { ArticleListItemCard } from './article-list-item';

interface ArticleListProps {
	category?: ArticleCategory;
	ListHeaderComponent?: React.ReactElement;
}

export const ArticleList = ({ category, ListHeaderComponent }: ArticleListProps) => {
	const { articles, isLoading, isLoadingMore, hasNextPage, loadMore, refresh } = useArticles({
		category,
	});

	const handleEndReached = useCallback(() => {
		if (hasNextPage && !isLoadingMore) {
			loadMore();
		}
	}, [hasNextPage, isLoadingMore, loadMore]);

	const renderItem = useCallback(
		({ item }: { item: ArticleListItem }) => <ArticleListItemCard article={item} />,
		[],
	);

	const keyExtractor = useCallback((item: ArticleListItem) => item.id, []);

	const renderFooter = useCallback(() => {
		if (!isLoadingMore) return null;
		return (
			<View style={styles.footer}>
				<ActivityIndicator size="small" color={colors.brand.primary} />
			</View>
		);
	}, [isLoadingMore]);

	const renderEmpty = useCallback(() => {
		if (isLoading) return null;
		return (
			<View style={styles.empty}>
				<Text style={styles.emptyText}>아직 등록된 글이 없어요</Text>
			</View>
		);
	}, [isLoading]);

	const refreshControl = useMemo(
		() => (
			<RefreshControl refreshing={false} onRefresh={refresh} tintColor={colors.brand.primary} />
		),
		[refresh],
	);

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
			keyExtractor={keyExtractor}
			contentContainerStyle={styles.list}
			showsVerticalScrollIndicator={false}
			onEndReached={handleEndReached}
			onEndReachedThreshold={0.5}
			ListHeaderComponent={ListHeaderComponent}
			ListFooterComponent={renderFooter}
			ListEmptyComponent={renderEmpty}
			refreshControl={refreshControl}
			initialNumToRender={8}
			maxToRenderPerBatch={8}
			windowSize={7}
			removeClippedSubviews
		/>
	);
};

const styles = StyleSheet.create({
	list: {
		paddingTop: 20,
		paddingBottom: 40,
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
