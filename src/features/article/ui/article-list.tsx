import colors from '@/src/shared/constants/colors';
import React from 'react';
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

	const handleEndReached = () => {
		if (hasNextPage && !isLoadingMore) {
			loadMore();
		}
	};

	const renderItem = ({ item }: { item: ArticleListItem }) => (
		<ArticleListItemCard article={item} />
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
			contentContainerStyle={styles.list}
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
