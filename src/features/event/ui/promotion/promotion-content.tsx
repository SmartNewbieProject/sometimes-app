import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import PromotionInviteCode from "./promotion-invite-code";

function PromotionContent() {
  return (
    <LinearGradient
      style={styles.container}
      colors={["#F4EFFF", "#E6DAFF"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      locations={[0.01, 1]}
    >
      <Image
        source={require("@assets/images/promotion/content/balloon.webp")}
        style={styles.balloon}
      />
      <Image
        source={require("@assets/images/promotion/content/particle.webp")}
        style={styles.particle}
      />
      <PromotionInviteCode />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    position: "relative",
    paddingHorizontal: 16,
  },
  balloon: {
    position: "absolute",
    top: 60,
    left: 124,
    width: 79,
    height: 79,
  },
  particle: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 357,
    height: 357,
  },
});

export default PromotionContent;
