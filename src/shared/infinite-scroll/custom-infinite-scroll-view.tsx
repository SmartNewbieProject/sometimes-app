import { useCallback, type RefObject } from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import type { InfiniteScrollViewProps } from './types';
import { useInfiniteScroll } from '../hooks/use-infinite-scroll';

interface CustomInfiniteScrollViewProps<T> extends InfiniteScrollViewProps<T> {
  flatListRef?: RefObject<FlatList<T>>;
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
  ...restProps
}: CustomInfiniteScrollViewProps<T>) {
  const { scrollProps, getLastItemProps } = useInfiniteScroll<T>(
    onLoadMore,
    {
      threshold,
      enabled: hasMore && !isLoadingMore,
    }
  );

  const renderItemInternal = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      if (Platform.OS === 'web' && index === data.length - 1) {
        const props = getLastItemProps();

        return (
          <View style={props.style} key={`last-item-${data.length}-${index}-${Date.now()}`}>
            {renderItem(item, index)}
            <View
              ref={props.ref}
              style={{
                height: 6,
                backgroundColor: 'transparent',
                marginTop: 10,
                width: '100%'
              }}
              id={`infinite-scroll-marker-${data.length}`}
            />
          </View>
        );
      }
      return renderItem(item, index);
    },
    [data, renderItem, getLastItemProps]
  );

  const ListFooterComponent = useCallback(() => {
    if (isLoadingMore) {
      return <LoadingIndicator />;
    }
    return null;
  }, [isLoadingMore, LoadingIndicator]);

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
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
