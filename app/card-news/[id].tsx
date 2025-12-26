/**
 * 카드뉴스 상세 페이지 (URL 기반)
 * 외부 링크나 딥링크로 접근 가능
 */
import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  type GestureResponderEvent,
  ActivityIndicator,
  Pressable,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Text } from "@/src/shared/ui";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { useCardNewsDetail, useCardNewsReward } from "@/src/features/card-news/queries";
import { useCardNewsAnalytics, CARD_NEWS_NAVIGATION_METHODS, CARD_NEWS_EXIT_METHODS, CARD_NEWS_ENTRY_SOURCES } from "@/src/features/card-news";
import { useToast } from "@/src/shared/hooks/use-toast";
import type { CardSection } from "@/src/features/card-news/types";

const URL_REGEX = /(https?:\/\/[^\s<\]]+)/g;

const handleOpenUrl = (url: string) => {
  Linking.openURL(url).catch(() => {});
};

const renderTextWithLinks = (text: string, baseStyle: object) => {
  const parts = text.split(URL_REGEX);

  return parts.map((part, idx) => {
    if (URL_REGEX.test(part)) {
      URL_REGEX.lastIndex = 0;
      return (
        <Text
          key={idx}
          style={[baseStyle, styles.linkText]}
          onPress={() => handleOpenUrl(part)}
        >
          {part}
        </Text>
      );
    }
    return part;
  });
};

const renderHtmlContent = (html: string) => {
  const lines = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p>/gi, "")
    .split("\n")
    .filter(line => line.trim());

  return lines.map((line, index) => {
    const isBold = /<(strong|b)>/.test(line);
    const cleanLine = line
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();

    if (!cleanLine) return null;

    const textStyle = isBold ? styles.cardBodyBold : styles.cardBodyLine;

    return (
      <Text key={index} style={textStyle}>
        {renderTextWithLinks(cleanLine, textStyle)}
      </Text>
    );
  }).filter(Boolean);
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH, 428);
const CONTENT_WIDTH = CONTAINER_WIDTH - 40;
const MAX_IMAGE_HEIGHT = 475;

export default function CardNewsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasClaimedReward, setHasClaimedReward] = useState(false);
  const { emitToast } = useToast();
  const analytics = useCardNewsAnalytics();

  const { data: cardNews, isLoading, error } = useCardNewsDetail(id ?? "", !!id);
  const { mutate: claimReward, isPending: isClaimingReward } = useCardNewsReward();

  const sections = cardNews?.sections ?? [];
  const totalCards = sections.length;
  const entrySourceRef = useRef<typeof CARD_NEWS_ENTRY_SOURCES[keyof typeof CARD_NEWS_ENTRY_SOURCES]>(
    CARD_NEWS_ENTRY_SOURCES.DEEP_LINK
  );
  const hasTrackedEntryRef = useRef(false);
  const hasTrackedCompletionRef = useRef(false);

  useEffect(() => {
    setCurrentIndex(0);
    setHasClaimedReward(false);
    hasTrackedEntryRef.current = false;
    hasTrackedCompletionRef.current = false;
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [id]);

  useEffect(() => {
    if (cardNews && !hasTrackedEntryRef.current) {
      hasTrackedEntryRef.current = true;
      analytics.trackDetailEntered(
        cardNews.id,
        cardNews.title,
        cardNews.sections.length,
        entrySourceRef.current
      );
    }
  }, [cardNews, analytics]);

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / CONTAINER_WIDTH);
      setCurrentIndex(newIndex);

      if (newIndex === totalCards - 1 && !hasTrackedCompletionRef.current) {
        hasTrackedCompletionRef.current = true;
        analytics.trackCompleted();
      }

      // TODO: 보상 기능 활성화 시 주석 해제
      // if (
      //   newIndex === totalCards - 1 &&
      //   cardNews?.hasReward &&
      //   !hasClaimedReward
      // ) {
      //   handleClaimReward();
      // }
    },
    [totalCards, cardNews?.hasReward, hasClaimedReward, analytics]
  );

  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / CONTAINER_WIDTH);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalCards) {
        setCurrentIndex(newIndex);

        if (newIndex === totalCards - 1 && !hasTrackedCompletionRef.current) {
          hasTrackedCompletionRef.current = true;
          analytics.trackCompleted();
        }
      }

      if (Platform.OS === "web") {
        if (scrollEndTimer.current) {
          clearTimeout(scrollEndTimer.current);
        }
        scrollEndTimer.current = setTimeout(() => {
          const snapIndex = Math.round(offsetX / CONTAINER_WIDTH);
          const snapX = snapIndex * CONTAINER_WIDTH;
          if (Math.abs(offsetX - snapX) > 1) {
            scrollRef.current?.scrollTo({ x: snapX, animated: true });
          }
        }, 150);
      }
    },
    [currentIndex, totalCards, analytics]
  );

  const handleClaimReward = useCallback(() => {
    if (!id || hasClaimedReward || isClaimingReward) return;

    claimReward(id, {
      onSuccess: (response) => {
        setHasClaimedReward(true);
        if (response.success && response.reward) {
          emitToast(
            `구슬 ${response.reward.gems}개 획득!`,
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: semanticColors.brand.primary }} />
          );
        } else if (response.alreadyRewarded) {
          emitToast("이미 보상을 받으셨어요", undefined);
        }
      },
      onError: () => {
        emitToast("보상 요청에 실패했어요. 다시 시도해주세요.", undefined);
      },
    });
  }, [id, hasClaimedReward, isClaimingReward, claimReward, emitToast]);

  const goToCard = useCallback(
    (index: number, navigationMethod?: typeof CARD_NEWS_NAVIGATION_METHODS[keyof typeof CARD_NEWS_NAVIGATION_METHODS]) => {
      if (index >= 0 && index < totalCards) {
        if (navigationMethod) {
          analytics.trackCardNavigated(index, navigationMethod);
        }
        scrollRef.current?.scrollTo({ x: CONTAINER_WIDTH * index, animated: true });
        setCurrentIndex(index);

        if (index === totalCards - 1 && !hasTrackedCompletionRef.current) {
          hasTrackedCompletionRef.current = true;
          analytics.trackCompleted();
        }
      }
    },
    [totalCards, analytics]
  );

  const handleLeftTap = useCallback(() => {
    goToCard(currentIndex - 1, CARD_NEWS_NAVIGATION_METHODS.TAP_LEFT);
  }, [currentIndex, goToCard]);

  const handleRightTap = useCallback(() => {
    goToCard(currentIndex + 1, CARD_NEWS_NAVIGATION_METHODS.TAP_RIGHT);
  }, [currentIndex, goToCard]);

  const handleClose = useCallback(() => {
    if (!hasTrackedCompletionRef.current && analytics.hasActiveSession()) {
      analytics.trackExited(CARD_NEWS_EXIT_METHODS.BACK_BUTTON);
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/community");
    }
  }, [analytics]);

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScrollX = useRef(0);

  const handleMouseDown = useCallback((e: GestureResponderEvent | React.MouseEvent) => {
    if (Platform.OS !== "web") return;
    isDragging.current = true;
    const clientX = "nativeEvent" in e && "pageX" in e.nativeEvent
      ? e.nativeEvent.pageX
      : (e as React.MouseEvent).clientX;
    dragStartX.current = clientX;
    dragStartScrollX.current = currentIndex * CONTAINER_WIDTH;
  }, [currentIndex]);

  const handleMouseMove = useCallback((e: GestureResponderEvent | React.MouseEvent) => {
    if (Platform.OS !== "web" || !isDragging.current) return;
    const clientX = "nativeEvent" in e && "pageX" in e.nativeEvent
      ? e.nativeEvent.pageX
      : (e as React.MouseEvent).clientX;
    const diff = dragStartX.current - clientX;
    const newScrollX = dragStartScrollX.current + diff;
    scrollRef.current?.scrollTo({ x: newScrollX, animated: false });
  }, []);

  const handleMouseUp = useCallback((e: GestureResponderEvent | React.MouseEvent) => {
    if (Platform.OS !== "web" || !isDragging.current) return;
    isDragging.current = false;
    const clientX = "nativeEvent" in e && "pageX" in e.nativeEvent
      ? e.nativeEvent.pageX
      : (e as React.MouseEvent).clientX;
    const diff = dragStartX.current - clientX;
    const threshold = CONTAINER_WIDTH * 0.2;

    if (Math.abs(diff) > threshold) {
      const direction = diff > 0 ? 1 : -1;
      goToCard(currentIndex + direction, CARD_NEWS_NAVIGATION_METHODS.SWIPE);
    } else {
      goToCard(currentIndex);
    }
  }, [currentIndex, goToCard]);

  const renderCard = useCallback(
    (section: CardSection) => (
      <View
        key={section.order}
        style={[
          styles.cardContainer,
          // @ts-ignore - Web-specific CSS for scroll snap
          Platform.OS === "web" && { scrollSnapAlign: "start" },
        ]}
      >
        <View style={styles.cardPadding}>
          <View style={styles.cardImageArea}>
            {section.imageUrl ? (
              <Image
                source={{ uri: section.imageUrl }}
                style={styles.cardImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.cardImagePlaceholder}>
                <Text style={styles.placeholderEmoji}>📰</Text>
              </View>
            )}
          </View>

          <View style={styles.cardTextArea}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <View style={styles.cardBodyContainer}>
              {renderHtmlContent(section.content)}
            </View>
          </View>
        </View>
      </View>
    ),
    []
  );

  if (!id) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>잘못된 카드뉴스 링크입니다</Text>
            <Pressable onPress={handleClose} style={styles.errorButton}>
              <Text style={styles.errorButtonText}>돌아가기</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>새로운 소식</Text>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>카드뉴스를 불러올 수 없습니다</Text>
            <Pressable onPress={handleClose} style={styles.errorButton}>
              <Text style={styles.errorButtonText}>돌아가기</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={semanticColors.brand.primary} size="large" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* 헤더 */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>새로운 소식</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* 카드 스크롤뷰 */}
        <View
          style={[
            { flex: 1, overflow: "hidden" },
            Platform.OS === "web" && {
              cursor: "grab",
              // @ts-ignore - Web-specific: allow horizontal touch scrolling
              touchAction: "pan-x",
            } as any,
          ]}
          {...(Platform.OS === "web" && {
            onMouseDown: handleMouseDown as any,
            onMouseMove: handleMouseMove as any,
            onMouseUp: handleMouseUp as any,
            onMouseLeave: handleMouseUp as any,
          })}
        >
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled={Platform.OS !== "web"}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumEnd}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={CONTAINER_WIDTH}
            snapToAlignment="start"
            nestedScrollEnabled
            disableIntervalMomentum
            scrollEnabled={totalCards > 1}
            style={[
              styles.scrollView,
              Platform.OS === "web" && {
                // @ts-ignore - Web-specific CSS for touch scrolling and snap
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-x",
                overscrollBehaviorX: "contain",
                scrollSnapType: "x mandatory",
              },
            ]}
          >
            {sections
              .sort((a, b) => a.order - b.order)
              .map((section) => renderCard(section))}
          </ScrollView>

          {/* 슬라이드 인디케이터 영역 - 카드가 2개 이상일 때만 표시 */}
          {totalCards > 1 && (
            <View style={styles.indicatorContainer}>
              {/* 진행 Dots */}
              <View style={styles.dotsWrapper}>
                {sections.map((_, index) => (
                  <Pressable
                    key={index}
                    onPress={() => goToCard(index)}
                    hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                  >
                    <View
                      style={[
                        styles.dot,
                        index === currentIndex && styles.dotActive,
                      ]}
                    />
                  </Pressable>
                ))}
              </View>

              {/* 남은 슬라이드 안내 */}
              {totalCards - currentIndex - 1 > 0 && (
                <View style={styles.remainingBadge}>
                  <Text style={styles.remainingText}>
                    {totalCards - currentIndex - 1}장 남았어요!
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* 탭 영역 (좌/우) - 네이티브 앱에서만 표시 (웹에서는 스와이프 사용) */}
        {totalCards > 1 && Platform.OS !== "web" && (
          <>
            <TouchableWithoutFeedback onPress={handleLeftTap}>
              <View style={[styles.touchZone, styles.touchLeft]} />
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={handleRightTap}>
              <View style={[styles.touchZone, styles.touchRight]} />
            </TouchableWithoutFeedback>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 428,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: semanticColors.text.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  errorButton: {
    backgroundColor: semanticColors.brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: semanticColors.surface.background,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E2E2",
    zIndex: 10,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    color: semanticColors.text.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: semanticColors.text.primary,
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  cardContainer: {
    width: CONTAINER_WIDTH,
    minHeight: SCREEN_HEIGHT - 56,
    backgroundColor: "#FFFFFF",
    paddingTop: 48,
  },
  indicatorContainer: {
    position: "absolute",
    top: 8,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
    pointerEvents: "box-none",
  },
  dotsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    pointerEvents: "auto",
  },
  remainingBadge: {
    backgroundColor: "rgba(122, 74, 226, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    pointerEvents: "none",
  },
  remainingText: {
    fontSize: 13,
    fontWeight: "600",
    color: semanticColors.brand.primary,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E2D5FF",
  },
  dotActive: {
    width: 28,
    height: 10,
    borderRadius: 5,
    backgroundColor: semanticColors.brand.primary,
  },
  cardPadding: {
    paddingHorizontal: 20,
  },
  cardImageArea: {
    width: "100%",
    aspectRatio: 4 / 5,
    maxHeight: MAX_IMAGE_HEIGHT,
    backgroundColor: "#F7F3FF",
    borderRadius: 16,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F7F3FF",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderEmoji: {
    fontSize: 60,
  },
  cardTextArea: {
    marginTop: 24,
    paddingBottom: 40,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: semanticColors.text.primary,
    marginBottom: 16,
    lineHeight: 32,
  },
  cardBodyContainer: {
    gap: 8,
  },
  cardBodyLine: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333333",
  },
  cardBodyBold: {
    fontWeight: "700",
    color: semanticColors.text.primary,
  },
  linkText: {
    color: semanticColors.brand.primary,
    textDecorationLine: "underline",
  },
  touchZone: {
    position: "absolute",
    top: 100,
    bottom: 0,
    width: "50%",
  },
  touchLeft: {
    left: 0,
  },
  touchRight: {
    right: 0,
  },
});
