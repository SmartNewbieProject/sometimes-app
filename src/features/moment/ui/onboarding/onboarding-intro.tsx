import React from 'react';
import { View, StyleSheet, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

import { Text, Button } from '@/src/shared/ui';
import colors from '@/src/shared/constants/colors';
import { IntroFeatures } from './components';
import { MOMENT_ONBOARDING_KEYS } from './keys';
import { useOnboardingQuestionsQuery } from '../../queries/onboarding';

const { width } = Dimensions.get('window');

export const OnboardingIntro = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data: questionsData, isLoading } = useOnboardingQuestionsQuery();

  const questionCount = questionsData?.questions?.length ?? 0;

  const features = [
    t(MOMENT_ONBOARDING_KEYS.intro.feature1, { count: questionCount }),
    t(MOMENT_ONBOARDING_KEYS.intro.feature2),
    t(MOMENT_ONBOARDING_KEYS.intro.feature3),
  ];

  const handleStart = () => {
    router.push('/moment/onboarding/questions');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#F5F1FF', '#E8DEFF']}
        locations={[0, 0.6, 1]}
        style={styles.gradient}
      />

      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        <View style={styles.imageContainer}>
          <Image
            source={require('@/assets/images/moment/miho-mailbox.webp')}
            style={styles.characterImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <Text size="24" weight="bold" textColor="black" style={styles.title}>
            {t(MOMENT_ONBOARDING_KEYS.intro.title)}
          </Text>
          <Text size="15" weight="normal" textColor="gray" style={styles.subtitle}>
            {t(MOMENT_ONBOARDING_KEYS.intro.subtitle)}
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <IntroFeatures features={features} />
        </View>
      </View>

      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 24 }]}>
        <Button
          variant="primary"
          size="lg"
          onPress={handleStart}
          style={styles.startButton}
        >
          {t(MOMENT_ONBOARDING_KEYS.intro.startButton)}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  characterImage: {
    width: width * 0.5,
    height: width * 0.5,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  featuresContainer: {
    marginTop: 8,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  startButton: {
    width: '100%',
  },
});
