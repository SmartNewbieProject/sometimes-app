import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { StyleSheet, View } from "react-native";

import Layout from "@/src/features/layout";
import {
  ProfileEditHeader,
  type Tab,
  ToggleTab,
} from "@/src/features/profile-edit/ui";
import ProfileContent from "@/src/features/profile-edit/ui/profile/profile-content";
import InterestContent from "@/src/features/profile-edit/ui/interest/interest-content";
import { useMemo, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Slot, usePathname } from "expo-router";

export default function ProfileEditLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<"profile" | "interest">(
    pathname.includes("interest") ? "interest" : "profile"
  );

  // 외부 네비게이션으로 진입 시 탭 동기화
  useEffect(() => {
    if (pathname.includes("interest")) {
      setActiveTab("interest");
    } else if (pathname.includes("profile")) {
      setActiveTab("profile");
    }
  }, [pathname]);

  const TABS: Tab[] = useMemo(() => [
    { id: "profile", label: t("apps.profile_edit.tabs.profile") },
    { id: "interest", label: t("apps.profile_edit.tabs.interest") },
  ], [t]);

  const handleTabClick = useCallback(() => {
    setActiveTab(prev => prev === "profile" ? "interest" : "profile");
  }, []);

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
        <View style={[styles.contentContainer, activeTab !== "profile" && styles.hidden]}>
          <ProfileContent />
        </View>
        <View style={[styles.contentContainer, activeTab !== "interest" && styles.hidden]}>
          <InterestContent />
        </View>
      </View>
      {/* Slot은 Expo Router 라우트 매칭에 필요하지만 실제 콘텐츠는 위에서 렌더링 */}
      <View style={styles.hidden}>
        <Slot />
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
  hidden: {
    display: "none",
  },
});
