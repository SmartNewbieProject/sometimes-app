import { useEffect, useRef, useCallback } from "react";
import { Platform } from "react-native";
import { InfiniteScrollOptions } from "../infinite-scroll/types";
import { InfiniteScrollProvider } from "../infinite-scroll/infinite-scroll-provider";
import { useLastItemRef } from "../infinite-scroll/strategies/web-infinite-scroll-strategy";
import { useFlatListRef } from "../infinite-scroll/strategies/native-infinite-scroll-strategy";

function getScrollRoot(): HTMLElement | Window {
  return window;
}

export function useInfiniteScroll<T>(
  onLoadMore: () => void,
  options: Omit<
    InfiniteScrollOptions,
    "lastItemRef" | "scrollContainerRef"
  > = {}
) {
  const providerRef = useRef<InfiniteScrollProvider | null>(null);
  if (!providerRef.current) {
    providerRef.current = new InfiniteScrollProvider();
  }

  const lastItemRef = useLastItemRef();
  const flatListRef = useFlatListRef<T>();

  const setupScroll = useCallback(() => {
    providerRef.current?.setupScroll(onLoadMore, {
      ...options,
      lastItemRef: Platform.OS === "web" ? lastItemRef : undefined,
      scrollContainerRef: Platform.OS !== "web" ? flatListRef : undefined,
    });
  }, [
    onLoadMore,
    options?.enabled,
    options?.threshold,
    lastItemRef,
    flatListRef,
  ]);

  const cleanupScroll = useCallback(() => {
    providerRef.current?.cleanupScroll();
  }, []);

  useEffect(() => {
    setupScroll();
    return cleanupScroll;
  }, [setupScroll, cleanupScroll]);

  const cooldownRef = useRef<number>(0);
  const rAFRef = useRef<number | null>(null);
  const removeScrollFallbackRef = useRef<(() => void) | undefined>(undefined);
  const lastFillCheckRef = useRef<number>(0);
  const fillAttemptCountRef = useRef<number>(0);

  const lastItemRefValueRef = useRef<any>(null);
  useEffect(() => {
    if (Platform.OS !== "web") return;

    if (lastItemRef.current !== lastItemRefValueRef.current) {
      lastItemRefValueRef.current = lastItemRef.current;
      fillAttemptCountRef.current = 0;
      const strategy = providerRef.current?.getStrategy() as any;
      if (strategy && "updateObserver" in strategy) {
        strategy.updateObserver?.();
        if ("isCallbackCalled" in strategy) {
          strategy.isCallbackCalled = false;
        }
      }
    }
  });

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const enabled = !!options.enabled;
    if (!enabled) {
      removeScrollFallbackRef.current?.();
      removeScrollFallbackRef.current = undefined;
      return;
    }

    const root = getScrollRoot();

    const getScrollPos = () => {
      if (root === window) {
        const doc = document.documentElement;
        const body = document.body;
        const scrollTop =
          window.scrollY || doc.scrollTop || body.scrollTop || 0;
        const height = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          doc.clientHeight,
          doc.scrollHeight,
          doc.offsetHeight
        );
        const viewport = window.innerHeight || doc.clientHeight;
        return { scrollTop, height, viewport };
      } else {
        const el = root as HTMLElement;
        return {
          scrollTop: el.scrollTop,
          height: el.scrollHeight,
          viewport: el.clientHeight,
        };
      }
    };

    const nearBottom = () => {
      const { scrollTop, height, viewport } = getScrollPos();
      const GAP = 200;
      return scrollTop + viewport >= height - GAP;
    };

    const tick = () => {
      rAFRef.current = null;
      const now = Date.now();
      if (nearBottom() && now - cooldownRef.current > 500) {
        cooldownRef.current = now;
        onLoadMore();
      }
    };

    const onScroll = () => {
      if (rAFRef.current == null) {
        rAFRef.current = requestAnimationFrame(tick);
      }
    };

    const onResize = () => {
      // 레이아웃 변경 시 재판정
      onScroll();
    };

    // passive 리스너로 부하 최소화
    if (root === window) {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      window.addEventListener("load", onResize);
      removeScrollFallbackRef.current = () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("load", onResize);
      };
    } else {
      const el = root as HTMLElement;
      el.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      removeScrollFallbackRef.current = () => {
        el.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
      };
    }

    return () => {
      removeScrollFallbackRef.current?.();
      removeScrollFallbackRef.current = undefined;
      if (rAFRef.current != null) {
        cancelAnimationFrame(rAFRef.current);
        rAFRef.current = null;
      }
    };
  }, [onLoadMore, options.enabled]);

  const scrollProps = providerRef.current?.getScrollProps() || {};

  const ensureFillTriggersLoad = useCallback(
    (data: T[], hasMore: boolean, isLoadingMore: boolean) => {
      if (Platform.OS !== "web") return;
      if (!hasMore || isLoadingMore) return;

      const now = Date.now();
      if (now - lastFillCheckRef.current < 1000) return;
      if (fillAttemptCountRef.current >= 3) return;

      requestAnimationFrame(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        const viewport = window.innerHeight;
        
        if (scrollHeight <= viewport + 20 && data.length < 30) {
          lastFillCheckRef.current = now;
          fillAttemptCountRef.current++;
          onLoadMore();
        }
      });
    },
    [onLoadMore]
  );

  return {
    scrollProps,
    lastItemRef: Platform.OS === "web" ? lastItemRef : undefined,
    flatListRef: Platform.OS !== "web" ? flatListRef : undefined,
    getLastItemProps: () =>
      Platform.OS === "web" ? { ref: lastItemRef as any } : {},
    ensureFillTriggersLoad,
  };
}
