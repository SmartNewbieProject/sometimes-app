import React, { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { semanticColors } from "@/src/shared/constants/semantic-colors";

interface ContainerProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  centered?: boolean;
}

export function Container({
  children,
  centered = false,
  style,
}: ContainerProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 12 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: semanticColors.surface.background,
  },
});
