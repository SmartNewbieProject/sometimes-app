import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import colors from '@/src/shared/constants/colors';

interface SequentialCheckProps {
  badges: string[];
  isActive: boolean;
}

export const SequentialCheck = ({ badges, isActive }: SequentialCheckProps) => {
  const scales = [
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
  ];

  const opacities = [
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
  ];

  useEffect(() => {
    if (isActive) {
      scales.forEach((scale, index) => {
        scale.value = withDelay(
          index * 300,
          withTiming(1, {
            duration: 300,
            easing: Easing.out(Easing.back(1.5)),
          })
        );
      });

      opacities.forEach((opacity, index) => {
        opacity.value = withDelay(
          index * 300,
          withTiming(1, { duration: 300 })
        );
      });
    } else {
      scales.forEach((scale) => {
        scale.value = 0;
      });
      opacities.forEach((opacity) => {
        opacity.value = 0;
      });
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      {badges.map((badge, index) => {
        const animatedStyle = useAnimatedStyle(() => ({
          transform: [{ scale: scales[index].value }],
          opacity: opacities[index].value,
        }));

        return (
          <Animated.View key={index} style={[styles.badge, animatedStyle]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    alignItems: 'center',
  },
  badge: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.cardPurple,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.primaryPurple,
  },
  badgeText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.primaryPurple,
  },
});
