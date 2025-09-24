import {
  TouchableOpacity,
  View,
  StyleSheet,
  Text as RNText,
} from "react-native";
import { Text as SText } from "@/src/shared/ui";
import { router } from "expo-router";
import { useInfiniteMyCommentsQuery } from "../../queries/use-infinite-my-comments";
import { CustomInfiniteScrollView } from "@/src/shared/infinite-scroll/custom-infinite-scroll-view";
import type { MyComment } from "../../apis";

function CommentRow({ item }: { item: MyComment }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/community/${item.article.id}`)}
      activeOpacity={0.8}
    >
      <SText size="12" className="opacity-60">
        원글 · {item.article.title ?? "제목 없음"}
      </SText>

      <RNText numberOfLines={3} ellipsizeMode="tail" style={styles.comment}>
        {item.content}
      </RNText>

      <SText size="12" className="opacity-60 mt-6">
        {new Date(item.createdAt).toLocaleString()}
      </SText>
    </TouchableOpacity>
  );
}

export default function MyCommentsScreen() {
  const { comments, isLoading, isLoadingMore, hasNextPage, loadMore, refetch } =
    useInfiniteMyCommentsQuery(15);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <SText className="px-4 py-3" weight="bold">
        내가 쓴 댓글
      </SText>

      <CustomInfiniteScrollView
        data={comments}
        renderItem={(c: MyComment) => <CommentRow item={c} />}
        onLoadMore={loadMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasNextPage}
        onRefresh={refetch}
        refreshing={isLoading && !isLoadingMore}
        className="flex-1"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#F0ECFF",
  },
  comment: {
    marginTop: 4,
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 20,
    color: "#111",
  },
});
