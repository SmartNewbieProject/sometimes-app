import { useCategory } from "@/src/features/community/hooks";
import { CategoryList, CreateArticleFAB } from "@/src/features/community/ui";
import { ImageResources } from "@/src/shared/libs";
import { BottomNavigation, Header, ImageResource } from "@/src/shared/ui";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { InfiniteArticleList } from "@/src/features/community/ui/infinite-article-list";
import { useInfiniteArticlesQuery } from "@/src/features/community/queries/use-infinite-articles";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchArticlesFirstPage } from "@/src/features/community/queries/use-infinite-articles";
import CommuHome from "@/src/features/community/ui/home";

const HOME_CODE = "__home__";

export default function CommunityScreen() {
  const { refresh: shouldRefresh } = useLocalSearchParams<{
    refresh: string;
  }>();
  const { currentCategory: categoryCode } = useCategory();

  const isHome = categoryCode === HOME_CODE;

  return (
    <View className="flex-1 relative">
      <ListHeaderComponent />

      <View className="flex-1 bg-white">
        <View style={{ height: 1, backgroundColor: "#F3F0FF" }} />

        {isHome ? (
          <CommuHome />
        ) : (
          <ArticleRegion
            key={`region-${categoryCode ?? "none"}`}
            categoryCode={categoryCode ?? ""}
            shouldRefresh={shouldRefresh === "true"}
          />
        )}
      </View>

      {!isHome && <CreateArticleFAB />}
      <BottomNavigation />
    </View>
  );
}

const ListHeaderComponent = () => {
  return (
    <View>
      <Header.Container className="items-center bg-white ">
        <Header.CenterContent className="mt-[10px]">
          <ImageResource
            resource={ImageResources.COMMUNITY_LOGO}
            width={152}
            height={18}
          />
        </Header.CenterContent>
      </Header.Container>

      <View className="pt-[14px] bg-white">
        <CategoryList />
      </View>
    </View>
  );
};

function ArticleRegion({
  categoryCode,
  shouldRefresh,
}: {
  categoryCode: string;
  shouldRefresh: boolean;
}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!categoryCode) return;
    prefetchArticlesFirstPage(queryClient, categoryCode, 10).catch(() => {});
  }, [categoryCode, queryClient]);

  const { refetch } = useInfiniteArticlesQuery({
    categoryCode,
    pageSize: 10,
  });

  useEffect(() => {
    if (shouldRefresh) refetch();
  }, [shouldRefresh, refetch]);

  return (
    <InfiniteArticleList
      key={`list-${categoryCode}`}
      initialSize={10}
      categoryCode={categoryCode}
      preferSkeletonOnCategoryChange
    />
  );
}
