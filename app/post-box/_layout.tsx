import { Stack, usePathname, useRouter , Slot, withLayoutContext } from "expo-router";
import { semanticColors } from '@/src/shared/constants/colors';
import { StyleSheet, View } from "react-native";

import Layout from "@/src/features/layout";

import PostBoxHeaders from "@/src/features/post-box/ui/post-box-header";
import { type Tab, ToggleTab } from "@/src/features/post-box/ui/toggle-tab";
import { useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS: Tab[] = [
  { id: "liked-me", label: "도착한 썸" },
  { id: "i-liked", label: "보낸 썸" },
];

export default function ProfileEditLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>(
    pathname.split("/")[2] ?? "liked-me"
  );
  return (
    <Layout.Default
      style={[styles.container, { paddingBottom: insets.bottom }]}
    >
      <PostBoxHeaders />
      <ScrollView style={styles.editContainer}>
        <View style={styles.toggleContainer}>
          <ToggleTab
            tabs={TABS}
            activeTab={activeTab}
            onTabClick={() => {
              const next = activeTab === "i-liked" ? "liked-me" : "i-liked";
              setActiveTab(next);
              router.navigate(`/post-box/${next}`);
            }}
          />
        </View>
        <View>
          <Slot />
        </View>
      </ScrollView>
    </Layout.Default>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  editContainer: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
  },
  toggleContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 22,
    paddingBottom: 10,
  },
});
