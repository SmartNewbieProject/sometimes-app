import { useCategory } from "@/src/features/community/hooks";
import { CategoryList, CreateArticleFAB } from "@/src/features/community/ui";
import { ImageResources } from "@/src/shared/libs";
import { BottomNavigation, Header, ImageResource } from "@/src/shared/ui";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { InfiniteArticleList } from "@/src/features/community/ui/infinite-article-list";
import { useInfiniteArticlesQuery } from "@/src/features/community/queries/use-infinite-articles";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchArticlesFirstPage } from "@/src/features/community/queries/use-infinite-articles";

export default function CommunityScreen() {
  const { refresh: shouldRefresh } = useLocalSearchParams<{
    refresh: string;
  }>();
  const {
    currentCategory: categoryCode,
  } = useCategory();
  const queryClient = useQueryClient();

  useEffect(() => {
    prefetchArticlesFirstPage(queryClient, categoryCode, 10).catch(() => {});
  }, [categoryCode, queryClient]);

  const { refetch } = useInfiniteArticlesQuery({ categoryCode, pageSize: 10 });
  useEffect(() => {
    if (shouldRefresh === "true") {
      refetch();
    }
  }, [shouldRefresh, refetch]);







  return (
    <View className="flex-1 relative">
      <ListHeaderComponent />

      <View className="flex-1 bg-white">
        <View style={{ height: 1, backgroundColor: "#F3F0FF" }} />
        <InfiniteArticleList
          key={`list-${categoryCode}`}
          initialSize={10}
          categoryCode={categoryCode}
          preferSkeletonOnCategoryChange
        />
      </View>

      <CreateArticleFAB />
      <BottomNavigation />
    </View>
  );
}

const ListHeaderComponent = () => {
  return (
    <View>
      <Header.Container className="items-center bg-white ">
        <Header.CenterContent>
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
