import useILikedQuery from "@/src/features/like/queries/use-i-liked-query";
import Loading from "@/src/features/loading";
import NotSome from "@/src/features/post-box/ui/not-some";
import PostBoxCard from "@/src/features/post-box/ui/post-box-card";
import { FlashList } from "@shopify/flash-list";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Platform, ScrollView, StyleSheet, View } from "react-native";

function ILiked() {
  const { t } = useTranslation();
  const { data: iLikedList, isLoading } = useILikedQuery();
  const sortedList = useMemo(() => {
    if (!iLikedList) {
      return [];
    }

    return [...iLikedList].sort((a, b) => {
      return (
        (a.status === "IN_CHAT" ? 1 : 0) - (b.status === "IN_CHAT" ? 1 : 0)
      );
    });
  }, [iLikedList]);
  const renderList = () => {
    if (sortedList?.length === 0) {
      return <NotSome type="iLiked" />;
    }

    if (Platform.OS === "web") {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {sortedList.map((item) => (
            <PostBoxCard key={item.matchId} type="i-liked" {...item} />
          ))}
        </ScrollView>
      );
    }

    return (
      <FlashList
        data={sortedList}
        renderItem={({ item }) => <PostBoxCard type="i-liked" {...item} />}
        estimatedItemSize={200}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 48 }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Loading.Lottie
        title={t("apps.postBox.i_liked_loading")}
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

export default ILiked;
