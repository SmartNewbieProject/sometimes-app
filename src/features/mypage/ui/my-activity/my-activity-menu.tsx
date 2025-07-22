import { useCommingSoon } from "@/src/features/admin/hooks";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MyActivityCard from "./my-activity-card";

function MyActivityMenu() {
  const showCommingSoon = useCommingSoon();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My 활동</Text>
      <View style={styles.contentContainer}>
        <MyActivityCard
          title="작성한 게시글, 댓글 관리"
          onPress={showCommingSoon}
        />
        <MyActivityCard
          title="좋아요 누른 게시글, 댓글"
          onPress={showCommingSoon}
        />

        <MyActivityCard title="리뷰 내역" onPress={showCommingSoon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
  },
  title: {
    fontSize: 14,
    fontFamily: "Pretendard-Bold",
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
