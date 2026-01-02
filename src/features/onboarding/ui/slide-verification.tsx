import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '@/src/shared/constants/colors';
import type { SlideComponent } from '../types';

const { width } = Dimensions.get('window');

export const SlideVerification: SlideComponent = () => {
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
          <View style={styles.badgesContainer}>
            {badges.map((text, index) => (
              <View key={index} style={styles.badge}>
                <Image
                  source={require('@/assets/images/onboarding/check_circle.png')}
                  style={styles.checkIcon}
                  resizeMode="contain"
                />
                <Text style={styles.badgeText}>{text}</Text>
              </View>
            ))}
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
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  headline: {
    fontSize: 26,
    fontFamily: 'Pretendard-Bold',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  subtext: {
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: '#8E94A0',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  illustrationArea: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  badgesContainer: {
    width: '100%',
    gap: 12,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F0FF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#7F52FF',
    width: width * 0.7,
  },
  checkIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#7F52FF', // Purple text
  },
});
