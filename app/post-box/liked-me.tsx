import useLikedMeQuery from "@/src/features/like/queries/use-liked-me-query";
import Loading from "@/src/features/loading";
import PostBoxCard from "@/src/features/post-box/ui/post-box-card";
import { FlashList } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { View } from "react-native";

function LikedMe() {
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
        title={"도착한 썸 리스트를 불러오는 중이에요!"}
        loading={isLoading}
      >
        <FlashList
          data={sortedList}
          renderItem={({ item }) => <PostBoxCard type="liked-me" {...item} />}
          estimatedItemSize={200}
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 48 }}
        />
      </Loading.Lottie>
    </View>
  );
}

export default LikedMe;
