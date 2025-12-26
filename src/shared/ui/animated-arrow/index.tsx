/**
 * 애니메이션 화살표 버튼
 * 좌/우 방향 네비게이션에 사용
 * withRepeat으로 부드러운 bouncing 애니메이션 적용
 */
import { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import colors from "@/src/shared/constants/colors";

type Direction = "left" | "right";

interface AnimatedArrowProps {
  direction: Direction;
  onPress: () => void;
  disabled?: boolean;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export function AnimatedArrow({
  direction,
  onPress,
  disabled = false,
  size = 44,
  color = colors.primaryPurple,
  backgroundColor = colors.white,
}: AnimatedArrowProps) {
  const translateX = useSharedValue(0);

  useEffect(() => {
    const offset = direction === "right" ? 3 : -3;
    translateX.value = withRepeat(
      withTiming(offset, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [direction, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: disabled ? 0.3 : 1,
  }));

  const arrowSize = size * 0.3;
  const rotation = direction === "right" ? "45deg" : "-135deg";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
    >
      <Animated.View style={[styles.arrowWrapper, animatedStyle]}>
        <View
          style={[
            styles.arrow,
            {
              width: arrowSize,
              height: arrowSize,
              borderColor: color,
              transform: [{ rotate: rotation }],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  arrowWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
  },
});
