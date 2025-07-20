import AccountMenu from "@/src/features/setting/ui/account-menu";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function Setting() {
  return (
    <View style={styles.container}>
      <AccountMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
});

export default Setting;
