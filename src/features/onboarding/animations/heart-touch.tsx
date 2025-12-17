import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
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

interface HeartTouchProps {
  isActive: boolean;
}

export const HeartTouch = ({ isActive }: HeartTouchProps) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(1.5, { duration: 300, easing: Easing.out(Easing.ease) }),
          withTiming(2, { duration: 300, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      );

      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.8, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        -1,
        false
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
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <FontAwesome name="user-circle" size={60} color={colors.gray} />
      </View>
      <Animated.View style={[styles.heartContainer, animatedStyle]}>
        <FontAwesome name="heart" size={40} color={colors.primaryPurple} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  profileCard: {
    width: 120,
    height: 160,
    backgroundColor: colors.cardPurple,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryPurple,
  },
  heartContainer: {
    position: 'absolute',
    top: 60,
  },
});
