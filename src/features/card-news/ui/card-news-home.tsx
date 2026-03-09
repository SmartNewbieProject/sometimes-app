/**
 * 카드뉴스 홈 화면
 * 하이라이트 캐러셀 + 무한 스크롤 목록
 */
import React, { useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { Text, PalePurpleGradient } from "@/src/shared/ui";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { IconWrapper } from "@/src/shared/ui/icons";
import VectorIcon from "@/assets/icons/Vector.svg";
import { CardNewsHighlights } from "./card-news-highlights";
import { CardNewsList } from "./card-news-list";
import { useCardNewsAnalytics } from "../hooks";
import type { CardNewsHighlight, CardNewsListItem } from "../types";
import { useTranslation } from "react-i18next";
import { useCategory, SOMETIME_STORY_CODE } from "@/src/features/community/hooks";

export function CardNewsHome() {
  const { t } = useTranslation();
  const analytics = useCardNewsAnalytics();
  const { changeCategory } = useCategory();

  const handlePressHighlight = useCallback((item: CardNewsHighlight) => {
    router.push(`/card-news/${item.id}`);
  }, []);

  const handlePressListItem = useCallback((item: CardNewsListItem) => {
    router.push(`/card-news/${item.id}`);
  }, []);

  const handleFAQPress = useCallback(() => {
    analytics.trackFAQClicked();
    const FAQ_URL = "https://ruby-composer-6d2.notion.site/FAQ-1ff1bbec5ba1803bab5cfbe635bba220?source=copy_link";
    Linking.openURL(FAQ_URL);
  }, [analytics]);

  const handleStoryPress = useCallback(() => {
    changeCategory(SOMETIME_STORY_CODE);
  }, [changeCategory]);

  const headerComponent = useMemo(() => (
    <>
      <TouchableOpacity
        style={styles.faqBanner}
        onPress={handleFAQPress}
        activeOpacity={0.8}
      >
        <View style={styles.faqContent}>
          <Text style={styles.faqTitle}>{t("features.card-news.home.faq_title")}</Text>
          <Text style={styles.faqDescription}>
            {t("features.card-news.home.faq_description")}
          </Text>
        </View>
        <IconWrapper>
          <VectorIcon width={9} height={12} color={semanticColors.brand.primary} />
        </IconWrapper>
      </TouchableOpacity>

      <CardNewsHighlights onPressItem={handlePressHighlight} />

      {/* 썸타임 이야기 링크 */}
      <TouchableOpacity
        style={styles.storyLink}
        onPress={handleStoryPress}
        activeOpacity={0.8}
      >
        <Text style={styles.storyLinkEmoji}>📖</Text>
        <View style={styles.storyLinkContent}>
          <Text style={styles.storyLinkTitle}>{t("features.community.ui.article_list_screen.title")}</Text>
          <Text style={styles.storyLinkDescription}>{t("features.community.ui.article_list_screen.subtitle")}</Text>
        </View>
        <View style={styles.mlAuto}>
          <IconWrapper>
            <VectorIcon width={9} height={12} color={semanticColors.brand.primary} />
          </IconWrapper>
        </View>
      </TouchableOpacity>
    </>
  ), [handleFAQPress, handlePressHighlight, handleStoryPress, t]);

  return (
    <View style={styles.container}>
      <PalePurpleGradient />

      <CardNewsList
        onPressItem={handlePressListItem}
        ListHeaderComponent={headerComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  faqBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "rgba(247, 243, 255, 0.8)",
    marginBottom: 16,
  },
  faqContent: {
    flex: 1,
    gap: 4,
  },
  faqTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: semanticColors.brand.primary,
  },
  faqDescription: {
    fontSize: 13,
    fontWeight: "400",
    color: semanticColors.text.secondary,
  },
  mlAuto: {
    marginLeft: "auto",
  },
  storyLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: semanticColors.surface.secondary,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 12,
  },
  storyLinkEmoji: {
    fontSize: 24,
  },
  storyLinkContent: {
    flex: 1,
    gap: 2,
  },
  storyLinkTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: semanticColors.text.primary,
  },
  storyLinkDescription: {
    fontSize: 13,
    color: semanticColors.text.muted,
  },
});
