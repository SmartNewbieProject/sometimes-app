import useILikedQuery from "@/src/features/like/queries/use-i-liked-query";
import Loading from "@/src/features/loading";
import NotSome from "@/src/features/post-box/ui/not-some";
import PostBoxCard from "@/src/features/post-box/ui/post-box-card";
import { FlashList } from "@shopify/flash-list";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

function ILiked() {
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
  return (
    <View>
      <Loading.Lottie
        title={"보낸 썸 리스트를 불러오는 중이에요!"}
        loading={isLoading}
      >
        {sortedList?.length > 0 ? (
          <FlashList
            data={sortedList}
            renderItem={({ item }) => <PostBoxCard type="i-liked" {...item} />}
            estimatedItemSize={200}
            contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 48 }}
          />
        ) : (
          <NotSome type="iLiked" />
        )}
      </Loading.Lottie>
    </View>
  );
}

const styles = StyleSheet.create({});

export default ILiked;
