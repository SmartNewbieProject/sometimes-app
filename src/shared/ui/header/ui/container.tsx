import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { cn } from '@/src/shared/libs/cn';
import { platform } from '@/src/shared/libs/platform';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  centered?: boolean;
}

export function Container({ children, className, centered = false }: ContainerProps) {
  return (
    <View
      className={cn(
        'w-full flex-row justify-between items-center px-3',
        platform({
          ios: () => 'pt-16 pb-4',
          android: () => 'pt-16 pb-4',
          web: () => 'pt-8 pb-4',
        }),
        className
      )}
    >
      {children}
    </View>
  );
}
