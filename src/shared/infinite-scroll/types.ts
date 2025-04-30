import { PaginationMeta, Pagination as PaginationParams, PaginatedResponse } from '@/src/types/server';

// 서버 타입을 그대로 재내보내기
export type { PaginationMeta, PaginatedResponse };
export type { Pagination as PaginationParams } from '@/src/types/server';
import { ReactNode } from 'react';
import { FlatListProps } from 'react-native';

export interface InfiniteScrollStrategy {
  setupScroll: (
    callback: () => void,
    options: InfiniteScrollOptions
  ) => void;
  cleanupScroll: () => void;
  getScrollProps: () => any;
}

export interface InfiniteScrollOptions {
  threshold?: number;
  enabled?: boolean;
  scrollContainerRef?: React.RefObject<any>;
  lastItemRef?: React.RefObject<any>;
}

export interface UseInfiniteDataOptions<T, P = PaginationParams> {
  fetchFn: (params: P) => Promise<PaginatedResponse<T>>;
  initialPage?: number;
  pageSize?: number;
  autoLoad?: boolean;
  dependencies?: any[];
  getItemKey?: (item: T) => string | number;
}

export interface UseInfiniteDataResult<T> {
  data: T[];
  currentPageData: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasNextPage: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  meta: PaginationMeta;
  currentPage: number;
}

export interface InfiniteScrollViewProps<T> extends Omit<FlatListProps<T>, 'data' | 'renderItem' | 'onEndReached'> {
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  onLoadMore: () => void;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  LoadingIndicator?: React.ComponentType<any>;
  EmptyComponent?: React.ComponentType<any>;
  ErrorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  threshold?: number;
}
