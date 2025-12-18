import Layout from "@/src/features/layout";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { StyleSheet, View } from "react-native";
import { Header, Text } from "@/src/shared/ui";
import { router , useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import { Article } from "@/src/features/community/ui/article";
import type { Article as ArticleType } from "@/src/features/community/types";
import { CustomInfiniteScrollView } from "@/src/shared/infinite-scroll/custom-infinite-scroll-view";
import { tryCatch } from "@/src/shared/libs";
import apis from "@/src/features/community/apis";
import { useModal } from "@/src/shared/hooks/use-modal";
import { ArticleSkeleton } from "@/src/features/loading/skeleton/article-skeleton";
import { useCallback, useMemo } from "react";
import {
  useInfiniteMyFeedQuery,
  type MyFeedType,
} from "../../queries/use-infinite-my-feed";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
        title: t('features.mypage.feed.delete_title'),
        children: <Text size="sm">{t('features.mypage.feed.delete_message')}</Text>,
        primaryButton: {
          text: t('features.mypage.feed.delete_button'),
          onClick: () =>
            tryCatch(
              async () => {
                await apis.articles.deleteArticle(id);
                await invalidateAndRefetch();
              },
              ({ error }) => {
                console.error("Article deletion error:", {
                  error,
                  errorMessage: error?.message,
                  errorString: error?.error,
                  status: error?.status,
                  statusCode: error?.statusCode,
                  articleId: id,
                });

                const errorMessage = error?.message || error?.error || "게시글 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.";
                showErrorModal(errorMessage, "error");
              }
            ),
        },
        secondaryButton: { text: t('features.mypage.feed.cancel_button'), onClick: () => {} },
      });
    },
    [invalidateAndRefetch, showErrorModal, showModal, t]
  );

  const header = useMemo(
    () => (
      <Header.Container style={feedStyles.headerContainer}>
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
        <View style={feedStyles.contentContainer}>
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
      <View style={feedStyles.contentContainer}>
        <Text style={feedStyles.titleText} weight="bold">
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
          style={feedStyles.scrollView}
        />
      </View>
    </Layout.Default>
  );
}

const feedStyles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
  },
  titleText: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scrollView: {
    flex: 1,
  },
});
