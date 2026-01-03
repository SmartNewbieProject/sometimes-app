import { StyleSheet, View, Image } from 'react-native';
import { Text } from '@/src/shared/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useTranslation } from 'react-i18next';
import { useState, useCallback, useEffect, useRef } from 'react';
import Svg, { Path, Mask, Rect, G } from 'react-native-svg';
import { dayUtils } from '@/src/shared/libs';
import { calculateTime, type TimeResult } from '../services/calculate-time';
import Time from './time';
import { BlurBackground } from './blur-background';
import { LoadingDots } from './loading-dots';
import type { PendingApprovalMatch } from '../types';

const characterImage = require('@/assets/images/pending-approval/character.webp');
const bellImage = require('@/assets/images/pending-approval/bell-3d.webp');

const HourglassIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 16.35 16.35" fill="none">
    <Mask id="mask0" maskUnits="userSpaceOnUse" x="0" y="0" width="17" height="17">
      <Rect width="16.35" height="16.35" fill="#D9D9D9" />
    </Mask>
    <G mask="url(#mask0)">
      <Path
        d="M8.17326 7.49325C8.92253 7.49325 9.56394 7.22646 10.0975 6.69289C10.6311 6.15932 10.8979 5.5179 10.8979 4.76864V2.72518H5.44865V4.76864C5.44865 5.5179 5.71543 6.15932 6.249 6.69289C6.78257 7.22646 7.42399 7.49325 8.17326 7.49325ZM3.40519 14.9859C3.2122 14.9859 3.05043 14.9206 2.91987 14.7901C2.78932 14.6595 2.72404 14.4978 2.72404 14.3048C2.72404 14.1118 2.78932 13.95 2.91987 13.8194C3.05043 13.6889 3.2122 13.6236 3.40519 13.6236H4.08634V11.5802C4.08634 10.8877 4.24812 10.2377 4.57167 9.63036C4.89521 9.023 5.34648 8.53768 5.92546 8.1744C5.34648 7.81112 4.89521 7.3258 4.57167 6.71843C4.24812 6.11107 4.08634 5.46114 4.08634 4.76864V2.72518H3.40519C3.2122 2.72518 3.05043 2.6599 2.91987 2.52935C2.78932 2.39879 2.72404 2.23702 2.72404 2.04403C2.72404 1.85103 2.78932 1.68926 2.91987 1.55871C3.05043 1.42815 3.2122 1.36287 3.40519 1.36287H12.9413C13.1343 1.36287 13.2961 1.42815 13.4266 1.55871C13.5572 1.68926 13.6225 1.85103 13.6225 2.04403C13.6225 2.23702 13.5572 2.39879 13.4266 2.52935C13.2961 2.6599 13.1343 2.72518 12.9413 2.72518H12.2602V4.76864C12.2602 5.46114 12.0984 6.11107 11.7749 6.71843C11.4513 7.3258 11 7.81112 10.4211 8.1744C11 8.53768 11.4513 9.023 11.7749 9.63036C12.0984 10.2377 12.2602 10.8877 12.2602 11.5802V13.6236H12.9413C13.1343 13.6236 13.2961 13.6889 13.4266 13.8194C13.5572 13.95 13.6225 14.1118 13.6225 14.3048C13.6225 14.4978 13.5572 14.6595 13.4266 14.7901C13.2961 14.9206 13.1343 14.9859 12.9413 14.9859H3.40519Z"
        fill="#717171"
      />
    </G>
  </Svg>
);

interface PendingCardProps {
  match: PendingApprovalMatch;
  onRefresh?: () => void;
}

export const PendingCard = ({ match, onRefresh }: PendingCardProps) => {
  const { t } = useTranslation();
  const trigger = useRef(false);
  const [currentTime, setCurrentTime] = useState(() => dayUtils.create());
  const [timeSet, setTimeSet] = useState<TimeResult>(() =>
    calculateTime(match.untilNext, currentTime)
  );

  const fire = useCallback(() => {
    trigger.current = true;
    onRefresh?.();
  }, [onRefresh]);

  const updateTime = useCallback(() => {
    if (trigger.current) return;

    const now = dayUtils.create();
    setCurrentTime(now);

    const { shouldTriggerCallback, value, delimeter } = calculateTime(
      match.untilNext,
      now
    );

    setTimeSet({
      shouldTriggerCallback,
      value,
      delimeter,
    });

    if (shouldTriggerCallback && onRefresh) {
      fire();
    }
  }, [match.untilNext, onRefresh, fire]);

  useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [updateTime]);

  return (
    <View style={styles.card}>
      <BlurBackground />

      <View style={styles.header}>
        <Text textColor="purple" style={styles.timerLabel}>
          {t('features.idle-match-timer.ui.pending-approval.next-matching')}
        </Text>
        <View style={styles.timerContainer}>
          <Time value={timeSet.delimeter} size="sm" />
          <Time value="-" size="sm" />
          {timeSet.value
            .toString()
            .split('')
            .map((char, index) => (
              <Time size="sm" key={`${char}-${index}`} value={char} />
            ))}
        </View>
      </View>

      <View style={styles.characterContainer}>
        <Image
          source={characterImage}
          style={styles.characterImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.titleSection}>
        <Text weight="bold" textColor="black" style={styles.cardTitle}>
          {t('features.idle-match-timer.ui.pending-approval.card-title-line1')}{' '}
          {t('features.idle-match-timer.ui.pending-approval.card-title-line2')}
        </Text>
        <Text textColor="secondary" style={styles.cardDesc}>
          {t('features.idle-match-timer.ui.pending-approval.card-desc-line1')}{' '}
          {t('features.idle-match-timer.ui.pending-approval.card-desc-line2')}
        </Text>
      </View>

      <LoadingDots />

      <View style={styles.timeEstimate}>
        <HourglassIcon />
        <Text style={styles.timeEstimateText}>
          {t('features.idle-match-timer.ui.pending-approval.default-time')}
        </Text>
      </View>

      <View style={styles.notificationBox}>
        <Image source={bellImage} style={styles.bellIcon} resizeMode="contain" />
        <Text textColor="black" style={styles.notiText}>
          {t('features.idle-match-timer.ui.pending-approval.notification-info')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FEFCFF',
    borderRadius: 20,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 0,
    zIndex: 1,
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: semanticColors.brand.primary,
    marginBottom: 4,
  },
  timerContainer: {
    flexDirection: 'row',
    gap: 2.5,
    alignItems: 'center',
  },
  characterContainer: {
    alignItems: 'center',
    marginTop: -20,
    marginBottom: 8,
    zIndex: 1,
  },
  characterImage: {
    width: 144,
    height: 144,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 12,
    zIndex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F1F1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 12,
    color: '#8E8E8E',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 14,
  },
  timeEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 16,
    marginBottom: 12,
    zIndex: 1,
  },
  timeEstimateText: {
    fontSize: 12,
    fontWeight: '300',
    color: '#717171',
  },
  notificationBox: {
    backgroundColor: '#F3EDFF',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 'auto',
    marginBottom: 12,
    zIndex: 1,
  },
  bellIcon: {
    width: 24,
    height: 24,
  },
  notiText: {
    flex: 1,
    fontSize: 12,
    color: '#000000',
    fontWeight: '400',
    lineHeight: 14,
  },
});
