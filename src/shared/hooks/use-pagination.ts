import { useState, useCallback, useMemo } from 'react';
import { Pagination, PaginationMeta, PaginatedResponse } from '../../types/server';

interface UsePaginationProps<T> {
  initialPage?: number;
  initialSize?: number;
  initialItems?: T[];
  initialMeta?: PaginationMeta;
}

interface UsePaginationReturn<T> {
  items: T[];
  meta: PaginationMeta;
  pagination: Pagination;
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  resetPagination: () => void;
  updateResults: (response: PaginatedResponse<T>) => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export function usePagination<T>({
  initialPage = 1,
  initialSize = 10,
  initialItems = [],
  initialMeta = {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
}: UsePaginationProps<T> = {}): UsePaginationReturn<T> {
  const [items, setItems] = useState<T[]>(initialItems);
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta);
  const [pagination, setPagination] = useState<Pagination>({
    page: initialPage,
    size: initialSize,
  });

  const isFirstPage = useMemo(() => meta.currentPage === 1, [meta.currentPage]);
  const isLastPage = useMemo(() => !meta.hasNextPage, [meta.hasNextPage]);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setSize = useCallback((size: number) => {
    setPagination((prev) => ({ ...prev, size }));
  }, []);

  const nextPage = useCallback(() => {
    if (meta.hasNextPage) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [meta.hasNextPage]);

  const prevPage = useCallback(() => {
    if (meta.hasPreviousPage) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }, [meta.hasPreviousPage]);

  const resetPagination = useCallback(() => {
    setPagination({ page: initialPage, size: initialSize });
  }, [initialPage, initialSize]);

  const updateResults = useCallback((response: PaginatedResponse<T>) => {
    setItems(response.items);
    setMeta(response.meta);
  }, []);

  return {
    items,
    meta,
    pagination,
    setPage,
    setSize,
    nextPage,
    prevPage,
    resetPagination,
    updateResults,
    isFirstPage,
    isLastPage,
  };
}
