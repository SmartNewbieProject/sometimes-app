import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '@/src/shared/constants/colors';
import { SequentialCheck } from '../animations/sequential-check';
import type { SlideComponent } from '../types';

export const SlideVerification: SlideComponent = ({ isActive }) => {
  const { t } = useTranslation();

  const badges = [
    t('features.onboarding.slides.verification.badges.pass'),
    t('features.onboarding.slides.verification.badges.email'),
    t('features.onboarding.slides.verification.badges.photo'),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headline}>
          {t('features.onboarding.slides.verification.headline')}
        </Text>
        <Text style={styles.subtext}>
          {t('features.onboarding.slides.verification.subtext')}
        </Text>

        <View style={styles.illustrationArea}>
          <SequentialCheck badges={badges} isActive={isActive} />
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
});
