import React from 'react';
import { View, StyleSheet } from 'react-native';
import { primaryPurple, lightPurple } from '@/src/shared/constants/colors';

interface StepIndicatorProps {
  length: number;
  step: number;
  className?: string;
  dotSize?: number;
  dotGap?: number;
}

export function StepIndicator({
  length,
  step,
  className,
  dotSize = 24,
  dotGap = 8,
}: StepIndicatorProps) {
  const currentStep = Math.max(0, Math.min(step, length));

  return (
    <View style={[styles.container, className]}>
      {Array.from({ length }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              backgroundColor: index < currentStep ? primaryPurple : lightPurple,
              marginRight: index < length - 1 ? dotGap : 0,
            }
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
