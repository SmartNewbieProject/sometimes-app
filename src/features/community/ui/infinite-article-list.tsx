import VectorIcon from "@/assets/icons/Vector.svg";
import { useAuth } from "@/src/features/auth";
import { useModal } from "@/src/shared/hooks/use-modal";
import { tryCatch } from "@/src/shared/libs";
import { Lottie, Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  type RefObject,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  type FlatList,
  Image,
  Linking,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import { CustomInfiniteScrollView } from "../../../shared/infinite-scroll/custom-infinite-scroll-view";
import apis from "../apis";
import { useCategory } from "../hooks";
import { useInfiniteArticlesQuery } from "../queries/use-infinite-articles";
import { createArticlesQueryKey } from "../queries/use-infinite-articles";
import type { Article as ArticleType } from "../types";
import { Article } from "./article";

import { ArticleSkeleton } from "../../loading/skeleton/article-skeleton";
import { useTranslation } from "react-i18next";

interface InfiniteArticleListProps {
  initialSize?: number;
  categoryCode?: string;
  preferSkeletonOnCategoryChange?: boolean;
}

export interface InfiniteArticleListHandle {
  refresh: () => void;
}

export const InfiniteArticleList = forwardRef<
  InfiniteArticleListHandle,
  InfiniteArticleListProps
>(
  (
    {
      initialSize = 10,
      categoryCode: categoryCodeOverride,
      preferSkeletonOnCategoryChange = true,
    }: InfiniteArticleListProps,
    ref
  ) => {
    const { showModal, showErrorModal } = useModal();
    const { currentCategory: currentFromContext } = useCategory();
    const categoryCode = categoryCodeOverride ?? currentFromContext;
    const { my } = useAuth();
    const { t } = useTranslation();
    const flatListRef = useRef<FlatList<ArticleType>>(null) as RefObject<
      FlatList<ArticleType>
    >;
    const queryClient = useQueryClient();

    const {
      articles,
      isLoading,
      isLoadingMore,
      hasNextPage,
      loadMore,
      updateArticleLike,
      saveScrollPosition,
      getScrollPosition,
      refetch,
    } = useInfiniteArticlesQuery({
      categoryCode,
      pageSize: initialSize,
    });

    const prevCategoryRef = useRef<string | undefined>(categoryCode);
    const [forceSkeleton, setForceSkeleton] = useState<boolean>(false);

    useEffect(() => {
      if (!preferSkeletonOnCategoryChange) return;

      // 카테고리가 바뀌면 → 데이터 준비 전까지 스켈레톤 고정
      if (prevCategoryRef.current !== categoryCode) {
        prevCategoryRef.current = categoryCode;
        setForceSkeleton(true);
      }
    }, [categoryCode, preferSkeletonOnCategoryChange]);

    useEffect(() => {
      if (!preferSkeletonOnCategoryChange) return;

      // 새 데이터가 도착했거나, 로딩이 끝났다면 스켈레톤 해제
      if ((articles && articles.length > 0) || (!isLoading && !isLoadingMore)) {
        setForceSkeleton(false);
      }
    }, [articles, isLoading, isLoadingMore, preferSkeletonOnCategoryChange]);

    const isWeb = Platform.OS === "web";

    const invalidateAndRefetch = async () => {
      await queryClient.invalidateQueries({
        queryKey: createArticlesQueryKey(categoryCode),
      });
      await refetch();
    };

    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!isWeb) {
          const position = event.nativeEvent.contentOffset.y;
          saveScrollPosition(position);
        }
      },
      [isWeb, saveScrollPosition]
    );
    const like = (item: ArticleType) => {
      if (!my?.id) {
        Linking.openURL("https://info.some-in-univ.com");
        return;
      }

      tryCatch(
        async () => {
          updateArticleLike(item.id);
          await apis.articles.doLike(item);
        },
        (error) => {
          console.error("좋아요 업데이트 실패:", error);
        }
      );
    };

    const deleteArticle = (id: string) => {
      showModal({
        title: t("features.community.ui.infinite_article_list.delete_article_title"),
        children: (
          <View>
            <Text size="sm" textColor="black">
              {t("features.community.ui.infinite_article_list.delete_article_confirm")}
            </Text>
          </View>
        ),
        primaryButton: {
          text:  t("features.community.ui.infinite_article_list.delete_button"),
          onClick: () =>
            tryCatch(
              async () => {
                await apis.articles.deleteArticle(id);
                await invalidateAndRefetch();
              },
              ({ error }) => {
                console.log({ error });
                showErrorModal(error, "error");
              }
            ),
        },
        secondaryButton: {
          text: t("global.cancel"),
          onClick: () => {},
        },
      });
    };

    //스켈레톤 버킷
    const pickVariant = useCallback((): "short" | "medium" | "long" => {
      const r = Math.random();
      if (r < 0.33) return "short";
      if (r < 0.66) return "medium";
      return "long";
    }, []);

    const renderFooter = useCallback(() => {
      if (!isLoadingMore) return null;
      return (
        <View className="py-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <ArticleSkeleton key={`skel-more-${i}`} variant={pickVariant()} />
          ))}
        </View>
      );
    }, [isLoadingMore, pickVariant]);

    useImperativeHandle(ref, () => ({
      refresh: () => {
        return invalidateAndRefetch();
      },
    }));

    useEffect(() => {
      if (isWeb) {
        const scrollContainer = document?.getElementById(
          "CommunityScrollView"
        ) as HTMLElement;
        if (!scrollContainer) return;
        const handleWebScroll = () => {
          console.log("handleWebScroll()");
          console.dir(scrollContainer);
          const position = scrollContainer.scrollTop;
          console.log({ position });
          saveScrollPosition(position);
        };

        scrollContainer.addEventListener("scroll", handleWebScroll, {
          passive: true,
        });

        return () => {
          scrollContainer.removeEventListener("scroll", handleWebScroll);
        };
      }
    }, [isWeb, saveScrollPosition]);

    useEffect(() => {
      if (!isWeb) return;
      const position = getScrollPosition();
      const scrollContainer = document.getElementById(
        "CommunityScrollView"
      ) as HTMLElement;
      if (!scrollContainer) return;

      if (position > 0) {
        setTimeout(() => {
          if (isWeb && typeof window !== "undefined") {
            console.debug(`scroll To ${position}`);
            scrollContainer.scrollTo({
              top: position,
              behavior: "auto",
            });
          } else if (flatListRef.current) {
            flatListRef.current.scrollToOffset({
              offset: position,
              animated: false,
            });
          }
        }, 100);
      }
    }, [getScrollPosition, isWeb]);

    if (
      (preferSkeletonOnCategoryChange && forceSkeleton) ||
      (isLoading && articles.length === 0)
    ) {
      return (
        <View className="flex-1 bg-white">
          <View className="h-[1px] bg-[#F3F0FF]" />

          <View className="h-[1px] bg-[#F3F0FF] mb-2" />
          {Array.from({ length: initialSize }).map((_, i) => (
            <ArticleSkeleton key={`skel-init-${i}`} variant={pickVariant()} />
          ))}
        </View>
      );
    }

    return (
      <View className="flex-1 bg-white">
        <View className="h-[1px] bg-[#F3F0FF]" />
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(
              "https://ruby-composer-6d2.notion.site/FAQ-1ff1bbec5ba1803bab5cfbe635bba220?source=copy_link"
            )
          }
          className="bg-[#F3EDFF] rounded-[5px]  mx-[16px] px-4 py-2 my-[10px] gap-x-2 flex-row items-center"
        >
          <Image
            source={require("@/assets/images/fireIcon.png")}
            style={{ width: 16, height: 16 }}
          />
          <Text size="sm" weight="bold">
            {t("features.community.ui.infinite_article_list.faq_title")}
          </Text>
          <TouchableOpacity className="ml-auto">
            <IconWrapper>
              <VectorIcon className=" h-[12px] w-[9px]" color="black" />
            </IconWrapper>
          </TouchableOpacity>
        </TouchableOpacity>
        <View className="h-[1px] bg-[#F3F0FF] mb-2" />

        <CustomInfiniteScrollView
          data={articles}
          id="ArticleListContainer"
          renderItem={(article: ArticleType) => (
            <Article
              data={article}
              onPress={() => {
                router.push(`/community/${article.id}`);
              }}
              onLike={() => like(article)}
              onDelete={deleteArticle}
              refresh={() => {
                return invalidateAndRefetch();
              }}
            />
          )}
          onLoadMore={loadMore}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasNextPage}
          onRefresh={invalidateAndRefetch}
          refreshing={isLoading && !isLoadingMore}
          className="flex-1"
          ListFooterComponent={renderFooter}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          flatListRef={flatListRef}
        />
      </View>
    );
  }
);
