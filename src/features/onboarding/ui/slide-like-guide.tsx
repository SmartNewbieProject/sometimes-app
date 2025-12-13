import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '@/src/shared/constants/colors';
import { HeartTouch } from '../animations/heart-touch';
import type { SlideComponent } from '../types';

export const SlideLikeGuide: SlideComponent = ({ isActive }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headline}>
          {t('features.onboarding.slides.likeGuide.headline')}
        </Text>
        <Text style={styles.subtext}>
          {t('features.onboarding.slides.likeGuide.subtext')}
        </Text>

        <View style={styles.illustrationArea}>
          <HeartTouch isActive={isActive} />
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
});
