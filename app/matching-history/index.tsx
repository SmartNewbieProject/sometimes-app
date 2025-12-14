import MatchingHistoryList from "@/src/features/matching-history/ui/matching-history-list";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { BottomNavigation } from "@/src/shared/ui";
import React from "react";
import { StyleSheet, View } from "react-native";

function MatchingHistory() {
  return (
    <View style={styles.container}>
      <MatchingHistoryList />
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: semanticColors.surface.background,
    flex: 1,
  },
});

export default MatchingHistory;
