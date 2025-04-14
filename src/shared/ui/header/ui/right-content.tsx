import React, { ReactNode } from 'react';
import { View } from 'react-native';

interface RightContentProps {
  children?: ReactNode;
}

export function RightContent({ children }: RightContentProps) {
  return (
    <View className="w-12 items-center justify-center px-1">
      {children || <View className="w-10" />}
    </View>
  );
}
