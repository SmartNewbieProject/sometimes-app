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
  type NativeSyntheticEvent,
  type NativeScrollEvent,
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

export default function CardNewsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasClaimedReward, setHasClaimedReward] = useState(false);
  const [imageAspectRatios, setImageAspectRatios] = useState<Record<number, number>>({});
  const { emitToast } = useToast();

  const { data: cardNews, isLoading, error } = useCardNewsDetail(id ?? "", !!id);
  const { mutate: claimReward, isPending: isClaimingReward } = useCardNewsReward();

  const sections = cardNews?.sections ?? [];
  const totalCards = sections.length;

  useEffect(() => {
    setCurrentIndex(0);
    setHasClaimedReward(false);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [id]);

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / CONTAINER_WIDTH);
      setCurrentIndex(newIndex);

      if (
        newIndex === totalCards - 1 &&
        cardNews?.hasReward &&
        !hasClaimedReward
      ) {
        handleClaimReward();
      }
    },
    [totalCards, cardNews?.hasReward, hasClaimedReward]
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
    (index: number) => {
      if (index >= 0 && index < totalCards) {
        scrollRef.current?.scrollTo({ x: CONTAINER_WIDTH * index, animated: true });
        setCurrentIndex(index);
      }
    },
    [totalCards]
  );

  const handleLeftTap = useCallback(() => {
    goToCard(currentIndex - 1);
  }, [currentIndex, goToCard]);

  const handleRightTap = useCallback(() => {
    goToCard(currentIndex + 1);
  }, [currentIndex, goToCard]);

  const handleClose = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/community");
    }
  }, []);

  const handleImageLoad = useCallback((order: number, width: number, height: number) => {
    if (width > 0 && height > 0) {
      setImageAspectRatios(prev => ({
        ...prev,
        [order]: width / height,
      }));
    }
  }, []);

  const renderCard = useCallback(
    (section: CardSection, index: number) => {
      const aspectRatio = imageAspectRatios[section.order] || 4 / 5;
      const imageHeight = CONTENT_WIDTH / aspectRatio;

      return (
        <View key={section.order} style={styles.cardContainer}>
          <View style={styles.cardPadding}>
            <View style={styles.cardImageArea}>
              {section.imageUrl ? (
                <Image
                  source={{ uri: section.imageUrl }}
                  style={[styles.cardImage, { aspectRatio }]}
                  contentFit="cover"
                  onLoad={(e) => {
                    const { width, height } = e.source;
                    handleImageLoad(section.order, width, height);
                  }}
                />
              ) : (
                <View style={[styles.cardImagePlaceholder, { aspectRatio: 4 / 5 }]}>
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
      );
    },
    [imageAspectRatios, handleImageLoad]
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
          <View style={[styles.header, { paddingTop: insets.top }]}>
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
        <View style={[styles.header, { paddingTop: insets.top }]}>
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
        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumEnd}
            scrollEventThrottle={16}
            decelerationRate="fast"
            style={styles.scrollView}
          >
            {sections
              .sort((a, b) => a.order - b.order)
              .map((section, index) => renderCard(section, index))}
          </ScrollView>

          {/* 진행 Dots (Absolute) */}
          <View style={styles.dotsContainerAbsolute}>
            {sections.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* 탭 영역 (좌/우) */}
        <TouchableWithoutFeedback onPress={handleLeftTap}>
          <View style={[styles.touchZone, styles.touchLeft]} />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={handleRightTap}>
          <View style={[styles.touchZone, styles.touchRight]} />
        </TouchableWithoutFeedback>
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
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
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
    paddingTop: 30,
  },
  dotsContainerAbsolute: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    zIndex: 10,
    pointerEvents: "none",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E2D5FF",
  },
  dotActive: {
    width: 18,
    borderRadius: 10,
    backgroundColor: semanticColors.brand.primary,
  },
  cardPadding: {
    paddingHorizontal: 20,
  },
  cardImageArea: {
    width: "100%",
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
