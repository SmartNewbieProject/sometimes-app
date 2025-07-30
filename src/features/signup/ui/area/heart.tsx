import AreaDisabledHeart from "@assets/icons/area-disabled-heart.svg";
import AreaFillHeart from "@assets/icons/area-fill-heart.svg";
import AreaHeart from "@assets/icons/area-heart.svg";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
interface HeartProps {
  isPick: boolean;
  onClick: () => void;
  open: "close" | "open" | "preOpen";
}

function Heart({ isPick, onClick, open }: HeartProps) {
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const [isFill, setFill] = useState(true);
  console.log("isPick", isFill, isPick);
  useEffect(() => {
    if (isPick) {
      setFill(true);
      scaleAnimation.setValue(0);
      Animated.spring(scaleAnimation, {
        toValue: 1,
        bounciness: 8,
        speed: 8,
        velocity: 10,
        useNativeDriver: true,
      }).start(() => {});
    }
  }, [isPick]);

  return (
    <Animated.View
      style={{
        position: "relative",
        width: 37,
        height: 37,
        transform: [{ scale: scaleAnimation }],
        zIndex: 0,
      }}
    >
      <Pressable onPress={onClick}>
        {open === "close" ? (
          <AreaDisabledHeart />
        ) : isPick ? (
          <AreaFillHeart />
        ) : (
          <AreaHeart />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({});

export default Heart;
