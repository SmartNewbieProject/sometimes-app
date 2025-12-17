import React from "react";
import { View, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";
import { Text } from "@/src/shared/ui";
import colors from "@/src/shared/constants/colors";
import { semanticColors } from "@/src/shared/constants/semantic-colors";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AnalysisCardProps = {
  title: string;
  score?: string;
  mode: "toggle" | "custom";
  children?: React.ReactNode;
  rightElement?: React.ReactElement;
  isExpanded?: boolean;
  onToggle?: () => void;
};

export const AnalysisCard = ({
  title,
  score,
  mode,
  children,
  rightElement,
  isExpanded,
  onToggle,
}: AnalysisCardProps) => {
  const handlePress = () => {
    if (mode === "toggle" && onToggle) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      onToggle();
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={mode === "toggle" ? 0.7 : 1}
      onPress={mode === "toggle" ? handlePress : undefined}
    >
      <View style={styles.header}>
        <Text size="md" weight="bold" textColor="purple">
          {title}
        </Text>
        <View style={styles.rightContainer}>
          {score && (
            <Text size="12" weight="normal" textColor="gray" style={styles.score}>
              {score}
            </Text>
          )}
          {mode === "toggle" && (
            <Text size="20" weight="light" textColor="gray" style={styles.expandIcon}>
              {isExpanded ? "⌃" : "⌄"}
            </Text>
          )}
          {mode === "custom" && rightElement}
        </View>
      </View>
      {mode === "toggle" && isExpanded && (
        <View style={styles.content}>{children}</View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.lightPurple, // #E2D5FF
    ...Platform.select({
      ios: {
        shadowColor: "#F2ECFF",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  score: {
    marginRight: 4,
  },
  expandIcon: {
    marginLeft: 4,
  },
  content: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
});
