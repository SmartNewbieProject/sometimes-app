import { View } from "react-native";
import { UserProfileSkeleton } from "./user-profile-skeleton";
import { SkeletonBlock } from "@/src/shared/skeleton/block";

type Props = {
  reservedHeight?: number;
  variant?: "short" | "medium" | "long";
};

export function ArticleSkeleton({ reservedHeight, variant = "medium" }: Props) {
  if (reservedHeight) {
    return <SkeletonBlock h={reservedHeight} r={0} />;
  }

  const conf = {
    short: { lines: 3, withImage: false },
    medium: { lines: 5, withImage: Math.random() < 0.3 },
    long: { lines: 6, withImage: Math.random() < 0.6 },
  }[variant];

  return (
    <View className="w-full p-4 bg-white" accessibilityRole="progressbar">
      <UserProfileSkeleton />

      <View className="my-3 mb-4 mx-[8px] flex flex-row justify-between items-center">
        <SkeletonBlock w={"55%"} h={16} />
        <SkeletonBlock w={60} h={10} />
      </View>

      <View className="mx-[8px] mb-4">
        {Array.from({ length: conf.lines }).map((_, i) => (
          <SkeletonBlock
            key={i}
            h={14}
            style={{ marginBottom: 8 }}
            w={i === conf.lines - 1 ? "70%" : `${80 - (i % 3) * 5}%`}
          />
        ))}
      </View>

      {conf.withImage && (
        <View className="mx-[8px] mb-4 flex-row gap-2">
          {Array.from({ length: Math.ceil(Math.random() * 3) }).map((_, i) => (
            <SkeletonBlock key={i} w={80} h={80} r={10} />
          ))}
        </View>
      )}

      <View className="flex-row items-center mx-[8px] justify-between">
        {[0, 1, 2].map((i) => (
          <View className="flex-row items-center" key={i} style={{ gap: 6 }}>
            <SkeletonBlock w={16} h={16} r={8} />
            <SkeletonBlock w={32} h={10} />
          </View>
        ))}
      </View>

      <View className="h-[1px] bg-[#F3F0FF] mt-3" />
    </View>
  );
}
