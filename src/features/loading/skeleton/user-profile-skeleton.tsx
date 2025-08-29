import { View } from "react-native";
import { SkeletonBlock } from "@/src/shared/skeleton/block";

export function UserProfileSkeleton() {
  return (
    <View className="flex flex-row items-center mb-2">
      <SkeletonBlock w={32} h={32} r={16} style={{ marginRight: 12 }} />
      <View className="flex-1">
        <SkeletonBlock w={"30%"} h={12} style={{ marginBottom: 6 }} />
        <SkeletonBlock w={"45%"} h={10} />
      </View>
    </View>
  );
}
