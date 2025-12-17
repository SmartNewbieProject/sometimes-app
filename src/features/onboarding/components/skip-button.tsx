import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import colors from '@/src/shared/constants/colors';
import type { SkipButtonProps } from '../types';

export const SkipButton = ({ onSkip }: SkipButtonProps) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const skipText = t('features.onboarding.navigation.skip');

  return (
    <TouchableOpacity
      style={[styles.button, { top: insets.top + 16 }]}
      onPress={onSkip}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={skipText}
    >
      <Text style={styles.text}>{skipText}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  text: {
    color: colors.gray,
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
  },
});
