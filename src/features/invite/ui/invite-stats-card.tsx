import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { useInviteStats } from "../hooks/use-invite-stats";

function InviteStatsCard() {
  const { summary, isLoading, isError } = useInviteStats();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={semanticColors.brand.primary} />
      </View>
    );
  }

  if (isError || !summary) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>내 초대 성과</Text>
      <View style={styles.statsRow}>
        <StatItem label="링크 클릭" value={summary.totalClicks} />
        <View style={styles.divider} />
        <StatItem label="가입 전환" value={summary.totalConversions} />
        <View style={styles.divider} />
        <StatItem
          label="전환율"
          value={`${summary.conversionRate.toFixed(1)}%`}
          highlight
        />
      </View>
    </View>
  );
}

interface StatItemProps {
  label: string;
  value: number | string;
  highlight?: boolean;
}

function StatItem({ label, value, highlight }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: semanticColors.surface.background,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Pretendard-SemiBold",
    color: semanticColors.text.primary,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: semanticColors.text.secondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Pretendard-Bold",
    color: semanticColors.text.primary,
  },
  statValueHighlight: {
    color: semanticColors.brand.primary,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: semanticColors.border.default,
  },
});

export default InviteStatsCard;
