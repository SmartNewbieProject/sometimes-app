
import { LinearGradient } from "expo-linear-gradient";
import { semanticColors } from '../../../shared/constants/colors';
import React, { useEffect, useState, useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";

export interface Tab {
  id: "profile" | "interest";
  label: string;
}

interface ToggleTabProps {
  tabs: Tab[];
  activeTab: string;
  onTabClick: () => void;
  style?: ViewStyle;
}

export const ToggleTab = ({
  tabs,
  activeTab,
  onTabClick,
  style,
}: ToggleTabProps) => {
  const [isMounted, setIsMounted] = useState(false);

  const left = useSharedValue(activeTab === "profile" ? 5 : 100);
  const width = useSharedValue(activeTab === "profile" ? 87 : 57);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (activeTab === "profile") {
      left.value = 5;
      width.value = 87;
    } else {
      left.value = 100;
      width.value = 57;
    }
  }, [activeTab, isMounted, left, width]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!isMounted) {
      return {
        transform: [{ translateX: activeTab === "profile" ? 5 : 100 }],
        width: activeTab === "profile" ? 87 : 57,
      };
    }

    return {
      transform: [{ translateX: left.value }],
      width: width.value,
    };
  }, [isMounted, activeTab]);

  const handleTabChange = useCallback(() => {
    // 애니메이션 먼저 시작
    if (activeTab === "profile") {
      left.value = withTiming(100, { duration: 300 });
      width.value = withTiming(57, { duration: 300 });
    } else {
      left.value = withTiming(5, { duration: 300 });
      width.value = withTiming(87, { duration: 300 });
    }

    // 애니메이션이 끝난 후 onTabClick 호출 (기존 타이밍 유지)
    setTimeout(() => {
      onTabClick();
    }, 400);
  }, [activeTab, onTabClick]);

  return (
    <Pressable style={[styles.container, style]} onPress={handleTabChange}>
      <LinearGradient
        colors={["rgba(0,0,0,0.15)", "transparent"]}
        style={styles.fakeInnerShadow}
        pointerEvents="none"
      />
      <Animated.View style={[styles.toggle, animatedStyle]} />
      <View style={styles.textContainer}>
        {tabs.map((tab) => (
          <Text
            numberOfLines={1}
            style={[
              styles.text,
              { color: activeTab === tab.id ? "#fff" : "#7A4AE2" },
            ]}
            key={tab.id}
          >
            {tab.label}
          </Text>
        ))}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 163,
    height: 50,
    borderRadius: 20,
    position: "relative",
    overflow: "hidden",
    backgroundColor: semanticColors.surface.secondary,
    flexDirection: "row",
    alignItems: "center",
  },
  fakeInnerShadow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 1,
  },
  toggle: {
    height: 40,
    alignItems: "center",
    position: "absolute",
    backgroundColor: semanticColors.brand.primary,
    justifyContent: "center",
    borderRadius: 16,
  },
  textContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    width: "100%",
    gap: 26,
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    fontSize: 14,
    fontFamily: "semibold",
    fontWeight: 600,
    lineHeight: 18,
  },
});
