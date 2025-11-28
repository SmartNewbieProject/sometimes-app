import React from 'react';
import { Text } from '@/src/shared/ui/text';
import { semanticColors } from '@/src/shared/constants/colors';
import { StyleSheet, View } from 'react-native';

interface SpecialTextProps {
  text: string;
  special?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  style?: any;
}

export const SpecialText: React.FC<SpecialTextProps> = ({
  text,
  special = false,
  size = 'md',
  weight = 'normal',
  style,
}) => {
  if (!text || !special) {
    return (
      <Text
        size={size}
        weight={weight}
        textColor="primary"
        style={style}
      >
        {text}
      </Text>
    );
  }

  const tokens = text.trim().split(/\s+/);
  console.log({ tokens });

  if (tokens.length === 0) {
    return null;
  }

  const regularTokens = tokens.slice(0, -1).join(' ');
  const lastToken = tokens[tokens.length - 1];

  return (
    <View style={[styles.container, style]}>
      <Text
        size={size}
        weight={weight}
        textColor="primary"
        style={styles.regularText}
      >
        {regularTokens}
        {regularTokens && ' '}
      </Text>
      <Text
        size={size}
        weight={weight}
        textColor="purple"
      >
        {lastToken}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  regularText: {
    color: semanticColors.text.primary,
  },
  specialText: {
    color: semanticColors.brand.primary,
  },
});