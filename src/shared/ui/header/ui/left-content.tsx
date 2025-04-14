import React, { ReactNode } from 'react';
import { View } from 'react-native';

interface LeftContentProps {
  children?: ReactNode;
}

export function LeftContent({ children }: LeftContentProps) {
  return (
    <View className="w-12 items-center justify-center px-1">
      {children}
    </View>
  );
}
