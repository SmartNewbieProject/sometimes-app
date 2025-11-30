import React from "react";
import { semanticColors } from '@/src/shared/constants/colors';
import { View, StyleSheet } from "react-native";

import { MomentPage } from "@/src/features/moment/ui";
import { BottomNavigation } from "@/src/shared/ui";

export default function MomentRoute() {
  return (
    <View style={styles.container}>
      <MomentPage />
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
  },
});