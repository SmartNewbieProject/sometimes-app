import Layout from "@/src/features/layout";
import { Header, Text } from "@/src/shared/ui";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import PromotionBanner from "./promotion-banner";
import PromotionHeader from "./promotion-header";

function Promotion() {
  return (
    <Layout.Default>
      <PromotionHeader />
      <PromotionBanner />
    </Layout.Default>
  );
}

const styles = StyleSheet.create({});

export default Promotion;
