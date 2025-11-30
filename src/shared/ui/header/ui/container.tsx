import React, { type ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { semanticColors } from "@/src/shared/constants/colors";

interface ContainerProps {
  children: ReactNode;
  centered?: boolean;
}

export function Container({
  children,
  centered = false,
}: ContainerProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 12 }
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%', // w-full
    flexDirection: 'row', // flex-row
    justifyContent: 'space-between', // justify-between
    alignItems: 'center', // items-center
    paddingHorizontal: 12, // px-3 (12px)
    paddingVertical: 12, // py-[12px]
    backgroundColor: semanticColors.surface.background, // bg-surface-background
  },
});
