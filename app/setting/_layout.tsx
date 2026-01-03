import { Stack, useRouter , Slot, withLayoutContext } from "expo-router";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { ScrollView, StyleSheet, View } from "react-native";

import Layout from "@/src/features/layout";

import { SettingHeader } from "@/src/features/setting/ui";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { JpLegalLinks } from "@/src/shared/ui";

export default function ProfileEditLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "interest">("profile");
  return (
    <Layout.Default style={[styles.container]}>
      <SettingHeader />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Slot />
        <JpLegalLinks variant="mypage" />
      </ScrollView>
    </Layout.Default>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
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
