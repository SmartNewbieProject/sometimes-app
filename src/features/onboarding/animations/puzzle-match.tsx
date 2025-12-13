import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import colors from '@/src/shared/constants/colors';

interface PuzzleMatchProps {
  isActive: boolean;
}

export const PuzzleMatch = ({ isActive }: PuzzleMatchProps) => {
  const leftTranslateX = useSharedValue(-60);
  const rightTranslateX = useSharedValue(60);
  const leftRotate = useSharedValue(0);
  const rightRotate = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      leftTranslateX.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(-60, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      rightTranslateX.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(60, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      leftRotate.value = withRepeat(
        withSequence(
          withTiming(10, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      rightRotate.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      leftTranslateX.value = withTiming(-60, { duration: 300 });
      rightTranslateX.value = withTiming(60, { duration: 300 });
      leftRotate.value = withTiming(0, { duration: 300 });
      rightRotate.value = withTiming(0, { duration: 300 });
    }
  }, [isActive]);

  const leftStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: leftTranslateX.value },
      { rotate: `${leftRotate.value}deg` },
    ],
  }));

  const rightStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: rightTranslateX.value },
      { rotate: `${rightRotate.value}deg` },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={leftStyle}>
        <Text style={styles.puzzle}>🧩</Text>
      </Animated.View>
      <Animated.View style={rightStyle}>
        <Text style={styles.heart}>❤️</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
  },
  puzzle: {
    fontSize: 60,
  },
  heart: {
    fontSize: 60,
  },
});
