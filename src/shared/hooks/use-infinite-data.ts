import { useCallback, useEffect, useRef, useState } from 'react';
import { PaginationMeta, PaginationParams, UseInfiniteDataOptions, UseInfiniteDataResult } from '../infinite-scroll/types';

export function useInfiniteData<T, P extends PaginationParams = PaginationParams>(
  options: UseInfiniteDataOptions<T, P>
): UseInfiniteDataResult<T> {
  const {
    fetchFn,
    initialPage = 1,
    pageSize = 10,
    autoLoad = true,
    dependencies = [],
    getItemKey = (item: any) => item.id,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [currentPageData, setCurrentPageData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [meta, setMeta] = useState<PaginationMeta>({
    currentPage: initialPage,
    itemsPerPage: pageSize,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const lastLoadedPageRef = useRef(0);
  const isLoadingRef = useRef(false);

  const fetchData = useCallback(
    async (page: number, isLoadingNextPage = false) => {
      if (isLoadingRef.current) return;

      try {
        isLoadingRef.current = true;
        if (isLoadingNextPage) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const paginationParams = {
          page,
          size: pageSize,
        } as unknown as P;

        const response = await fetchFn(paginationParams);
        const { items, meta: responseMeta } = response;

        setMeta(responseMeta);
        setCurrentPageData(items);

        if (isLoadingNextPage) {
          setData((prevData) => {
            const existingIds = new Set(prevData.map(getItemKey));
            const uniqueNewItems = items.filter(
              (item) => !existingIds.has(getItemKey(item))
            );
            return [...prevData, ...uniqueNewItems];
          });
        } else {
          setData(items);
        }

        lastLoadedPageRef.current = page;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [fetchFn, pageSize, getItemKey]
  );

  const loadMore = useCallback(async () => {
    if (!meta.hasNextPage || isLoadingRef.current) return;
    if (currentPage > lastLoadedPageRef.current) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);

    await fetchData(nextPage, true);
  }, [meta.hasNextPage, currentPage, fetchData]);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setCurrentPage(initialPage);
      await fetchData(initialPage, false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [initialPage, fetchData]);

  useEffect(() => {
    if (autoLoad) {
      refresh();
    }
  }, [...dependencies]);

  return {
    data,
    currentPageData,
    setData,
    isLoading,
    isLoadingMore,
    error,
    hasNextPage: meta.hasNextPage,
    loadMore,
    refresh,
    meta,
    currentPage,
  };
}
