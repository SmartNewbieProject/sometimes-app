import { LinearGradient } from "expo-linear-gradient";
import { semanticColors } from '../../../shared/constants/colors';
import React from "react";
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
  const left = useSharedValue(activeTab === "profile" ? 5 : 100);
  const width = useSharedValue(activeTab === "profile" ? 87 : 57);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: left.value }],
      width: width.value,
    };
  });

  const handleTabChange = () => {
    if (activeTab === "profile") {
      left.value = withTiming(100, { duration: 300 });
      width.value = withTiming(57, { duration: 300 });
    } else {
      left.value = withTiming(5, { duration: 300 });
      width.value = withTiming(87, { duration: 300 });
    }

    setTimeout(() => {
      onTabClick();
    }, 400);
  };

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
    fontFamily: "Pretendard-SemiBold",
    fontWeight: 600,
    lineHeight: 18,
  },
});
