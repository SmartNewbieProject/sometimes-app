import useLikedMeQuery from "@/src/features/like/queries/use-liked-me-query";
import Loading from "@/src/features/loading";
import NotSome from "@/src/features/post-box/ui/not-some";
import PostBoxCard from "@/src/features/post-box/ui/post-box-card";
import { useMutualMatchReviewTrigger } from "@/src/features/in-app-review";
import { MIXPANEL_EVENTS } from "@/src/shared/constants/mixpanel-events";
import { mixpanelAdapter } from "@/src/shared/libs/mixpanel";
import { FlashList } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import colors from "@/src/shared/constants/colors";
import { Text } from "@/src/shared/ui";

function LikedMe() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'LATEST' | 'LETTER'>('LATEST');
  const hasLetter = filter === 'LETTER' ? true : undefined;

  const { data: likedMeList, isLoading } = useLikedMeQuery(hasLetter);
  const queryClient = useQueryClient();

  useEffect(() => {
    mixpanelAdapter.track(MIXPANEL_EVENTS.LIKE_LIST_VIEWED, {
      list_type: "liked_me",
      timestamp: new Date().toISOString(),
    });
  }, []);

  const sortedList = useMemo(() => {
    if (!likedMeList) {
      return [];
    }

    return [...likedMeList].sort((a, b) => {
      return (
        (a.status === "IN_CHAT" ? 1 : 0) - (b.status === "IN_CHAT" ? 1 : 0)
      );
    });
  }, [likedMeList]);

  // 인앱 리뷰: 상호 좋아요 매칭 발생 시 리뷰 요청
  const hasMutualMatch = useMemo(() => {
    return likedMeList?.some((item) => item.isMutualLike) ?? false;
  }, [likedMeList]);

  useMutualMatchReviewTrigger({
    isMutualMatch: hasMutualMatch,
    enabled: !isLoading,
  });

  useEffect(() => {
    return () => {
      queryClient.invalidateQueries({
        queryKey: ["liked", "preview-history"],
        exact: true,
      });
    };
  }, []);

  const renderList = () => {
    if (sortedList?.length === 0) {
      return <NotSome type="likedMe" />;
    }

    if (Platform.OS === "web") {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {sortedList.map((item) => (
            <PostBoxCard key={item.matchId} type="liked-me" {...item} />
          ))}
        </ScrollView>
      );
    }

    return (
      <FlashList
        data={sortedList}
        renderItem={({ item }) => <PostBoxCard type="liked-me" {...item} />}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 48 }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Pressable
          style={[
            styles.filterChip,
            filter === 'LATEST' && styles.filterChipActive,
          ]}
          onPress={() => setFilter('LATEST')}
        >
          <Text
            size="13"
            weight={filter === 'LATEST' ? 'medium' : 'regular'}
            style={{
              color: filter === 'LATEST' ? colors.primaryPurple : '#9CA3AF',
            }}
          >
            {t("features.post-box.ui.filter.latest")}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterChip,
            filter === 'LETTER' && styles.filterChipActive,
          ]}
          onPress={() => setFilter('LETTER')}
        >
          <Text
            size="13"
            weight={filter === 'LETTER' ? 'medium' : 'regular'}
            style={{
              color: filter === 'LETTER' ? colors.primaryPurple : '#9CA3AF',
            }}
          >
            {t("features.post-box.ui.filter.letter_first")}
          </Text>
        </Pressable>
      </View>

      <Loading.Lottie
        title={t("apps.postBox.liked_me_loading")}
        loading={isLoading}
      >
        {renderList()}
      </Loading.Lottie>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 400,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    borderColor: colors.primaryPurple,
    backgroundColor: '#F3F0FF',
  },
  // Letter chip specific active style override if needed, 
  // but relying on conditional text color for now. 
  // Wait, let's match the design: Letter chip usually has a filled background if active?
  // User said "refer to image 1". In image 1:
  // "최신순" is white bg with purple border/text when active? Or simple gray?
  // "편지 포함 우선" is purple bg with white text when active?
  // Let's re-examine image 1.
  // Actually I cannot see the image clearly in my mind but standard design in this app:
  // Active chip usually has primary color border/bg.
  // Let's implement based on description: "배치하여 스위치할 수 있게끔".
  // Let's assume:
  // INACTIVE: White BG, Gray Border, Gray Text.
  // ACTIVE (Latest): White BG, Purple Border, Purple Text (as per code above).
  // ACTIVE (Letter): Purple BG, Purple Border, White Text (Need to adjust styles).

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 48,
  },
});

export default LikedMe;
