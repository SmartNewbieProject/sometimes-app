import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/src/shared/constants/colors';
import { semanticColors } from '@/src/shared/constants/colors';
import { Button, Show } from '@/src/shared/ui';
import { useCountdownTimer } from '../hooks/use-countdown-timer';
import { useOnboardingStorage } from '../hooks/use-onboarding-storage';
import type { SlideComponent } from '../types';
import KakaoLogo from '@assets/icons/kakao-logo.svg';

export const SlideCta: SlideComponent = ({ source }) => {
  const { t } = useTranslation();
  const { countdown } = useCountdownTimer();
  const { saveOnboardingComplete } = useOnboardingStorage();
  const insets = useSafeAreaInsets();
  const isFromLogin = source === 'login';

  const handlePassLogin = async () => {
    await saveOnboardingComplete();
    router.replace('/auth/login');
  };

  const handleKakaoLogin = async () => {
    await saveOnboardingComplete();
    router.replace('/auth/login');
  };

  const handleAppleLogin = async () => {
    await saveOnboardingComplete();
    router.replace('/auth/login');
  };

  if (isFromLogin) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.headline}>
            {t('features.onboarding.slides.cta.headline')}
          </Text>
          <Text style={styles.subtext}>
            지금 바로 가입하고{'\n'}설렘을 시작하세요
          </Text>

          <View style={styles.loginButtonsContainer}>
            <Button
              variant="primary"
              width="full"
              onPress={handlePassLogin}
              styles={styles.passButton}
            >
              <Text style={styles.passButtonText}>PASS 로그인</Text>
            </Button>

            <Pressable
              onPress={handleKakaoLogin}
              style={styles.kakaoButton}
            >
              <View style={styles.kakaoLogoWrapper}>
                <KakaoLogo width={28} height={28} />
              </View>
              <Text style={styles.kakaoButtonText}>카카오 로그인</Text>
            </Pressable>

            <Show when={Platform.OS === 'ios'}>
              <Pressable
                onPress={handleAppleLogin}
                style={styles.appleButton}
              >
                <Text style={styles.appleButtonText}> 애플 로그인</Text>
              </Pressable>
            </Show>
          </View>
        </View>
      </View>
    );
  }

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
    fontFamily: 'Pretendard-SemiBold',
    color: colors.gray,
    marginBottom: 12,
  },
  countdownText: {
    fontSize: 28,
    fontFamily: 'Pretendard-Bold',
    color: colors.primaryPurple,
  },
  loginButtonsContainer: {
    width: '100%',
    gap: 12,
    alignItems: 'center',
  },
  passButton: {
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 300,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passButtonText: {
    color: colors.white,
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    textAlign: 'center',
  },
  kakaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE500',
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 300,
    minHeight: 56,
  },
  kakaoLogoWrapper: {
    width: 28,
    height: 28,
  },
  kakaoButtonText: {
    color: colors.black,
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.black,
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 300,
    minHeight: 56,
  },
  appleButtonText: {
    color: colors.white,
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
  },
});
