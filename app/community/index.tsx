import { useCategory } from "@/src/features/community/hooks";
import { CategoryList, CreateArticleFAB } from "@/src/features/community/ui";
import { ImageResources } from "@/src/shared/libs";
import { BottomNavigation, Header, ImageResource, Text } from "@/src/shared/ui";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, useWindowDimensions, ActivityIndicator } from "react-native";
import {
  TabView,
  type NavigationState,
  type SceneRendererProps,
} from "react-native-tab-view";
import { InfiniteArticleList } from "@/src/features/community/ui/infinite-article-list";
import { useInfiniteArticlesQuery } from "@/src/features/community/queries/use-infinite-articles";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchArticlesFirstPage } from "@/src/features/community/queries/use-infinite-articles";
import { ArticleSkeleton } from "@/src/features/loading/skeleton/article-skeleton";

type CategoryRoute = { key: string; title: string };

export default function CommunityScreen() {
  const { refresh: shouldRefresh } = useLocalSearchParams<{
    refresh: string;
  }>();
  const {
    categories,
    currentCategory: categoryCode,
    changeCategory,
  } = useCategory();
  const layout = useWindowDimensions();
  const queryClient = useQueryClient();

  const safeWidth = Math.max(1, layout.width || 0);

  const routes: CategoryRoute[] = useMemo(
    () => categories.map((c) => ({ key: c.code, title: c.displayName })),
    [categories]
  );

  const currentIndex = useMemo(() => {
    const idx = routes.findIndex((r) => r.key === categoryCode);
    return idx >= 0 ? idx : 0;
  }, [routes, categoryCode]);

  const [index, setIndex] = useState<number>(currentIndex);

  useEffect(() => {
    if (index !== currentIndex) setIndex(currentIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  useEffect(() => {
    if (routes.length === 0) return;
    const targets = [index, index - 1, index + 1]
      .filter((i) => i >= 0 && i < routes.length)
      .map((i) => routes[i].key);

    targets.forEach((code) => {
      prefetchArticlesFirstPage(queryClient, code, 10).catch(() => {});
    });
  }, [index, routes, queryClient]);

  const onIndexChange = useCallback(
    (next: number) => {
      if (next < 0 || next >= routes.length) return;
      setIndex(next);
      const nextKey = routes[next]?.key;
      if (nextKey && nextKey !== categoryCode) {
        changeCategory(nextKey);
      }
    },
    [routes, categoryCode, changeCategory]
  );

  const { refetch } = useInfiniteArticlesQuery({ categoryCode, pageSize: 10 });
  useEffect(() => {
    if (shouldRefresh === "true") {
      refetch();
    }
  }, [shouldRefresh, refetch]);

  const hasRoutes = routes.length > 0;

  const renderScene = useCallback(
    (props: SceneRendererProps & { route: CategoryRoute }) => {
      const { route } = props;
      return (
        <View style={{ flex: 1, backgroundColor: "white" }} key={route.key}>
          <View style={{ height: 1, backgroundColor: "#F3F0FF" }} />
          <InfiniteArticleList
            key={`list-${route.key}`}
            initialSize={10}
            categoryCode={route.key}
            preferSkeletonOnCategoryChange
          />
        </View>
      );
    },
    []
  );

  const renderLazyPlaceholder = useCallback(
    (_: SceneRendererProps & { route: CategoryRoute }) => {
      return (
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <View style={{ height: 1, backgroundColor: "#F3F0FF" }} />
          <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
            {/* <Text size="sm" weight="bold">
              로딩 중…
            </Text> */}
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
          {Array.from({ length: 8 }).map((_, i) => (
            <ArticleSkeleton
              key={`tab-skel-${i}`}
              variant={i % 3 === 0 ? "short" : i % 3 === 1 ? "medium" : "long"}
            />
          ))}
        </View>
      );
    },
    []
  );

  return (
    <View className="flex-1 relative">
      <ListHeaderComponent />

      <View className="flex-1 bg-white">
        {hasRoutes ? (
          <TabView<CategoryRoute>
            key={routes.map((r) => r.key).join("|")}
            navigationState={
              { index, routes } as NavigationState<CategoryRoute>
            }
            renderScene={renderScene}
            renderLazyPlaceholder={renderLazyPlaceholder}
            onIndexChange={onIndexChange}
            initialLayout={{ width: safeWidth }}
            lazy
            lazyPreloadDistance={1}
            swipeEnabled
            renderTabBar={() => null}
          />
        ) : (
          <View style={{ flex: 1 }} />
        )}
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
