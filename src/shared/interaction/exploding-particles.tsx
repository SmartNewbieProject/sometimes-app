import { useFocusEffect } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
} from "react-native-reanimated";

interface ExplodingParticlesProps {
  particleCount?: number;
  top: number;
  left: number;
}

function ExplodingParticles({
  particleCount = 16,
  top,
  left,
}: ExplodingParticlesProps) {
  const particles = Array.from({ length: particleCount }).map(() => ({
    translateX: useSharedValue(0),
    translateY: useSharedValue(0),
    opacity: useSharedValue(0),
    scale: useSharedValue(1),
  }));

  useFocusEffect(() => {
    particles.forEach((p, i) => {
      const baseAngle = 2 * Math.PI * (Math.floor(Math.random() * 16) / 16); // 8등분
      const jitter = (Math.random() - 0.5) * (Math.PI / 12);
      const angle = baseAngle + jitter;
      const distance = 30 + Math.random() * 15;

      p.translateX.value = withDelay(
        800,
        withTiming(Math.cos(angle) * distance, {
          duration: 500,
          easing: Easing.out(Easing.exp),
        })
      );
      p.translateY.value = withDelay(
        800,
        withTiming(Math.sin(angle) * distance, {
          duration: 500,
          easing: Easing.out(Easing.exp),
        })
      );
      p.opacity.value = withDelay(
        800,
        withTiming(1, {}, (finished) => {
          if (finished) {
            p.opacity.value = withTiming(0, { duration: 500 });
          }
        })
      );

      p.scale.value = withDelay(800, withTiming(0, { duration: 500 }));
    });
  });

  return (
    <>
      {particles.map((p, i) => {
        const style = useAnimatedStyle(() => ({
          transform: [
            { translateX: p.translateX.value },
            { translateY: p.translateY.value },
            { scale: p.scale.value },
          ],
          opacity: p.opacity.value,
        }));
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        return (
          <Animated.View
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={i}
            style={[
              styles.particle,
              style,
              { backgroundColor: getRandomRainbowColor(), top, left },
            ]}
          />
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
  },
  particle: {
    position: "absolute",

    width: 10,
    height: 10,
    borderRadius: 10,
  },
});

function getRandomRainbowColor(): string {
  const rainbowColors = [
    "#F2B6B6",
    "#F2C8A2",
    "#F2F0AA",
    "#BFE3BF",
    "#BFCFEA",
    "#BFAED3",
    "#D9C3E6",
  ];
  const index = Math.floor(Math.random() * rainbowColors.length);
  return rainbowColors[index];
}

export default ExplodingParticles;
