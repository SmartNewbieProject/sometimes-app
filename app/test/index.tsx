import GalleryList from "@/src/features/chat/ui/gallery-list";
import { DefaultLayout } from "@/src/features/layout/ui";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function Test() {
  const insets = useSafeAreaInsets();
  return (
    <DefaultLayout style={{ paddingTop: insets.top }}>
      <Text>12312312</Text>
      <GalleryList />
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({});

export default Test;
