import { View, Text, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useCountdownTimer } from '../hooks/use-countdown-timer';
import type { SlideComponent } from '../types';

const clockImage = require('@assets/images/onboarding/matching-time/time.png');

interface TimeCardProps {
  value: string;
}

const TimeCard = ({ value }: TimeCardProps) => (
  <View style={styles.timeCard}>
    <Text style={styles.timeCardText}>{value}</Text>
  </View>
);

export const SlideMatchingTime: SlideComponent = () => {
  const { t } = useTranslation();
  const { countdownParts } = useCountdownTimer();

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
          <Image source={clockImage} style={styles.clockImage} resizeMode="contain" />
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownLabel}>
              {t('features.onboarding.slides.matchingTime.countdownLabel')}
            </Text>
            <View style={styles.timeCardsRow}>
              <TimeCard value={`D-${countdownParts.days}`} />
              <TimeCard value={`${countdownParts.hours}시`} />
              <TimeCard value={`${countdownParts.minutes}분`} />
            </View>
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
    fontFamily: 'Pretendard-Bold',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  subtext: {
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
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
  clockImage: {
    width: 120,
    height: 120,
  },
  countdownContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  countdownLabel: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.gray,
    marginBottom: 12,
  },
  timeCardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timeCard: {
    backgroundColor: semanticColors.surface.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  timeCardText: {
    fontSize: 23,
    fontFamily: 'Rubik-Bold',
    color: colors.primaryPurple,
  },
});
