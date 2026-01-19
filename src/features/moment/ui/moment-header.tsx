import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import colors from "@/src/shared/constants/colors";

export const MomentHeader = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <Image
        source={require("@/assets/images/moment/moment-logo.webp")}
        style={styles.logo}
        contentFit="contain"
        defaultSource={require("@/assets/images/moment/moment-logo.webp")}
      />
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
});