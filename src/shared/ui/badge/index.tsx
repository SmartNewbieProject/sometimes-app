import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { semanticColors } from '../../constants/semantic-colors';

type BadgeVariant = 'main' | 'approved' | 'reviewing' | 'pending' | 'rejected';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant]]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  main: {
    backgroundColor: semanticColors.brand.primary,
  },
  mainText: {
    color: semanticColors.text.inverse,
  },
  approved: {
    backgroundColor: semanticColors.surface.tertiary,
  },
  approvedText: {
    color: semanticColors.brand.primary,
  },
  reviewing: {
    backgroundColor: '#FFF9E6',
  },
  reviewingText: {
    color: semanticColors.state.warning,
  },
  pending: {
    backgroundColor: '#FFF9E6',
  },
  pendingText: {
    color: semanticColors.state.warning,
  },
  rejected: {
    backgroundColor: '#FFE6E6',
  },
  rejectedText: {
    color: semanticColors.state.error,
  },
});
