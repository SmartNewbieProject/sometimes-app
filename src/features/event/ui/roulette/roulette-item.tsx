import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import RoulettePizza from "@assets/images/roulette-pizza.svg";

import Roulette from "@assets/images/roulette.svg";
import { useRoulette } from "../../hooks/roulette/use-roulette";

function RouletteItem() {
  const { isSpinning, rouletteAnimationStyle, handleStart } = useRoulette();
  return (
    <View style={styles.shadowContainer}>
      <LinearGradient
        colors={["#C6ADF6", "#7A4AE2"]}
        locations={[0.12, 1.7]}
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 0.8, y: 0.9 }}
        style={styles.gradientContainer}
      >
        <LinearGradient
          colors={["rgba(122, 74, 226, 0.25)", "transparent"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.4 }}
          style={styles.insetShadow}
        />

        <Animated.View style={[rouletteAnimationStyle, styles.roulette]}>
          <Roulette />
        </Animated.View>
        <RoulettePizza style={styles.pizza} />

        <Pressable onPress={handleStart} disabled={isSpinning}>
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
  shadowContainer: {
    alignSelf: "center",
    marginTop: 40,
    width: 296,
    height: 296,
    borderRadius: 296,
    shadowColor: "rgba(122, 74, 226, 0.60)",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 8.5,
    elevation: 10,
  },
  gradientContainer: {
    flex: 1,
    borderRadius: 296,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#fff",
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
    borderRadius: "50%",
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
    borderColor: "white",

    justifyContent: "center",
    alignItems: "center",
  },
  startText: {
    fontFamily: "Gmarket-Sans-Bold",
    fontWeight: 700,
    lineHeight: 18,
    fontSize: 15,
    color: "#fff",
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
});

export default RouletteItem;
