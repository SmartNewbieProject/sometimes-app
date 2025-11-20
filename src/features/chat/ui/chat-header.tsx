import ChevronLeft from "@assets/icons/chevron-left.svg";
import { semanticColors } from '../../../shared/constants/colors';
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
function ChatHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container]}>
      <Image
        source={require("@assets/images/MESSAGE_LOGO.png")}
        style={{ width: 118, height: 18 }}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 68,
    backgroundColor: semanticColors.surface.background,
    flexDirection: "row",
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: 700,
    fontFamily: "Pretendard-ExtraBold",
    color: semanticColors.text.primary,
  },
});

export default ChatHeader;
