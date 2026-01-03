import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { Image } from "expo-image";
import { useRouter, type Href } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, Linking } from "react-native";
import type { BannerResponse } from "../../types";

interface ServerBannerProps {
  banner: BannerResponse;
}

function ServerBanner({ banner }: ServerBannerProps) {
  const router = useRouter();

  const handlePress = async () => {
    if (!banner.actionUrl || !banner.actionType) return;

    if (banner.actionType === "internal") {
      router.push(banner.actionUrl as Href);
    } else if (banner.actionType === "external") {
      const canOpen = await Linking.canOpenURL(banner.actionUrl);
      if (canOpen) {
        await Linking.openURL(banner.actionUrl);
      }
    }
  };

  const isDisabled = !banner.actionType || !banner.actionUrl;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={isDisabled ? 1 : 0.8}
      onPress={handlePress}
      disabled={isDisabled}
    >
      <Image
        source={{ uri: banner.imageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    width: "99%",
    height: 88,
    backgroundColor: semanticColors.surface.background,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

export default ServerBanner;
