import { Stack, usePathname, useRouter , Slot, withLayoutContext } from "expo-router";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { StyleSheet, View } from "react-native";

import Layout from "@/src/features/layout";

import PostBoxHeaders from "@/src/features/post-box/ui/post-box-header";
import { type Tab, ToggleTab } from "@/src/features/post-box/ui/toggle-tab";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileEditLayout() {
  const { t } = useTranslation();
  const TABS: Tab[] = [
    { id: "liked-me", label: t("apps.postBox.tab_liked_me") },
    { id: "i-liked", label: t("apps.postBox.tab_i_liked") },
  ];
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
