import React, { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

interface CenterContentProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function CenterContent({ children, style }: CenterContentProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
