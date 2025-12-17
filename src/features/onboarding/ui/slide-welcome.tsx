import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '@/src/shared/constants/colors';
import { HeartPulse } from '../animations/heart-pulse';
import type { SlideComponent } from '../types';

export const SlideWelcome: SlideComponent = ({ isActive }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headline}>{t('features.onboarding.slides.welcome.headline')}</Text>
        <Text style={styles.subtext}>{t('features.onboarding.slides.welcome.subtext')}</Text>

        <View style={styles.illustrationArea}>
          <HeartPulse isActive={isActive} />
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
