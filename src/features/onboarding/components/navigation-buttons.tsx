import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import colors from '@/src/shared/constants/colors';
import type { NavigationButtonsProps } from '../types';

export const NavigationButtons = ({
  currentIndex,
  totalSlides,
  onNext,
  onPrevious,
  isTransitioning,
  source,
}: NavigationButtonsProps) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const isLastSlide = currentIndex === totalSlides - 1;
  const isFirstSlide = currentIndex === 0;

  const nextButtonText = isLastSlide
    ? t('features.onboarding.navigation.start')
    : t('features.onboarding.navigation.next');

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      {!isFirstSlide && (
        <TouchableOpacity
          style={[styles.prevButton, isTransitioning && styles.buttonDisabled]}
          onPress={onPrevious}
          disabled={isTransitioning}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={t('features.onboarding.navigation.previous')}
        >
          <Text style={styles.prevButtonText}>{t('features.onboarding.navigation.previous')}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.button, isTransitioning && styles.buttonDisabled]}
        onPress={onNext}
        disabled={isTransitioning}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={nextButtonText}
      >
        <Text style={styles.buttonText}>{nextButtonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 8,
  },
  button: {
    backgroundColor: colors.primaryPurple,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryPurple,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
  },
  prevButtonText: {
    color: colors.primaryPurple,
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
  },
});
