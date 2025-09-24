import { View } from "react-native";
import { Text } from "@/src/shared/ui";
import { router } from "expo-router";
import { useInfiniteMyArticlesQuery } from "../../queries/use-infinite-my-articles";
import { CustomInfiniteScrollView } from "@/src/shared/infinite-scroll/custom-infinite-scroll-view";
import type { Article as ArticleType } from "@/src/features/community/types";
import { Article } from "@/src/features/community/ui/article";
import apis from "@/src/features/community/apis";
import { tryCatch } from "@/src/shared/libs";
import { useModal } from "@/src/shared/hooks/use-modal";
import { ArticleSkeleton } from "@/src/features/loading/skeleton/article-skeleton";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export default function MyArticlesScreen() {
  const {
    articles,
    isLoading,
    isLoadingMore,
    hasNextPage,
    loadMore,
    refetch,
    invalidate,
  } = useInfiniteMyArticlesQuery(10);
  const { showModal, showErrorModal } = useModal();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const invalidateAndRefetch = async () => {
    await invalidate();
    await refetch();
  };

  const like = (item: ArticleType) => {
    tryCatch(
      async () => {
        await apis.articles.doLike(item);
        await invalidateAndRefetch();
      },
      (e) => console.error(e)
    );
  };

  const deleteArticle = (id: string) => {
    showModal({
      title: "게시글 삭제",
      children: <Text size="sm">해당 게시글을 삭제할까요?</Text>,
      primaryButton: {
        text: "삭제하기",
        onClick: () =>
          tryCatch(
            async () => {
              await apis.articles.deleteArticle(id);
              await invalidateAndRefetch();
            },
            ({ error }) => showErrorModal(error, "error")
          ),
      },
      secondaryButton: { text: "취소", onClick: () => {} },
    });
  };

  const pickVariant = (): "short" | "medium" | "long" => {
    const r = Math.random();
    if (r < 0.33) return "short";
    if (r < 0.66) return "medium";
    return "long";
  };

  if (isLoading && articles.length === 0) {
    return (
      <View className="flex-1 bg-white">
        {Array.from({ length: 10 }).map((_, i) => (
          <ArticleSkeleton
            key={`skel-my-article-${i}`}
            variant={pickVariant()}
          />
        ))}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Text className="px-4 py-3" weight="bold">
        내가 쓴 글
      </Text>
      <CustomInfiniteScrollView
        data={articles}
        renderItem={(article: ArticleType) => (
          <Article
            data={article}
            onPress={() => router.push(`/community/${article.id}`)}
            onLike={() => like(article)}
            onDelete={deleteArticle}
            refresh={invalidateAndRefetch}
          />
        )}
        onLoadMore={loadMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasNextPage}
        onRefresh={invalidateAndRefetch}
        refreshing={isLoading && !isLoadingMore}
        className="flex-1"
      />
    </View>
  );
}
