import { View, StyleSheet } from "react-native";
import { semanticColors } from '../../../shared/constants/colors';
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
    short: { lines: 1, withImage: false },
    medium: { lines: 2, withImage: Math.random() < 0.3 },
    long: { lines: 3, withImage: Math.random() < 0.6 },
  }[variant];

  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <UserProfileSkeleton />

      <View style={styles.headerRow}>
        <SkeletonBlock w={"55%"} h={16} />
        <SkeletonBlock w={60} h={10} />
      </View>

      <View style={styles.body}>
        {Array.from({ length: conf.lines }).map((_, i) => (
          <SkeletonBlock
            key={i}
            h={14}
            style={styles.bodyLine}
            w={i === conf.lines - 1 ? "70%" : `${80 - (i % 3) * 5}%`}
          />
        ))}
      </View>

      {conf.withImage && (
        <View style={styles.thumbRow}>
          {Array.from({ length: Math.ceil(Math.random() * 3) }).map((_, i) => (
            <SkeletonBlock key={i} w={80} h={80} r={10} />
          ))}
        </View>
      )}

      <View style={styles.actionsRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.actionItem}>
            <SkeletonBlock w={16} h={16} r={8} />
            <SkeletonBlock w={32} h={10} />
          </View>
        ))}
      </View>

      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 16, // p-4
    backgroundColor: "#FFFFFF",
  },
  headerRow: {
    marginTop: 12, // my-3 (top)
    marginBottom: 16, // mb-4 overrides bottom of my-3
    marginHorizontal: 8, // mx-[8px]
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  body: {
    marginHorizontal: 8, // mx-[8px]
    marginBottom: 16, // mb-4
  },
  bodyLine: {
    marginBottom: 8,
  },
  thumbRow: {
    marginHorizontal: 8, // mx-[8px]
    marginBottom: 16, // mb-4
    flexDirection: "row",
    // If your RN version supports gap, you can add: columnGap: 8
  },
  actionsRow: {
    marginHorizontal: 8, // mx-[8px]
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: semanticColors.surface.background,
    marginTop: 12, // mt-3
  },
});
