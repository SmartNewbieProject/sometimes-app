import { useCallback, type RefObject, useEffect, useRef } from "react";
import { semanticColors } from '../constants/colors';
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
  autoFillMaxPages?: number;
  observerEnabled?: boolean;
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
  autoFillMaxPages = 0,
  observerEnabled = false,
  ...restProps
}: CustomInfiniteScrollViewProps<T>) {
  const { scrollProps, getLastItemProps } = useInfiniteScroll<T>(onLoadMore, {
    threshold,
    enabled: observerEnabled && hasMore && !isLoadingMore,
  });

  const autoFillCountRef = useRef(0);
  useEffect(() => {
    if (!observerEnabled) return;
    if (Platform.OS !== "web") return;
    if (autoFillMaxPages <= 0) return;
    if (!hasMore || isLoadingMore) return;
    if (autoFillCountRef.current >= autoFillMaxPages) return;

    const rAF = requestAnimationFrame(() => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        doc.clientHeight,
        doc.scrollHeight,
        doc.offsetHeight
      );
      const viewport = window.innerHeight || doc.clientHeight;

      if (scrollHeight <= viewport + 4) {
        autoFillCountRef.current += 1;
        onLoadMore();
      }
    });

    return () => cancelAnimationFrame(rAF);
  }, [
    data.length,
    hasMore,
    isLoadingMore,
    onLoadMore,
    autoFillMaxPages,
    observerEnabled,
  ]);

  const renderItemInternal = useCallback(
    ({ item, index }: { item: T; index: number }) => renderItem(item, index),
    [renderItem]
  );

  const ListFooterComponent = useCallback(() => {
    const props = getLastItemProps(); // web: { ref }, native: {}
    return (
      <View style={{ paddingTop: Platform.OS === "web" ? 8 : 0 }}>
        {Platform.OS === "web" && observerEnabled && (
          <View
            ref={props.ref as any}
            style={{ height: 24, width: "100%" }}
            id="infinite-scroll-footer-sentinel"
          />
        )}
        {isLoadingMore ? <LoadingIndicator /> : null}
      </View>
    );
  }, [getLastItemProps, isLoadingMore, LoadingIndicator, observerEnabled]);

  const listEmpty = !isLoading ? <EmptyComponent /> : null;

  const keyExtractor =
    restProps.keyExtractor ??
    ((item: T, index: number) =>
      (getItemKey && getItemKey(item, index)) ?? `item-${index}`);

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={renderItemInternal}
      keyExtractor={keyExtractor}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={listEmpty}
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
    color: semanticColors.text.disabled,
  },
});
