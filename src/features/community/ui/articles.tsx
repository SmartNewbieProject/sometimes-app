import { FlatList, View } from 'react-native';
import { ArticleItem } from './article-item';
import { useArticles } from '../hooks/use-articles';
import { Article } from '../types';

interface ArticleListProps {
  type: 'realtime' | 'popular';
}

export function ArticleList({ type }: ArticleListProps) {
  const { articles, isLoading, hasMore, loadMore, refresh } = useArticles(type);

  return (
    <FlatList<Article>
      data={articles}
      renderItem={({ item }) => <ArticleItem article={item} />}
      keyExtractor={(item) => item.id.toString()}
      onEndReached={loadMore}
      onEndReachedThreshold={0.1}
      onRefresh={refresh}
      refreshing={isLoading}
      className="flex-1"
      ItemSeparatorComponent={() => <View className="h-[1px] bg-gray-100" />}
    />
  );
} 