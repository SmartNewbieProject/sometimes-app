import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";

import colors from "@/src/shared/constants/colors";

export const Header = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <Image
        source={require("@/assets/images/moment/moment-logo.webp")}
        style={styles.logo}
        contentFit="contain"
        defaultSource={require("@/assets/images/moment/moment-logo.webp")}
      />
      {/* Fallback: 이미지가 없을 경우 텍스트 표시 */}
      {/* <Text style={styles.logoText}>MOMENT</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  logo: {
    width: 120,
    height: 40,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primaryPurple,
  },
});