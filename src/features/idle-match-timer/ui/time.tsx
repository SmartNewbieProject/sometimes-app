import { View, StyleSheet, Platform } from 'react-native';
import { semanticColors } from '@/src/shared/constants/colors';
import { Text } from '@/src/shared/ui';

type SizeType = 'sm' | 'md';

interface TimeProps {
  value: string;
  size?: SizeType;
}

export default function Time({ value, size = 'md' }: TimeProps) {
  // 웹과 네이티브에서 다른 폰트 패밀리 사용
  const getFontFamily = () => {
    if (Platform.OS === 'web') {
      // 웹에서는 CSS 로드된 폰트와 fallback 함께 사용
      return "'Rubik-Regular', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    }
    // 네이티브에서는 expo-font 로드된 폰트 사용
    return 'Rubik-Regular';
  };

  return (
    <View style={[styles.container, styles[size]]}>
      <Text
        weight="bold"
        style={[
          {
            color: '#7A4AE2', // primaryPurple
            fontFamily: getFontFamily(),
            fontSize: size === 'md' ? 23 : 18,
            letterSpacing: Platform.OS === 'ios' ? -0.5 : 0,
          }
        ]}
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
});
