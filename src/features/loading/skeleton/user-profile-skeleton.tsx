import { View, StyleSheet } from "react-native";
import { SkeletonBlock } from "@/src/shared/skeleton/block";

export function UserProfileSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonBlock w={32} h={32} r={16} style={styles.avatar} />
      <View style={styles.textWrapper}>
        <SkeletonBlock w={"30%"} h={12} style={styles.nameLine} />
        <SkeletonBlock w={"45%"} h={10} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // flex flex-row
    alignItems: "center", // items-center
    marginBottom: 8, // mb-2
  },
  avatar: {
    marginRight: 12, // mr-3
  },
  textWrapper: {
    flex: 1, // flex-1
  },
  nameLine: {
    marginBottom: 6,
  },
});
