import React, { memo } from "react";
import { StyleSheet, View } from "react-native";

interface LoggerOverlayProps {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  logs: any[];
}

function LoggerOverlay({ logs }: LoggerOverlayProps) {
  return <View style={styles.container}>{JSON.stringify(logs)}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: "100%",
    overflowY: "auto",
  },
});

export default memo(LoggerOverlay);
