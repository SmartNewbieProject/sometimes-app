import React from 'react';
import { View } from 'react-native';
import { cn } from '@/src/shared/libs/cn';

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
    <View className={cn("flex flex-row items-center", className)}>
      {Array.from({ length }).map((_, index) => (
        <View
          key={index}
          className={cn(
            "rounded-full",
            index < currentStep ? "bg-primaryPurple" : "bg-lightPurple"
          )}
          style={{
            width: dotSize,
            height: dotSize,
            marginRight: index < length - 1 ? dotGap : 0,
          }}
        />
      ))}
    </View>
  );
}
