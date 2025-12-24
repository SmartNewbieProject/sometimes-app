/**
 * 카드뉴스 하이라이트 캐러셀
 * 홈 화면 상단에 표시되는 최신 카드뉴스 3개
 * - 3초 간격 자동 슬라이드
 * - 무한 캐러셀 (마지막 → 첫 번째 자연스러운 전환)
 * - 터치 시 자동 슬라이드 일시 중지
 */
import React, { useCallback, useRef, useState, useEffect, useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  type LayoutChangeEvent,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/src/shared/ui";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { useCardNewsHighlights } from "../queries";
import type { CardNewsHighlight } from "../types";

const SCREEN_WIDTH = Dimensions.get("window").width;
const AUTO_SLIDE_INTERVAL = 3000;

type Props = {
  onPressItem: (item: CardNewsHighlight) => void;
};

export function CardNewsHighlights({ onPressItem }: Props) {
  const { data: highlights, isLoading, isError } = useCardNewsHighlights();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(SCREEN_WIDTH - 32);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const autoSlideTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isJumpingRef = useRef(false);

  const itemCount = highlights?.length ?? 0;

  const extendedHighlights = useMemo(() => {
    if (!highlights || highlights.length === 0) return [];
    if (highlights.length === 1) return highlights;
    return [
      highlights[highlights.length - 1],
      ...highlights,
      highlights[0],
    ];
  }, [highlights]);

  const getRealIndex = useCallback(
    (extendedIndex: number) => {
      if (itemCount <= 1) return 0;
      if (extendedIndex === 0) return itemCount - 1;
      if (extendedIndex === extendedHighlights.length - 1) return 0;
      return extendedIndex - 1;
    },
    [itemCount, extendedHighlights.length]
  );

  const scrollToIndex = useCallback(
    (index: number, animated = true) => {
      scrollRef.current?.scrollTo({
        x: index * containerWidth,
        animated,
      });
    },
    [containerWidth]
  );

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  useEffect(() => {
    if (itemCount > 1 && containerWidth > 0) {
      scrollToIndex(1, false);
      setCurrentIndex(1);
    }
  }, [itemCount, containerWidth, scrollToIndex]);

  const startAutoSlide = useCallback(() => {
    if (autoSlideTimer.current) {
      clearInterval(autoSlideTimer.current);
    }
    if (itemCount <= 1) return;

    autoSlideTimer.current = setInterval(() => {
      if (isUserInteracting || isJumpingRef.current) return;

      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        scrollToIndex(nextIndex, true);
        return nextIndex;
      });
    }, AUTO_SLIDE_INTERVAL);
  }, [itemCount, scrollToIndex, isUserInteracting]);

  const stopAutoSlide = useCallback(() => {
    if (autoSlideTimer.current) {
      clearInterval(autoSlideTimer.current);
      autoSlideTimer.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isUserInteracting && itemCount > 1) {
      startAutoSlide();
    }
    return () => stopAutoSlide();
  }, [isUserInteracting, itemCount, startAutoSlide, stopAutoSlide]);

  const handleScrollBeginDrag = useCallback(() => {
    setIsUserInteracting(true);
    stopAutoSlide();
  }, [stopAutoSlide]);

  const handleScrollEndDrag = useCallback(() => {
    setIsUserInteracting(false);
  }, []);

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isJumpingRef.current) return;

      const offsetX = e.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / containerWidth);
      setCurrentIndex(newIndex);

      if (itemCount <= 1) return;

      if (newIndex === 0) {
        isJumpingRef.current = true;
        const jumpToIndex = extendedHighlights.length - 2;
        setTimeout(() => {
          scrollToIndex(jumpToIndex, false);
          setCurrentIndex(jumpToIndex);
          isJumpingRef.current = false;
        }, 50);
      } else if (newIndex === extendedHighlights.length - 1) {
        isJumpingRef.current = true;
        setTimeout(() => {
          scrollToIndex(1, false);
          setCurrentIndex(1);
          isJumpingRef.current = false;
        }, 50);
      }
    },
    [containerWidth, itemCount, extendedHighlights.length, scrollToIndex]
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={semanticColors.brand.primary} />
      </View>
    );
  }

  if (isError || !highlights?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>✨</Text>
        <Text style={styles.emptyTitle}>곧 새로운 소식이 올라와요!</Text>
        <Text style={styles.emptyDescription}>
          썸타임에서 준비한 특별한 이야기,{"\n"}조금만 기다려주세요
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>지금 주목할 소식</Text>
      </View>

      <View onLayout={handleLayout}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollEnd={handleMomentumEnd}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={containerWidth}
          contentContainerStyle={styles.scrollContent}
        >
          {extendedHighlights.map((item, index) => (
            <TouchableOpacity
              key={`${item.id}-${index}`}
              activeOpacity={0.9}
              onPress={() => onPressItem(item)}
              style={[styles.cardWrapper, { width: containerWidth }]}
            >
              <View style={styles.card}>
                <Image
                  source={{ uri: item.backgroundImage.url }}
                  style={StyleSheet.absoluteFillObject}
                  contentFit="cover"
                />
                <LinearGradient
                  colors={[
                    "transparent",
                    "rgba(0,0,0,0.5)",
                    "rgba(0,0,0,0.9)",
                  ]}
                  locations={[0, 0.4, 1]}
                  style={StyleSheet.absoluteFillObject}
                />
                {item.hasReward && (
                  <View style={styles.rewardBadge}>
                    <Text style={styles.rewardBadgeText}>🎁 보상</Text>
                  </View>
                )}
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.ctaButton}>
                    <Text style={styles.ctaText}>지금 확인하기 →</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.paginationContainer}>
        {highlights.map((_, index) => {
          const realCurrentIndex = getRealIndex(currentIndex);
          const isActive = index === realCurrentIndex;
          return (
            <View
              key={index}
              style={[
                styles.paginationDot,
                isActive && styles.paginationDotActive,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  loadingContainer: {
    height: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(247, 243, 255, 0.5)",
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: semanticColors.brand.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: semanticColors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: semanticColors.text.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  cardWrapper: {
    paddingRight: 8,
  },
  card: {
    height: 280,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: semanticColors.brand.primary,
  },
  rewardBadge: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  rewardBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 32,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.95)",
    lineHeight: 20,
    marginBottom: 16,
  },
  ctaButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ctaText: {
    color: semanticColors.brand.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D9D9D9",
  },
  paginationDotActive: {
    width: 36,
    backgroundColor: semanticColors.brand.primary,
    borderRadius: 10,
  },
});
