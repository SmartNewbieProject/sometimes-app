import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import colors from '@/src/shared/constants/colors';
import { useCountdownTimer } from '../hooks/use-countdown-timer';
import type { SlideComponent } from '../types';

export const SlideMatchingTime: SlideComponent = () => {
  const { t } = useTranslation();
  const { countdown } = useCountdownTimer();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headline}>
          {t('features.onboarding.slides.matchingTime.headline')}
        </Text>
        <Text style={styles.subtext}>
          {t('features.onboarding.slides.matchingTime.subtext')}
        </Text>

        <View style={styles.illustrationArea}>
          <FontAwesome name="clock-o" size={80} color={colors.primaryPurple} />
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
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: colors.cardPurple,
    borderRadius: 12,
    alignItems: 'center',
  },
  countdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
    marginBottom: 8,
  },
  countdownText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryPurple,
  },
});
