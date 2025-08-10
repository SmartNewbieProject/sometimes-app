import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import colors from '@/src/shared/constants/colors';

interface ScrollDownIndicatorProps {
  visible: boolean;
}

export const ScrollDownIndicator = ({ visible }: ScrollDownIndicatorProps) => {
  const translateYAnim = useSharedValue(0);
  const opacityAnim = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    translateYAnim.value = withRepeat(
      withTiming(8, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    opacityAnim.value = withTiming(visible ? 1 : 0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateYAnim.value }],
      opacity: opacityAnim.value,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <View style={styles.arrow}>
        <View style={styles.arrowLine} />
        <View style={[styles.arrowHead, styles.arrowHeadLeft]} />
        <View style={[styles.arrowHead, styles.arrowHeadRight]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    marginLeft: -15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  arrow: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLine: {
    width: 2,
    height: 8,
    backgroundColor: colors.primaryPurple,
    marginBottom: 2,
  },
  arrowHead: {
    position: 'absolute',
    bottom: 0,
    width: 6,
    height: 2,
    backgroundColor: colors.primaryPurple,
  },
  arrowHeadLeft: {
    left: 3,
    transform: [{ rotate: '45deg' }],
  },
  arrowHeadRight: {
    right: 3,
    transform: [{ rotate: '-45deg' }],
  },
});