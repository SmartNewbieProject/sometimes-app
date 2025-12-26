/**
 * 카드뉴스 목록 (무한 스크롤)
 * "지난 소식" 섹션에 표시되는 카드뉴스 리스트
 */
import React, { useCallback } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { Text } from "@/src/shared/ui";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { useCardNewsInfiniteList } from "../queries";
import { useCardNewsAnalytics } from "../hooks";
import type { CardNewsListItem } from "../types";
import dayUtils from "@/src/shared/libs/day";

type Props = {
  onPressItem: (item: CardNewsListItem) => void;
  ListHeaderComponent?: React.ReactElement;
};

export function CardNewsList({ onPressItem, ListHeaderComponent }: Props) {
  const { items, isLoading, isLoadingMore, hasNextPage, loadMore, refetch } =
    useCardNewsInfiniteList(10);
  const analytics = useCardNewsAnalytics();

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isLoadingMore) {
      loadMore();
    }

    analytics.trackListEndReached(items.length, hasNextPage);
  }, [hasNextPage, isLoadingMore, loadMore, analytics, items.length]);

  const handleItemPress = useCallback((item: CardNewsListItem, index: number) => {
    analytics.trackListItemClicked(
      item.id,
      item.title,
      index,
      item.publishedAt,
      item.readCount
    );
    onPressItem(item);
  }, [analytics, onPressItem]);

  const renderItem = useCallback(
    ({ item, index }: { item: CardNewsListItem; index: number }) => (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.9}
        onPress={() => handleItemPress(item, index)}
      >
        <View style={styles.thumbnail}>
          {item.backgroundImage?.url ? (
            <Image
              source={{ uri: item.backgroundImage.url }}
              style={styles.thumbnailImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Text style={styles.thumbnailEmoji}>📰</Text>
            </View>
          )}
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            {/* TODO: 보상 기능 활성화 시 주석 해제
            {item.hasReward && (
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardBadgeText}>🎁</Text>
              </View>
            )}
            */}
          </View>
          <Text style={styles.meta}>
            {dayUtils.formatRelativeTime(item.publishedAt)} • 조회 {item.readCount}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [handleItemPress]
  );

  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator color={semanticColors.brand.primary} />
        </View>
      );
    }
    if (!hasNextPage && items.length > 0) {
      return (
        <View style={styles.endMessage}>
          <Text style={styles.endMessageText}>모든 소식을 확인했어요 🎉</Text>
        </View>
      );
    }
    return null;
  }, [isLoadingMore, hasNextPage, items.length]);

  const renderHeader = useCallback(() => {
    return (
      <>
        {ListHeaderComponent}
        {items.length > 0 && (
          <View style={styles.sectionHeader}>
            <Text weight="bold" style={styles.sectionTitle}>지난 소식</Text>
          </View>
        )}
      </>
    );
  }, [ListHeaderComponent, items.length]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🌱</Text>
        <Text style={styles.emptyTitle}>첫 소식을 준비하고 있어요</Text>
        <Text style={styles.emptyDescription}>
          썸타임 커뮤니티의 시작, 함께 만들어가요!{"\n"}
          곧 흥미로운 이야기로 찾아뵐게요
        </Text>
      </View>
    );
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        {ListHeaderComponent}
        <ActivityIndicator
          color={semanticColors.brand.primary}
          style={styles.loader}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      onRefresh={refetch}
      refreshing={isLoading}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: semanticColors.brand.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: semanticColors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: semanticColors.text.primary,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: semanticColors.surface.background,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: semanticColors.surface.surface,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 16,
    overflow: "hidden",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: semanticColors.surface.tertiary,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailEmoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: semanticColors.text.primary,
  },
  rewardBadge: {
    marginLeft: 8,
    backgroundColor: semanticColors.surface.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rewardBadgeText: {
    fontSize: 10,
  },
  meta: {
    fontSize: 12,
    color: semanticColors.text.muted,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  endMessage: {
    paddingVertical: 20,
    alignItems: "center",
  },
  endMessageText: {
    fontSize: 13,
    color: semanticColors.text.muted,
  },
});
