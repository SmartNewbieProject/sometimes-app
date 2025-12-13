import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '@/src/shared/constants/colors';
import { useCountdownTimer } from '../hooks/use-countdown-timer';
import type { SlideComponent } from '../types';

export const SlideCta: SlideComponent = () => {
  const { t } = useTranslation();
  const { countdown } = useCountdownTimer();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headline}>
          {t('features.onboarding.slides.cta.headline')}
        </Text>
        <Text style={styles.subtext}>
          {t('features.onboarding.slides.cta.subtext')}
        </Text>

        <View style={styles.illustrationArea}>
          <View style={styles.countdownBox}>
            <Text style={styles.countdownLabel}>
              {t('features.onboarding.slides.matchingTime.countdownLabel')}
            </Text>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  subtext: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  illustrationArea: {
    width: '100%',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownBox: {
    paddingVertical: 32,
    paddingHorizontal: 48,
    backgroundColor: colors.cardPurple,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryPurple,
  },
  countdownLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray,
    marginBottom: 12,
  },
  countdownText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryPurple,
  },
});
