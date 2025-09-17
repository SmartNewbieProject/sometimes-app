import useLikedMeQuery from "@/src/features/like/queries/use-liked-me-query";
import Loading from "@/src/features/loading";
import PostBoxCard from "@/src/features/post-box/ui/post-box-card";
import { FlashList } from "@shopify/flash-list";
import React, {useEffect} from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {useQueryClient} from "@tanstack/react-query";

function LikedMe() {
  const { t } = useTranslation();
  const { data: likedMeList, isLoading } = useLikedMeQuery();
  const queryClient = useQueryClient();

  useEffect(() => {
    return () => {
      queryClient.invalidateQueries({
        queryKey: ["liked", "preview-history"],
        exact: true,
      });
    };
  }, []);

  return (
    <View>
      <Loading.Lottie
        title={t("apps.post-box.liked_me_loading")}
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
