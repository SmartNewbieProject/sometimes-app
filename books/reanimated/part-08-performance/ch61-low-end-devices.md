# Chapter 61: 저사양 기기 대응

다양한 성능의 기기에서 일관된 애니메이션 경험을 제공하는 방법을 배웁니다.

## 📌 학습 목표

- 기기 성능 감지 및 분류 방법 이해
- 점진적 기능 저하(Graceful Degradation) 구현
- 저사양 기기용 폴백 애니메이션 전략 수립
- 적응형 애니메이션 시스템 구축

## 📖 개념 이해

### 기기 성능 티어

```
┌─────────────────────────────────────────────────────────────┐
│                    Device Performance Tiers                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  High-End (고사양)                                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ • iPhone 12 Pro+, Galaxy S21+, Pixel 6+             │    │
│  │ • RAM: 6GB+                                          │    │
│  │ • 모든 애니메이션 풀 품질 실행                        │    │
│  │ • Spring, 그림자, 블러, 복잡한 제스처                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Mid-Range (중사양)                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ • iPhone SE, Galaxy A52, Pixel 4a                    │    │
│  │ • RAM: 4-6GB                                         │    │
│  │ • 대부분 애니메이션 정상 실행                         │    │
│  │ • 복잡한 효과 일부 제한                               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Low-End (저사양)                                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ • iPhone 7/8, Galaxy A12, 오래된 기기                │    │
│  │ • RAM: 2-4GB                                         │    │
│  │ • 애니메이션 단순화 필요                              │    │
│  │ • 그림자, 블러 비활성화                               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 점진적 기능 저하

```
┌─────────────────────────────────────────────────────────────┐
│                   Graceful Degradation                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Full Experience (고사양)                                    │
│  ├── Spring 물리 애니메이션                                  │
│  ├── 다중 리플 효과                                          │
│  ├── 실시간 그림자                                           │
│  ├── 블러 효과                                               │
│  └── 복잡한 파티클 시스템                                    │
│          │                                                   │
│          ▼ 성능 감지                                         │
│  Reduced Motion (중사양)                                     │
│  ├── Timing 애니메이션 (Spring 대체)                        │
│  ├── 단일 리플                                               │
│  ├── 정적 그림자                                             │
│  └── 블러 제거                                               │
│          │                                                   │
│          ▼ 성능 저하 감지                                    │
│  Minimal Animation (저사양)                                  │
│  ├── 단순 fade/scale만                                       │
│  ├── 효과 최소화                                             │
│  ├── 그림자 없음                                             │
│  └── 즉시 전환 옵션                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 코드 예제

### 1. 기기 성능 감지

```typescript
import { Platform, Dimensions, PixelRatio } from 'react-native';
import * as Device from 'expo-device'; // Expo 사용 시
import { useSharedValue, useFrameCallback, runOnJS } from 'react-native-reanimated';
import { useState, useEffect, useCallback, useRef } from 'react';

type PerformanceTier = 'high' | 'medium' | 'low';

interface DeviceProfile {
  tier: PerformanceTier;
  totalMemory: number | null;
  screenDensity: number;
  cpuCores: number | null;
  isOldDevice: boolean;
}

// 기기 정보 기반 성능 프로파일
function useDeviceProfile(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>({
    tier: 'high',
    totalMemory: null,
    screenDensity: PixelRatio.get(),
    cpuCores: null,
    isOldDevice: false,
  });

  useEffect(() => {
    const detectDevice = async () => {
      let totalMemory: number | null = null;
      let isOldDevice = false;

      try {
        // Expo Device API
        totalMemory = await Device.totalMemory;

        // 기기 모델 기반 판단 (iOS)
        if (Platform.OS === 'ios') {
          const modelName = Device.modelName || '';

          // iPhone 7/8 이하
          isOldDevice = /iPhone (7|8|SE|6|5)/.test(modelName);
        }

        // Android
        if (Platform.OS === 'android') {
          // RAM 2GB 이하 저사양
          isOldDevice = (totalMemory || 0) < 2 * 1024 * 1024 * 1024;
        }
      } catch (error) {
        console.log('Device info not available');
      }

      // 티어 결정
      let tier: PerformanceTier = 'high';

      if (isOldDevice || (totalMemory && totalMemory < 3 * 1024 * 1024 * 1024)) {
        tier = 'low';
      } else if (totalMemory && totalMemory < 6 * 1024 * 1024 * 1024) {
        tier = 'medium';
      }

      setProfile({
        tier,
        totalMemory,
        screenDensity: PixelRatio.get(),
        cpuCores: null,
        isOldDevice,
      });
    };

    detectDevice();
  }, []);

  return profile;
}

// 런타임 성능 감지
function useRuntimePerformance() {
  const [measuredTier, setMeasuredTier] = useState<PerformanceTier | null>(null);

  const frameCount = useSharedValue(0);
  const jankCount = useSharedValue(0);
  const lastTime = useSharedValue(0);
  const measureComplete = useSharedValue(false);

  const finishMeasurement = useCallback((avgFrameTime: number, janks: number) => {
    let tier: PerformanceTier;

    if (avgFrameTime < 14 && janks < 3) {
      tier = 'high';
    } else if (avgFrameTime < 20 && janks < 10) {
      tier = 'medium';
    } else {
      tier = 'low';
    }

    setMeasuredTier(tier);
  }, []);

  // 60프레임 측정
  useFrameCallback((info) => {
    if (measureComplete.value) return;

    if (lastTime.value > 0) {
      const frameTime = (info.timestamp - lastTime.value) / 1000000;

      if (frameTime > 20) {
        jankCount.value++;
      }

      frameCount.value++;

      if (frameCount.value >= 60) {
        measureComplete.value = true;
        const avgTime = 1000 / 60; // 대략적 추정
        runOnJS(finishMeasurement)(avgTime, jankCount.value);
      }
    }

    lastTime.value = info.timestamp;
  }, measuredTier === null);

  return measuredTier;
}

export { useDeviceProfile, useRuntimePerformance, PerformanceTier };
```

### 2. 적응형 애니메이션 Context

```typescript
import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import Animated, {
  withTiming,
  withSpring,
  Easing,
  AnimationCallback,
} from 'react-native-reanimated';

type PerformanceTier = 'high' | 'medium' | 'low';

interface AnimationConfig {
  // 타이밍
  shortDuration: number;
  mediumDuration: number;
  longDuration: number;

  // Spring 설정
  useSpring: boolean;
  damping: number;
  stiffness: number;
  mass: number;

  // 효과
  enableShadows: boolean;
  enableBlur: boolean;
  enableRipples: boolean;
  maxParticles: number;

  // 품질
  skipAnimations: boolean;
}

const configByTier: Record<PerformanceTier, AnimationConfig> = {
  high: {
    shortDuration: 200,
    mediumDuration: 300,
    longDuration: 500,
    useSpring: true,
    damping: 15,
    stiffness: 150,
    mass: 1,
    enableShadows: true,
    enableBlur: true,
    enableRipples: true,
    maxParticles: 50,
    skipAnimations: false,
  },
  medium: {
    shortDuration: 150,
    mediumDuration: 250,
    longDuration: 400,
    useSpring: false,
    damping: 20,
    stiffness: 200,
    mass: 0.8,
    enableShadows: true,
    enableBlur: false,
    enableRipples: true,
    maxParticles: 20,
    skipAnimations: false,
  },
  low: {
    shortDuration: 100,
    mediumDuration: 150,
    longDuration: 250,
    useSpring: false,
    damping: 25,
    stiffness: 250,
    mass: 0.5,
    enableShadows: false,
    enableBlur: false,
    enableRipples: false,
    maxParticles: 0,
    skipAnimations: false,
  },
};

interface AdaptiveAnimationContextValue {
  tier: PerformanceTier;
  config: AnimationConfig;
  animate: (
    value: Animated.SharedValue<number>,
    toValue: number,
    callback?: AnimationCallback
  ) => void;
  timing: (
    value: Animated.SharedValue<number>,
    toValue: number,
    duration?: 'short' | 'medium' | 'long'
  ) => void;
}

const AdaptiveAnimationContext = createContext<AdaptiveAnimationContextValue | null>(null);

// Provider
function AdaptiveAnimationProvider({
  tier,
  children,
}: {
  tier: PerformanceTier;
  children: ReactNode;
}) {
  const config = configByTier[tier];

  const value = useMemo<AdaptiveAnimationContextValue>(() => ({
    tier,
    config,
    animate: (sharedValue, toValue, callback) => {
      if (config.skipAnimations) {
        sharedValue.value = toValue;
        callback?.(true);
        return;
      }

      if (config.useSpring) {
        sharedValue.value = withSpring(toValue, {
          damping: config.damping,
          stiffness: config.stiffness,
          mass: config.mass,
        }, callback);
      } else {
        sharedValue.value = withTiming(toValue, {
          duration: config.mediumDuration,
          easing: Easing.out(Easing.quad),
        }, callback);
      }
    },
    timing: (sharedValue, toValue, duration = 'medium') => {
      const durationMs = duration === 'short' ? config.shortDuration :
                        duration === 'long' ? config.longDuration :
                        config.mediumDuration;

      sharedValue.value = withTiming(toValue, {
        duration: durationMs,
        easing: Easing.out(Easing.quad),
      });
    },
  }), [tier, config]);

  return (
    <AdaptiveAnimationContext.Provider value={value}>
      {children}
    </AdaptiveAnimationContext.Provider>
  );
}

// Hook
function useAdaptiveAnimation() {
  const context = useContext(AdaptiveAnimationContext);
  if (!context) {
    throw new Error('useAdaptiveAnimation must be used within AdaptiveAnimationProvider');
  }
  return context;
}

export {
  AdaptiveAnimationProvider,
  useAdaptiveAnimation,
  configByTier,
  AnimationConfig,
};
```

### 3. 적응형 컴포넌트

```typescript
import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useAdaptiveAnimation } from './AdaptiveAnimationContext';

// 적응형 카드 컴포넌트
const AdaptiveCard = memo(function AdaptiveCard({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress?: () => void;
}) {
  const { config, animate } = useAdaptiveAnimation();
  const scale = useSharedValue(1);
  const elevation = useSharedValue(4);

  const handlePressIn = () => {
    animate(scale, 0.98);
    if (config.enableShadows) {
      animate(elevation, 2);
    }
  };

  const handlePressOut = () => {
    animate(scale, 1);
    if (config.enableShadows) {
      animate(elevation, 4);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    const shadowStyle: ViewStyle = config.enableShadows ? {
      shadowOpacity: interpolate(
        elevation.value,
        [2, 4],
        [0.1, 0.15],
        Extrapolation.CLAMP
      ),
      shadowRadius: elevation.value,
      elevation: elevation.value,
    } : {};

    return {
      transform: [{ scale: scale.value }],
      ...shadowStyle,
    };
  });

  const staticShadowStyle = config.enableShadows ? {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  } : {};

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[
        styles.card,
        staticShadowStyle,
        animatedStyle,
      ]}>
        {children}
      </Animated.View>
    </Pressable>
  );
});

// 적응형 버튼
const AdaptiveButton = memo(function AdaptiveButton({
  title,
  onPress,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}) {
  const { config, animate, timing } = useAdaptiveAnimation();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    timing(scale, 0.96, 'short');
    timing(opacity, 0.8, 'short');
  };

  const handlePressOut = () => {
    animate(scale, 1);
    timing(opacity, 1, 'short');
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const buttonStyle = variant === 'primary' ? styles.primaryButton : styles.secondaryButton;
  const textStyle = variant === 'primary' ? styles.primaryText : styles.secondaryText;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[buttonStyle, animatedStyle]}>
        <Text style={textStyle}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
});

// 적응형 리플 효과
function AdaptiveRipple({
  x,
  y,
  onComplete,
}: {
  x: number;
  y: number;
  onComplete: () => void;
}) {
  const { config } = useAdaptiveAnimation();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0.3);

  if (!config.enableRipples) {
    // 저사양: 리플 없이 즉시 완료
    React.useEffect(() => {
      onComplete();
    }, [onComplete]);
    return null;
  }

  React.useEffect(() => {
    scale.value = withTiming(1, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onComplete)();
    });
  }, [scale, opacity, onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x - 50 },
      { translateY: y - 50 },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.ripple, animatedStyle]} />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: '#7A4AE2',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#7A4AE2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: '#7A4AE2',
    fontSize: 16,
    fontWeight: '600',
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(122, 74, 226, 0.3)',
  },
});

export { AdaptiveCard, AdaptiveButton, AdaptiveRipple };
```

### 4. 폴백 애니메이션 시스템

```typescript
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

type PerformanceTier = 'high' | 'medium' | 'low';

// 폴백 애니메이션 팩토리
function createFallbackAnimation(tier: PerformanceTier) {
  return {
    // 페이드 인
    fadeIn: (value: Animated.SharedValue<number>) => {
      switch (tier) {
        case 'high':
          value.value = 0;
          value.value = withSpring(1, { damping: 15 });
          break;
        case 'medium':
          value.value = 0;
          value.value = withTiming(1, { duration: 200 });
          break;
        case 'low':
          value.value = 1; // 즉시 표시
          break;
      }
    },

    // 페이드 아웃
    fadeOut: (value: Animated.SharedValue<number>, callback?: () => void) => {
      const onComplete = callback ? () => runOnJS(callback)() : undefined;

      switch (tier) {
        case 'high':
          value.value = withSpring(0, { damping: 15 }, onComplete);
          break;
        case 'medium':
          value.value = withTiming(0, { duration: 150 }, onComplete);
          break;
        case 'low':
          value.value = 0;
          callback?.();
          break;
      }
    },

    // 스케일 바운스
    bounce: (value: Animated.SharedValue<number>) => {
      switch (tier) {
        case 'high':
          value.value = withSequence(
            withSpring(1.1, { damping: 10 }),
            withSpring(0.95, { damping: 10 }),
            withSpring(1, { damping: 12 })
          );
          break;
        case 'medium':
          value.value = withSequence(
            withTiming(1.05, { duration: 100 }),
            withTiming(1, { duration: 100 })
          );
          break;
        case 'low':
          // 바운스 없음
          break;
      }
    },

    // 슬라이드 인
    slideIn: (
      value: Animated.SharedValue<number>,
      from: number,
      to: number
    ) => {
      value.value = from;

      switch (tier) {
        case 'high':
          value.value = withSpring(to, {
            damping: 20,
            stiffness: 150,
          });
          break;
        case 'medium':
          value.value = withTiming(to, {
            duration: 250,
            easing: Easing.out(Easing.cubic),
          });
          break;
        case 'low':
          value.value = withTiming(to, {
            duration: 150,
            easing: Easing.out(Easing.quad),
          });
          break;
      }
    },

    // 회전
    rotate: (value: Animated.SharedValue<number>, degrees: number) => {
      switch (tier) {
        case 'high':
          value.value = withSpring(degrees, { damping: 15 });
          break;
        case 'medium':
        case 'low':
          value.value = withTiming(degrees, { duration: 200 });
          break;
      }
    },
  };
}

// 폴백 애니메이션 훅
function useFallbackAnimation(tier: PerformanceTier) {
  const animations = useCallback(() => createFallbackAnimation(tier), [tier]);
  return animations();
}

// 사용 예시: 폴백 로딩 스피너
function FallbackSpinner({ tier }: { tier: PerformanceTier }) {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (tier === 'low') {
      // 저사양: 정적 인디케이터 또는 단순 펄스
      return;
    }

    rotation.value = withTiming(360, {
      duration: tier === 'high' ? 1000 : 1500,
      easing: Easing.linear,
    });

    const interval = setInterval(() => {
      rotation.value = 0;
      rotation.value = withTiming(360, {
        duration: tier === 'high' ? 1000 : 1500,
        easing: Easing.linear,
      });
    }, tier === 'high' ? 1000 : 1500);

    return () => clearInterval(interval);
  }, [tier, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  if (tier === 'low') {
    // 저사양: 정적 로딩 표시
    return (
      <View style={styles.staticSpinner}>
        <View style={styles.staticDot} />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.spinner, animatedStyle]}>
      <View style={styles.spinnerArc} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  spinner: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerArc: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#7A4AE2',
  },
  staticSpinner: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E2D5FF',
    borderRadius: 20,
  },
  staticDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7A4AE2',
  },
});

export { createFallbackAnimation, useFallbackAnimation, FallbackSpinner };
```

### 5. 성능 모니터링 및 자동 조절

```typescript
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useFrameCallback,
  runOnJS,
} from 'react-native-reanimated';

type PerformanceTier = 'high' | 'medium' | 'low';

interface PerformanceState {
  currentTier: PerformanceTier;
  averageFps: number;
  jankPercentage: number;
  isAutoAdjusting: boolean;
}

// 자동 성능 조절
function useAutoPerformanceAdjustment(
  initialTier: PerformanceTier = 'high'
) {
  const [state, setState] = useState<PerformanceState>({
    currentTier: initialTier,
    averageFps: 60,
    jankPercentage: 0,
    isAutoAdjusting: true,
  });

  const frameTimesRef = useRef<number[]>([]);
  const lastTimeRef = useSharedValue(0);
  const measurementWindow = 120; // 2초 (60fps 기준)

  const adjustTier = useCallback((fps: number, jankPercent: number) => {
    setState(prev => {
      let newTier = prev.currentTier;

      // 성능 하락 감지 - 티어 다운그레이드
      if (fps < 45 || jankPercent > 15) {
        if (prev.currentTier === 'high') {
          newTier = 'medium';
        } else if (prev.currentTier === 'medium') {
          newTier = 'low';
        }
      }
      // 성능 안정 - 티어 업그레이드 (보수적으로)
      else if (fps > 55 && jankPercent < 5) {
        if (prev.currentTier === 'low') {
          newTier = 'medium';
        } else if (prev.currentTier === 'medium') {
          // 고사양으로 복구는 더 엄격하게
          if (fps > 58 && jankPercent < 2) {
            newTier = 'high';
          }
        }
      }

      if (newTier !== prev.currentTier) {
        console.log(`[AutoPerf] Tier changed: ${prev.currentTier} → ${newTier}`);
      }

      return {
        ...prev,
        currentTier: newTier,
        averageFps: fps,
        jankPercentage: jankPercent,
      };
    });
  }, []);

  useFrameCallback((info) => {
    if (!state.isAutoAdjusting) return;

    const currentTime = info.timestamp;

    if (lastTimeRef.value > 0) {
      const frameTime = (currentTime - lastTimeRef.value) / 1000000;
      frameTimesRef.current.push(frameTime);

      if (frameTimesRef.current.length >= measurementWindow) {
        const times = frameTimesRef.current;
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const jankFrames = times.filter(t => t > 20).length;

        const fps = Math.round(1000 / avgTime);
        const jankPercent = (jankFrames / times.length) * 100;

        runOnJS(adjustTier)(fps, jankPercent);

        frameTimesRef.current = [];
      }
    }

    lastTimeRef.value = currentTime;
  }, state.isAutoAdjusting);

  const setAutoAdjusting = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, isAutoAdjusting: enabled }));
  }, []);

  const forceTier = useCallback((tier: PerformanceTier) => {
    setState(prev => ({
      ...prev,
      currentTier: tier,
      isAutoAdjusting: false,
    }));
  }, []);

  return {
    ...state,
    setAutoAdjusting,
    forceTier,
  };
}

// 성능 상태 표시 컴포넌트
function PerformanceIndicator({
  state,
}: {
  state: PerformanceState;
}) {
  if (!__DEV__) return null;

  const tierColors = {
    high: '#4CAF50',
    medium: '#FFC107',
    low: '#F44336',
  };

  return (
    <View style={styles.indicator}>
      <View style={[
        styles.tierBadge,
        { backgroundColor: tierColors[state.currentTier] }
      ]}>
        <Text style={styles.tierText}>
          {state.currentTier.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.fpsText}>{state.averageFps} FPS</Text>
      <Text style={styles.jankText}>
        Jank: {state.jankPercentage.toFixed(1)}%
      </Text>
      {state.isAutoAdjusting && (
        <Text style={styles.autoText}>AUTO</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    top: 50,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'flex-start',
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  tierText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  fpsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  jankText: {
    color: '#999',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  autoText: {
    color: '#4CAF50',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export { useAutoPerformanceAdjustment, PerformanceIndicator };
```

## sometimes-app 적용 사례

### 매칭 카드 스와이프 최적화

```typescript
// src/features/matching/ui/adaptive-swipe-card.tsx
import React, { memo, useCallback } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useAdaptiveAnimation } from '../hooks/useAdaptiveAnimation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface Profile {
  id: string;
  name: string;
  age: number;
  imageUrl: string;
  university: string;
}

interface AdaptiveSwipeCardProps {
  profile: Profile;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export const AdaptiveSwipeCard = memo(function AdaptiveSwipeCard({
  profile,
  onSwipeLeft,
  onSwipeRight,
}: AdaptiveSwipeCardProps) {
  const { tier, config, animate } = useAdaptiveAnimation();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const handleSwipeComplete = useCallback((direction: 'left' | 'right') => {
    if (direction === 'left') {
      onSwipeLeft();
    } else {
      onSwipeRight();
    }
  }, [onSwipeLeft, onSwipeRight]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // 고사양에서만 스케일 효과
      if (tier === 'high') {
        scale.value = withSpring(1.02, { damping: 20 });
      }
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;

      // 저사양에서는 Y축 이동 제한
      if (tier !== 'low') {
        translateY.value = event.translationY * 0.5;
      }

      // 회전 계산 (저사양에서는 비활성화)
      if (tier !== 'low') {
        rotation.value = event.translationX / 20;
      }
    })
    .onEnd((event) => {
      const shouldSwipeRight = translateX.value > SWIPE_THRESHOLD;
      const shouldSwipeLeft = translateX.value < -SWIPE_THRESHOLD;

      if (shouldSwipeRight || shouldSwipeLeft) {
        const direction = shouldSwipeRight ? 'right' : 'left';
        const targetX = shouldSwipeRight ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;

        // 티어에 따른 스와이프 아웃 애니메이션
        if (tier === 'high') {
          translateX.value = withSpring(targetX, {
            damping: 15,
            stiffness: 100,
          }, () => {
            runOnJS(handleSwipeComplete)(direction);
          });
        } else {
          translateX.value = withTiming(targetX, {
            duration: config.mediumDuration,
          }, () => {
            runOnJS(handleSwipeComplete)(direction);
          });
        }
      } else {
        // 리셋
        if (tier === 'high') {
          translateX.value = withSpring(0, { damping: 15 });
          translateY.value = withSpring(0, { damping: 15 });
          rotation.value = withSpring(0, { damping: 15 });
        } else {
          translateX.value = withTiming(0, { duration: config.shortDuration });
          translateY.value = withTiming(0, { duration: config.shortDuration });
          rotation.value = 0;
        }
      }

      if (tier === 'high') {
        scale.value = withSpring(1);
      } else {
        scale.value = 1;
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const baseTransform = [
      { translateX: translateX.value },
      { scale: scale.value },
    ];

    // 티어에 따른 추가 효과
    if (tier !== 'low') {
      baseTransform.push(
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` }
      );
    }

    return {
      transform: baseTransform,
    };
  });

  // Like/Nope 오버레이 (중/고사양만)
  const likeOpacity = useAnimatedStyle(() => {
    if (tier === 'low') return { opacity: 0 };

    return {
      opacity: interpolate(
        translateX.value,
        [0, SWIPE_THRESHOLD],
        [0, 1],
        Extrapolation.CLAMP
      ),
    };
  });

  const nopeOpacity = useAnimatedStyle(() => {
    if (tier === 'low') return { opacity: 0 };

    return {
      opacity: interpolate(
        translateX.value,
        [-SWIPE_THRESHOLD, 0],
        [1, 0],
        Extrapolation.CLAMP
      ),
    };
  });

  // 그림자 스타일 (고사양만)
  const shadowStyle = config.enableShadows ? {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  } : {};

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, shadowStyle, cardStyle]}>
        <Image
          source={{ uri: profile.imageUrl }}
          style={styles.image}
          // 저사양에서는 낮은 품질
          resizeMethod={tier === 'low' ? 'resize' : 'auto'}
        />

        {/* Like/Nope 오버레이 */}
        {tier !== 'low' && (
          <>
            <Animated.View style={[styles.likeOverlay, likeOpacity]}>
              <Text style={styles.likeText}>LIKE</Text>
            </Animated.View>
            <Animated.View style={[styles.nopeOverlay, nopeOpacity]}>
              <Text style={styles.nopeText}>NOPE</Text>
            </Animated.View>
          </>
        )}

        {/* 프로필 정보 */}
        <View style={styles.info}>
          <Text style={styles.name}>{profile.name}, {profile.age}</Text>
          <Text style={styles.university}>{profile.university}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 1.3,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  likeOverlay: {
    position: 'absolute',
    top: 40,
    left: 30,
    borderWidth: 4,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 10,
    transform: [{ rotate: '-15deg' }],
  },
  likeText: {
    color: '#4CAF50',
    fontSize: 32,
    fontWeight: 'bold',
  },
  nopeOverlay: {
    position: 'absolute',
    top: 40,
    right: 30,
    borderWidth: 4,
    borderColor: '#F44336',
    borderRadius: 8,
    padding: 10,
    transform: [{ rotate: '15deg' }],
  },
  nopeText: {
    color: '#F44336',
    fontSize: 32,
    fontWeight: 'bold',
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  university: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginTop: 4,
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 1. 기기 감지 타이밍

```typescript
// ❌ 렌더링 중 감지 (성능 저하)
function Component() {
  const tier = detectDeviceTier(); // 매 렌더마다 실행!
  return <View />;
}

// ✅ 초기화 시 한 번만
function Component() {
  const [tier, setTier] = useState<PerformanceTier>('high');

  useEffect(() => {
    detectDeviceTier().then(setTier);
  }, []);

  return <View />;
}
```

### 2. 조건부 훅 사용

```typescript
// ❌ 조건부 훅 (React 규칙 위반)
function Component({ tier }) {
  if (tier === 'high') {
    const spring = useSharedValue(0); // 규칙 위반!
  }
}

// ✅ 항상 훅 호출, 조건부 사용
function Component({ tier }) {
  const spring = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: tier === 'high'
      ? [{ scale: spring.value }]
      : [],
  }));
}
```

### 3. 폴백 없는 기능

```typescript
// ❌ 저사양에서 깨지는 UI
if (tier === 'high') {
  return <FancyAnimation />;
}
// tier가 'low'일 때 아무것도 렌더링 안 됨!

// ✅ 항상 폴백 제공
if (tier === 'high') {
  return <FancyAnimation />;
} else if (tier === 'medium') {
  return <SimpleAnimation />;
} else {
  return <StaticFallback />;
}
```

## 💡 성능 최적화 팁

### 1. 티어별 기능 매트릭스

```typescript
const featureMatrix = {
  high: {
    springAnimations: true,
    shadows: true,
    blur: true,
    particles: 50,
    ripples: 3,
  },
  medium: {
    springAnimations: false,
    shadows: true,
    blur: false,
    particles: 10,
    ripples: 1,
  },
  low: {
    springAnimations: false,
    shadows: false,
    blur: false,
    particles: 0,
    ripples: 0,
  },
};
```

### 2. 점진적 로딩

```typescript
// 저사양에서는 필수 기능만 먼저 로드
async function loadFeatures(tier: PerformanceTier) {
  // 핵심 기능
  await loadCoreFeatures();

  if (tier !== 'low') {
    // 중간 기능
    await loadEnhancedFeatures();
  }

  if (tier === 'high') {
    // 고급 기능
    await loadPremiumFeatures();
  }
}
```

## 📚 이 장에서 배운 내용

1. **기기 티어 분류**: High, Medium, Low 성능 기준
2. **점진적 기능 저하**: 성능에 따른 기능 축소 전략
3. **적응형 Context**: 티어별 애니메이션 설정 관리
4. **폴백 시스템**: 저사양 기기용 대체 애니메이션
5. **자동 조절**: 런타임 성능 감지 및 티어 조정
6. **기능 매트릭스**: 티어별 기능 활성화 관리

## 다음 장 예고

**Chapter 62: 애니메이션 디버깅**에서는 Reanimated 애니메이션의 문제를 효과적으로 찾고 해결하는 방법을 배웁니다. 디버깅 도구, 로깅 전략, 흔한 버그 패턴과 해결책을 다룹니다.
