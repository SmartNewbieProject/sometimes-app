import { Stack, usePathname, useRouter , Slot, withLayoutContext } from "expo-router";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { StyleSheet, View } from "react-native";

import Layout from "@/src/features/layout";
import {
  ProfileEditHeader,
  type Tab,
  ToggleTab,
} from "@/src/features/profile-edit/ui";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileEditLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<string>("profile");

  // pathname 변경에 따라 activeTab 동기화
  useEffect(() => {
    if (pathname.includes("/profile-edit/")) {
      const pathTab = pathname.split("/")[2];
      if (pathTab === "profile" || pathTab === "interest") {
        setActiveTab(pathTab);
      }
    }
  }, [pathname]);

  const TABS: Tab[] = useMemo(() => [
    { id: "profile", label: t("apps.profile_edit.tabs.profile") },
    { id: "interest", label: t("apps.profile_edit.tabs.interest") },
  ], [t]);

  const handleTabClick = useCallback(() => {
    setActiveTab(prev => {
      const next = prev === "profile" ? "interest" : "profile";
      router.navigate(`/profile-edit/${next}`);
      return next;
    });
  }, [router]);

  return (
    <Layout.Default
      style={[styles.container, { paddingBottom: insets.bottom }]}
    >
      <ProfileEditHeader />
      <View style={styles.editContainer}>
        <View style={styles.toggleContainer}>
          <ToggleTab
            tabs={TABS}
            activeTab={activeTab}
            onTabClick={handleTabClick}
          />
        </View>
        <View style={styles.contentContainer}>
          <Slot />
        </View>
      </View>
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
  contentContainer: {
    flex: 1,
  },
});
