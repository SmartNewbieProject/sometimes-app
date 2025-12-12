// app/community/index.tsx
import { useCategory } from "@/src/features/community/hooks";
import { semanticColors } from '../../src/shared/constants/colors';
import { CategoryList, CreateArticleFAB } from "@/src/features/community/ui";
import { ImageResources } from "@/src/shared/libs";
import { BottomNavigation, Header, ImageResource, HeaderWithNotification, Text } from "@/src/shared/ui";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, useWindowDimensions, ActivityIndicator } from "react-native";
import {
  TabView,
  type NavigationState,
  type SceneRendererProps,
} from "react-native-tab-view";
import { InfiniteArticleList } from "@/src/features/community/ui/infinite-article-list";
import {
  prefetchArticlesFirstPage,
  useInfiniteArticlesQuery,
} from "@/src/features/community/queries/use-infinite-articles";
import { useQueryClient } from "@tanstack/react-query";
import { ArticleSkeleton } from "@/src/features/loading/skeleton/article-skeleton";
import CommuHome from "@/src/features/community/ui/home";
import { NOTICE_CODE } from "@/src/features/community/queries/use-home";
import { useCommunityEvent } from "@/src/features/event/hooks/use-community-event";
import { useModal } from "@/src/shared/hooks/use-modal";
import { useTranslation } from "react-i18next";

const HOME_CODE = "__home__";
type CategoryRoute = { key: string; title: string; isHome?: boolean };

export default function CommunityScreen() {
  const { t } = useTranslation();
  const { refresh: shouldRefresh, receivedGemReward } = useLocalSearchParams<{
    refresh: string;
    receivedGemReward?: string;
  }>();
  const {
    categories,
    currentCategory: categoryCode,
    changeCategory,
  } = useCategory();
  const layout = useWindowDimensions();
  const queryClient = useQueryClient();
  const safeWidth = Math.max(1, layout.width || 0);

  const { renderPromptModal } = useCommunityEvent();
  const { showModal } = useModal();
  const [hasShownGemReward, setHasShownGemReward] = useState(false);

  useEffect(() => {
    if (receivedGemReward === "true" && !hasShownGemReward) {
      setHasShownGemReward(true);

      showModal({
        showLogo: true,
        customTitle: (
          <View className="w-full flex flex-row justify-center pb-[5px]">
            <Text size="20" weight="bold" textColor="black">
              {t("features.payment.ui.community_event_modal.title")}
            </Text>
          </View>
        ),
        children: (
          <View className="flex flex-col gap-y-1 items-center">
            <Text textColor="black" weight="semibold">
              {t("features.payment.ui.community_event_modal.description")}
            </Text>
          </View>
        ),
        primaryButton: {
          text: t("features.payment.ui.community_event_modal.confirm_button"),
          onClick: () => {},
        },
      });
    }
  }, [receivedGemReward, hasShownGemReward, showModal, t]);

  const routes: CategoryRoute[] = useMemo(() => {
    const safeCategories = Array.isArray(categories) ? categories : [];
    return [
      { key: HOME_CODE, title: "홈", isHome: true },
      ...safeCategories
        .filter((c) => c.code !== NOTICE_CODE)
        .map((c) => ({ key: c.code, title: c.displayName })),
    ];
  }, [categories]);

  const isNotice = (categoryCode ?? HOME_CODE) === NOTICE_CODE;

  const currentIndex = useMemo(() => {
    const targetKey = categoryCode ?? HOME_CODE;
    const idx = routes.findIndex((r) => r.key === targetKey);
    return idx >= 0 ? idx : 0;
  }, [routes, categoryCode]);

  const [index, setIndex] = useState<number>(currentIndex);
  useEffect(() => {
    if (!isNotice && index !== currentIndex) setIndex(currentIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isNotice]);

  useEffect(() => {
    if (isNotice || routes.length === 0) return;
    const targets = [index, index - 1, index + 1]
      .filter((i) => i >= 0 && i < routes.length)
      .map((i) => routes[i].key)
      .filter((code) => code !== HOME_CODE);
    targets.forEach((code) => {
      prefetchArticlesFirstPage(queryClient, code, 10).catch(() => {});
    });
  }, [index, routes, queryClient, isNotice]);

  const onIndexChange = useCallback(
    (next: number) => {
      if (next < 0 || next >= routes.length) return;
      setIndex(next);
      const nextKey = routes[next]?.key;
      if (nextKey && nextKey !== categoryCode) changeCategory(nextKey);
    },
    [routes, categoryCode, changeCategory]
  );

  const { refetch } = useInfiniteArticlesQuery({
    categoryCode: isNotice ? undefined : categoryCode,
    pageSize: 10,
  });
  useEffect(() => {
    if (shouldRefresh === "true" && !isNotice) {
      refetch();
    }
  }, [shouldRefresh, refetch, isNotice]);

  const hasRoutes = routes.length > 0;

  const renderScene = useCallback(
    (props: SceneRendererProps & { route: CategoryRoute }) => {
      const { route } = props;
      if (route.isHome) {
        return (
          <View style={{ flex: 1, backgroundColor: semanticColors.surface.background }} key={route.key}>
            <View style={{ height: 1, backgroundColor: semanticColors.surface.other }} />
            <CommuHome />
          </View>
        );
      }
      return (
        <View style={{ flex: 1, backgroundColor: semanticColors.surface.background }} key={route.key}>
          <View style={{ height: 1, backgroundColor: semanticColors.surface.other }} />
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
        <View style={{ flex: 1, backgroundColor: semanticColors.surface.background }}>
          <View style={{ height: 1, backgroundColor: semanticColors.surface.background }} />
          <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
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

  const isHome = !isNotice && routes[index]?.isHome === true;

  return (
    <View className="flex-1 relative">
      <ListHeaderComponent />

      <View className="flex-1 bg-surface-background">
        {/** 공지 전용: 스와이프 불가 */}
        {isNotice ? (
          <View style={{ flex: 1, backgroundColor: semanticColors.surface.background }} key="__notice__">
            <View style={{ height: 1, backgroundColor: semanticColors.surface.other }} />
            <InfiniteArticleList
              key={`list-${NOTICE_CODE}`}
              initialSize={10}
              categoryCode={NOTICE_CODE}
              preferSkeletonOnCategoryChange
            />
          </View>
        ) : hasRoutes ? (
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

      {!isHome && <CreateArticleFAB />}
      <BottomNavigation />

      {renderPromptModal()}
    </View>
  );
}

const ListHeaderComponent = () => {
  return (
    <View>
      <HeaderWithNotification
        centerContent={
          <ImageResource
            resource={ImageResources.COMMUNITY_LOGO}
            width={152}
            height={18}
          />
        }
        showBackButton={false}
      />
      <View className="pt-[14px] bg-surface-background">
        <CategoryList />
      </View>
    </View>
  );
};
