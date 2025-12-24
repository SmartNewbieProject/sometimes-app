/**
 * 카드뉴스 홈 화면
 * 하이라이트 캐러셀 + 무한 스크롤 목록
 */
import React, { useCallback, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
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
import { useCardNewsHighlights, useCardNewsInfiniteList } from "../queries";
import type { CardNewsHighlight, CardNewsListItem } from "../types";

type Props = {
  onNavigateToNotice?: () => void;
};

export function CardNewsHome({ onNavigateToNotice }: Props) {
  const analytics = useCardNewsAnalytics();
  const { data: highlights } = useCardNewsHighlights();
  const { items: listItems } = useCardNewsInfiniteList(10);
  const hasTrackedSectionViewRef = useRef(false);

  useEffect(() => {
    if (highlights && !hasTrackedSectionViewRef.current) {
      hasTrackedSectionViewRef.current = true;
      analytics.trackSectionViewed(
        highlights.length,
        listItems.length > 0,
        'home'
      );
    }
  }, [highlights, listItems.length, analytics]);

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

  const HeaderComponent = (
    <>
      <TouchableOpacity
        style={styles.faqBanner}
        onPress={handleFAQPress}
        activeOpacity={0.8}
      >
        <View style={styles.faqContent}>
          <Text style={styles.faqTitle}>자주 묻는 질문</Text>
          <Text style={styles.faqDescription}>
            궁금한 점이 있으신가요? FAQ를 확인해보세요!
          </Text>
        </View>
        <IconWrapper>
          <VectorIcon width={9} height={12} color={semanticColors.brand.primary} />
        </IconWrapper>
      </TouchableOpacity>

      <CardNewsHighlights onPressItem={handlePressHighlight} />

      {onNavigateToNotice && (
        <TouchableOpacity
          style={styles.noticeLink}
          onPress={onNavigateToNotice}
          activeOpacity={0.8}
        >
          <Image
            source={require("@/assets/images/loudspeaker.png")}
            style={styles.noticeLinkIcon}
          />
          <Text style={styles.noticeLinkText}>기존 공지사항 보기</Text>
          <View style={styles.mlAuto}>
            <IconWrapper>
              <VectorIcon width={9} height={12} color="black" />
            </IconWrapper>
          </View>
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <PalePurpleGradient />

      <CardNewsList
        onPressItem={handlePressListItem}
        ListHeaderComponent={HeaderComponent}
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
  noticeLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: semanticColors.surface.background,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  noticeLinkIcon: {
    width: 16,
    height: 16,
  },
  noticeLinkText: {
    fontSize: 14,
    color: semanticColors.text.primary,
  },
  mlAuto: {
    marginLeft: "auto",
  },
});
