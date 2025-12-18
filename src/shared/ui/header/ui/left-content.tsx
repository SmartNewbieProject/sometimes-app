import React, { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

interface LeftContentProps {
  children?: ReactNode;
}

export function LeftContent({ children }: LeftContentProps) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
});
