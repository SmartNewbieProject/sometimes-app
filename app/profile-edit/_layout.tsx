import { Stack, useRouter } from "expo-router";
import { Slot, withLayoutContext } from "expo-router";
import { StyleSheet, View } from "react-native";

import Layout from "@/src/features/layout";
import {
  ProfileEditHeader,
  type Tab,
  ToggleTab,
} from "@/src/features/profile-edit/ui";
import { useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS: Tab[] = [
  { id: "profile", label: "나의 프로필" },
  { id: "interest", label: "이상형" },
];

export default function ProfileEditLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "interest">("profile");
  return (
    <Layout.Default
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.top },
      ]}
    >
      <ProfileEditHeader />
      <ScrollView style={styles.editContainer}>
        <View style={styles.toggleContainer}>
          <ToggleTab
            tabs={TABS}
            activeTab={activeTab}
            onTabClick={() => {
              const next = activeTab === "profile" ? "interest" : "profile";
              setActiveTab(next);
              router.navigate(`/profile-edit/${next}`);
            }}
            style={{ width: 180 }}
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
    backgroundColor: "#fff",
  },
  toggleContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 22,
    paddingBottom: 10,
  },
});
