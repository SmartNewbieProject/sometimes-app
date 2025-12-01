import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import KakaoShare from "./share/kakao-share";
import LinkShare from "./share/link-share";

function PromotionBottom() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { bottom: insets.bottom + 16 }]}>
      <KakaoShare />
      <LinkShare />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 32,
  },
});

export default PromotionBottom;
