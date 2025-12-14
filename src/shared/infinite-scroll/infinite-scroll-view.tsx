import { useCallback } from "react";
import { semanticColors } from '../constants/semantic-colors';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { InfiniteScrollViewProps } from "./types";
import { useInfiniteScroll } from "../hooks/use-infinite-scroll";

export function InfiniteScrollView<T>({
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
  ...restProps
}: InfiniteScrollViewProps<T>) {
  const { scrollProps, flatListRef, getLastItemProps, ensureFillTriggersLoad } =
    useInfiniteScroll<T>(onLoadMore, {
      threshold,
      enabled: hasMore && !isLoadingMore,
    });

  ensureFillTriggersLoad?.(data, hasMore, isLoadingMore);

  const renderItemInternal = useCallback(
    ({ item, index }: { item: T; index: number }) => renderItem(item, index),
    [renderItem]
  );

  const ListFooterComponent = useCallback(() => {
    const props = getLastItemProps(); // web: { ref }, native: {}
    return (
      <View style={{ paddingTop: Platform.OS === "web" ? 8 : 0 }}>
        {Platform.OS === "web" && (
          <View
            ref={props.ref as any}
            style={{ height: 24, width: "100%" }}
            id="infinite-scroll-footer-sentinel"
          />
        )}
        {isLoadingMore ? <LoadingIndicator /> : null}
      </View>
    );
  }, [getLastItemProps, isLoadingMore, LoadingIndicator]);

  if (data.length === 0 && !isLoading) {
    return <EmptyComponent />;
  }

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={renderItemInternal}
      keyExtractor={(_, index) => `item-${index}`}
      ListFooterComponent={ListFooterComponent}
      onRefresh={onRefresh}
      refreshing={refreshing}
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

export default InfiniteScrollView;
