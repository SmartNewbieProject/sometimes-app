import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
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

const TOTAL_SLIDES = 11;

const SLIDES = [
  SlideWelcome,
  SlideStory,
  SlideMatchingTime,
  SlideVerification,
  SlideStudentOnly,
  SlideAiMatching,
  SlideLikeGuide,
  SlideChatGuide,
  SlideRefund,
  SlideRegion,
  SlideCta,
];

export const OnboardingScreen = () => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useSharedValue(0);
  const { saveOnboardingComplete } = useOnboardingStorage();

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

    if (currentIndex === TOTAL_SLIDES - 1) {
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
      },
      () => {
        setIsTransitioning(false);
      }
    );

    setCurrentIndex(nextIndex);
  }, [currentIndex, isTransitioning, translateX, containerWidth]);

  const handleComplete = async () => {
    await saveOnboardingComplete();
    router.replace('/home');
  };

  const handleSkip = async () => {
    await saveOnboardingComplete();
    router.replace('/home');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ProgressBar currentIndex={currentIndex} totalSlides={TOTAL_SLIDES} />

      {currentIndex === 0 && <SkipButton onSkip={handleSkip} />}

      <View style={styles.slidesOuterContainer} onLayout={handleLayout}>
        <Animated.View style={[styles.slidesContainer, animatedStyle]}>
          {SLIDES.map((SlideComponent, index) => (
            <View
              key={index}
              style={[styles.slideWrapper, containerWidth > 0 && { width: containerWidth }]}
            >
              {Math.abs(index - currentIndex) <= 1 ? (
                <SlideComponent
                  isActive={index === currentIndex}
                  index={index}
                />
              ) : null}
            </View>
          ))}
        </Animated.View>
      </View>

      <NavigationButtons
        currentIndex={currentIndex}
        totalSlides={TOTAL_SLIDES}
        onNext={goToNextSlide}
        isTransitioning={isTransitioning}
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
