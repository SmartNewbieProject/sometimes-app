import VectorIcon from "@/assets/icons/Vector.svg";
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

interface InfiniteArticleListProps {
  initialSize?: number;
}

export interface InfiniteArticleListHandle {
  refresh: () => void;
}

export const InfiniteArticleList = forwardRef<
  InfiniteArticleListHandle,
  InfiniteArticleListProps
>(({ initialSize = 10 }: InfiniteArticleListProps, ref) => {
  const { showModal, showErrorModal } = useModal();
  const { currentCategory: categoryCode } = useCategory();
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
      title: "게시글 삭제",
      children: (
        <View>
          <Text size="sm" textColor="black">
            해당 게시글을 삭제할까요?
          </Text>
        </View>
      ),
      primaryButton: {
        text: "삭제하기",
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
        text: "취소",
        onClick: () => {},
      },
    });
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View className="py-4 flex items-center justify-center">
        <Lottie size={48} />
      </View>
    );
  };

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

  if (isLoading && articles.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Lottie size={128} />
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
          [FAQ] 자주묻는 질문
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
});
