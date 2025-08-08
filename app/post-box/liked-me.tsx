import useLikedMeQuery from "@/src/features/like/queries/use-liked-me-query";
import Loading from "@/src/features/loading";
import PostBoxCard from "@/src/features/post-box/ui/post-box-card";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

function LikedMe() {
  const { data: likedMeList, isLoading } = useLikedMeQuery();

  return (
    <View>
      <Loading.Lottie
        title={"도착한 썸 리스트를 불러오는 중이에요!"}
        loading={isLoading}
      >
        <FlashList
          data={likedMeList}
          renderItem={({ item }) => <PostBoxCard type="liked-me" {...item} />}
          estimatedItemSize={200}
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 48 }}
        />
      </Loading.Lottie>
    </View>
  );
}

const styles = StyleSheet.create({});

export default LikedMe;
