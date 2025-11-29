import React, { ReactNode } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { PalePurpleGradient } from '../gradient';
import { BottomNavigation } from '../navigation';

type MainLayoutProps = {
  children: ReactNode;
  showNavigation?: boolean;
  showGradient?: boolean;
};

export function MainLayout({
  children,
  showNavigation = true,
  showGradient = true,
}: MainLayoutProps) {
  return (
    <View style={styles.container}>
      {showGradient && <PalePurpleGradient />}

      <View style={styles.content}>
        {children}
      </View>

      {showNavigation && <BottomNavigation />}
    </View>
  );
}

type ScrollableLayoutProps = MainLayoutProps;

export function ScrollableLayout({
  children,
  showNavigation = true,
  showGradient = true,
}: ScrollableLayoutProps) {
  return (
    <MainLayout
      showNavigation={showNavigation}
      showGradient={showGradient}
    >
      <ScrollView style={styles.scrollContainer}>
        {children}
      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
});
