import { View, StyleSheet } from 'react-native';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';

type SizeType = 'sm' | 'md';

interface TimeProps {
  value: string;
  size?: SizeType;
}

export default function Time({ value, size = 'md' }: TimeProps) {
  return (
    <View style={[styles.container, styles[size]]}>
      <Text
        weight="bold"
        textColor="purple"
        style={size === 'md' ? styles.textMd : styles.textSm}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: semanticColors.surface.background,
    borderRadius: 8,
    textAlign: 'center',
    fontFamily: 'Rubik',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  textMd: {
    fontSize: 23,
    fontFamily: 'Rubik',
    fontWeight: 'bold',
  },
  textSm: {
    fontSize: 18,
    fontFamily: 'Rubik',
    fontWeight: 'bold',
  },
});
