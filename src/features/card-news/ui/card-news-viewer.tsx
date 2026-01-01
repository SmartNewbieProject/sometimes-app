/**
 * 카드뉴스 뷰어 (풀스크린 오버레이)
 * ScrollView pagingEnabled 기반 스와이프 네비게이션
 */
import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Linking,
  ScrollView,
  Platform,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, AnimatedArrow } from "@/src/shared/ui";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { useCardNewsDetail, useCardNewsReward } from "../queries";
import { useToast } from "@/src/shared/hooks/use-toast";
import type { CardSection } from "../types";
import { useTranslation } from "react-i18next";

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

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MAX_IMAGE_HEIGHT = 475;

type Props = {
  cardNewsId: string | null;
  onClose: () => void;
};

export function CardNewsViewer({ cardNewsId, onClose }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasClaimedReward, setHasClaimedReward] = useState(false);
  const { emitToast } = useToast();
  const scrollViewRef = useRef<ScrollView>(null);

  const { data: cardNews, isLoading } = useCardNewsDetail(
    cardNewsId ?? "",
    !!cardNewsId
  );
  const { mutate: claimReward, isPending: isClaimingReward } =
    useCardNewsReward();

  const sections = cardNews?.sections ?? [];
  const totalCards = sections.length;

  useEffect(() => {
    setCurrentIndex(0);
    setHasClaimedReward(false);
    scrollViewRef.current?.scrollTo({ x: 0, animated: false });
  }, [cardNewsId]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    console.log("[CardNewsViewer] handleScroll - offsetX:", offsetX, "index:", index);
    setCurrentIndex(index);
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, totalCards - 1));
    scrollViewRef.current?.scrollTo({ x: clampedIndex * SCREEN_WIDTH, animated: true });
  }, [totalCards]);

  const handleClaimReward = useCallback(() => {
    if (!cardNewsId || hasClaimedReward || isClaimingReward) return;

    claimReward(cardNewsId, {
      onSuccess: (response) => {
        setHasClaimedReward(true);
        if (response.success && response.reward) {
          emitToast(
            t("features.card-news.viewer.reward_success_toast", { count: response.reward.gems }),
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: semanticColors.brand.primary }} />
          );
        } else if (response.alreadyRewarded) {
          emitToast(t("features.card-news.viewer.reward_already"), undefined);
        }
      },
      onError: () => {
        emitToast(t("features.card-news.viewer.reward_error"), undefined);
      },
    });
  }, [cardNewsId, hasClaimedReward, isClaimingReward, claimReward, emitToast]);

  const handlePrevious = useCallback(() => {
    scrollToIndex(currentIndex - 1);
  }, [scrollToIndex, currentIndex]);

  const handleNext = useCallback(() => {
    scrollToIndex(currentIndex + 1);
  }, [scrollToIndex, currentIndex]);

  const renderCard = useCallback(
    (section: CardSection) => (
      <View key={section.order} style={styles.cardContainer}>
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

  if (!cardNewsId) return null;

  const isFirstCard = currentIndex === 0;
  const isLastCard = currentIndex === totalCards - 1;

  return (
    <View style={styles.overlay}>
      <StatusBar barStyle="dark-content" />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={semanticColors.brand.primary} size="large" />
        </View>
      ) : (
        <>
          {/* 헤더 */}
          <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t("features.card-news.viewer.header_title")}</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* 카드 캐러셀 - ScrollView 기반 */}
          <View style={styles.carouselContainer}>
            {/* 진행 Dots */}
            {totalCards > 1 && (
              <View style={styles.dotsContainer}>
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
            )}

            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              bounces={false}
              decelerationRate="fast"
              snapToInterval={SCREEN_WIDTH}
              snapToAlignment="start"
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {sections
                .sort((a, b) => a.order - b.order)
                .map((section) => renderCard(section))}
            </ScrollView>
          </View>

          {/* 하단 네비게이션 버튼 */}
          <View style={[styles.navigationContainer, { paddingBottom: insets.bottom + 16 }]}>
            {totalCards > 1 ? (
              <>
                <AnimatedArrow
                  direction="left"
                  onPress={handlePrevious}
                  disabled={isFirstCard}
                />
                <View style={styles.pageIndicator}>
                  <Text style={styles.pageText}>
                    {isLastCard ? " " : t("features.card-news.viewer.cards_remaining", { count: totalCards - currentIndex - 1 })}
                  </Text>
                </View>
                <AnimatedArrow
                  direction="right"
                  onPress={handleNext}
                  disabled={isLastCard}
                />
              </>
            ) : (
              <View style={styles.pageIndicator}>
                <Text style={styles.pageText}> </Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
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
  carouselContainer: {
    flex: 1,
  },
  horizontalScroll: {
    flex: 1,
  },
  horizontalScrollContent: {
    flexDirection: "row",
  },
  dotsContainer: {
    position: "absolute",
    top: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    zIndex: 10,
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
  cardContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  cardPadding: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
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
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 32,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  pageIndicator: {
    minWidth: 100,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pageText: {
    fontSize: 14,
    fontWeight: "500",
    color: semanticColors.text.secondary,
  },
});
