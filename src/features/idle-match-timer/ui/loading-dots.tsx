import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

const DOT_SIZE = 10;
const DOT_GAP = 16;
const ANIMATION_DURATION = 700;

const dotColors = ['#B8A4D6', '#9B7ED9', '#7A4AE2'];

interface DotProps {
  color: string;
  delay: number;
}

const AnimatedDot = ({ color, delay }: DotProps) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.3, {
            duration: ANIMATION_DURATION,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: ANIMATION_DURATION,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration: ANIMATION_DURATION,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.6, {
            duration: ANIMATION_DURATION,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      )
    );
  }, [scale, opacity, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
};

export const LoadingDots = () => {
  return (
    <View style={styles.container}>
      {dotColors.map((color, index) => (
        <AnimatedDot
          key={index}
          color={color}
          delay={index * 200}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
    gap: DOT_GAP,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});
