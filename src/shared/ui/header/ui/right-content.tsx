import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

interface RightContentProps {
  children?: ReactNode;
}

const styles = StyleSheet.create({
  container: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  placeholder: {
    width: 40,
  },
});

export function RightContent({ children }: RightContentProps) {
  return (
    <View style={styles.container}>
      {children || <View style={styles.placeholder} />}
    </View>
  );
}
