# Chapter 60: 배터리 효율

모바일 기기의 배터리를 효율적으로 사용하면서 부드러운 애니메이션을 유지하는 방법을 배웁니다.

## 📌 학습 목표

- 애니메이션이 배터리 소모에 미치는 영향 이해
- 백그라운드 상태에서 애니메이션 최적화
- 적응형 프레임 레이트 구현
- 전력 효율적인 애니메이션 패턴 습득

## 📖 개념 이해

### 배터리 소모 요인

```
┌─────────────────────────────────────────────────────────────┐
│                Battery Drain Factors                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              GPU 사용량 (높음)                       │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ • 복잡한 그래픽 렌더링                               │    │
│  │ • 그라데이션, 그림자, 블러 효과                      │    │
│  │ • 큰 이미지 처리                                     │    │
│  │ • 고해상도 애니메이션                                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              CPU 사용량 (중간)                       │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ • JS Thread 계산                                     │    │
│  │ • 복잡한 레이아웃 계산                               │    │
│  │ • 빈번한 리렌더링                                    │    │
│  │ • 무거운 Worklet 함수                                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              화면 갱신 빈도 (높음)                   │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ • 60fps = 초당 60회 화면 업데이트                    │    │
│  │ • 무한 반복 애니메이션                               │    │
│  │ • 백그라운드에서도 실행되는 애니메이션               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 앱 상태와 애니메이션

```
┌─────────────────────────────────────────────────────────────┐
│                  App State Lifecycle                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Active (포그라운드)                                         │
│  ┌─────────────────┐                                        │
│  │ • 모든 애니메이션 정상 실행                              │
│  │ • 60fps 목표                                             │
│  │ • 사용자 인터랙션 반응                                   │
│  └─────────────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  Inactive (전환 중)                                          │
│  ┌─────────────────┐                                        │
│  │ • 알림 센터 열림                                         │
│  │ • 앱 스위처 표시                                         │
│  │ • 애니메이션 일시 정지 가능                              │
│  └─────────────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  Background                                                  │
│  ┌─────────────────┐                                        │
│  │ • 모든 시각적 애니메이션 정지 필수                       │
│  │ • 리소스 해제                                            │
│  │ • 타이머/인터벌 정리                                     │
│  └─────────────────┘                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 코드 예제

### 1. 앱 상태 기반 애니메이션 제어

```typescript
import React, { useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, AppState, AppStateStatus } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  withSpring,
} from 'react-native-reanimated';

// 앱 상태 기반 애니메이션 훅
function useAppStateAnimation<T extends number>(
  initialValue: T,
  options?: {
    pauseOnBackground?: boolean;
    pauseOnInactive?: boolean;
  }
) {
  const { pauseOnBackground = true, pauseOnInactive = false } = options || {};

  const value = useSharedValue(initialValue);
  const savedValue = useRef(initialValue);
  const isAnimating = useRef(false);
  const currentAnimation = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      const shouldPause =
        (pauseOnBackground && nextState === 'background') ||
        (pauseOnInactive && nextState === 'inactive');

      if (shouldPause && isAnimating.current) {
        // 현재 값 저장 후 정지
        savedValue.current = value.value as T;
        cancelAnimation(value);
        isAnimating.current = false;
      } else if (nextState === 'active' && !isAnimating.current) {
        // 복원
        if (currentAnimation.current) {
          currentAnimation.current();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [pauseOnBackground, pauseOnInactive, value]);

  const animate = useCallback((animation: () => void) => {
    currentAnimation.current = animation;
    isAnimating.current = true;
    animation();
  }, []);

  const stop = useCallback(() => {
    cancelAnimation(value);
    isAnimating.current = false;
    currentAnimation.current = null;
  }, [value]);

  return {
    value,
    animate,
    stop,
    isAnimating: isAnimating.current,
  };
}

// 사용 예시: 로딩 스피너
function BatteryEfficientSpinner() {
  const { value: rotation, animate, stop } = useAppStateAnimation(0, {
    pauseOnBackground: true,
    pauseOnInactive: true,
  });

  useEffect(() => {
    animate(() => {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false
      );
    });

    return () => stop();
  }, [animate, rotation, stop]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.spinner, animatedStyle]}>
      <View style={styles.spinnerDot} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  spinner: {
    width: 40,
    height: 40,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  spinnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7A4AE2',
  },
});
```

### 2. 가시성 기반 애니메이션

```typescript
import React, { useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// 화면에 보일 때만 애니메이션 실행
function useVisibilityAnimation() {
  const isVisible = useSharedValue(false);
  const animatedValues = useRef<Animated.SharedValue<number>[]>([]);

  const registerValue = useCallback((value: Animated.SharedValue<number>) => {
    animatedValues.current.push(value);
  }, []);

  const pauseAll = useCallback(() => {
    animatedValues.current.forEach(v => cancelAnimation(v));
  }, []);

  const setVisibility = useCallback((visible: boolean) => {
    isVisible.value = visible;
    if (!visible) {
      pauseAll();
    }
  }, [isVisible, pauseAll]);

  return {
    isVisible,
    setVisibility,
    registerValue,
    pauseAll,
  };
}

// IntersectionObserver 유사 훅
function useOnScreen(
  callback: (isVisible: boolean) => void,
  threshold: number = 0.5
) {
  const viewRef = useRef<View>(null);
  const isVisibleRef = useRef(false);

  const checkVisibility = useCallback(() => {
    viewRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const viewTop = pageY;
      const viewBottom = pageY + height;
      const screenTop = 0;
      const screenBottom = SCREEN_HEIGHT;

      const visibleHeight = Math.min(viewBottom, screenBottom) -
                           Math.max(viewTop, screenTop);
      const visibleRatio = Math.max(0, visibleHeight / height);

      const isVisible = visibleRatio >= threshold;

      if (isVisible !== isVisibleRef.current) {
        isVisibleRef.current = isVisible;
        callback(isVisible);
      }
    });
  }, [callback, threshold]);

  return { viewRef, checkVisibility };
}

// 화면에 보일 때만 애니메이션하는 카드
function VisibilityAwareCard({ index }: { index: number }) {
  const pulse = useSharedValue(1);
  const opacity = useSharedValue(0.5);
  const isAnimating = useRef(false);

  const startAnimation = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    pulse.value = withRepeat(
      withTiming(1.05, { duration: 1500 }),
      -1,
      true
    );
    opacity.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    );
  }, [pulse, opacity]);

  const stopAnimation = useCallback(() => {
    if (!isAnimating.current) return;
    isAnimating.current = false;

    cancelAnimation(pulse);
    cancelAnimation(opacity);
    pulse.value = 1;
    opacity.value = 0.5;
  }, [pulse, opacity]);

  const handleVisibilityChange = useCallback((isVisible: boolean) => {
    if (isVisible) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }, [startAnimation, stopAnimation]);

  const { viewRef, checkVisibility } = useOnScreen(handleVisibilityChange, 0.3);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: opacity.value,
  }));

  // 초기 가시성 체크
  useEffect(() => {
    const timer = setTimeout(checkVisibility, 100);
    return () => clearTimeout(timer);
  }, [checkVisibility]);

  return (
    <View ref={viewRef} onLayout={checkVisibility}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {/* 카드 내용 */}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 200,
    backgroundColor: '#7A4AE2',
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
});
```

### 3. 적응형 프레임 레이트

```typescript
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import * as Battery from 'expo-battery'; // Expo 사용 시

type QualityLevel = 'high' | 'medium' | 'low';

interface AnimationConfig {
  duration: number;
  useSpring: boolean;
  damping: number;
  stiffness: number;
}

// 배터리 상태 기반 품질 조절
function useAdaptiveAnimation() {
  const [quality, setQuality] = useState<QualityLevel>('high');
  const [batteryLevel, setBatteryLevel] = useState(1);
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    let subscription: any;

    const checkBattery = async () => {
      if (Platform.OS === 'web') {
        setQuality('high');
        return;
      }

      try {
        const level = await Battery.getBatteryLevelAsync();
        const state = await Battery.getBatteryStateAsync();

        setBatteryLevel(level);
        setIsCharging(state === Battery.BatteryState.CHARGING);

        // 배터리 레벨에 따른 품질 결정
        if (state === Battery.BatteryState.CHARGING) {
          setQuality('high');
        } else if (level > 0.5) {
          setQuality('high');
        } else if (level > 0.2) {
          setQuality('medium');
        } else {
          setQuality('low');
        }
      } catch (error) {
        // 배터리 정보 없을 시 기본값
        setQuality('high');
      }
    };

    checkBattery();

    // 배터리 상태 변화 구독
    const setupSubscription = async () => {
      subscription = Battery.addBatteryStateListener(({ batteryState }) => {
        checkBattery();
      });
    };

    setupSubscription();

    return () => {
      subscription?.remove();
    };
  }, []);

  const getConfig = useCallback((): AnimationConfig => {
    switch (quality) {
      case 'high':
        return {
          duration: 300,
          useSpring: true,
          damping: 15,
          stiffness: 150,
        };
      case 'medium':
        return {
          duration: 200,
          useSpring: false,
          damping: 20,
          stiffness: 200,
        };
      case 'low':
        return {
          duration: 150,
          useSpring: false,
          damping: 25,
          stiffness: 250,
        };
    }
  }, [quality]);

  const animate = useCallback((
    value: Animated.SharedValue<number>,
    toValue: number
  ) => {
    const config = getConfig();

    if (config.useSpring) {
      value.value = withSpring(toValue, {
        damping: config.damping,
        stiffness: config.stiffness,
      });
    } else {
      value.value = withTiming(toValue, {
        duration: config.duration,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [getConfig]);

  return {
    quality,
    batteryLevel,
    isCharging,
    getConfig,
    animate,
  };
}

// 배터리 상태 표시 컴포넌트
function BatteryAwareAnimation() {
  const scale = useSharedValue(1);
  const { quality, batteryLevel, isCharging, animate } = useAdaptiveAnimation();

  const handlePress = () => {
    animate(scale, 1.2);
    setTimeout(() => animate(scale, 1), 300);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          Battery: {Math.round(batteryLevel * 100)}%
        </Text>
        <Text style={styles.statusText}>
          {isCharging ? '⚡ Charging' : '🔋'}
        </Text>
        <View style={[
          styles.qualityBadge,
          {
            backgroundColor:
              quality === 'high' ? '#4CAF50' :
              quality === 'medium' ? '#FFC107' : '#F44336'
          }
        ]}>
          <Text style={styles.qualityText}>
            {quality.toUpperCase()}
          </Text>
        </View>
      </View>

      <Animated.View
        style={[styles.animatedBox, animatedStyle]}
        onTouchEnd={handlePress}
      >
        <Text style={styles.boxText}>Tap Me</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 30,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  qualityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qualityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  animatedBox: {
    width: 150,
    height: 150,
    backgroundColor: '#7A4AE2',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
```

### 4. 저전력 모드 감지

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, NativeModules } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  cancelAnimation,
} from 'react-native-reanimated';

// 저전력 모드 감지 (iOS)
function useLowPowerMode() {
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    // Native Module 통해 저전력 모드 감지
    // 실제 구현에서는 Native Module 필요
    const checkLowPowerMode = async () => {
      try {
        // const lowPower = await NativeModules.LowPowerMode?.isEnabled();
        // setIsLowPowerMode(lowPower ?? false);
        setIsLowPowerMode(false); // 기본값
      } catch {
        setIsLowPowerMode(false);
      }
    };

    checkLowPowerMode();

    // 주기적 체크 (실제로는 이벤트 리스너 사용)
    const interval = setInterval(checkLowPowerMode, 5000);
    return () => clearInterval(interval);
  }, []);

  return isLowPowerMode;
}

// 저전력 모드 대응 애니메이션
function LowPowerAwareComponent() {
  const isLowPowerMode = useLowPowerMode();
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (isLowPowerMode) {
      // 저전력 모드: 애니메이션 단순화
      cancelAnimation(opacity);
      cancelAnimation(translateY);
      opacity.value = 1;
      translateY.value = 0;
    } else {
      // 일반 모드: 풀 애니메이션
      opacity.value = withRepeat(
        withTiming(0.6, { duration: 2000 }),
        -1,
        true
      );
      translateY.value = withRepeat(
        withTiming(-10, { duration: 1500 }),
        -1,
        true
      );
    }

    return () => {
      cancelAnimation(opacity);
      cancelAnimation(translateY);
    };
  }, [isLowPowerMode, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.container}>
      {isLowPowerMode && (
        <View style={styles.lowPowerBanner}>
          <Text style={styles.lowPowerText}>
            ⚡ Low Power Mode - Animations Simplified
          </Text>
        </View>
      )}

      <Animated.View style={[styles.floatingCard, animatedStyle]}>
        <Text style={styles.cardText}>Floating Card</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lowPowerBanner: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
  },
  lowPowerText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  floatingCard: {
    width: 200,
    height: 100,
    backgroundColor: '#7A4AE2',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7A4AE2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
```

### 5. 효율적인 무한 애니메이션

```typescript
import React, { useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, AppState } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

// 효율적인 무한 애니메이션 훅
function useEfficientInfiniteAnimation() {
  const rotation = useSharedValue(0);
  const isRunning = useRef(false);
  const appStateRef = useRef(AppState.currentState);

  const start = useCallback(() => {
    if (isRunning.current) return;
    isRunning.current = true;

    // 선형 회전 (Spring보다 효율적)
    rotation.value = 0;
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [rotation]);

  const stop = useCallback(() => {
    isRunning.current = false;
    cancelAnimation(rotation);
  }, [rotation]);

  const pause = useCallback(() => {
    cancelAnimation(rotation);
  }, [rotation]);

  const resume = useCallback(() => {
    if (!isRunning.current) return;

    // 현재 값에서 이어서 시작
    const currentRotation = rotation.value % 360;
    rotation.value = currentRotation;
    rotation.value = withRepeat(
      withTiming(currentRotation + 360, {
        duration: 2000 * (1 - currentRotation / 360),
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [rotation]);

  // 앱 상태 변화 처리
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (
        appStateRef.current.match(/active/) &&
        nextState.match(/inactive|background/)
      ) {
        pause();
      } else if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        resume();
      }
      appStateRef.current = nextState;
    });

    return () => {
      subscription.remove();
      stop();
    };
  }, [pause, resume, stop]);

  return { rotation, start, stop, pause, resume };
}

// 효율적인 로딩 인디케이터
function EfficientLoadingIndicator({ size = 40 }: { size?: number }) {
  const { rotation, start, stop } = useEfficientInfiniteAnimation();

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        styles.loader,
        { width: size, height: size },
        animatedStyle,
      ]}
    >
      <View style={[styles.loaderArc, { borderWidth: size / 10 }]} />
    </Animated.View>
  );
}

// 펄스 애니메이션 (효율적 버전)
function EfficientPulse({ children }: { children: React.ReactNode }) {
  const scale = useSharedValue(1);
  const isRunning = useRef(false);

  useEffect(() => {
    isRunning.current = true;

    // 단순한 시퀀스 (Spring 대신 Timing)
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        cancelAnimation(scale);
        scale.value = 1;
      } else if (state === 'active' && isRunning.current) {
        scale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1000 }),
            withTiming(1, { duration: 1000 })
          ),
          -1,
          false
        );
      }
    });

    return () => {
      isRunning.current = false;
      cancelAnimation(scale);
      subscription.remove();
    };
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderArc: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    borderColor: 'transparent',
    borderTopColor: '#7A4AE2',
  },
});

export { EfficientLoadingIndicator, EfficientPulse, useEfficientInfiniteAnimation };
```

## sometimes-app 적용 사례

### 매칭 대기 화면 배터리 최적화

```typescript
// src/features/matching/ui/battery-efficient-matching.tsx
import React, { useEffect, useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, AppState, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  cancelAnimation,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MatchingWaitProps {
  estimatedTime: number; // 초
  onMatch: () => void;
}

export function BatteryEfficientMatchingWait({
  estimatedTime,
  onMatch,
}: MatchingWaitProps) {
  const [quality, setQuality] = useState<'high' | 'low'>('high');

  // 애니메이션 값들
  const heartbeat = useSharedValue(1);
  const ripple1 = useSharedValue(0);
  const ripple2 = useSharedValue(0);
  const ripple3 = useSharedValue(0);
  const progress = useSharedValue(0);

  const isActiveRef = useRef(true);

  // 품질 감지
  useEffect(() => {
    // 3분 이상 대기 시 저품질 모드
    if (estimatedTime > 180) {
      setQuality('low');
    }
  }, [estimatedTime]);

  // 심장박동 애니메이션
  const startHeartbeat = useCallback(() => {
    if (quality === 'high') {
      heartbeat.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 300, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 300, easing: Easing.in(Easing.ease) }),
          withTiming(1.08, { duration: 250, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 650, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      // 저품질: 단순한 펄스
      heartbeat.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        false
      );
    }
  }, [heartbeat, quality]);

  // 리플 애니메이션
  const startRipples = useCallback(() => {
    if (quality === 'low') return; // 저품질에서는 리플 없음

    const createRipple = (value: Animated.SharedValue<number>, delay: number) => {
      setTimeout(() => {
        value.value = 0;
        value.value = withRepeat(
          withTiming(1, { duration: 2500, easing: Easing.out(Easing.ease) }),
          -1,
          false
        );
      }, delay);
    };

    createRipple(ripple1, 0);
    createRipple(ripple2, 800);
    createRipple(ripple3, 1600);
  }, [ripple1, ripple2, ripple3, quality]);

  // 진행률 애니메이션
  const startProgress = useCallback(() => {
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: estimatedTime * 1000,
      easing: Easing.linear,
    });
  }, [progress, estimatedTime]);

  // 모든 애니메이션 시작
  const startAllAnimations = useCallback(() => {
    if (!isActiveRef.current) return;
    startHeartbeat();
    startRipples();
    startProgress();
  }, [startHeartbeat, startRipples, startProgress]);

  // 모든 애니메이션 정지
  const stopAllAnimations = useCallback(() => {
    cancelAnimation(heartbeat);
    cancelAnimation(ripple1);
    cancelAnimation(ripple2);
    cancelAnimation(ripple3);

    // 프로그레스는 유지 (재개 시 이어서)
  }, [heartbeat, ripple1, ripple2, ripple3]);

  // 앱 상태 관리
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        isActiveRef.current = true;
        startAllAnimations();
      } else {
        isActiveRef.current = false;
        stopAllAnimations();
      }
    });

    startAllAnimations();

    return () => {
      stopAllAnimations();
      cancelAnimation(progress);
      subscription.remove();
    };
  }, [startAllAnimations, stopAllAnimations, progress]);

  // 스타일들
  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartbeat.value }],
  }));

  const createRippleStyle = (value: Animated.SharedValue<number>) => {
    return useAnimatedStyle(() => ({
      transform: [{ scale: interpolate(value.value, [0, 1], [1, 2.5]) }],
      opacity: interpolate(value.value, [0, 0.5, 1], [0.6, 0.3, 0]),
    }));
  };

  const ripple1Style = createRippleStyle(ripple1);
  const ripple2Style = createRippleStyle(ripple2);
  const ripple3Style = createRippleStyle(ripple3);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      {/* 품질 표시 */}
      {quality === 'low' && (
        <View style={styles.lowPowerBadge}>
          <Text style={styles.lowPowerText}>절전 모드</Text>
        </View>
      )}

      {/* 중앙 심장 */}
      <View style={styles.heartContainer}>
        {/* 리플 (고품질에서만) */}
        {quality === 'high' && (
          <>
            <Animated.View style={[styles.ripple, ripple1Style]} />
            <Animated.View style={[styles.ripple, ripple2Style]} />
            <Animated.View style={[styles.ripple, ripple3Style]} />
          </>
        )}

        <Animated.View style={[styles.heart, heartStyle]}>
          <Text style={styles.heartEmoji}>💜</Text>
        </Animated.View>
      </View>

      {/* 진행률 바 */}
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, progressStyle]} />
      </View>

      <Text style={styles.waitText}>
        상대방을 찾고 있어요...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  lowPowerBadge: {
    position: 'absolute',
    top: 50,
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  lowPowerText: {
    color: '#856404',
    fontSize: 12,
    fontWeight: '600',
  },
  heartContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E2D5FF',
  },
  heart: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7A4AE2',
    borderRadius: 40,
  },
  heartEmoji: {
    fontSize: 40,
  },
  progressContainer: {
    width: SCREEN_WIDTH * 0.6,
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    marginTop: 40,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#7A4AE2',
    borderRadius: 2,
  },
  waitText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 1. 백그라운드에서 무한 루프

```typescript
// ❌ 백그라운드에서도 계속 실행
useEffect(() => {
  rotation.value = withRepeat(withTiming(360), -1);
}, []);

// ✅ 앱 상태 확인
useEffect(() => {
  const subscription = AppState.addEventListener('change', (state) => {
    if (state !== 'active') {
      cancelAnimation(rotation);
    } else {
      rotation.value = withRepeat(withTiming(360), -1);
    }
  });

  rotation.value = withRepeat(withTiming(360), -1);

  return () => {
    cancelAnimation(rotation);
    subscription.remove();
  };
}, []);
```

### 2. 불필요한 Spring 사용

```typescript
// ❌ 단순 회전에 Spring (오버헤드)
rotation.value = withRepeat(
  withSpring(360), // 불필요한 물리 계산
  -1
);

// ✅ 선형 Timing 사용
rotation.value = withRepeat(
  withTiming(360, { easing: Easing.linear }),
  -1
);
```

### 3. 다중 리스너 등록

```typescript
// ❌ 매 렌더마다 리스너 추가
AppState.addEventListener('change', handleChange);

// ✅ useEffect로 정리
useEffect(() => {
  const subscription = AppState.addEventListener('change', handleChange);
  return () => subscription.remove();
}, []);
```

## 💡 성능 최적화 팁

### 1. 애니메이션 복잡도 단계

```typescript
const animationComplexity = {
  high: {
    useSpring: true,
    rippleCount: 3,
    shadowEnabled: true,
  },
  medium: {
    useSpring: false,
    rippleCount: 1,
    shadowEnabled: false,
  },
  low: {
    useSpring: false,
    rippleCount: 0,
    shadowEnabled: false,
  },
};
```

### 2. 지연 시작

```typescript
// 화면 진입 후 약간의 지연 후 애니메이션 시작
useEffect(() => {
  const timer = setTimeout(() => {
    startAnimation();
  }, 300); // 레이아웃 완료 후

  return () => clearTimeout(timer);
}, []);
```

### 3. 배치 업데이트

```typescript
// 여러 값을 한 번에 업데이트
const stopAll = () => {
  cancelAnimation(value1);
  cancelAnimation(value2);
  cancelAnimation(value3);
  value1.value = 0;
  value2.value = 0;
  value3.value = 0;
};
```

## 📚 이 장에서 배운 내용

1. **배터리 소모 요인**: GPU, CPU, 화면 갱신 빈도의 영향
2. **앱 상태 관리**: Active, Inactive, Background 상태 처리
3. **가시성 기반 제어**: 화면에 보일 때만 애니메이션 실행
4. **적응형 품질**: 배터리 상태에 따른 애니메이션 품질 조절
5. **저전력 모드**: 시스템 저전력 모드 감지 및 대응
6. **효율적 패턴**: Spring 대신 Timing, 단순한 Easing 사용

## 다음 장 예고

**Chapter 61: 저사양 기기 대응**에서는 다양한 성능의 기기에서 일관된 애니메이션 경험을 제공하는 방법을 배웁니다. 기기 성능 감지, 점진적 기능 저하, 폴백 애니메이션 전략을 다룹니다.
