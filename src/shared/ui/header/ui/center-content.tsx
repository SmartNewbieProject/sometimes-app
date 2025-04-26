import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { cn } from '@/src/shared/libs/cn';

interface CenterContentProps {
  children?: ReactNode;
  className?: string;
}

export function CenterContent({ children, className }: CenterContentProps) {
  return (
    <View className={cn("flex-1 items-center justify-center", className)}>
      {children}
    </View>
  );
}
