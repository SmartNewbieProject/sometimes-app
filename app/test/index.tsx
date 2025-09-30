import RouletteItem from "@/src/features/event/ui/roulette/roulette-item";
import RouletteModal from "@/src/features/event/ui/roulette/roulette-modal";
import { useModal } from "@/src/shared/hooks/use-modal";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

function Test() {
  const { showModal } = useModal();
  useEffect(() => {
    showModal({ custom: RouletteModal });
  }, []);
  return (
    <>
      <Text>hello</Text>
    </>
  );
}

export default Test;
