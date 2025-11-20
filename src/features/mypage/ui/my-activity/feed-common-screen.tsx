import Layout from "@/src/features/layout";
import { semanticColors } from '../../../../shared/constants/colors';
import { View } from "react-native";
import { Header, Text } from "@/src/shared/ui";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Article } from "@/src/features/community/ui/article";
import type { Article as ArticleType } from "@/src/features/community/types";
import { CustomInfiniteScrollView } from "@/src/shared/infinite-scroll/custom-infinite-scroll-view";
import { tryCatch } from "@/src/shared/libs";
import apis from "@/src/features/community/apis";
import { useModal } from "@/src/shared/hooks/use-modal";
import { ArticleSkeleton } from "@/src/features/loading/skeleton/article-skeleton";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  useInfiniteMyFeedQuery,
  type MyFeedType,
} from "../../queries/use-infinite-my-feed";

type Props = {
  title: string;
  type: MyFeedType;
  pageSize?: number;
};

const pickVariant = (): "short" | "medium" | "long" => {
  const r = Math.random();
  if (r < 0.33) return "short";
  if (r < 0.66) return "medium";
  return "long";
};

export default function FeedListScreen({ title, type, pageSize = 10 }: Props) {
  const { articles, isLoading, isLoadingMore, hasNextPage, loadMore, refetch } =
    useInfiniteMyFeedQuery(type, pageSize);

  const { showModal, showErrorModal } = useModal();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const invalidateAndRefetch = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const like = useCallback(
    (item: ArticleType) => {
      tryCatch(
        async () => {
          await apis.articles.doLike(item);
          await invalidateAndRefetch();
        },
        (e) => console.error(e)
      );
    },
    [invalidateAndRefetch]
  );

  const deleteArticle = useCallback(
    (id: string) => {
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
    },
    [invalidateAndRefetch, showErrorModal, showModal]
  );

  const header = useMemo(
    () => (
      <Header.Container className="items-center ">
        <Header.LeftContent>
          <Header.LeftButton visible={true} onPress={() => router.back()} />
        </Header.LeftContent>
        <Header.CenterContent>
          <Image
            source={require("@assets/images/MY_LOGO.png")}
            style={{ width: 40, height: 20 }}
            contentFit="contain"
          />
        </Header.CenterContent>
        <Header.RightContent />
      </Header.Container>
    ),
    []
  );

  if (isLoading && articles.length === 0) {
    return (
      <Layout.Default style={{ backgroundColor: semanticColors.surface.background }}>
        {header}
        <View className="flex-1 bg-surface-background">
          {Array.from({ length: 10 }).map((_, i) => (
            <ArticleSkeleton
              key={`skel-${type}-${i}`}
              variant={pickVariant()}
            />
          ))}
        </View>
      </Layout.Default>
    );
  }

  return (
    <Layout.Default style={{ backgroundColor: semanticColors.surface.background }}>
      {header}
      <View className="flex-1 bg-surface-background">
        <Text className="px-4 py-3" weight="bold">
          {title}
        </Text>
        <CustomInfiniteScrollView
          data={articles}
          getItemKey={(a: ArticleType) => String(a.id)}
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
    </Layout.Default>
  );
}
