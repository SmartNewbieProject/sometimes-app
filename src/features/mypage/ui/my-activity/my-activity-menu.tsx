import { useCommingSoon } from "@/src/features/admin/hooks";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MyActivityCard from "./my-activity-card";
import { router } from "expo-router";

function MyActivityMenu() {
  const showCommingSoon = useCommingSoon();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My 활동</Text>
      <View style={styles.contentContainer}>
        <MyActivityCard
          title="내가 쓴 글"
          onPress={() => router.push("/community/my/my-articles")}
        />
        <MyActivityCard
          title="댓글 단 글"
          onPress={() => router.push("/community/my/my-comments")}
        />
        <MyActivityCard
          title="좋아요한 글"
          onPress={() => router.push("/community/my/my-liked")}
        />
        <MyActivityCard title="리뷰 내역" onPress={showCommingSoon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 28 },
  title: {
    fontSize: 14,
    fontFamily: "Pretendard-Bold",
    fontWeight: "700" as any,
    lineHeight: 20,
    letterSpacing: -0.042,
  },
  contentContainer: {
    paddingHorizontal: 2,
    gap: 24,
    marginTop: 24,
  },
});

export default MyActivityMenu;
