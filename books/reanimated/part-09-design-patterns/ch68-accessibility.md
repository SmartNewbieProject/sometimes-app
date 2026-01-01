# Chapter 68: 접근성

애니메이션이 접근성에 미치는 영향을 이해하고, 모든 사용자를 위한 포용적인 경험을 제공하는 방법을 학습합니다.

## 📌 학습 목표

- 모션 감소(Reduce Motion) 설정 존중
- 스크린 리더와 애니메이션 호환
- 시각 장애인을 위한 대안 제공
- 전정 기관 장애 고려

## 📖 개념 이해

### 접근성 고려 사항

```
┌─────────────────────────────────────────────────────────┐
│                Accessibility Considerations              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🦮 시각 장애                                            │
│  ├── 스크린 리더 (VoiceOver, TalkBack)                 │
│  ├── 고대비 모드                                       │
│  └── 큰 텍스트                                         │
│                                                         │
│  🎯 모션 민감성                                         │
│  ├── 전정 기관 장애 (어지러움, 멀미)                   │
│  ├── 발작 유발 (빠른 깜빡임)                           │
│  └── 주의력 결핍 (과도한 움직임)                       │
│                                                         │
│  🖐️ 운동 장애                                          │
│  ├── 터치 타겟 크기                                    │
│  ├── 제스처 복잡성                                     │
│  └── 시간 제한                                         │
│                                                         │
│  🧠 인지 장애                                           │
│  ├── 예측 가능한 동작                                  │
│  ├── 단순한 상호작용                                   │
│  └── 명확한 피드백                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Reduce Motion 동작 흐름

```
┌─────────────────────────────────────────────────────────┐
│              Reduce Motion Implementation                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐                                      │
│  │ 시스템 설정   │                                      │
│  │ Reduce Motion│──────┐                               │
│  └──────────────┘      │                               │
│                        ▼                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │              useReducedMotion()                  │  │
│  │  ┌────────────────┐  ┌────────────────────────┐  │  │
│  │  │ isReducedMotion│  │ Accessibility.addListener│  │  │
│  │  │     true/false │  │                        │  │  │
│  │  └────────────────┘  └────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                        │                               │
│         ┌──────────────┴──────────────┐               │
│         ▼                              ▼               │
│  ┌──────────────┐              ┌──────────────┐       │
│  │ 모션 활성화   │              │ 모션 비활성화 │       │
│  │              │              │              │       │
│  │ • 스프링     │              │ • 즉시 변경   │       │
│  │ • 타이밍     │              │ • 페이드만    │       │
│  │ • 제스처     │              │ • 대안 표시   │       │
│  └──────────────┘              └──────────────┘       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 💻 코드 예제

### 예제 1: Reduce Motion 감지 및 적용

```typescript
// hooks/useReducedMotion.ts
import { useEffect, useState, useCallback } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  WithSpringConfig,
  WithTimingConfig,
} from 'react-native-reanimated';

interface ReducedMotionReturn {
  isReducedMotion: boolean;
  // 조건부 애니메이션 헬퍼
  animate: <T extends number>(
    value: T,
    options?: AnimateOptions
  ) => T;
  // 조건부 스타일
  getAnimatedStyle: (
    normalStyle: () => object,
    reducedStyle: () => object
  ) => object;
}

interface AnimateOptions {
  type?: 'spring' | 'timing';
  springConfig?: WithSpringConfig;
  timingConfig?: WithTimingConfig;
}

export function useReducedMotion(): ReducedMotionReturn {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // 초기값 확인
    AccessibilityInfo.isReduceMotionEnabled().then(setIsReducedMotion);

    // 변경 감지
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReducedMotion
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // 조건부 애니메이션
  const animate = useCallback(
    <T extends number>(value: T, options: AnimateOptions = {}): T => {
      if (isReducedMotion) {
        // 모션 감소: 즉시 값 변경
        return value;
      }

      const { type = 'spring', springConfig, timingConfig } = options;

      if (type === 'spring') {
        return withSpring(value, springConfig) as T;
      }
      return withTiming(value, timingConfig) as T;
    },
    [isReducedMotion]
  );

  // 조건부 스타일
  const getAnimatedStyle = useCallback(
    (
      normalStyle: () => object,
      reducedStyle: () => object
    ): object => {
      return isReducedMotion ? reducedStyle() : normalStyle();
    },
    [isReducedMotion]
  );

  return {
    isReducedMotion,
    animate,
    getAnimatedStyle,
  };
}

// 고급: Context로 전역 제공
import React, { createContext, useContext } from 'react';

const ReducedMotionContext = createContext<ReducedMotionReturn | null>(null);

export function ReducedMotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useReducedMotion();

  return (
    <ReducedMotionContext.Provider value={value}>
      {children}
    </ReducedMotionContext.Provider>
  );
}

export function useReducedMotionContext() {
  const context = useContext(ReducedMotionContext);
  if (!context) {
    throw new Error(
      'useReducedMotionContext must be used within ReducedMotionProvider'
    );
  }
  return context;
}
```

### 예제 2: 접근성 고려 애니메이션 컴포넌트

```typescript
// components/AccessibleAnimatedView.tsx
import React from 'react';
import { ViewStyle, AccessibilityProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface AccessibleAnimatedViewProps extends AccessibilityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  // 진입 애니메이션
  entering?: 'fade' | 'slide' | 'scale' | 'none';
  enteringDirection?: 'up' | 'down' | 'left' | 'right';
  // 종료 애니메이션
  exiting?: 'fade' | 'slide' | 'scale' | 'none';
  // 지연
  delay?: number;
}

export function AccessibleAnimatedView({
  children,
  style,
  entering = 'fade',
  enteringDirection = 'up',
  exiting = 'fade',
  delay = 0,
  // 접근성 props
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  ...accessibilityProps
}: AccessibleAnimatedViewProps) {
  const { isReducedMotion } = useReducedMotion();

  // 진입 애니메이션 선택
  const getEnteringAnimation = () => {
    if (isReducedMotion) {
      // 모션 감소: 페이드만 사용
      return FadeIn.duration(150).delay(delay);
    }

    switch (entering) {
      case 'fade':
        return FadeIn.duration(300).delay(delay);
      case 'slide':
        const slideDistance = 50;
        const slideConfig = { damping: 15 };
        switch (enteringDirection) {
          case 'up':
            return FadeIn.duration(300)
              .delay(delay)
              .springify()
              .damping(15);
          case 'down':
            return FadeIn.duration(300).delay(delay);
          default:
            return FadeIn.duration(300).delay(delay);
        }
      case 'scale':
        return FadeIn.duration(300).delay(delay);
      case 'none':
        return undefined;
      default:
        return FadeIn.duration(300).delay(delay);
    }
  };

  // 종료 애니메이션 선택
  const getExitingAnimation = () => {
    if (isReducedMotion) {
      return FadeOut.duration(100);
    }

    switch (exiting) {
      case 'fade':
        return FadeOut.duration(200);
      default:
        return FadeOut.duration(200);
    }
  };

  return (
    <Animated.View
      style={style}
      entering={getEnteringAnimation()}
      exiting={getExitingAnimation()}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      {...accessibilityProps}
    >
      {children}
    </Animated.View>
  );
}

// 접근성 안내 컴포넌트
export function AnimationStatusAnnouncer({
  message,
  delay = 500,
}: {
  message: string;
  delay?: number;
}) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      AccessibilityInfo.announceForAccessibility(message);
    }, delay);

    return () => clearTimeout(timer);
  }, [message, delay]);

  return null;
}
```

### 예제 3: 스크린 리더 호환 제스처

```typescript
// components/AccessibleGestureHandler.tsx
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

interface AccessibleGestureHandlerProps {
  children: React.ReactNode;
  // 스와이프 핸들러
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  // 탭 핸들러
  onTap?: () => void;
  onDoubleTap?: () => void;
  // 접근성
  accessibilityLabel: string;
  accessibilityHint?: string;
  // 스와이프 라벨 (스크린 리더용)
  swipeLeftLabel?: string;
  swipeRightLabel?: string;
}

export function AccessibleGestureHandler({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onDoubleTap,
  accessibilityLabel,
  accessibilityHint,
  swipeLeftLabel = '왼쪽으로 스와이프',
  swipeRightLabel = '오른쪽으로 스와이프',
}: AccessibleGestureHandlerProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // 스와이프 완료 알림
  const announceSwipe = useCallback((direction: string) => {
    AccessibilityInfo.announceForAccessibility(
      `${direction} 스와이프 완료`
    );
  }, []);

  // 팬 제스처
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const threshold = 100;

      if (Math.abs(event.translationX) > threshold) {
        if (event.translationX > 0 && onSwipeRight) {
          runOnJS(onSwipeRight)();
          runOnJS(announceSwipe)('오른쪽');
        } else if (event.translationX < 0 && onSwipeLeft) {
          runOnJS(onSwipeLeft)();
          runOnJS(announceSwipe)('왼쪽');
        }
      } else if (Math.abs(event.translationY) > threshold) {
        if (event.translationY > 0 && onSwipeDown) {
          runOnJS(onSwipeDown)();
          runOnJS(announceSwipe)('아래');
        } else if (event.translationY < 0 && onSwipeUp) {
          runOnJS(onSwipeUp)();
          runOnJS(announceSwipe)('위');
        }
      }

      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  // 탭 제스처
  const tapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(() => {
      if (onTap) {
        runOnJS(onTap)();
      }
    });

  // 더블 탭 제스처
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (onDoubleTap) {
        runOnJS(onDoubleTap)();
      }
    });

  const composedGesture = Gesture.Race(
    panGesture,
    Gesture.Exclusive(doubleTapGesture, tapGesture)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // 접근성 액션 정의
  const accessibilityActions = [];

  if (onSwipeLeft) {
    accessibilityActions.push({
      name: 'swipeLeft',
      label: swipeLeftLabel,
    });
  }
  if (onSwipeRight) {
    accessibilityActions.push({
      name: 'swipeRight',
      label: swipeRightLabel,
    });
  }
  if (onTap) {
    accessibilityActions.push({
      name: 'activate',
      label: '활성화',
    });
  }

  const handleAccessibilityAction = (event: any) => {
    switch (event.nativeEvent.actionName) {
      case 'swipeLeft':
        onSwipeLeft?.();
        break;
      case 'swipeRight':
        onSwipeRight?.();
        break;
      case 'activate':
        onTap?.();
        break;
    }
  };

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={animatedStyle}
        accessible
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityActions={accessibilityActions}
        onAccessibilityAction={handleAccessibilityAction}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
```

### 예제 4: 발작 안전 애니메이션

```typescript
// hooks/useSeizureSafeAnimation.ts
import { useMemo } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

// WCAG 2.1 기준: 3회/초 이상 깜빡임 금지
const MAX_FLASH_RATE = 3; // Hz
const MIN_FLASH_INTERVAL = 1000 / MAX_FLASH_RATE; // ~333ms

interface SeizureSafeOptions {
  // 최소 애니메이션 간격 (ms)
  minInterval?: number;
  // 대비 제한 (높은 대비 깜빡임 방지)
  maxContrastChange?: number;
  // 면적 제한 (화면의 %)
  maxFlashArea?: number;
}

export function useSeizureSafeAnimation(options: SeizureSafeOptions = {}) {
  const {
    minInterval = MIN_FLASH_INTERVAL,
    maxContrastChange = 0.8,
    maxFlashArea = 0.25,
  } = options;

  // 마지막 애니메이션 시간 추적
  const lastAnimationTime = useSharedValue(0);

  // 안전한 깜빡임 (페이드 기반)
  const safeBlink = useMemo(() => {
    const opacity = useSharedValue(1);

    const start = () => {
      // 깜빡임 대신 부드러운 페이드
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.3, {
            duration: minInterval / 2,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: minInterval / 2,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      );
    };

    const stop = () => {
      cancelAnimation(opacity);
      opacity.value = withTiming(1, { duration: 150 });
    };

    return { opacity, start, stop };
  }, [minInterval]);

  // 안전한 펄스 효과
  const safePulse = useMemo(() => {
    const scale = useSharedValue(1);

    const start = () => {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, {
            duration: 500,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: 500,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      );
    };

    const stop = () => {
      cancelAnimation(scale);
      scale.value = withTiming(1, { duration: 200 });
    };

    return { scale, start, stop };
  }, []);

  // 색상 변경 검증
  const isColorChangeSafe = (
    fromColor: string,
    toColor: string
  ): boolean => {
    // 간단한 대비 계산 (실제로는 더 정교한 계산 필요)
    // 밝기 차이가 maxContrastChange 이상이면 안전하지 않음
    return true; // 구현 필요
  };

  // 영역 크기 검증
  const isAreaSafe = (
    widthPercent: number,
    heightPercent: number
  ): boolean => {
    const area = widthPercent * heightPercent;
    return area <= maxFlashArea;
  };

  return {
    safeBlink,
    safePulse,
    isColorChangeSafe,
    isAreaSafe,
    minInterval,
  };
}

// 안전한 로딩 인디케이터
export function SafeLoadingIndicator() {
  const { safePulse } = useSeizureSafeAnimation();

  React.useEffect(() => {
    safePulse.start();
    return () => safePulse.stop();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: safePulse.scale.value }],
  }));

  return (
    <Animated.View
      style={[styles.indicator, animatedStyle]}
      accessibilityLabel="로딩 중"
      accessibilityRole="progressbar"
    >
      <View style={styles.dot} />
    </Animated.View>
  );
}
```

### 예제 5: 접근성 피드백 시스템

```typescript
// hooks/useAccessibleFeedback.ts
import { useCallback } from 'react';
import {
  AccessibilityInfo,
  Vibration,
  Platform,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {
  useSharedValue,
  withSequence,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useReducedMotion } from './useReducedMotion';

type FeedbackType =
  | 'success'
  | 'error'
  | 'warning'
  | 'selection'
  | 'impact';

interface FeedbackOptions {
  // 시각적 피드백
  visual?: boolean;
  // 햅틱 피드백
  haptic?: boolean;
  // 음성 알림
  announcement?: string;
  // 진동 패턴 (Android)
  vibrationPattern?: number[];
}

export function useAccessibleFeedback() {
  const { isReducedMotion } = useReducedMotion();
  const feedbackScale = useSharedValue(1);

  // 햅틱 피드백
  const triggerHaptic = useCallback((type: FeedbackType) => {
    const hapticTypes: Record<string, string> = {
      success: 'notificationSuccess',
      error: 'notificationError',
      warning: 'notificationWarning',
      selection: 'selection',
      impact: 'impactMedium',
    };

    if (Platform.OS === 'ios') {
      ReactNativeHapticFeedback.trigger(hapticTypes[type] as any);
    } else {
      // Android 진동
      const patterns: Record<string, number[]> = {
        success: [0, 50, 50, 50],
        error: [0, 100, 50, 100],
        warning: [0, 75],
        selection: [0, 25],
        impact: [0, 50],
      };
      Vibration.vibrate(patterns[type] || [0, 50]);
    }
  }, []);

  // 음성 알림
  const announce = useCallback((message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  // 시각적 피드백 (스케일 펄스)
  const triggerVisualFeedback = useCallback(() => {
    if (isReducedMotion) {
      // 모션 감소: 간단한 페이드 또는 색상 변화로 대체
      return;
    }

    feedbackScale.value = withSequence(
      withSpring(1.05, { damping: 10 }),
      withSpring(1, { damping: 15 })
    );
  }, [isReducedMotion]);

  // 통합 피드백
  const feedback = useCallback(
    (type: FeedbackType, options: FeedbackOptions = {}) => {
      const {
        visual = true,
        haptic = true,
        announcement,
        vibrationPattern,
      } = options;

      // 햅틱
      if (haptic) {
        triggerHaptic(type);
      }

      // 시각적
      if (visual) {
        triggerVisualFeedback();
      }

      // 음성 알림
      if (announcement) {
        announce(announcement);
      }
    },
    [triggerHaptic, triggerVisualFeedback, announce]
  );

  // 성공 피드백
  const success = useCallback(
    (message?: string) => {
      feedback('success', {
        announcement: message || '성공',
      });
    },
    [feedback]
  );

  // 에러 피드백
  const error = useCallback(
    (message?: string) => {
      feedback('error', {
        announcement: message || '오류가 발생했습니다',
      });
    },
    [feedback]
  );

  // 선택 피드백
  const selection = useCallback(() => {
    feedback('selection', {
      visual: false,
    });
  }, [feedback]);

  return {
    feedback,
    success,
    error,
    selection,
    feedbackScale,
  };
}
```

## 🎨 sometimes-app 적용 사례

### 접근성 친화적 매칭 카드

```typescript
// features/matching/ui/AccessibleMatchingCard.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  AccessibilityInfo,
  findNodeHandle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAccessibleFeedback } from '@/hooks/useAccessibleFeedback';

interface Profile {
  id: string;
  name: string;
  age: number;
  university: string;
  bio: string;
  photos: string[];
}

interface AccessibleMatchingCardProps {
  profile: Profile;
  onLike: (id: string) => void;
  onPass: (id: string) => void;
  onSuperLike: (id: string) => void;
}

export function AccessibleMatchingCard({
  profile,
  onLike,
  onPass,
  onSuperLike,
}: AccessibleMatchingCardProps) {
  const { isReducedMotion } = useReducedMotion();
  const { success, selection } = useAccessibleFeedback();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // 스와이프 처리
  const handleSwipeComplete = useCallback(
    (direction: 'left' | 'right' | 'up') => {
      switch (direction) {
        case 'right':
          onLike(profile.id);
          success(`${profile.name}님에게 좋아요를 보냈습니다`);
          break;
        case 'left':
          onPass(profile.id);
          AccessibilityInfo.announceForAccessibility('다음 프로필로 이동');
          break;
        case 'up':
          onSuperLike(profile.id);
          success(`${profile.name}님에게 슈퍼라이크를 보냈습니다`);
          break;
      }
    },
    [profile, onLike, onPass, onSuperLike, success]
  );

  // 제스처 설정
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (isReducedMotion) {
        // 모션 감소: 더 큰 임계값
        translateX.value = event.translationX * 0.5;
        translateY.value = event.translationY * 0.5;
      } else {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      const threshold = isReducedMotion ? 150 : 100;

      if (Math.abs(event.translationX) > threshold) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        runOnJS(handleSwipeComplete)(direction);

        if (isReducedMotion) {
          // 즉시 숨기기
          cardOpacity.value = 0;
        } else {
          // 애니메이션으로 퇴장
          translateX.value = withSpring(
            event.translationX > 0 ? 500 : -500
          );
        }
      } else if (event.translationY < -threshold) {
        runOnJS(handleSwipeComplete)('up');

        if (isReducedMotion) {
          cardOpacity.value = 0;
        } else {
          translateY.value = withSpring(-500);
        }
      } else {
        // 원위치
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  // 사진 탐색
  const handleNextPhoto = useCallback(() => {
    if (currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex((prev) => prev + 1);
      selection();
      AccessibilityInfo.announceForAccessibility(
        `사진 ${currentPhotoIndex + 2}/${profile.photos.length}`
      );
    }
  }, [currentPhotoIndex, profile.photos.length, selection]);

  const handlePrevPhoto = useCallback(() => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex((prev) => prev - 1);
      selection();
      AccessibilityInfo.announceForAccessibility(
        `사진 ${currentPhotoIndex}/${profile.photos.length}`
      );
    }
  }, [currentPhotoIndex, profile.photos.length, selection]);

  // 애니메이션 스타일
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: isReducedMotion
          ? '0deg'
          : `${translateX.value * 0.1}deg`,
      },
    ],
    opacity: cardOpacity.value,
  }));

  // 접근성 액션
  const accessibilityActions = [
    { name: 'like', label: '좋아요' },
    { name: 'pass', label: '패스' },
    { name: 'superLike', label: '슈퍼라이크' },
    { name: 'nextPhoto', label: '다음 사진' },
    { name: 'prevPhoto', label: '이전 사진' },
  ];

  const handleAccessibilityAction = (event: any) => {
    switch (event.nativeEvent.actionName) {
      case 'like':
        handleSwipeComplete('right');
        break;
      case 'pass':
        handleSwipeComplete('left');
        break;
      case 'superLike':
        handleSwipeComplete('up');
        break;
      case 'nextPhoto':
        handleNextPhoto();
        break;
      case 'prevPhoto':
        handlePrevPhoto();
        break;
    }
  };

  // 접근성 라벨 생성
  const accessibilityLabel = `
    ${profile.name}, ${profile.age}세, ${profile.university}.
    ${profile.bio}.
    사진 ${currentPhotoIndex + 1}/${profile.photos.length}.
    좋아요를 보내려면 오른쪽으로 스와이프하거나 좋아요 버튼을 누르세요.
    패스하려면 왼쪽으로 스와이프하세요.
  `.trim();

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[styles.card, cardStyle]}
        accessible
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityHint="위아래 스와이프로 사진 탐색, 좌우 스와이프로 결정"
        accessibilityActions={accessibilityActions}
        onAccessibilityAction={handleAccessibilityAction}
      >
        {/* 사진 */}
        <Image
          source={{ uri: profile.photos[currentPhotoIndex] }}
          style={styles.photo}
          accessibilityElementsHidden // 이미지는 라벨로 설명됨
        />

        {/* 사진 인디케이터 */}
        <View style={styles.photoIndicators} accessibilityElementsHidden>
          {profile.photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentPhotoIndex && styles.indicatorActive,
              ]}
            />
          ))}
        </View>

        {/* 프로필 정보 */}
        <View style={styles.info}>
          <Text style={styles.name} accessibilityElementsHidden>
            {profile.name}, {profile.age}
          </Text>
          <Text style={styles.university} accessibilityElementsHidden>
            {profile.university}
          </Text>
        </View>

        {/* 액션 버튼 (스크린 리더용 대안) */}
        <View style={styles.actions}>
          <AccessibleActionButton
            icon="✕"
            label="패스"
            onPress={() => handleSwipeComplete('left')}
            color="#FF6B6B"
          />
          <AccessibleActionButton
            icon="★"
            label="슈퍼라이크"
            onPress={() => handleSwipeComplete('up')}
            color="#6C63FF"
          />
          <AccessibleActionButton
            icon="♥"
            label="좋아요"
            onPress={() => handleSwipeComplete('right')}
            color="#4ECDC4"
          />
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

// 접근성 친화적 액션 버튼
function AccessibleActionButton({
  icon,
  label,
  onPress,
  color,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  color: string;
}) {
  const { isReducedMotion } = useReducedMotion();
  const scale = useSharedValue(1);

  const gesture = Gesture.Tap()
    .onBegin(() => {
      if (!isReducedMotion) {
        scale.value = withSpring(0.9);
      }
    })
    .onFinalize((_, success) => {
      scale.value = withSpring(1);
      if (success) {
        runOnJS(onPress)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.actionButton, { borderColor: color }, animatedStyle]}
        accessible
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityHint={`${label}를 선택합니다`}
      >
        <Text style={[styles.actionIcon, { color }]}>{icon}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '90%',
    aspectRatio: 0.7,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '75%',
  },
  photoIndicators: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 4,
  },
  indicator: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  indicatorActive: {
    backgroundColor: '#fff',
  },
  info: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  university: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 16,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  actionIcon: {
    fontSize: 24,
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 실수 1: 모션 감소 무시

```typescript
// ❌ 잘못된 방식 - 항상 애니메이션 적용
function BadComponent() {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withSpring(1);
  }, []);

  return <Animated.View style={{ opacity }} />;
}

// ✅ 올바른 방식 - 모션 감소 존중
function GoodComponent() {
  const { isReducedMotion } = useReducedMotion();
  const opacity = useSharedValue(isReducedMotion ? 1 : 0);

  useEffect(() => {
    if (!isReducedMotion) {
      opacity.value = withSpring(1);
    }
  }, [isReducedMotion]);

  return <Animated.View style={{ opacity }} />;
}
```

### 실수 2: 접근성 라벨 누락

```typescript
// ❌ 잘못된 방식 - 라벨 없음
function BadButton() {
  return (
    <Pressable onPress={handleLike}>
      <Animated.View style={animatedStyle}>
        <Text>♥</Text>
      </Animated.View>
    </Pressable>
  );
}

// ✅ 올바른 방식 - 명확한 라벨
function GoodButton() {
  return (
    <Pressable
      onPress={handleLike}
      accessible
      accessibilityLabel="좋아요"
      accessibilityRole="button"
      accessibilityHint="이 프로필에 좋아요를 보냅니다"
    >
      <Animated.View style={animatedStyle}>
        <Text>♥</Text>
      </Animated.View>
    </Pressable>
  );
}
```

### 실수 3: 제스처 대안 미제공

```typescript
// ❌ 잘못된 방식 - 스와이프만 지원
function BadCard() {
  const gesture = Gesture.Pan().onEnd((e) => {
    if (e.translationX > 100) onLike();
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View>{/* 콘텐츠 */}</Animated.View>
    </GestureDetector>
  );
}

// ✅ 올바른 방식 - 버튼 대안 제공
function GoodCard() {
  // 제스처 + 버튼 둘 다 제공
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessibilityActions={[{ name: 'like', label: '좋아요' }]}
        onAccessibilityAction={handleAccessibilityAction}
      >
        {/* 콘텐츠 */}
        <View style={styles.buttonContainer}>
          <Button title="좋아요" onPress={onLike} />
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
```

## 💡 접근성 팁

### 1. 체크리스트

```typescript
// 접근성 검증 체크리스트
const accessibilityChecklist = {
  // 모션
  reducedMotion: '✓ 모션 감소 설정 존중',
  noFlashing: '✓ 3Hz 이상 깜빡임 없음',

  // 스크린 리더
  labels: '✓ 모든 인터랙티브 요소에 라벨',
  hints: '✓ 복잡한 동작에 힌트 제공',
  announcements: '✓ 상태 변화 알림',

  // 제스처
  alternatives: '✓ 제스처 대안 제공',
  customActions: '✓ 접근성 액션 정의',

  // 기타
  contrast: '✓ 색상 대비 4.5:1 이상',
  touchTarget: '✓ 터치 타겟 44pt 이상',
};
```

### 2. 테스트 방법

```typescript
// 접근성 테스트 시나리오
const testScenarios = [
  // VoiceOver/TalkBack 테스트
  '1. 스크린 리더로 앱 탐색',
  '2. 모든 요소가 읽히는지 확인',
  '3. 제스처 대안이 동작하는지 확인',

  // 모션 감소 테스트
  '4. 시스템 설정에서 모션 감소 활성화',
  '5. 애니메이션이 단순화되는지 확인',

  // 고대비 테스트
  '6. 고대비 모드에서 가독성 확인',
];
```

## 🏋️ 연습 문제

### 문제 1: 접근성 친화적 탭 바

모션 감소를 존중하고 스크린 리더와 호환되는 애니메이션 탭 바를 구현하세요.

<details>
<summary>정답 보기</summary>

```typescript
function AccessibleTabBar({ tabs, activeIndex, onTabPress }) {
  const { isReducedMotion } = useReducedMotion();
  const indicatorX = useSharedValue(0);

  useEffect(() => {
    const targetX = activeIndex * TAB_WIDTH;
    if (isReducedMotion) {
      indicatorX.value = targetX;
    } else {
      indicatorX.value = withSpring(targetX);
    }

    AccessibilityInfo.announceForAccessibility(
      `${tabs[activeIndex].label} 탭 선택됨`
    );
  }, [activeIndex, isReducedMotion]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View
      style={styles.tabBar}
      accessibilityRole="tablist"
    >
      <Animated.View style={[styles.indicator, indicatorStyle]} />

      {tabs.map((tab, index) => (
        <Pressable
          key={tab.id}
          onPress={() => onTabPress(index)}
          accessible
          accessibilityRole="tab"
          accessibilityLabel={tab.label}
          accessibilityState={{ selected: index === activeIndex }}
          style={styles.tab}
        >
          <Text
            style={[
              styles.tabText,
              index === activeIndex && styles.tabTextActive,
            ]}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
```

</details>

## 📚 이 장에서 배운 내용

1. **모션 감소**: 시스템 설정을 존중하는 조건부 애니메이션
2. **스크린 리더**: 접근성 라벨, 힌트, 알림 제공
3. **발작 안전**: WCAG 기준에 따른 안전한 애니메이션
4. **제스처 대안**: 모든 사용자를 위한 대안 인터랙션
5. **피드백 시스템**: 시각, 청각, 촉각 피드백 조합

## 다음 장 예고

**Chapter 69: 다크 모드와 테마**에서는 테마 전환 애니메이션과 다양한 테마를 지원하는 디자인 시스템 구축 방법을 배웁니다.
