import { useCallback, useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import colors from '@/src/shared/constants/colors';
import { ProgressBar } from '../components/progress-bar';
import { NavigationButtons } from '../components/navigation-buttons';
import { SkipButton } from '../components/skip-button';
import { useOnboardingStorage } from '../hooks/use-onboarding-storage';
import { SlideWelcome } from './slide-welcome';
import { SlideStory } from './slide-story';
import { SlideMatchingTime } from './slide-matching-time';
import { SlideVerification } from './slide-verification';
import { SlideStudentOnly } from './slide-student-only';
import { SlideAiMatching } from './slide-ai-matching';
import { SlideLikeGuide } from './slide-like-guide';
import { SlideChatGuide } from './slide-chat-guide';
import { SlideRefund } from './slide-refund';
import { SlideRegion } from './slide-region';
import { SlideCta } from './slide-cta';

const ALL_SLIDES = [
  { component: SlideWelcome, id: 'welcome' },
  { component: SlideStory, id: 'story' },
  { component: SlideMatchingTime, id: 'matchingTime' },
  { component: SlideVerification, id: 'verification' },
  { component: SlideStudentOnly, id: 'studentOnly' },
  { component: SlideAiMatching, id: 'aiMatching' },
  { component: SlideLikeGuide, id: 'likeGuide' },
  { component: SlideChatGuide, id: 'chatGuide' },
  { component: SlideRefund, id: 'refund' },
  { component: SlideRegion, id: 'region' },
  { component: SlideCta, id: 'cta' },
];

interface OnboardingScreenProps {
  source?: string;
}

export const OnboardingScreen = ({ source }: OnboardingScreenProps) => {
  const insets = useSafeAreaInsets();
  const { i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useSharedValue(0);
  const { saveOnboardingComplete } = useOnboardingStorage();

  const activeSlides = useMemo(() => {
    if (i18n.language === 'ja') {
      return ALL_SLIDES.filter(slide => slide.id !== 'region');
    }
    return ALL_SLIDES;
  }, [i18n.language]);

  const totalSlides = activeSlides.length;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) {
      setContainerWidth(width);
    }
  };

  const goToNextSlide = useCallback(() => {
    if (isTransitioning || containerWidth === 0) return;

    if (currentIndex === totalSlides - 1) {
      handleComplete();
      return;
    }

    setIsTransitioning(true);
    const nextIndex = currentIndex + 1;

    translateX.value = withTiming(
      -nextIndex * containerWidth,
      {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      }
    );

    setCurrentIndex(nextIndex);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 320);
  }, [currentIndex, isTransitioning, translateX, containerWidth, totalSlides]);

  const handleComplete = async () => {
    await saveOnboardingComplete();
    if (source === 'login') {
      router.replace('/auth/login');
      return;
    }
    router.replace('/home');
  };

  const handleSkip = async () => {
    if (source === 'login') {
      router.replace('/auth/login');
      return;
    }
    await saveOnboardingComplete();
    router.replace('/home');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ProgressBar currentIndex={currentIndex} totalSlides={totalSlides} />

      {currentIndex !== totalSlides - 1 && <SkipButton onSkip={handleSkip} />}

      <View style={styles.slidesOuterContainer} onLayout={handleLayout}>
        <Animated.View style={[styles.slidesContainer, animatedStyle]}>
          {activeSlides.map(({ component: SlideComponent }, index) => (
            <View
              key={index}
              style={[styles.slideWrapper, containerWidth > 0 && { width: containerWidth }]}
            >
              {Math.abs(index - currentIndex) <= 1 ? (
                <SlideComponent
                  isActive={index === currentIndex}
                  index={index}
                  source={source}
                />
              ) : null}
            </View>
          ))}
        </Animated.View>
      </View>

      <NavigationButtons
        currentIndex={currentIndex}
        totalSlides={totalSlides}
        onNext={goToNextSlide}
        isTransitioning={isTransitioning}
        source={source}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  slidesOuterContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  slidesContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  slideWrapper: {
    height: '100%',
  },
});
