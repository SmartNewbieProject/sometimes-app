import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import colors from '@/src/shared/constants/colors';
import type { ProgressBarProps } from '../types';

export const ProgressBar = ({ currentIndex, totalSlides }: ProgressBarProps) => {
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    const progress = ((currentIndex + 1) / totalSlides) * 100;
    progressWidth.value = withTiming(progress, { duration: 300 });
  }, [currentIndex, totalSlides]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <View style={styles.container} accessible={true} accessibilityRole="progressbar">
      <View style={styles.track}>
        <Animated.View style={[styles.fill, animatedStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  track: {
    height: 4,
    backgroundColor: '#E1D9FF',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primaryPurple,
    borderRadius: 2,
  },
});
