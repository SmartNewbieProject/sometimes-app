import { DefaultLayout } from "@/src/features/layout/ui";
import { Link, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function Area() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <DefaultLayout style={{ paddingTop: insets.top }}>
      <Link href="/">hi</Link>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({});

export default Area;
