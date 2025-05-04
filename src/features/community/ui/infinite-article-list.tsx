import { TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import { Article } from './article';
import { IconWrapper } from '@/src/shared/ui/icons';
import VectorIcon from '@/assets/icons/Vector.svg';
import { Text } from '@/src/shared/ui';
import { useCategory, useInfiniteArticles } from '../hooks';
import { InfiniteScrollView } from '../../../shared/infinite-scroll';
import { router } from 'expo-router';
import { Article as ArticleType } from '../types';
import { tryCatch } from '@/src/shared/libs';
import apis from '../apis';
import { forwardRef, useImperativeHandle } from 'react';

interface InfiniteArticleListProps {
  initialSize?: number;
}

export interface InfiniteArticleListHandle {
  refresh: () => void;
}

export const InfiniteArticleList = forwardRef<InfiniteArticleListHandle, InfiniteArticleListProps>(
  function InfiniteArticleList({ initialSize = 10 }: InfiniteArticleListProps, ref) {
    const { currentCategory: categoryCode } = useCategory();
    const {
      articles,
      isLoading,
      isLoadingMore,
      hasNextPage,
      setData,
      loadMore,
      refresh,
      scrollProps
    } = useInfiniteArticles({
      categoryCode,
      initialPage: 1,
      pageSize: initialSize,
    });

    useImperativeHandle(ref, () => ({
      refresh
    }));

    const renderFooter = () => {
      if (!isLoadingMore) return null;

      return (
        <View className="py-4 flex items-center justify-center">
          <ActivityIndicator size="small" color="#8C6AE3" />
        </View>
      );
    };

    if (isLoading && articles.length === 0) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8C6AE3" />
        </View>
      );
    }

    const renderItem = (item: ArticleType, index: number) => (
      <Article
        data={item}
        onPress={() => { router.push(`/community/${item.id}`) }}
        onComment={() => { }}
        onLike={() => like(item)}
      />
    );

    const toggleArticleLike = (article: ArticleType, targetId: string): ArticleType => {
      if (article.id === targetId) {
        return {
          ...article,
          likeCount: article.likeCount + (article.isLiked ? -1 : 1),
          isLiked: !article.isLiked
        };
      }
      return article;
    };

    const like = (item: ArticleType) => {
      const changeLikeStatus = () =>
        setData((prevArticles) =>
          prevArticles.map((article) => toggleArticleLike(article, item.id))
        );

      tryCatch(async () => {
        await apis.articles.doLike(item);
        changeLikeStatus();
      })
    };

    return (
      <View className="flex-1">
        <View className="h-[1px] bg-[#F3F0FF]" />
        <View className="bg-lightPurple/20 px-4 py-2 mt-2 flex-row items-center">
          <Image
            source={require('@/assets/images/fireIcon.png')}
            style={{ width: 22, height: 22 }}
          />
          <Text size="sm">토끼는 급해. 그래서 급사.</Text>
          <TouchableOpacity className="ml-auto">
            <IconWrapper>
              <VectorIcon className=" h-[12px] w-[9px]" color="black" />
            </IconWrapper>
          </TouchableOpacity>
        </View>
        <View className="h-[1px] bg-[#F3F0FF] mb-2" />

        <InfiniteScrollView
          data={articles}
          renderItem={renderItem}
          onLoadMore={loadMore}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasNextPage}
          onRefresh={refresh}
          refreshing={isLoading && !isLoadingMore}
          className="flex-1"
          ItemSeparatorComponent={() => <View className="h-[1px] bg-[#F3F0FF]" />}
          ListFooterComponent={renderFooter}
          {...scrollProps}
        />
      </View>
    );
  }
);
