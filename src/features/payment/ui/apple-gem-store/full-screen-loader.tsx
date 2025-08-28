import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

function FullScreenLoader({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, // 화면 전체 덮기
    backgroundColor: "rgba(0,0,0,0.5)", // 반투명 검은색
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
});

export default FullScreenLoader;
