import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

interface LeftContentProps {
  children?: ReactNode;
}

const styles = StyleSheet.create({
  container: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});

export function LeftContent({ children }: LeftContentProps) {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
}
