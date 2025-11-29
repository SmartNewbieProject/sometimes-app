import React, { type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

interface CenterContentProps {
  children?: ReactNode;
}

export function CenterContent({ children }: CenterContentProps) {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
