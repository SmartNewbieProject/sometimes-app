import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, TouchableOpacity, Linking } from "react-native";

function JapanOpeningBanner() {
  const handlePress = async () => {
    const url = "https://sometimejapan.vercel.app/";
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <Image
        source={require("@assets/images/banner/japan-opening.webp")}
        style={styles.image}
        contentFit="cover"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    width: "99%",
    height: 88,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    backgroundColor: semanticColors.surface.background,
    overflow: "hidden",
    shadowColor: "#F2ECFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});

export default JapanOpeningBanner;
