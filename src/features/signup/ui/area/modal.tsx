import React, { useEffect, useRef } from "react";
import { semanticColors } from '@/src/shared/constants/colors';
import { Animated, StyleSheet, Text, View } from "react-native";

interface AreaModalProps {
  open: "open" | "preOpen" | "close";
  area: string;
  description?: string;
  isShow: boolean;
}

function AreaModal({ open, area, description, isShow }: AreaModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const desc = description ?? "오픈 준비 중";
  const bgColor =
    open === "open" ? "#7A4AE2" : open === "preOpen" ? "#fff" : "#E5E7EB";
  const textColor =
    open === "open" ? "#fff" : open === "preOpen" ? "#7A4AE2" : "#000";
  const border =
    open === "preOpen"
      ? {
          borderWidth: 3,
          borderColor: semanticColors.brand.primary,
        }
      : {};

  useEffect(() => {
    if (isShow) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        bounciness: 1,
        speed: 8,
        velocity: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 0,
        bounciness: 1,
        speed: 14,
        velocity: 10,
        useNativeDriver: true,
      }).start();
    }
  }, [isShow]);

  return (
    <Animated.View
      style={[
        styles.contaienr,
        {
          backgroundColor: bgColor,
          transform: [{ scale: scaleAnim }],
          top: open === "preOpen" ? -106 : -100,
          opacity: isShow ? 1 : 0,
          pointerEvents: isShow ? "auto" : "none",
          ...border,
        },
      ]}
    >
      <Text style={[styles.area, { color: textColor }]}>{area}</Text>
      <Text style={[styles.desc, { color: textColor }]}>{desc}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  contaienr: {
    paddingVertical: 20,
    width: 192,
    position: "absolute",
    borderRadius: 20,
    alignItems: "center",
    zIndex: 30,
  },
  area: {
    fontFamily: "Pretendard-Semibold",
    lineHeight: 24,
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 600,
  },
  desc: {
    fontSize: 13,
    fontWeight: 300,
    fontFamily: "Pretendard-Thin",

    lineHeight: 15.6,
    opacity: 0.7,
  },
});

export default AreaModal;
