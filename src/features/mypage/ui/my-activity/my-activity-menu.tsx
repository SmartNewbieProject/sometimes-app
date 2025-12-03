import { useCommingSoon } from "@/src/features/admin/hooks";
import { semanticColors } from '../../../../shared/constants/colors';
import { StyleSheet, Text, View } from "react-native";
import MyActivityCard from "./my-activity-card";
import { router } from "expo-router";


function MyActivityMenu() {
  const showCommingSoon = useCommingSoon();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My 활동</Text>
      <View style={styles.bar} />
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
        {/* <MyActivityCard title="리뷰 내역" onPress={showCommingSoon} /> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 28 },
  title: {
    color: semanticColors.text.primary,
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    fontWeight: 600,
    lineHeight: 21.6,
  },
  bar: {
    marginTop: 5,
    height: 1,
    width: "100%",
    backgroundColor: semanticColors.surface.background,
  },
  contentContainer: {
    paddingHorizontal: 2,
    gap: 17,
    marginTop: 17,
  },
});

export default MyActivityMenu;
