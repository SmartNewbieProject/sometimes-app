import useILikedQuery from "@/src/features/like/queries/use-i-liked-query";
import Loading from "@/src/features/loading";
import PostBoxCard from "@/src/features/post-box/ui/post-box-card";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

function ILiked() {
  const { t } = useTranslation();
  const { data: iLikedList, isLoading } = useILikedQuery();

  return (
    <View>
      <Loading.Lottie
        title={t("apps.postBox.i_liked_loading")}
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
