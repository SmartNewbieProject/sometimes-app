import React, { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

interface RightContentProps {
  children?: ReactNode;
}

export function RightContent({ children }: RightContentProps) {
  return (
    <View style={styles.container}>
      {children || <View style={styles.placeholder} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  placeholder: {
    width: 40,
  },
});
