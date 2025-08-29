import React, { useEffect, useRef, useState, memo } from "react";
import {
  Animated,
  Easing,
  View,
  StyleSheet,
  type ViewStyle,
  type DimensionValue,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type ShimmerProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
  baseColor?: string;
  highlightColor?: string;
  duration?: number; // 1200~1600 권장
  pauseMS?: number;
  reduceMotion?: boolean;
};

const DEFAULT_BASE = "#EFEFF3";
const DEFAULT_HI = "#F6F6FA";

export const Shimmer = memo(function Shimmer({
  width = "100%",
  height = 12,
  borderRadius = 6,
  style,
  baseColor = DEFAULT_BASE,
  highlightColor = DEFAULT_HI,
  duration = 1400,
  pauseMS = 0,
  reduceMotion = false,
}: ShimmerProps) {
  const translateX = useRef(new Animated.Value(-1)).current;
  const [containerW, setContainerW] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.linear),
          useNativeDriver: true,
        }),
        Animated.delay(pauseMS),
        Animated.timing(translateX, {
          toValue: -1,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [duration, pauseMS, reduceMotion, translateX]);

  const animatedStyle = {
    transform: [
      {
        translateX: translateX.interpolate({
          inputRange: [-1, 1],
          outputRange: [-containerW, containerW],
        }),
      },
    ],
  };

  const containerStyle: ViewStyle = {
    width,
    height,
    borderRadius,
    overflow: "hidden",
    backgroundColor: baseColor,
  };

  return (
    <View
      onLayout={(e) => setContainerW(e.nativeEvent.layout.width || 0)}
      style={[containerStyle, style]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={[baseColor, highlightColor, baseColor]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
});
