import useLikedMeQuery from "@/src/features/like/queries/use-liked-me-query";
import Loading from "@/src/features/loading";
import NotSome from "@/src/features/post-box/ui/not-some";
import PostBoxCard from "@/src/features/post-box/ui/post-box-card";
import { useMutualMatchReviewTrigger } from "@/src/features/in-app-review";
import { MIXPANEL_EVENTS } from "@/src/shared/constants/mixpanel-events";
import { mixpanelAdapter } from "@/src/shared/libs/mixpanel";
import { FlashList } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Platform, ScrollView, StyleSheet, View } from "react-native";

function LikedMe() {
  const { t } = useTranslation();
  const { data: likedMeList, isLoading } = useLikedMeQuery();
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 48,
  },
});

export default LikedMe;
