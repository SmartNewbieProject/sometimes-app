import CahtScreen from "@/src/features/chat/ui/chat-screen";
import GalleryList from "@/src/features/chat/ui/gallery-list";
import { DefaultLayout } from "@/src/features/layout/ui";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
function Test() {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardProvider>
      <CahtScreen />
    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({});

export default Test;
