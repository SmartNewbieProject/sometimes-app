import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
} from 'react-native-reanimated';
import { Text } from '@/src/shared/ui/text';
import colors from '@/src/shared/constants/colors';

type RotationType = 'bottom' | 'top' | 'left' | 'right';

interface FloatingTooltipProps {
  text: string;
  rotation: RotationType;
}

const OFFSET = 6;
const TRIANGLE_SIZE = 6;

export const FloatingTooltip: React.FC<FloatingTooltipProps> = ({ text, rotation }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 800 }),
        withTiming(0, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const getPositionStyle = (): ViewStyle => {
    switch (rotation) {
      case 'bottom':
        return {
          top: 206, // 카드 높이 200 + OFFSET
          alignSelf: 'center',
        };
      case 'top':
        return {
          bottom: 206,
          alignSelf: 'center',
        };
      case 'left':
        return {
          right: '100%',
          top: 100,
          marginRight: OFFSET,
        };
      case 'right':
        return {
          left: '100%',
          top: 100,
          marginLeft: OFFSET,
        };
      default:
        return {};
    }
  };

  const getTriangleStyle = (): ViewStyle => {
    const baseTriangleStyle = {
      width: 0,
      height: 0,
      position: 'absolute' as const,
    };

    switch (rotation) {
      case 'bottom':
        return {
          ...baseTriangleStyle,
          top: -TRIANGLE_SIZE,
          alignSelf: 'center',
          borderLeftWidth: TRIANGLE_SIZE,
          borderRightWidth: TRIANGLE_SIZE,
          borderBottomWidth: TRIANGLE_SIZE,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: colors.black,
          borderRadius: 1,
        };
      case 'top':
        return {
          ...baseTriangleStyle,
          bottom: -TRIANGLE_SIZE,
          alignSelf: 'center',
          borderLeftWidth: TRIANGLE_SIZE,
          borderRightWidth: TRIANGLE_SIZE,
          borderTopWidth: TRIANGLE_SIZE,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: colors.black,
          borderRadius: 1,
        };
      case 'left':
        return {
          ...baseTriangleStyle,
          right: -TRIANGLE_SIZE,
          top: '50%',
          marginTop: -TRIANGLE_SIZE,
          borderTopWidth: TRIANGLE_SIZE,
          borderBottomWidth: TRIANGLE_SIZE,
          borderLeftWidth: TRIANGLE_SIZE,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: colors.black,
          borderRadius: 1,
        };
      case 'right':
        return {
          ...baseTriangleStyle,
          left: -TRIANGLE_SIZE,
          top: '50%',
          marginTop: -TRIANGLE_SIZE,
          borderTopWidth: TRIANGLE_SIZE,
          borderBottomWidth: TRIANGLE_SIZE,
          borderRightWidth: TRIANGLE_SIZE,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: colors.black,
          borderRadius: 1,
        };
      default:
        return {};
    }
  };

  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <Animated.View style={[styles.container, getPositionStyle(), animatedStyle]}>
      <View style={styles.tooltip}>
        <Text size="12" textColor="white" weight="medium">
          {text}
        </Text>
        <View style={getTriangleStyle()} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  tooltip: {
    backgroundColor: colors.black,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    position: 'relative',
  },
});