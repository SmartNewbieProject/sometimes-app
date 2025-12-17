import { useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import colors from '@/src/shared/constants/colors';

interface HeartPulseProps {
  isActive: boolean;
}

export const HeartPulse = ({ isActive }: HeartPulseProps) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 750, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.8, { duration: 750, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.6, { duration: 750, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <FontAwesome name="heart" size={80} color={colors.primaryPurple} />
    </Animated.View>
  );
};
