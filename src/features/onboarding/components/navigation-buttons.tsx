import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import colors from '@/src/shared/constants/colors';
import type { NavigationButtonsProps } from '../types';

export const NavigationButtons = ({
  currentIndex,
  totalSlides,
  onNext,
  isTransitioning,
}: NavigationButtonsProps) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const isLastSlide = currentIndex === totalSlides - 1;
  const buttonText = isLastSlide
    ? t('features.onboarding.navigation.start')
    : t('features.onboarding.navigation.next');

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      <TouchableOpacity
        style={[styles.button, isTransitioning && styles.buttonDisabled]}
        onPress={onNext}
        disabled={isTransitioning}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={buttonText}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  button: {
    backgroundColor: colors.primaryPurple,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
