import { Stack, useRouter } from "expo-router";
import { semanticColors } from '../../src/shared/constants/colors';
import { Slot, withLayoutContext } from "expo-router";
import { StyleSheet, View } from "react-native";

import Layout from "@/src/features/layout";

import { SettingHeader } from "@/src/features/setting/ui";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileEditLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "interest">("profile");
  return (
    <Layout.Default style={[styles.container]}>
      <SettingHeader />

      <View>
        <Slot />
      </View>
    </Layout.Default>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
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
