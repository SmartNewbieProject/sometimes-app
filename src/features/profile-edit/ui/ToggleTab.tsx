
import { LinearGradient } from "expo-linear-gradient";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import React, { useEffect, useState, useCallback, useRef } from "react";
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const left = useSharedValue(activeTab === "profile" ? 5 : 125);
  const width = useSharedValue(activeTab === "profile" ? 110 : 75);

  useEffect(() => {
    setIsMounted(true);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (activeTab === "profile") {
      left.value = 5;
      width.value = 110;
    } else {
      left.value = 125;
      width.value = 75;
    }
  }, [activeTab, isMounted, left, width]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!isMounted) {
      return {
        transform: [{ translateX: activeTab === "profile" ? 5 : 125 }],
        width: activeTab === "profile" ? 110 : 75,
      };
    }

    return {
      transform: [{ translateX: left.value }],
      width: width.value,
    };
  }, [isMounted, activeTab]);

  const handleTabChange = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (activeTab === "profile") {
      left.value = withTiming(125, { duration: 300 });
      width.value = withTiming(75, { duration: 300 });
    } else {
      left.value = withTiming(5, { duration: 300 });
      width.value = withTiming(110, { duration: 300 });
    }

    timeoutRef.current = setTimeout(() => {
      if (isMounted) {
        onTabClick();
      }
    }, 400);
  }, [activeTab, onTabClick, isMounted, left, width]);

  return (
    <Pressable style={[styles.container, style]} onPress={handleTabChange}>
      <LinearGradient
        colors={["rgba(0,0,0,0.15)", "transparent"]}
        style={styles.fakeInnerShadow}
        pointerEvents="none"
      />
      <Animated.View style={[styles.toggle, animatedStyle]} />
      <View style={styles.tabWrapper}>
        <View style={styles.profileTab}>
          <Text
            numberOfLines={1}
            style={[
              styles.text,
              { color: activeTab === "profile" ? "#fff" : "#7A4AE2" },
            ]}
          >
            {tabs[0].label}
          </Text>
        </View>
        <View style={styles.interestTab}>
          <Text
            numberOfLines={1}
            style={[
              styles.text,
              { color: activeTab === "interest" ? "#fff" : "#7A4AE2" },
            ]}
          >
            {tabs[1].label}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 220,
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
  tabWrapper: {
    flexDirection: "row",
    width: "100%",
    height: "100%",
    position: "relative",
  },
  profileTab: {
    position: "absolute",
    left: 5,
    width: 110,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  interestTab: {
    position: "absolute",
    left: 125,
    width: 75,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 14,
    fontFamily: "Pretendard-SemiBold",
    fontWeight: 600,
    lineHeight: 18,
    textAlign: "center",
  },
});
