# Chapter 70: 국제화

RTL(Right-to-Left) 레이아웃 지원과 다국어 환경에서의 애니메이션 처리 방법을 학습합니다.

## 📌 학습 목표

- RTL 레이아웃 애니메이션 적응
- 방향성 있는 제스처 처리
- 언어별 애니메이션 조정
- 국제화 친화적 컴포넌트 설계

## 📖 개념 이해

### RTL vs LTR 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│                   Layout Directions                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  LTR (Left-to-Right): English, Korean, Japanese...     │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ← 시작                              끝 →       │   │
│  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐            │   │
│  │  │  1  │→ │  2  │→ │  3  │→ │  4  │            │   │
│  │  └─────┘  └─────┘  └─────┘  └─────┘            │   │
│  │  스와이프: ──→ 다음, ←── 이전                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  RTL (Right-to-Left): Arabic, Hebrew, Persian...       │
│  ┌─────────────────────────────────────────────────┐   │
│  │       ← 끝                              시작 →  │   │
│  │            ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  │   │
│  │            │  4  │← │  3  │← │  2  │← │  1  │  │   │
│  │            └─────┘  └─────┘  └─────┘  └─────┘  │   │
│  │  스와이프: ←── 다음, ──→ 이전                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 애니메이션 방향 매핑

```
┌─────────────────────────────────────────────────────────┐
│             Animation Direction Mapping                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  의미적 방향 (Semantic)  →  물리적 방향 (Physical)      │
│                                                         │
│  ┌─────────────┐         ┌─────────────────────────┐   │
│  │   'start'   │ ──────▶ │ LTR: left  │ RTL: right │   │
│  │   'end'     │ ──────▶ │ LTR: right │ RTL: left  │   │
│  │   'forward' │ ──────▶ │ LTR: right │ RTL: left  │   │
│  │   'back'    │ ──────▶ │ LTR: left  │ RTL: right │   │
│  └─────────────┘         └─────────────────────────┘   │
│                                                         │
│  물리적 방향 (Physical)  →  항상 동일                   │
│  ┌─────────────┐         ┌─────────────────────────┐   │
│  │   'left'    │ ──────▶ │ 항상 왼쪽               │   │
│  │   'right'   │ ──────▶ │ 항상 오른쪽             │   │
│  └─────────────┘         └─────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 💻 코드 예제

### 예제 1: RTL 감지 및 방향 유틸리티

```typescript
// utils/rtl.ts
import { I18nManager, Dimensions } from 'react-native';
import {
  useSharedValue,
  useDerivedValue,
  SharedValue,
} from 'react-native-reanimated';

// RTL 상태
export const isRTL = I18nManager.isRTL;

// 방향 타입
export type SemanticDirection = 'start' | 'end' | 'forward' | 'back';
export type PhysicalDirection = 'left' | 'right' | 'up' | 'down';

// 의미적 방향 → 물리적 방향 변환
export function getPhysicalDirection(
  semantic: SemanticDirection
): PhysicalDirection {
  switch (semantic) {
    case 'start':
      return isRTL ? 'right' : 'left';
    case 'end':
      return isRTL ? 'left' : 'right';
    case 'forward':
      return isRTL ? 'left' : 'right';
    case 'back':
      return isRTL ? 'right' : 'left';
  }
}

// X 변환값 방향 조정
export function getDirectionalX(value: number): number {
  'worklet';
  return isRTL ? -value : value;
}

// 조건부 X 변환
export function useDirectionalX(
  value: SharedValue<number>
): SharedValue<number> {
  return useDerivedValue(() => {
    return isRTL ? -value.value : value.value;
  });
}

// 스와이프 방향 해석
export function interpretSwipeDirection(
  translationX: number,
  threshold: number = 50
): 'forward' | 'back' | null {
  'worklet';

  const direction = isRTL ? -translationX : translationX;

  if (direction > threshold) {
    return 'back';
  } else if (direction < -threshold) {
    return 'forward';
  }

  return null;
}

// 회전 방향 조정
export function getDirectionalRotation(degrees: number): number {
  'worklet';
  return isRTL ? -degrees : degrees;
}

// 그라데이션 방향 조정
export type GradientDirection =
  | 'toRight'
  | 'toLeft'
  | 'toStart'
  | 'toEnd';

export function getGradientStart(
  direction: GradientDirection
): { x: number; y: number } {
  switch (direction) {
    case 'toRight':
      return { x: 0, y: 0.5 };
    case 'toLeft':
      return { x: 1, y: 0.5 };
    case 'toStart':
      return isRTL ? { x: 1, y: 0.5 } : { x: 0, y: 0.5 };
    case 'toEnd':
      return isRTL ? { x: 0, y: 0.5 } : { x: 1, y: 0.5 };
  }
}

export function getGradientEnd(
  direction: GradientDirection
): { x: number; y: number } {
  switch (direction) {
    case 'toRight':
      return { x: 1, y: 0.5 };
    case 'toLeft':
      return { x: 0, y: 0.5 };
    case 'toStart':
      return isRTL ? { x: 0, y: 0.5 } : { x: 1, y: 0.5 };
    case 'toEnd':
      return isRTL ? { x: 1, y: 0.5 } : { x: 0, y: 0.5 };
  }
}
```

### 예제 2: RTL 적응형 애니메이션 훅

```typescript
// hooks/useDirectionalAnimation.ts
import { useCallback, useMemo } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { isRTL, getDirectionalX } from '../utils/rtl';

interface DirectionalAnimationOptions {
  // 시작 위치 (의미적)
  startPosition?: 'start' | 'end' | 'center';
  // 진행 방향 (의미적)
  progressDirection?: 'forward' | 'back';
  // 거리
  distance?: number;
}

export function useDirectionalSlide(
  options: DirectionalAnimationOptions = {}
) {
  const {
    startPosition = 'start',
    progressDirection = 'forward',
    distance = 100,
  } = options;

  const progress = useSharedValue(0);

  // 시작 오프셋 계산
  const startOffset = useMemo(() => {
    switch (startPosition) {
      case 'start':
        return isRTL ? distance : -distance;
      case 'end':
        return isRTL ? -distance : distance;
      case 'center':
        return 0;
    }
  }, [startPosition, distance]);

  // 진행 방향 계산
  const endOffset = useMemo(() => {
    if (progressDirection === 'forward') {
      return isRTL ? -distance : distance;
    }
    return isRTL ? distance : -distance;
  }, [progressDirection, distance]);

  const slideIn = useCallback(() => {
    progress.value = withSpring(1, { damping: 15 });
  }, []);

  const slideOut = useCallback(() => {
    progress.value = withSpring(0, { damping: 15 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 1],
          [startOffset, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
    opacity: interpolate(
      progress.value,
      [0, 0.5, 1],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    ),
  }));

  return {
    progress,
    slideIn,
    slideOut,
    animatedStyle,
  };
}

// 페이지 전환 애니메이션
export function usePageTransition() {
  const currentPage = useSharedValue(0);

  const goToPage = useCallback((pageIndex: number) => {
    currentPage.value = withTiming(pageIndex, { duration: 300 });
  }, []);

  const getPageStyle = useCallback(
    (pageIndex: number) => {
      return useAnimatedStyle(() => {
        const diff = pageIndex - currentPage.value;

        // RTL에서는 방향 반전
        const adjustedDiff = isRTL ? -diff : diff;

        return {
          transform: [
            {
              translateX: interpolate(
                adjustedDiff,
                [-1, 0, 1],
                [-300, 0, 300],
                Extrapolation.CLAMP
              ),
            },
          ],
          opacity: interpolate(
            Math.abs(diff),
            [0, 1],
            [1, 0.3],
            Extrapolation.CLAMP
          ),
        };
      });
    },
    []
  );

  return {
    currentPage,
    goToPage,
    getPageStyle,
  };
}
```

### 예제 3: RTL 지원 스와이프 컴포넌트

```typescript
// components/DirectionalSwipeable.tsx
import React, { useCallback } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { isRTL, interpretSwipeDirection } from '../utils/rtl';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DirectionalSwipeableProps {
  children: React.ReactNode;
  onSwipeForward?: () => void;
  onSwipeBack?: () => void;
  threshold?: number;
  disabled?: boolean;
}

export function DirectionalSwipeable({
  children,
  onSwipeForward,
  onSwipeBack,
  threshold = SCREEN_WIDTH * 0.3,
  disabled = false,
}: DirectionalSwipeableProps) {
  const translateX = useSharedValue(0);

  const handleSwipeComplete = useCallback(
    (direction: 'forward' | 'back') => {
      if (direction === 'forward' && onSwipeForward) {
        onSwipeForward();
      } else if (direction === 'back' && onSwipeBack) {
        onSwipeBack();
      }
    },
    [onSwipeForward, onSwipeBack]
  );

  const gesture = Gesture.Pan()
    .enabled(!disabled)
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const direction = interpretSwipeDirection(
        event.translationX,
        threshold
      );

      if (direction) {
        // 스와이프 완료 - 화면 밖으로 이동
        const exitX =
          direction === 'forward'
            ? isRTL
              ? SCREEN_WIDTH
              : -SCREEN_WIDTH
            : isRTL
            ? -SCREEN_WIDTH
            : SCREEN_WIDTH;

        translateX.value = withSpring(exitX, { damping: 20 }, () => {
          runOnJS(handleSwipeComplete)(direction);
        });
      } else {
        // 원위치 복귀
        translateX.value = withSpring(0, { damping: 15 });
      }
    });

  // 스와이프 방향에 따른 오버레이 (의미적)
  const forwardOverlayStyle = useAnimatedStyle(() => {
    // forward = LTR에서 왼쪽, RTL에서 오른쪽
    const progress = isRTL
      ? interpolate(
          translateX.value,
          [0, threshold],
          [0, 1],
          Extrapolation.CLAMP
        )
      : interpolate(
          translateX.value,
          [-threshold, 0],
          [1, 0],
          Extrapolation.CLAMP
        );

    return {
      opacity: progress,
    };
  });

  const backOverlayStyle = useAnimatedStyle(() => {
    // back = LTR에서 오른쪽, RTL에서 왼쪽
    const progress = isRTL
      ? interpolate(
          translateX.value,
          [-threshold, 0],
          [1, 0],
          Extrapolation.CLAMP
        )
      : interpolate(
          translateX.value,
          [0, threshold],
          [0, 1],
          Extrapolation.CLAMP
        );

    return {
      opacity: progress,
    };
  });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
          isRTL ? [15, 0, -15] : [-15, 0, 15]
        )}deg`,
      },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, cardStyle]}>
        {children}

        {/* Forward 오버레이 (다음) */}
        <Animated.View
          style={[
            styles.overlay,
            styles.forwardOverlay,
            forwardOverlayStyle,
          ]}
        >
          <Text style={styles.overlayText}>다음</Text>
        </Animated.View>

        {/* Back 오버레이 (이전) */}
        <Animated.View
          style={[
            styles.overlay,
            styles.backOverlay,
            backOverlayStyle,
          ]}
        >
          <Text style={styles.overlayText}>이전</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 3,
  },
  forwardOverlay: {
    // 의미적 'end' 위치
    ...(isRTL ? { left: 20 } : { right: 20 }),
    borderColor: '#4CAF50',
  },
  backOverlay: {
    // 의미적 'start' 위치
    ...(isRTL ? { right: 20 } : { left: 20 }),
    borderColor: '#FF9800',
  },
  overlayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});
```

### 예제 4: 진행 표시기 국제화

```typescript
// components/DirectionalProgress.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { isRTL } from '../utils/rtl';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DirectionalProgressProps {
  progress: number; // 0-1
  color?: string;
  backgroundColor?: string;
  height?: number;
  animated?: boolean;
}

export function DirectionalProgress({
  progress,
  color = '#7C4DFF',
  backgroundColor = '#E0E0E0',
  height = 4,
  animated = true,
}: DirectionalProgressProps) {
  const animatedProgress = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      animatedProgress.value = withSpring(progress, { damping: 15 });
    } else {
      animatedProgress.value = progress;
    }
  }, [progress, animated]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
    // RTL에서는 오른쪽에서 시작
    ...(isRTL
      ? { right: 0, left: undefined }
      : { left: 0, right: undefined }),
  }));

  return (
    <View style={[styles.track, { backgroundColor, height }]}>
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: color, height },
          progressStyle,
        ]}
      />
    </View>
  );
}

// 스텝 인디케이터
interface StepIndicatorProps {
  steps: number;
  currentStep: number;
  onStepPress?: (step: number) => void;
}

export function DirectionalStepIndicator({
  steps,
  currentStep,
  onStepPress,
}: StepIndicatorProps) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withSpring(currentStep / (steps - 1), {
      damping: 15,
    });
  }, [currentStep, steps]);

  // 단계 배열 (RTL에서 반전)
  const stepsArray = React.useMemo(() => {
    const arr = Array.from({ length: steps }, (_, i) => i);
    return isRTL ? arr.reverse() : arr;
  }, [steps]);

  const lineStyle = useAnimatedStyle(() => {
    const width = interpolate(
      progress.value,
      [0, 1],
      [0, 100],
      Extrapolation.CLAMP
    );

    return {
      width: `${width}%`,
      // RTL에서는 오른쪽에서 시작
      ...(isRTL
        ? { right: 0, left: undefined }
        : { left: 0, right: undefined }),
    };
  });

  return (
    <View style={styles.stepContainer}>
      {/* 배경 라인 */}
      <View style={styles.stepLine} />

      {/* 진행 라인 */}
      <Animated.View style={[styles.stepLineActive, lineStyle]} />

      {/* 단계 점 */}
      <View style={styles.stepsRow}>
        {stepsArray.map((step, index) => {
          // 실제 단계 인덱스 (RTL 반전 고려)
          const actualStep = isRTL ? steps - 1 - index : index;
          const isCompleted = actualStep < currentStep;
          const isActive = actualStep === currentStep;

          return (
            <StepDot
              key={step}
              isCompleted={isCompleted}
              isActive={isActive}
              onPress={() => onStepPress?.(actualStep)}
            />
          );
        })}
      </View>
    </View>
  );
}

function StepDot({
  isCompleted,
  isActive,
  onPress,
}: {
  isCompleted: boolean;
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (isActive) {
      scale.value = withSpring(1.2);
    } else {
      scale.value = withSpring(1);
    }
  }, [isActive]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: isCompleted || isActive ? '#7C4DFF' : '#E0E0E0',
  }));

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[styles.stepDot, dotStyle]}>
        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    borderRadius: 2,
  },
  stepContainer: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
  },
  stepLine: {
    position: 'absolute',
    height: 2,
    width: '100%',
    backgroundColor: '#E0E0E0',
  },
  stepLineActive: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#7C4DFF',
  },
  stepsRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
```

### 예제 5: 언어별 애니메이션 조정

```typescript
// hooks/useLocalizedAnimation.ts
import { useMemo } from 'react';
import { I18nManager } from 'react-native';
import i18n from 'i18next';

// 언어별 애니메이션 설정
interface LanguageAnimationConfig {
  // 읽기 방향
  direction: 'ltr' | 'rtl';
  // 애니메이션 속도 조절 (긴 텍스트를 가진 언어)
  durationMultiplier: number;
  // 텍스트 애니메이션용 문자당 딜레이
  charDelayMs: number;
  // 스크롤 방향
  scrollDirection: 'horizontal' | 'vertical';
}

const languageConfigs: Record<string, LanguageAnimationConfig> = {
  en: {
    direction: 'ltr',
    durationMultiplier: 1,
    charDelayMs: 30,
    scrollDirection: 'horizontal',
  },
  ko: {
    direction: 'ltr',
    durationMultiplier: 1,
    charDelayMs: 50, // 한글은 조금 더 긴 딜레이
    scrollDirection: 'vertical', // 세로 스크롤 선호
  },
  ja: {
    direction: 'ltr',
    durationMultiplier: 1.1, // 긴 문장
    charDelayMs: 40,
    scrollDirection: 'vertical',
  },
  ar: {
    direction: 'rtl',
    durationMultiplier: 1,
    charDelayMs: 30,
    scrollDirection: 'horizontal',
  },
  he: {
    direction: 'rtl',
    durationMultiplier: 1,
    charDelayMs: 30,
    scrollDirection: 'horizontal',
  },
  zh: {
    direction: 'ltr',
    durationMultiplier: 0.8, // 짧은 문장
    charDelayMs: 60, // 한자는 더 긴 딜레이
    scrollDirection: 'vertical',
  },
};

export function useLocalizedAnimation() {
  const currentLanguage = i18n.language || 'en';

  const config = useMemo(() => {
    return languageConfigs[currentLanguage] || languageConfigs.en;
  }, [currentLanguage]);

  // 조정된 지속 시간
  const getAdjustedDuration = (baseDuration: number) => {
    return baseDuration * config.durationMultiplier;
  };

  // 텍스트 애니메이션 딜레이
  const getCharacterDelay = (index: number) => {
    return index * config.charDelayMs;
  };

  // 방향 변환
  const getDirectionalValue = (value: number) => {
    return config.direction === 'rtl' ? -value : value;
  };

  return {
    config,
    isRTL: config.direction === 'rtl',
    getAdjustedDuration,
    getCharacterDelay,
    getDirectionalValue,
  };
}

// 타이핑 애니메이션 (언어별 최적화)
export function useLocalizedTypingAnimation(text: string) {
  const { getCharacterDelay, isRTL } = useLocalizedAnimation();
  const progress = useSharedValue(0);
  const [displayedText, setDisplayedText] = React.useState('');

  React.useEffect(() => {
    const characters = text.split('');
    let currentIndex = 0;

    const typeNextChar = () => {
      if (currentIndex < characters.length) {
        const char = characters[currentIndex];
        setDisplayedText((prev) =>
          isRTL ? char + prev : prev + char
        );
        currentIndex++;

        const delay = getCharacterDelay(1);
        setTimeout(typeNextChar, delay);
      }
    };

    typeNextChar();

    return () => {
      setDisplayedText('');
    };
  }, [text, isRTL]);

  return displayedText;
}
```

## 🎨 sometimes-app 적용 사례

### 글로벌 매칭 카드

```typescript
// features/matching/ui/GlobalMatchingCard.tsx
import React, { useCallback } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import {
  isRTL,
  interpretSwipeDirection,
  getDirectionalX,
} from '@/utils/rtl';
import { useLocalizedAnimation } from '@/hooks/useLocalizedAnimation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface Profile {
  id: string;
  name: string;
  age: number;
  university: string;
  photos: string[];
}

interface GlobalMatchingCardProps {
  profile: Profile;
  onLike: (id: string) => void;
  onPass: (id: string) => void;
  onSuperLike: (id: string) => void;
}

export function GlobalMatchingCard({
  profile,
  onLike,
  onPass,
  onSuperLike,
}: GlobalMatchingCardProps) {
  const { t } = useTranslation('matching');
  const { getAdjustedDuration, isRTL: isRightToLeft } =
    useLocalizedAnimation();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // 스와이프 완료 처리
  const handleSwipeComplete = useCallback(
    (action: 'like' | 'pass' | 'superLike') => {
      switch (action) {
        case 'like':
          onLike(profile.id);
          break;
        case 'pass':
          onPass(profile.id);
          break;
        case 'superLike':
          onSuperLike(profile.id);
          break;
      }
    },
    [profile.id, onLike, onPass, onSuperLike]
  );

  // RTL 적응형 제스처
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const horizontalDirection = interpretSwipeDirection(
        event.translationX,
        SWIPE_THRESHOLD
      );

      // 수평 스와이프
      if (horizontalDirection) {
        // RTL에서는 의미가 반전
        // forward (왼쪽 스와이프 in LTR) = Pass
        // back (오른쪽 스와이프 in LTR) = Like
        const action =
          horizontalDirection === 'forward' ? 'pass' : 'like';

        const exitX =
          action === 'like'
            ? getDirectionalX(SCREEN_WIDTH * 1.5)
            : getDirectionalX(-SCREEN_WIDTH * 1.5);

        translateX.value = withSpring(exitX, { damping: 20 }, () => {
          runOnJS(handleSwipeComplete)(action);
        });
      }
      // 위로 스와이프 = Super Like
      else if (event.translationY < -SWIPE_THRESHOLD) {
        translateY.value = withSpring(-SCREEN_WIDTH, { damping: 20 }, () => {
          runOnJS(handleSwipeComplete)('superLike');
        });
      }
      // 원위치
      else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  // Like 오버레이 (의미적 'end' 방향)
  const likeOverlayStyle = useAnimatedStyle(() => {
    // LTR: 오른쪽 스와이프, RTL: 왼쪽 스와이프
    const normalizedX = isRightToLeft
      ? -translateX.value
      : translateX.value;

    return {
      opacity: interpolate(normalizedX, [0, SWIPE_THRESHOLD], [0, 1]),
      transform: [
        {
          scale: interpolate(normalizedX, [0, SWIPE_THRESHOLD], [0.5, 1]),
        },
      ],
    };
  });

  // Pass 오버레이 (의미적 'start' 방향)
  const passOverlayStyle = useAnimatedStyle(() => {
    const normalizedX = isRightToLeft
      ? translateX.value
      : -translateX.value;

    return {
      opacity: interpolate(normalizedX, [0, SWIPE_THRESHOLD], [0, 1]),
      transform: [
        {
          scale: interpolate(normalizedX, [0, SWIPE_THRESHOLD], [0.5, 1]),
        },
      ],
    };
  });

  // Super Like 오버레이
  const superLikeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      -translateY.value,
      [0, SWIPE_THRESHOLD],
      [0, 1]
    ),
  }));

  // 카드 스타일
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        // RTL에서는 회전 방향 반전
        rotate: `${getDirectionalX(translateX.value * 0.1)}deg`,
      },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Image
          source={{ uri: profile.photos[0] }}
          style={styles.image}
        />

        {/* Like 오버레이 */}
        <Animated.View
          style={[
            styles.overlay,
            // RTL에서는 위치 반전
            isRightToLeft ? styles.overlayStart : styles.overlayEnd,
            styles.likeOverlay,
            likeOverlayStyle,
          ]}
        >
          <Text style={styles.overlayText}>{t('action.like')}</Text>
        </Animated.View>

        {/* Pass 오버레이 */}
        <Animated.View
          style={[
            styles.overlay,
            isRightToLeft ? styles.overlayEnd : styles.overlayStart,
            styles.passOverlay,
            passOverlayStyle,
          ]}
        >
          <Text style={styles.overlayText}>{t('action.pass')}</Text>
        </Animated.View>

        {/* Super Like 오버레이 */}
        <Animated.View
          style={[
            styles.overlay,
            styles.superLikeOverlay,
            superLikeOverlayStyle,
          ]}
        >
          <Text style={styles.overlayText}>{t('action.superLike')}</Text>
        </Animated.View>

        {/* 프로필 정보 */}
        <View style={styles.info}>
          <Text style={styles.name}>
            {profile.name}, {profile.age}
          </Text>
          <Text style={styles.university}>{profile.university}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH - 40,
    aspectRatio: 0.7,
    borderRadius: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '75%',
  },
  info: {
    padding: 16,
    // RTL 자동 지원
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    // 텍스트 정렬은 자동 RTL 지원
    textAlign: 'left',
  },
  university: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  overlay: {
    position: 'absolute',
    top: 40,
    padding: 12,
    borderWidth: 4,
    borderRadius: 8,
  },
  // 의미적 위치 (start/end)
  overlayStart: {
    left: 20,
  },
  overlayEnd: {
    right: 20,
  },
  likeOverlay: {
    borderColor: '#4CAF50',
    transform: [{ rotate: '-15deg' }],
  },
  passOverlay: {
    borderColor: '#F44336',
    transform: [{ rotate: '15deg' }],
  },
  superLikeOverlay: {
    alignSelf: 'center',
    top: '40%',
    borderColor: '#2196F3',
  },
  overlayText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 실수 1: RTL에서 방향 하드코딩

```typescript
// ❌ 잘못된 방식 - 물리적 방향 하드코딩
const slideInFromLeft = useAnimatedStyle(() => ({
  transform: [{ translateX: -100 }], // 항상 왼쪽에서
}));

// ✅ 올바른 방식 - 의미적 방향 사용
const slideInFromStart = useAnimatedStyle(() => ({
  transform: [
    { translateX: isRTL ? 100 : -100 }, // start에서
  ],
}));

// 또는 헬퍼 사용
const slideIn = useAnimatedStyle(() => ({
  transform: [
    { translateX: getDirectionalX(-100) },
  ],
}));
```

### 실수 2: 스와이프 방향 해석 오류

```typescript
// ❌ 잘못된 방식 - RTL 고려 없음
const gesture = Gesture.Pan().onEnd((e) => {
  if (e.translationX > 100) {
    // 오른쪽 = 좋아요?
    onLike();
  }
});

// ✅ 올바른 방식 - 의미적 방향 해석
const gesture = Gesture.Pan().onEnd((e) => {
  const direction = interpretSwipeDirection(e.translationX, 100);
  if (direction === 'back') {
    // back = 좋아요 (LTR: 오른쪽, RTL: 왼쪽)
    onLike();
  }
});
```

## 💡 국제화 팁

### 1. 테스트 방법

```typescript
// RTL 테스트 유틸
export function forceRTL(enable: boolean) {
  if (__DEV__) {
    I18nManager.allowRTL(enable);
    I18nManager.forceRTL(enable);
    // 앱 재시작 필요
  }
}

// 언어별 테스트
const testLanguages = ['en', 'ko', 'ar', 'he', 'ja', 'zh'];
testLanguages.forEach(lang => {
  // 각 언어로 테스트
});
```

### 2. 스타일 팁

```typescript
// 자동 RTL 지원 스타일
const styles = StyleSheet.create({
  container: {
    // start/end 사용 (자동 반전)
    paddingStart: 16,
    paddingEnd: 16,
    marginStart: 8,

    // left/right 대신
    // paddingLeft: 16, // ❌
  },
  text: {
    // textAlign: 'left' 대신
    textAlign: 'auto', // 또는 I18nManager.isRTL ? 'right' : 'left'
  },
});
```

## 📚 이 장에서 배운 내용

1. **RTL 감지**: I18nManager를 활용한 방향 감지
2. **의미적 방향**: start/end/forward/back 사용
3. **적응형 제스처**: RTL에서 스와이프 방향 해석
4. **애니메이션 조정**: 언어별 타이밍과 방향 최적화
5. **테스트 전략**: 다국어 환경 검증 방법

## 다음 장 예고

**Chapter 71: 디자인 시스템 통합**에서는 애니메이션을 포함한 완전한 디자인 시스템 구축 방법을 배웁니다. Storybook 연동, 문서화, 팀 협업 전략을 다룹니다.
