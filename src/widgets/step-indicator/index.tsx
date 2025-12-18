import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import colors from '@/src/shared/constants/colors';

interface StepIndicatorProps {
  length: number;
  step: number;
  style?: StyleProp<ViewStyle>;
  dotSize?: number;
  dotGap?: number;
}

export function StepIndicator({
  length,
  step,
  style,
  dotSize = 24,
  dotGap = 8,
}: StepIndicatorProps) {
  const currentStep = Math.max(0, Math.min(step, length));

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              marginRight: index < length - 1 ? dotGap : 0,
              backgroundColor: index < currentStep ? colors.primaryPurple : colors.lightPurple,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    borderRadius: 9999,
  },
});
