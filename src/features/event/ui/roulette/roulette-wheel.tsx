import { Image } from "expo-image";
import { semanticColors } from "@/src/shared/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, { AnimatedStyle } from "react-native-reanimated";

import RoulettePizza from "@assets/images/roulette-pizza.svg";

interface RouletteWheelProps {
  isSpinning: boolean;
  rouletteAnimationStyle: AnimatedStyle<ViewStyle>;
  onStart: () => void;
}

export function RouletteWheel({
  isSpinning,
  rouletteAnimationStyle,
  onStart
}: RouletteWheelProps) {
  return (
    <View style={styles.componentContainer}>
      <View style={styles.shadowLayer} />

      <LinearGradient
        colors={["#C6ADF6", "#7A4AE2"]}
        locations={[0.12, 1.0]}
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 0.8, y: 0.9 }}
        style={styles.contentLayer}
      >
        <LinearGradient
          colors={["rgba(122, 74, 226, 0.25)", "rgba(0, 0, 0, 0)"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.4 }}
          style={styles.insetShadow}
        />

        <Animated.View style={[rouletteAnimationStyle, styles.roulette]}>
          <Image
            source={require("@assets/images/roulette.png")}
            style={styles.rouletteImage}
          />
        </Animated.View>
        <RoulettePizza style={styles.pizza} />

        <Pressable onPress={onStart} disabled={isSpinning}>
          <View style={styles.shadowButtonContainer}>
            <LinearGradient
              colors={["#7A4AE2", "#290E62"]}
              start={{ x: 0.14, y: 0.12 }}
              end={{ x: 0.82, y: 0.81 }}
              style={styles.gradient}
            >
              <Text style={styles.startText}>START</Text>
            </LinearGradient>
          </View>
        </Pressable>
      </LinearGradient>

      <Image
        style={styles.shadowArrowContainer}
        source={require("@assets/images/roulette-arrow.png")}
      />
      <Image
        style={styles.bottom}
        source={require("@assets/images/roulette-bottom.png")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  componentContainer: {
    alignSelf: "center",
    marginTop: 40,
    width: 296,
    height: 296,
  },
  shadowLayer: {
    width: "100%",
    height: "100%",
    borderRadius: 148,
    backgroundColor: semanticColors.brand.accent,
    shadowColor: "rgba(122, 74, 226, 0.60)",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 8.5,
    elevation: 10,
  },
  contentLayer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 148,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  insetShadow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  roulette: {
    padding: 0,
    alignSelf: "flex-start",
    marginLeft: -38,
    position: "absolute",
  },
  shadowButtonContainer: {
    width: 76,
    height: 76,
    borderRadius: 999,
    shadowColor: "#6938CF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    position: "absolute",
    top: -38,
    left: -38,
    zIndex: 10,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 10,
  },
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderRadius: 44,
    borderWidth: 0.5,
    borderColor: semanticColors.border.default,
    justifyContent: "center",
    alignItems: "center",
  },
  startText: {
    fontFamily: "Gmarket-Sans-Bold",
    fontWeight: "700",
    lineHeight: 18,
    fontSize: 15,
    color: semanticColors.text.inverse,
    textShadowColor: "#7A4AE2",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  pizza: {
    position: "absolute",
    top: 14,
  },
  shadowArrowContainer: {
    position: "absolute",
    top: -20,
    left: 126,
    width: 45,
    height: 70,
  },
  bottom: {
    position: "absolute",
    bottom: -36,
    left: 50,
    width: 190,
    height: 95,
    zIndex: -10,
  },
  rouletteImage: {
    width: 370,
    height: 370,
  },
});
