/**
 * 애니메이션 화살표 버튼
 * 좌/우 방향 네비게이션에 사용
 * Web: React Native 기본 Animated API
 * Native: react-native-reanimated (성능 최적화)
 */
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
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

function ArrowIcon({ direction, size }: { direction: Direction; size: number }) {
  const iconSize = size * 0.6;
  const scaleX = direction === "left" ? -1 : 1;

  return (
    <Svg
      width={iconSize}
      height={iconSize * 0.77}
      viewBox="0 0 31 24"
      fill="none"
      style={{ transform: [{ scaleX }] }}
    >
      <Path
        d="M2.03418 11.6992H28.4831M28.4831 11.6992L18.8191 2.03516M28.4831 11.6992L18.8191 21.3632"
        stroke="url(#paint0_linear)"
        strokeWidth={4.069}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Defs>
        <LinearGradient
          id="paint0_linear"
          x1={28.4831}
          y1={11.6992}
          x2={2.03418}
          y2={11.6992}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="white" />
          <Stop offset={1} stopColor="white" stopOpacity={0} />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}

function AnimatedArrowWeb({
  direction,
  onPress,
  disabled = false,
  size = 44,
  backgroundColor = colors.primaryPurple,
}: AnimatedArrowProps) {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const offset = direction === "right" ? 6 : -6;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: offset,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [direction, translateX]);

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
      <Animated.View
        style={[
          styles.arrowWrapper,
          {
            transform: [{ translateX }],
            opacity: disabled ? 0.3 : 1,
          },
        ]}
      >
        <ArrowIcon direction={direction} size={size} />
      </Animated.View>
    </TouchableOpacity>
  );
}

let AnimatedArrowNative: React.ComponentType<AnimatedArrowProps> | null = null;

if (Platform.OS !== "web") {
  const Reanimated = require("react-native-reanimated");
  const {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing: ReanimatedEasing,
  } = Reanimated;

  AnimatedArrowNative = function AnimatedArrowNativeImpl({
    direction,
    onPress,
    disabled = false,
    size = 44,
    backgroundColor = colors.primaryPurple,
  }: AnimatedArrowProps) {
    const translateX = useSharedValue(0);

    useEffect(() => {
      const offset = direction === "right" ? 6 : -6;
      translateX.value = withRepeat(
        withTiming(offset, {
          duration: 600,
          easing: ReanimatedEasing.out(ReanimatedEasing.ease),
        }),
        -1,
        true
      );
    }, [direction, translateX]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
      opacity: disabled ? 0.3 : 1,
    }));

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
        <Reanimated.default.View style={[styles.arrowWrapper, animatedStyle]}>
          <ArrowIcon direction={direction} size={size} />
        </Reanimated.default.View>
      </TouchableOpacity>
    );
  };
}

export function AnimatedArrow(props: AnimatedArrowProps) {
  if (Platform.OS === "web") {
    return <AnimatedArrowWeb {...props} />;
  }

  if (AnimatedArrowNative) {
    return <AnimatedArrowNative {...props} />;
  }

  return <AnimatedArrowWeb {...props} />;
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
});
