import { useCallback, useMemo, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  LayoutChangeEvent,
} from "react-native";
import { useHomeNoticesQuery } from "../queries/use-home";

export function useHomeNotices(size = 5) {
  const { notices, isLoading, isError, error, refetch, prefetch } =
    useHomeNoticesQuery(size);

  const scrollRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [index, setIndex] = useState(0);

  const total = useMemo(
    () => Math.min(notices.length, size),
    [notices.length, size]
  );

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width || 0;
      if (w && w !== containerWidth) setContainerWidth(w);
    },
    [containerWidth]
  );

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const viewportWidth =
        e.nativeEvent.layoutMeasurement?.width || containerWidth || 1;
      const offsetX = e.nativeEvent.contentOffset.x || 0;
      const next = Math.round(offsetX / viewportWidth);
      const clamped = Math.max(0, Math.min(next, Math.max(total - 1, 0)));
      setIndex(clamped);
    },
    [containerWidth, total]
  );

  const goTo = useCallback(
    (i: number, animated = true) => {
      if (!scrollRef.current) return;
      const w = containerWidth || 0;
      if (!w) return;
      const clamped = Math.max(0, Math.min(i, Math.max(total - 1, 0)));
      scrollRef.current.scrollTo({ x: clamped * w, y: 0, animated });
      setIndex(clamped);
    },
    [containerWidth, total]
  );

  return {
    notices,
    isLoading,
    isError,
    error,
    index,
    total,
    refs: { scrollRef },
    handlers: {
      onLayout,
      onMomentumEnd,
      goTo,
    },
    actions: {
      refetch,
      prefetch,
    },
    containerWidth,
  };
}
