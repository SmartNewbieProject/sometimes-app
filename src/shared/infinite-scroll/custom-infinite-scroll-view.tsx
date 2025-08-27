import { useCallback, type RefObject, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { InfiniteScrollViewProps } from "./types";
import { useInfiniteScroll } from "../hooks/use-infinite-scroll";

interface CustomInfiniteScrollViewProps<T> extends InfiniteScrollViewProps<T> {
  flatListRef?: RefObject<FlatList<T>>;
  getItemKey?: (item: T, index: number) => string;
}

export function CustomInfiniteScrollView<T>({
  data,
  renderItem,
  onLoadMore,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onRefresh,
  refreshing = false,
  LoadingIndicator = DefaultLoadingIndicator,
  EmptyComponent = DefaultEmptyComponent,
  ErrorComponent,
  threshold = 0.5,
  flatListRef,
  getItemKey,
  ...restProps
}: CustomInfiniteScrollViewProps<T>) {
  const { scrollProps, lastItemRef, getLastItemProps, ensureFillTriggersLoad } =
    useInfiniteScroll<T>(onLoadMore, {
      threshold,
      enabled: hasMore && !isLoadingMore,
    });

  ensureFillTriggersLoad?.(data, hasMore, isLoadingMore);

  const renderItemInternal = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      return renderItem(item, index);
    },
    [renderItem]
  );

  const ListFooterComponent = useCallback(() => {
    if (Platform.OS === "web") {
      const props = getLastItemProps();
      return (
        <View style={{ paddingVertical: 8 }}>
          <View
            ref={props.ref as any}
            style={{ height: 24, width: "100%" }}
            id="infinite-scroll-footer-sentinel"
          />
          {isLoadingMore ? <LoadingIndicator /> : null}
        </View>
      );
    }
    return isLoadingMore ? <LoadingIndicator /> : null;
  }, [isLoadingMore, getLastItemProps, LoadingIndicator]);

  if (data.length === 0 && !isLoading) {
    return <EmptyComponent />;
  }

  const keyExtractor = useCallback(
    (item: T, index: number) => {
      if (getItemKey) return getItemKey(item, index);
      return `item-${index}`;
    },
    [getItemKey]
  );

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={renderItemInternal}
      keyExtractor={keyExtractor}
      ListFooterComponent={ListFooterComponent}
      onRefresh={onRefresh}
      refreshing={refreshing}
      nestedScrollEnabled={true}
      showsVerticalScrollIndicator={false}
      {...scrollProps}
      {...restProps}
    />
  );
}

function DefaultLoadingIndicator() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color="#8C6AE3" />
    </View>
  );
}

function DefaultEmptyComponent() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>데이터가 없습니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
