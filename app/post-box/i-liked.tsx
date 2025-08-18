import useILikedQuery from "@/src/features/like/queries/use-i-liked-query";
import Loading from "@/src/features/loading";
import PostBoxCard from "@/src/features/post-box/ui/post-box-card";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

function ILiked() {
  const { data: iLikedList, isLoading } = useILikedQuery();

  return (
    <View>
      <Loading.Lottie
        title={"보낸 썸 리스트를 불러오는 중이에요!"}
        loading={isLoading}
      >
        <FlashList
          data={iLikedList}
          renderItem={({ item }) => <PostBoxCard type="i-liked" {...item} />}
          estimatedItemSize={200}
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 48 }}
        />
      </Loading.Lottie>
    </View>
  );
}

const styles = StyleSheet.create({});

export default ILiked;
