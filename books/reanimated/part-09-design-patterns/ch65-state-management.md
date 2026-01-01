# Chapter 65: 상태 관리 패턴

애니메이션과 앱 상태를 효율적으로 연동하는 패턴을 학습합니다.

## 📌 학습 목표

- SharedValue와 React State 동기화 전략
- Zustand 스토어와 애니메이션 연동
- 전역 애니메이션 상태 관리
- 성능을 고려한 상태 설계

## 📖 개념 이해

### 상태의 두 세계

```
┌─────────────────────────────────────────────────────────┐
│                    State Architecture                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────┐    ┌─────────────────────┐    │
│  │   React State       │    │   Animation State   │    │
│  │   (JS Thread)       │    │   (UI Thread)       │    │
│  ├─────────────────────┤    ├─────────────────────┤    │
│  │ • useState          │    │ • SharedValue       │    │
│  │ • useReducer        │    │ • useDerivedValue   │    │
│  │ • Context           │    │ • useAnimatedStyle  │    │
│  │ • Zustand           │    │                     │    │
│  └─────────┬───────────┘    └───────────┬─────────┘    │
│            │                            │               │
│            │    ┌─────────────────┐     │               │
│            └────┤  Sync Bridge    ├─────┘               │
│                 │ (runOnJS/       │                     │
│                 │  runOnUI)       │                     │
│                 └─────────────────┘                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 동기화 방향

```
┌─────────────────────────────────────────────────────────┐
│                  Synchronization Patterns                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. React → Animation (Push)                            │
│     ┌──────────┐        ┌──────────┐                   │
│     │  React   │───────▶│ Shared   │                   │
│     │  State   │ update │ Value    │                   │
│     └──────────┘        └──────────┘                   │
│     • 사용자 액션에 의한 상태 변경                      │
│     • 비즈니스 로직 결과 반영                           │
│                                                         │
│  2. Animation → React (Pull)                            │
│     ┌──────────┐        ┌──────────┐                   │
│     │  React   │◀───────│ Shared   │                   │
│     │  State   │ runOnJS│ Value    │                   │
│     └──────────┘        └──────────┘                   │
│     • 애니메이션 완료 콜백                              │
│     • 제스처 결과 전달                                  │
│                                                         │
│  3. Bidirectional Sync                                  │
│     ┌──────────┐        ┌──────────┐                   │
│     │  React   │◀──────▶│ Shared   │                   │
│     │  State   │        │ Value    │                   │
│     └──────────┘        └──────────┘                   │
│     • 실시간 양방향 동기화                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 💻 코드 예제

### 예제 1: React State ↔ SharedValue 동기화

```typescript
// hooks/useSyncedAnimation.ts
import { useEffect, useCallback, useRef } from 'react';
import {
  useSharedValue,
  useAnimatedReaction,
  withSpring,
  withTiming,
  runOnJS,
  SharedValue,
  WithSpringConfig,
} from 'react-native-reanimated';

// 기본 동기화 훅
interface SyncOptions {
  // 동기화 방향
  direction: 'toAnimation' | 'toReact' | 'bidirectional';
  // 애니메이션 설정
  animated?: boolean;
  springConfig?: WithSpringConfig;
  // 변환 함수
  toAnimationValue?: (reactValue: any) => number;
  toReactValue?: (animationValue: number) => any;
}

export function useSyncedAnimation<T>(
  reactValue: T,
  setReactValue: (value: T) => void,
  options: SyncOptions
): SharedValue<number> {
  const {
    direction,
    animated = true,
    springConfig = { damping: 15, stiffness: 150 },
    toAnimationValue = (v) => (v as unknown as number),
    toReactValue = (v) => (v as unknown as T),
  } = options;

  const sharedValue = useSharedValue(toAnimationValue(reactValue));
  const lastSyncSource = useRef<'react' | 'animation'>('react');

  // React → Animation 동기화
  useEffect(() => {
    if (direction === 'toReact') return;
    if (lastSyncSource.current === 'animation') {
      lastSyncSource.current = 'react';
      return;
    }

    const targetValue = toAnimationValue(reactValue);
    if (animated) {
      sharedValue.value = withSpring(targetValue, springConfig);
    } else {
      sharedValue.value = targetValue;
    }
  }, [reactValue]);

  // Animation → React 동기화
  useAnimatedReaction(
    () => sharedValue.value,
    (currentValue, previousValue) => {
      if (direction === 'toAnimation') return;
      if (currentValue === previousValue) return;

      // 양방향일 때 무한 루프 방지
      runOnJS((value: number) => {
        lastSyncSource.current = 'animation';
        setReactValue(toReactValue(value));
      })(currentValue);
    },
    [direction]
  );

  return sharedValue;
}

// 불린 상태 동기화 훅
export function useSyncedBooleanAnimation(
  isActive: boolean,
  setIsActive: (value: boolean) => void,
  options: Omit<SyncOptions, 'toAnimationValue' | 'toReactValue'> = {
    direction: 'bidirectional',
  }
): SharedValue<number> {
  return useSyncedAnimation(isActive, setIsActive, {
    ...options,
    toAnimationValue: (v) => (v ? 1 : 0),
    toReactValue: (v) => v > 0.5,
  });
}

// 범위 값 동기화 훅
export function useSyncedRangeAnimation(
  value: number,
  setValue: (value: number) => void,
  range: { min: number; max: number },
  options: Omit<SyncOptions, 'toAnimationValue' | 'toReactValue'> = {
    direction: 'bidirectional',
  }
): SharedValue<number> {
  return useSyncedAnimation(value, setValue, {
    ...options,
    // 0-1 범위로 정규화
    toAnimationValue: (v) => (v - range.min) / (range.max - range.min),
    toReactValue: (v) => range.min + v * (range.max - range.min),
  });
}
```

### 예제 2: Zustand 스토어와 애니메이션 연동

```typescript
// stores/animationStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  makeMutable,
  runOnUI,
  SharedValue,
} from 'react-native-reanimated';

// 애니메이션 상태 타입
interface AnimationState {
  // UI 상태 (React에서 관리)
  theme: 'light' | 'dark';
  isMenuOpen: boolean;
  activeTabIndex: number;

  // 액션
  setTheme: (theme: 'light' | 'dark') => void;
  toggleMenu: () => void;
  setActiveTab: (index: number) => void;
}

// Zustand 스토어 생성
export const useAnimationStore = create<AnimationState>()(
  subscribeWithSelector((set) => ({
    theme: 'light',
    isMenuOpen: false,
    activeTabIndex: 0,

    setTheme: (theme) => set({ theme }),
    toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
    setActiveTab: (index) => set({ activeTabIndex: index }),
  }))
);

// SharedValue 레지스트리 (UI Thread에서 접근)
const sharedValueRegistry = new Map<string, SharedValue<number>>();

// SharedValue 생성/가져오기
export function getSharedValue(key: string, initialValue = 0): SharedValue<number> {
  if (!sharedValueRegistry.has(key)) {
    sharedValueRegistry.set(key, makeMutable(initialValue));
  }
  return sharedValueRegistry.get(key)!;
}

// 스토어 상태를 SharedValue로 동기화하는 훅
export function useStoreAnimation<K extends keyof AnimationState>(
  key: K,
  toAnimationValue: (value: AnimationState[K]) => number = (v) =>
    typeof v === 'boolean' ? (v ? 1 : 0) : (v as number)
): SharedValue<number> {
  const sharedValue = getSharedValue(key as string);
  const currentValue = useAnimationStore((state) => state[key]);

  React.useEffect(() => {
    // 스토어 구독
    const unsubscribe = useAnimationStore.subscribe(
      (state) => state[key],
      (value) => {
        const animValue = toAnimationValue(value);
        runOnUI(() => {
          'worklet';
          sharedValue.value = animValue;
        })();
      },
      { fireImmediately: true }
    );

    return unsubscribe;
  }, [key]);

  return sharedValue;
}

// 사용 예시 컴포넌트
export function ThemedAnimatedBox() {
  const themeProgress = useStoreAnimation('theme', (theme) =>
    theme === 'dark' ? 1 : 0
  );

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      ['#ffffff', '#1a1a1a']
    ),
  }));

  return <Animated.View style={[styles.box, animatedStyle]} />;
}
```

### 예제 3: 전역 애니메이션 컨텍스트

```typescript
// providers/GlobalAnimationProvider.tsx
import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  SharedValue,
  WithSpringConfig,
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 전역 애니메이션 상태 타입
interface GlobalAnimationContextType {
  // 공유 상태
  scrollY: SharedValue<number>;
  tabIndex: SharedValue<number>;
  modalProgress: SharedValue<number>;
  toastProgress: SharedValue<number>;
  keyboardHeight: SharedValue<number>;

  // 화면 전환
  screenTransition: SharedValue<number>;

  // 제어 함수
  showModal: (id: string) => void;
  hideModal: () => void;
  showToast: (message: string, duration?: number) => void;
  setActiveTab: (index: number, animated?: boolean) => void;

  // 상태 조회
  activeModal: string | null;
  toastMessage: string;
}

const GlobalAnimationContext =
  createContext<GlobalAnimationContextType | null>(null);

export function useGlobalAnimation() {
  const context = useContext(GlobalAnimationContext);
  if (!context) {
    throw new Error(
      'useGlobalAnimation must be used within GlobalAnimationProvider'
    );
  }
  return context;
}

// Provider 구현
interface GlobalAnimationProviderProps {
  children: React.ReactNode;
}

export function GlobalAnimationProvider({
  children,
}: GlobalAnimationProviderProps) {
  // SharedValues
  const scrollY = useSharedValue(0);
  const tabIndex = useSharedValue(0);
  const modalProgress = useSharedValue(0);
  const toastProgress = useSharedValue(0);
  const keyboardHeight = useSharedValue(0);
  const screenTransition = useSharedValue(0);

  // React State (UI 표시용)
  const [activeModal, setActiveModal] = React.useState<string | null>(null);
  const [toastMessage, setToastMessage] = React.useState('');

  // 타이머 ref
  const toastTimerRef = useRef<NodeJS.Timeout>();

  // 모달 제어
  const showModal = useCallback((id: string) => {
    setActiveModal(id);
    modalProgress.value = withSpring(1, { damping: 20 });
  }, []);

  const hideModal = useCallback(() => {
    modalProgress.value = withSpring(0, { damping: 20 }, (finished) => {
      if (finished) {
        runOnJS(setActiveModal)(null);
      }
    });
  }, []);

  // 토스트 제어
  const showToast = useCallback((message: string, duration = 3000) => {
    // 기존 타이머 취소
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToastMessage(message);
    toastProgress.value = withSpring(1);

    // 자동 숨김
    toastTimerRef.current = setTimeout(() => {
      toastProgress.value = withSpring(0, {}, (finished) => {
        if (finished) {
          runOnJS(setToastMessage)('');
        }
      });
    }, duration);
  }, []);

  // 탭 전환
  const setActiveTab = useCallback(
    (index: number, animated = true) => {
      if (animated) {
        tabIndex.value = withSpring(index, { damping: 15 });
      } else {
        tabIndex.value = index;
      }
    },
    []
  );

  // 키보드 이벤트 처리
  React.useEffect(() => {
    const { Keyboard } = require('react-native');

    const showSubscription = Keyboard.addListener('keyboardWillShow', (e) => {
      keyboardHeight.value = withTiming(e.endCoordinates.height);
    });

    const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
      keyboardHeight.value = withTiming(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // 정리
  React.useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      scrollY,
      tabIndex,
      modalProgress,
      toastProgress,
      keyboardHeight,
      screenTransition,
      showModal,
      hideModal,
      showToast,
      setActiveTab,
      activeModal,
      toastMessage,
    }),
    [activeModal, toastMessage]
  );

  return (
    <GlobalAnimationContext.Provider value={value}>
      {children}
      <GlobalToast />
      <GlobalModal />
    </GlobalAnimationContext.Provider>
  );
}

// 전역 토스트 컴포넌트
function GlobalToast() {
  const { toastProgress, toastMessage } = useGlobalAnimation();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(toastProgress.value, [0, 1], [-100, 0]) },
    ],
    opacity: toastProgress.value,
  }));

  if (!toastMessage) return null;

  return (
    <Animated.View style={[styles.toast, animatedStyle]}>
      <Text style={styles.toastText}>{toastMessage}</Text>
    </Animated.View>
  );
}

// 전역 모달 컴포넌트
function GlobalModal() {
  const { modalProgress, activeModal, hideModal } = useGlobalAnimation();

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: modalProgress.value * 0.5,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(modalProgress.value, [0, 1], [0.9, 1]) },
      {
        translateY: interpolate(
          modalProgress.value,
          [0, 1],
          [SCREEN_HEIGHT * 0.1, 0]
        ),
      },
    ],
    opacity: modalProgress.value,
  }));

  if (!activeModal) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable onPress={hideModal} style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </Pressable>
      <Animated.View style={[styles.modalContent, contentStyle]}>
        {/* 모달 내용 렌더링 */}
      </Animated.View>
    </View>
  );
}
```

### 예제 4: 상태 머신과 애니메이션

```typescript
// hooks/useAnimationStateMachine.ts
import { useCallback, useRef } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';

// 상태 머신 타입 정의
type State = string;
type Event = string;

interface StateConfig {
  enter?: () => void;
  exit?: () => void;
  animation?: {
    scale?: number;
    opacity?: number;
    translateX?: number;
    translateY?: number;
    rotate?: number;
  };
}

interface Transition {
  target: State;
  guard?: () => boolean;
  action?: () => void;
}

interface StateMachineConfig {
  initial: State;
  states: Record<State, StateConfig>;
  transitions: Record<State, Record<Event, Transition>>;
}

interface AnimationStateMachine {
  currentState: State;
  send: (event: Event) => void;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  canTransition: (event: Event) => boolean;
}

export function useAnimationStateMachine(
  config: StateMachineConfig
): AnimationStateMachine {
  const { initial, states, transitions } = config;

  // 상태 관리
  const currentStateRef = useRef(initial);
  const [currentState, setCurrentState] = React.useState(initial);

  // 애니메이션 값
  const scale = useSharedValue(states[initial].animation?.scale ?? 1);
  const opacity = useSharedValue(states[initial].animation?.opacity ?? 1);
  const translateX = useSharedValue(states[initial].animation?.translateX ?? 0);
  const translateY = useSharedValue(states[initial].animation?.translateY ?? 0);
  const rotate = useSharedValue(states[initial].animation?.rotate ?? 0);

  // 상태 전환 가능 여부 확인
  const canTransition = useCallback(
    (event: Event): boolean => {
      const stateTransitions = transitions[currentStateRef.current];
      if (!stateTransitions) return false;

      const transition = stateTransitions[event];
      if (!transition) return false;

      if (transition.guard && !transition.guard()) return false;

      return true;
    },
    []
  );

  // 상태에 따른 애니메이션 적용
  const applyStateAnimation = useCallback((state: State) => {
    const stateConfig = states[state];
    if (!stateConfig.animation) return;

    const anim = stateConfig.animation;
    const springConfig = { damping: 15, stiffness: 150 };

    if (anim.scale !== undefined) {
      scale.value = withSpring(anim.scale, springConfig);
    }
    if (anim.opacity !== undefined) {
      opacity.value = withTiming(anim.opacity, { duration: 200 });
    }
    if (anim.translateX !== undefined) {
      translateX.value = withSpring(anim.translateX, springConfig);
    }
    if (anim.translateY !== undefined) {
      translateY.value = withSpring(anim.translateY, springConfig);
    }
    if (anim.rotate !== undefined) {
      rotate.value = withSpring(anim.rotate, springConfig);
    }
  }, []);

  // 이벤트 전송
  const send = useCallback((event: Event) => {
    const stateTransitions = transitions[currentStateRef.current];
    if (!stateTransitions) {
      console.warn(`No transitions defined for state: ${currentStateRef.current}`);
      return;
    }

    const transition = stateTransitions[event];
    if (!transition) {
      console.warn(
        `No transition for event "${event}" in state "${currentStateRef.current}"`
      );
      return;
    }

    // Guard 체크
    if (transition.guard && !transition.guard()) {
      console.log(`Guard prevented transition for event: ${event}`);
      return;
    }

    // 현재 상태 exit
    const currentConfig = states[currentStateRef.current];
    if (currentConfig.exit) {
      currentConfig.exit();
    }

    // 전환 액션 실행
    if (transition.action) {
      transition.action();
    }

    // 새 상태로 전환
    const nextState = transition.target;
    currentStateRef.current = nextState;
    setCurrentState(nextState);

    // 새 상태 enter
    const nextConfig = states[nextState];
    if (nextConfig.enter) {
      nextConfig.enter();
    }

    // 애니메이션 적용
    applyStateAnimation(nextState);
  }, []);

  // 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  // 초기 상태 애니메이션 적용
  React.useEffect(() => {
    applyStateAnimation(initial);

    const initialConfig = states[initial];
    if (initialConfig.enter) {
      initialConfig.enter();
    }
  }, []);

  return {
    currentState,
    send,
    animatedStyle,
    canTransition,
  };
}

// 사용 예시: 버튼 상태 머신
export function StateMachineButton() {
  const { currentState, send, animatedStyle } = useAnimationStateMachine({
    initial: 'idle',
    states: {
      idle: {
        animation: { scale: 1, opacity: 1 },
      },
      pressed: {
        animation: { scale: 0.95, opacity: 0.8 },
      },
      loading: {
        enter: () => console.log('Loading started'),
        animation: { scale: 1, opacity: 0.7 },
      },
      success: {
        enter: () => console.log('Success!'),
        animation: { scale: 1.05, opacity: 1 },
      },
      error: {
        animation: { scale: 1, translateX: 0 }, // shake 효과는 별도 처리
      },
    },
    transitions: {
      idle: {
        PRESS: { target: 'pressed' },
      },
      pressed: {
        RELEASE: { target: 'idle' },
        SUBMIT: { target: 'loading' },
      },
      loading: {
        SUCCESS: { target: 'success' },
        ERROR: { target: 'error' },
      },
      success: {
        RESET: { target: 'idle' },
      },
      error: {
        RESET: { target: 'idle' },
        RETRY: { target: 'loading' },
      },
    },
  });

  return (
    <GestureDetector
      gesture={Gesture.Tap()
        .onBegin(() => send('PRESS'))
        .onEnd(() => {
          send('RELEASE');
          // 또는 바로 submit: send('SUBMIT');
        })}
    >
      <Animated.View style={[styles.button, animatedStyle]}>
        <Text>{currentState}</Text>
      </Animated.View>
    </GestureDetector>
  );
}
```

### 예제 5: 파생 상태와 메모이제이션

```typescript
// hooks/useDerivedAnimationState.ts
import { useMemo } from 'react';
import {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  SharedValue,
  interpolate,
  interpolateColor,
  Extrapolation,
} from 'react-native-reanimated';

// 여러 상태를 조합하는 파생 상태 훅
interface DerivedStateConfig {
  sources: SharedValue<number>[];
  derive: (values: number[]) => number;
}

export function useDerivedSharedValue(
  config: DerivedStateConfig
): SharedValue<number> {
  const { sources, derive } = config;

  return useDerivedValue(() => {
    const values = sources.map((s) => s.value);
    return derive(values);
  }, sources);
}

// 테마 기반 색상 보간 훅
interface ThemeColors {
  light: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
  };
  dark: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
  };
}

export function useThemeAnimatedColors(
  themeProgress: SharedValue<number>,
  colors: ThemeColors
) {
  const backgroundColor = useDerivedValue(() =>
    interpolateColor(
      themeProgress.value,
      [0, 1],
      [colors.light.background, colors.dark.background]
    )
  );

  const textColor = useDerivedValue(() =>
    interpolateColor(
      themeProgress.value,
      [0, 1],
      [colors.light.text, colors.dark.text]
    )
  );

  const primaryColor = useDerivedValue(() =>
    interpolateColor(
      themeProgress.value,
      [0, 1],
      [colors.light.primary, colors.dark.primary]
    )
  );

  const secondaryColor = useDerivedValue(() =>
    interpolateColor(
      themeProgress.value,
      [0, 1],
      [colors.light.secondary, colors.dark.secondary]
    )
  );

  return {
    backgroundColor,
    textColor,
    primaryColor,
    secondaryColor,
  };
}

// 복합 레이아웃 상태 훅
interface LayoutAnimationState {
  headerHeight: number;
  tabBarHeight: number;
  safeAreaTop: number;
  safeAreaBottom: number;
}

export function useLayoutAnimationState(layout: LayoutAnimationState) {
  // 스크롤에 따른 헤더 축소
  const scrollY = useSharedValue(0);

  // 파생된 헤더 높이
  const animatedHeaderHeight = useDerivedValue(() => {
    return interpolate(
      scrollY.value,
      [0, 100],
      [layout.headerHeight, layout.headerHeight * 0.6],
      Extrapolation.CLAMP
    );
  });

  // 파생된 콘텐츠 영역
  const contentInsets = useDerivedValue(() => ({
    top: animatedHeaderHeight.value + layout.safeAreaTop,
    bottom: layout.tabBarHeight + layout.safeAreaBottom,
  }));

  // 헤더 스타일
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    height: animatedHeaderHeight.value,
    opacity: interpolate(
      scrollY.value,
      [0, 50],
      [1, 0.9],
      Extrapolation.CLAMP
    ),
  }));

  // 콘텐츠 스타일
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    paddingTop: contentInsets.value.top,
    paddingBottom: contentInsets.value.bottom,
  }));

  return {
    scrollY,
    animatedHeaderHeight,
    contentInsets,
    headerAnimatedStyle,
    contentAnimatedStyle,
  };
}

// 애니메이션 상태 조합 훅
export function useComposedAnimationState(
  states: Record<string, SharedValue<number>>
) {
  // 모든 상태의 합
  const totalProgress = useDerivedValue(() => {
    return Object.values(states).reduce((sum, s) => sum + s.value, 0);
  });

  // 활성 상태 개수
  const activeCount = useDerivedValue(() => {
    return Object.values(states).filter((s) => s.value > 0.5).length;
  });

  // 평균 진행도
  const averageProgress = useDerivedValue(() => {
    const values = Object.values(states);
    if (values.length === 0) return 0;
    return values.reduce((sum, s) => sum + s.value, 0) / values.length;
  });

  // 최대 진행도
  const maxProgress = useDerivedValue(() => {
    return Math.max(...Object.values(states).map((s) => s.value));
  });

  return {
    totalProgress,
    activeCount,
    averageProgress,
    maxProgress,
  };
}
```

## 🎨 sometimes-app 적용 사례

### 매칭 상태 관리 시스템

```typescript
// features/matching/stores/matchingAnimationStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

// 매칭 상태 타입
type MatchingPhase =
  | 'idle'
  | 'searching'
  | 'found'
  | 'revealing'
  | 'matched'
  | 'rejected';

interface MatchingState {
  // 상태
  phase: MatchingPhase;
  currentProfileId: string | null;
  matchedProfiles: string[];
  rejectedProfiles: string[];

  // 통계
  todayMatchCount: number;
  remainingSwipes: number;

  // 액션
  startSearching: () => void;
  profileFound: (profileId: string) => void;
  swipeRight: (profileId: string) => void;
  swipeLeft: (profileId: string) => void;
  matchConfirmed: () => void;
  reset: () => void;
}

export const useMatchingStore = create<MatchingState>()(
  subscribeWithSelector((set, get) => ({
    phase: 'idle',
    currentProfileId: null,
    matchedProfiles: [],
    rejectedProfiles: [],
    todayMatchCount: 0,
    remainingSwipes: 10,

    startSearching: () => set({ phase: 'searching' }),

    profileFound: (profileId) =>
      set({
        phase: 'found',
        currentProfileId: profileId,
      }),

    swipeRight: (profileId) => {
      const { matchedProfiles, todayMatchCount, remainingSwipes } = get();
      set({
        phase: 'revealing',
        matchedProfiles: [...matchedProfiles, profileId],
        todayMatchCount: todayMatchCount + 1,
        remainingSwipes: remainingSwipes - 1,
      });
    },

    swipeLeft: (profileId) => {
      const { rejectedProfiles, remainingSwipes } = get();
      set({
        phase: 'searching',
        currentProfileId: null,
        rejectedProfiles: [...rejectedProfiles, profileId],
        remainingSwipes: remainingSwipes - 1,
      });
    },

    matchConfirmed: () => set({ phase: 'matched' }),

    reset: () =>
      set({
        phase: 'idle',
        currentProfileId: null,
      }),
  }))
);

// 매칭 애니메이션 훅
export function useMatchingAnimations() {
  const phase = useMatchingStore((state) => state.phase);

  // 애니메이션 값
  const searchProgress = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(1);
  const revealProgress = useSharedValue(0);
  const matchCelebration = useSharedValue(0);

  // 페이즈 변경 시 애니메이션
  React.useEffect(() => {
    switch (phase) {
      case 'idle':
        searchProgress.value = withSpring(0);
        cardScale.value = withSpring(1);
        cardOpacity.value = withSpring(1);
        revealProgress.value = 0;
        matchCelebration.value = 0;
        break;

      case 'searching':
        searchProgress.value = withSpring(1);
        cardOpacity.value = withSpring(0.5);
        break;

      case 'found':
        searchProgress.value = withSpring(0);
        cardScale.value = withSequence(
          withSpring(1.05),
          withSpring(1)
        );
        cardOpacity.value = withSpring(1);
        break;

      case 'revealing':
        revealProgress.value = withSpring(1);
        break;

      case 'matched':
        matchCelebration.value = withSequence(
          withSpring(1),
          withDelay(1000, withSpring(1.2)),
          withSpring(1)
        );
        break;

      case 'rejected':
        cardOpacity.value = withSpring(0);
        break;
    }
  }, [phase]);

  // 파생 상태
  const isAnimating = useDerivedValue(() => {
    return (
      searchProgress.value > 0 ||
      revealProgress.value > 0 ||
      matchCelebration.value > 0
    );
  });

  // 검색 오버레이 스타일
  const searchOverlayStyle = useAnimatedStyle(() => ({
    opacity: searchProgress.value * 0.8,
    transform: [
      { scale: interpolate(searchProgress.value, [0, 1], [0.8, 1]) },
    ],
  }));

  // 카드 스타일
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  // 매치 결과 스타일
  const revealAnimatedStyle = useAnimatedStyle(() => ({
    opacity: revealProgress.value,
    transform: [
      {
        translateY: interpolate(
          revealProgress.value,
          [0, 1],
          [50, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  // 축하 스타일
  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: matchCelebration.value }],
    opacity: matchCelebration.value > 0 ? 1 : 0,
  }));

  return {
    // 상태
    phase,
    isAnimating,

    // 스타일
    searchOverlayStyle,
    cardAnimatedStyle,
    revealAnimatedStyle,
    celebrationStyle,

    // 값 (추가 커스터마이징용)
    searchProgress,
    cardScale,
    cardOpacity,
    revealProgress,
    matchCelebration,
  };
}

// 매칭 화면 컴포넌트
export function MatchingScreen() {
  const {
    phase,
    cardAnimatedStyle,
    searchOverlayStyle,
    revealAnimatedStyle,
    celebrationStyle,
  } = useMatchingAnimations();

  const { startSearching, profileFound, swipeRight, swipeLeft, matchConfirmed } =
    useMatchingStore();

  return (
    <View style={styles.container}>
      {/* 카드 스택 */}
      <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
        <ProfileCardStack onSwipeRight={swipeRight} onSwipeLeft={swipeLeft} />
      </Animated.View>

      {/* 검색 오버레이 */}
      {phase === 'searching' && (
        <Animated.View style={[styles.searchOverlay, searchOverlayStyle]}>
          <SearchingIndicator />
        </Animated.View>
      )}

      {/* 매치 결과 */}
      {phase === 'revealing' && (
        <Animated.View style={[styles.revealContainer, revealAnimatedStyle]}>
          <MatchReveal onConfirm={matchConfirmed} />
        </Animated.View>
      )}

      {/* 축하 효과 */}
      {phase === 'matched' && (
        <Animated.View style={[styles.celebration, celebrationStyle]}>
          <ConfettiAnimation />
          <MatchCelebration />
        </Animated.View>
      )}

      {/* 통계 바 */}
      <MatchingStatsBar />
    </View>
  );
}

// 통계 바 컴포넌트 (Zustand 구독)
function MatchingStatsBar() {
  const todayMatchCount = useMatchingStore((state) => state.todayMatchCount);
  const remainingSwipes = useMatchingStore((state) => state.remainingSwipes);

  const countProgress = useSharedValue(0);

  React.useEffect(() => {
    countProgress.value = withSpring(todayMatchCount);
  }, [todayMatchCount]);

  const countStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          countProgress.value % 1,
          [0, 0.5, 1],
          [1, 1.2, 1]
        ),
      },
    ],
  }));

  return (
    <View style={styles.statsBar}>
      <Animated.View style={countStyle}>
        <Text style={styles.statText}>오늘 매칭: {todayMatchCount}</Text>
      </Animated.View>
      <Text style={styles.statText}>남은 스와이프: {remainingSwipes}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebration: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 실수 1: 무한 동기화 루프

```typescript
// ❌ 잘못된 방식 - 무한 루프 발생
function BadSync() {
  const [value, setValue] = useState(0);
  const sharedValue = useSharedValue(0);

  // 양방향 동기화가 무한 루프 유발
  useEffect(() => {
    sharedValue.value = value;
  }, [value]);

  useAnimatedReaction(
    () => sharedValue.value,
    (sv) => {
      runOnJS(setValue)(sv); // 이게 다시 useEffect 트리거
    }
  );
}

// ✅ 올바른 방식 - 소스 추적
function GoodSync() {
  const [value, setValue] = useState(0);
  const sharedValue = useSharedValue(0);
  const syncSourceRef = useRef<'react' | 'animation'>('react');

  useEffect(() => {
    if (syncSourceRef.current === 'animation') {
      syncSourceRef.current = 'react';
      return;
    }
    sharedValue.value = value;
  }, [value]);

  useAnimatedReaction(
    () => sharedValue.value,
    (sv) => {
      runOnJS((newValue) => {
        syncSourceRef.current = 'animation';
        setValue(newValue);
      })(sv);
    }
  );
}
```

### 실수 2: 불필요한 리렌더링

```typescript
// ❌ 잘못된 방식 - 모든 상태 변경에 리렌더링
function BadSubscription() {
  const store = useMatchingStore(); // 전체 스토어 구독

  return <Text>{store.phase}</Text>;
}

// ✅ 올바른 방식 - 필요한 상태만 구독
function GoodSubscription() {
  const phase = useMatchingStore((state) => state.phase);

  return <Text>{phase}</Text>;
}
```

### 실수 3: Context 과다 업데이트

```typescript
// ❌ 잘못된 방식 - 매 프레임 Context 업데이트
function BadProvider({ children }) {
  const progress = useSharedValue(0);

  // progress.value가 변경될 때마다 Context 값이 바뀜
  const value = useMemo(
    () => ({ progress: progress.value }),
    [progress.value] // 이건 동작 안 함!
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

// ✅ 올바른 방식 - SharedValue 자체를 전달
function GoodProvider({ children }) {
  const progress = useSharedValue(0);

  // SharedValue 객체 자체는 안정적
  const value = useMemo(
    () => ({ progress }),
    [] // 한 번만 생성
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
```

## 💡 상태 관리 팁

### 1. 상태 분류 기준

```typescript
// React State가 적합한 경우
// - UI 표시용 데이터 (모달 열림 여부, 선택된 탭)
// - 비즈니스 로직 상태 (로딩, 에러, 데이터)
// - 다른 컴포넌트와 공유해야 하는 상태

// SharedValue가 적합한 경우
// - 60fps 애니메이션 값
// - 제스처 중간 값
// - 레이아웃 변환 값
// - 스크롤 위치

// 둘 다 필요한 경우
// - 최종 결과는 React State
// - 중간 과정은 SharedValue
// - 완료 시 runOnJS로 동기화
```

### 2. 성능 최적화 패턴

```typescript
// 선택적 구독
const activeCount = useMatchingStore(
  (state) => state.matchedProfiles.length,
  (prev, next) => prev === next // shallow compare 커스텀
);

// 메모이제이션된 선택자
const selectMatchStats = useMemo(
  () => (state: MatchingState) => ({
    matched: state.matchedProfiles.length,
    rejected: state.rejectedProfiles.length,
  }),
  []
);

const stats = useMatchingStore(selectMatchStats);
```

### 3. 디버깅 지원

```typescript
// 개발용 상태 로깅
if (__DEV__) {
  useMatchingStore.subscribe((state, prevState) => {
    if (state.phase !== prevState.phase) {
      console.log(`[Matching] Phase: ${prevState.phase} → ${state.phase}`);
    }
  });
}
```

## 🏋️ 연습 문제

### 문제 1: 설정 상태와 애니메이션 연동

앱 설정(진동, 사운드, 애니메이션 on/off)을 관리하고 실시간으로 애니메이션에 반영하는 스토어를 구현하세요.

<details>
<summary>정답 보기</summary>

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';

interface SettingsState {
  hapticEnabled: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';

  setHaptic: (enabled: boolean) => void;
  setSound: (enabled: boolean) => void;
  setAnimations: (enabled: boolean) => void;
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      hapticEnabled: true,
      soundEnabled: true,
      animationsEnabled: true,
      animationSpeed: 'normal',

      setHaptic: (enabled) => set({ hapticEnabled: enabled }),
      setSound: (enabled) => set({ soundEnabled: enabled }),
      setAnimations: (enabled) => set({ animationsEnabled: enabled }),
      setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
    }),
    { name: 'settings-storage' }
  )
);

// 애니메이션 설정 훅
export function useAnimationSettings() {
  const animationsEnabled = useSettingsStore((s) => s.animationsEnabled);
  const animationSpeed = useSettingsStore((s) => s.animationSpeed);

  const speedMultiplier = useSharedValue(1);

  React.useEffect(() => {
    const multipliers = { slow: 1.5, normal: 1, fast: 0.5 };
    speedMultiplier.value = animationsEnabled
      ? multipliers[animationSpeed]
      : 0;
  }, [animationsEnabled, animationSpeed]);

  // 조건부 애니메이션 래퍼
  const animate = React.useCallback(
    (
      value: SharedValue<number>,
      target: number,
      config?: WithSpringConfig
    ) => {
      if (!animationsEnabled) {
        value.value = target;
        return;
      }

      const adjustedConfig = {
        ...config,
        duration: config?.duration
          ? config.duration * speedMultiplier.value
          : undefined,
      };

      value.value = withSpring(target, adjustedConfig);
    },
    [animationsEnabled]
  );

  return {
    animationsEnabled,
    speedMultiplier,
    animate,
  };
}
```

</details>

### 문제 2: 실시간 동기화 상태

서버와 실시간 동기화되는 알림 카운터를 구현하고, 새 알림이 올 때 애니메이션을 표시하세요.

<details>
<summary>정답 보기</summary>

```typescript
import { useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { create } from 'zustand';

interface NotificationState {
  unreadCount: number;
  lastNotificationId: string | null;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  lastNotificationId: null,
  increment: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  decrement: () => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
  reset: () => set({ unreadCount: 0 }),
  setCount: (count) => set({ unreadCount: count }),
}));

export function useNotificationBadge() {
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const prevCountRef = useRef(unreadCount);

  const badgeScale = useSharedValue(1);
  const badgeRotation = useSharedValue(0);

  useEffect(() => {
    // 새 알림 감지
    if (unreadCount > prevCountRef.current) {
      // 뱃지 바운스 애니메이션
      badgeScale.value = withSequence(
        withSpring(1.3),
        withSpring(0.9),
        withSpring(1)
      );

      // 흔들림 효과
      badgeRotation.value = withSequence(
        withSpring(-10),
        withSpring(10),
        withSpring(-5),
        withSpring(5),
        withSpring(0)
      );
    }

    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: badgeScale.value },
      { rotate: `${badgeRotation.value}deg` },
    ],
  }));

  return {
    unreadCount,
    badgeAnimatedStyle,
  };
}

// WebSocket 연동
export function useNotificationSync() {
  const { setCount, increment } = useNotificationStore();

  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com/notifications');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'SYNC') {
        setCount(data.count);
      } else if (data.type === 'NEW') {
        increment();
      }
    };

    return () => ws.close();
  }, []);
}
```

</details>

## 📚 이 장에서 배운 내용

1. **상태 동기화**: React State ↔ SharedValue 양방향 동기화 패턴
2. **Zustand 연동**: 스토어와 애니메이션 효율적 연결
3. **전역 컨텍스트**: 앱 전체 애니메이션 상태 관리
4. **상태 머신**: 복잡한 애니메이션 흐름 제어
5. **파생 상태**: useDerivedValue를 활용한 효율적 계산

## 다음 장 예고

**Chapter 66: 훅 조합 패턴**에서는 여러 훅을 효과적으로 조합하여 재사용 가능한 애니메이션 로직을 만드는 방법을 배웁니다. 커스텀 훅 설계 원칙과 조합 전략을 다룹니다.
