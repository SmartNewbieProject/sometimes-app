import useLikedMeQuery from "@/src/features/like/queries/use-liked-me-query";
import Loading from "@/src/features/loading";
import NotSome from "@/src/features/post-box/ui/not-some";
import PostBoxCard from "@/src/features/post-box/ui/post-box-card";
import { FlashList } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

function LikedMe() {
  const { t } = useTranslation();
  const { data: likedMeList, isLoading } = useLikedMeQuery();
  const queryClient = useQueryClient();

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
        title={t("apps.postBox.liked_me_loading")}
        loading={isLoading}
      >
        {sortedList?.length > 0 ? (
          <FlashList
            data={sortedList}
            renderItem={({ item }) => <PostBoxCard type="liked-me" {...item} />}
            estimatedItemSize={200}
            contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 48 }}
          />
        ) : (
          <NotSome type="likedMe" />
        )}
      </Loading.Lottie>
    </View>
  );
}

export default LikedMe;
