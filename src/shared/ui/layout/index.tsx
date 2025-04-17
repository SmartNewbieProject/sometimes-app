import React, { ReactNode } from 'react';
import { View, ScrollView } from 'react-native';
import { PalePurpleGradient } from '../gradient';
import { BottomNavigation } from '../navigation';
import { cn } from '@/src/shared/libs/cn';

type MainLayoutProps = {
  children: ReactNode;
  showNavigation?: boolean;
  showGradient?: boolean;
  className?: string;
  contentClassName?: string;
};

export function MainLayout({
  children,
  showNavigation = true,
  showGradient = true,
  className,
  contentClassName,
}: MainLayoutProps) {
  return (
    <View className={cn("flex-1", className)}>
      {showGradient && <PalePurpleGradient />}
      
      <View className={cn("flex-1", contentClassName)}>
        {children}
      </View>
      
      {showNavigation && <BottomNavigation />}
    </View>
  );
}

type ScrollableLayoutProps = MainLayoutProps & {
  scrollClassName?: string;
};

export function ScrollableLayout({
  children,
  showNavigation = true,
  showGradient = true,
  className,
  contentClassName,
  scrollClassName,
}: ScrollableLayoutProps) {
  return (
    <MainLayout
      showNavigation={showNavigation}
      showGradient={showGradient}
      className={className}
      contentClassName={contentClassName}
    >
      <ScrollView className={cn("flex-1", scrollClassName)}>
        {children}
      </ScrollView>
    </MainLayout>
  );
}
