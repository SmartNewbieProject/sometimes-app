import { usePathname, useRouter, Slot } from "expo-router";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { StyleSheet, View, Pressable } from "react-native";

import Layout from "@/src/features/layout";

import PostBoxHeaders from "@/src/features/post-box/ui/post-box-header";
import { type Tab, ToggleTab } from "@/src/features/post-box/ui/toggle-tab";
import { PostBoxFilterContext, type LikedMeFilter } from "@/src/features/post-box/post-box-filter-context";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/src/shared/constants/colors";
import { Text } from "@/src/shared/ui";
import { PROFILE_VIEWER_KEYS } from "@/src/shared/libs/locales/keys";
import { Feather } from "@expo/vector-icons";

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
  const [filter, setFilter] = useState<LikedMeFilter>('LATEST');

  const handleViewedMePress = () => {
    router.navigate('/viewed-me');
  };

  return (
    <PostBoxFilterContext.Provider value={{ filter, setFilter }}>
      <Layout.Default
        style={[styles.container, { paddingBottom: insets.bottom }]}
      >
        <PostBoxHeaders />
        <View style={styles.editContainer}>
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

          {activeTab === "liked-me" && (
            <View style={styles.filterContainer}>
              <View style={styles.filterChips}>
                <Pressable
                  style={[styles.filterChip, filter === 'LATEST' && styles.filterChipActive]}
                  onPress={() => setFilter('LATEST')}
                >
                  <Text
                    size="13"
                    weight={filter === 'LATEST' ? 'medium' : 'regular'}
                    style={{ color: filter === 'LATEST' ? colors.primaryPurple : '#9CA3AF' }}
                  >
                    {t('features.post-box.ui.filter.latest')}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.filterChip, filter === 'LETTER' && styles.filterChipActive]}
                  onPress={() => setFilter('LETTER')}
                >
                  <Text
                    size="13"
                    weight={filter === 'LETTER' ? 'medium' : 'regular'}
                    style={{ color: filter === 'LETTER' ? colors.primaryPurple : '#9CA3AF' }}
                  >
                    {t('features.post-box.ui.filter.letter_first')}
                  </Text>
                </Pressable>
              </View>

              <Pressable style={styles.viewerAnchor} onPress={handleViewedMePress}>
                <Text size="13" weight="medium" textColor="purple">
                  {t(PROFILE_VIEWER_KEYS.viewedMeAnchorText)}
                </Text>
                <Feather name="chevron-right" size={16} color={semanticColors.brand.primary} />
              </Pressable>
            </View>
          )}

          <View style={styles.slotContainer}>
            <Slot />
          </View>
        </View>
      </Layout.Default>
    </PostBoxFilterContext.Provider>
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    borderColor: colors.primaryPurple,
    backgroundColor: '#F3F0FF',
  },
  viewerAnchor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  slotContainer: {
    flex: 1,
  },
});
