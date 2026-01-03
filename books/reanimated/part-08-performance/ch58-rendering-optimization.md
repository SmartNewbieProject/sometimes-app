# Chapter 58: 렌더링 최적화

Reanimated 애니메이션을 사용하면서 React 컴포넌트의 렌더링을 최적화하는 방법을 배웁니다.

## 📌 학습 목표

- 불필요한 리렌더링 원인 파악 및 해결
- React.memo와 useMemo의 올바른 활용
- 애니메이션과 React 상태 분리 패턴 습득
- 대규모 리스트에서의 렌더링 최적화

## 📖 개념 이해

### 리렌더링 발생 원인

```
┌─────────────────────────────────────────────────────────────┐
│                  Re-render Triggers                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. State 변경                                               │
│  ┌────────┐      ┌────────┐      ┌────────┐                │
│  │setState│ ───▶ │Reconcile│ ───▶ │Re-render│               │
│  └────────┘      └────────┘      └────────┘                │
│                                                              │
│  2. Props 변경                                               │
│  ┌────────┐      ┌────────┐      ┌────────┐                │
│  │ Parent │ ───▶ │New Props│ ───▶ │Re-render│               │
│  │Re-render│      └────────┘      └────────┘                │
│  └────────┘                                                  │
│                                                              │
│  3. Context 변경                                             │
│  ┌────────┐      ┌────────┐      ┌────────┐                │
│  │Provider│ ───▶ │New Value│ ───▶ │All Consumers│           │
│  │ Update │      └────────┘      │ Re-render  │             │
│  └────────┘                      └────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### SharedValue vs State

```
┌─────────────────────────────────────────────────────────────┐
│            SharedValue vs React State                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SharedValue (Reanimated)                                    │
│  ┌─────────────────────────────────────┐                    │
│  │ value 변경 ────▶ UI Thread 업데이트  │                    │
│  │                  (Re-render 없음!)   │                    │
│  └─────────────────────────────────────┘                    │
│  ✅ 애니메이션 값에 적합                                     │
│  ✅ 60fps 유지 가능                                          │
│                                                              │
│  React State                                                 │
│  ┌─────────────────────────────────────┐                    │
│  │ setState ────▶ Reconciliation       │                    │
│  │           ────▶ Virtual DOM Diff    │                    │
│  │           ────▶ Re-render           │                    │
│  │           ────▶ Commit              │                    │
│  └─────────────────────────────────────┘                    │
│  ✅ UI 상태에 적합 (표시/숨김, 데이터)                       │
│  ❌ 매 프레임 업데이트에는 부적합                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 메모이제이션 전략

```
┌─────────────────────────────────────────────────────────────┐
│                Memoization Strategy                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Level 1: React.memo (컴포넌트)                              │
│  ┌──────────────────┐                                       │
│  │ Props 비교 ─▶ 같으면 스킵                                │
│  └──────────────────┘                                       │
│                                                              │
│  Level 2: useMemo (값)                                       │
│  ┌──────────────────┐                                       │
│  │ 의존성 비교 ─▶ 같으면 캐시 반환                          │
│  └──────────────────┘                                       │
│                                                              │
│  Level 3: useCallback (함수)                                 │
│  ┌──────────────────┐                                       │
│  │ 의존성 비교 ─▶ 같으면 기존 함수 참조                     │
│  └──────────────────┘                                       │
│                                                              │
│  Level 4: useDerivedValue (Reanimated)                       │
│  ┌──────────────────┐                                       │
│  │ SharedValue 의존 ─▶ UI Thread에서 계산                   │
│  │ (Re-render 없음)                                          │
│  └──────────────────┘                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 코드 예제

### 1. 리렌더링 감지 및 분석

```typescript
import React, { useRef, useEffect, memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 렌더링 카운터 HOC
function withRenderCounter<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return memo(function WithRenderCounter(props: P) {
    const renderCount = useRef(0);
    const lastRenderTime = useRef(Date.now());

    renderCount.current++;

    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    if (__DEV__) {
      console.log(
        `[Render] ${componentName}: ` +
        `#${renderCount.current} ` +
        `(${timeSinceLastRender}ms since last)`
      );
    }

    return (
      <View>
        {__DEV__ && (
          <View style={styles.debugBadge}>
            <Text style={styles.debugText}>
              R: {renderCount.current}
            </Text>
          </View>
        )}
        <WrappedComponent {...props} />
      </View>
    );
  });
}

// 사용 예시
const AnimatedCard = withRenderCounter(
  function AnimatedCard({ title }: { title: string }) {
    return (
      <View style={styles.card}>
        <Text>{title}</Text>
      </View>
    );
  },
  'AnimatedCard'
);

const styles = StyleSheet.create({
  debugBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F44336',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 100,
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  card: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
});

export { withRenderCounter };
```

### 2. 애니메이션과 상태 분리

```typescript
import React, { useState, useCallback, memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

// ❌ 안티패턴: 애니메이션으로 인한 리렌더링
function BadAnimatedCounter() {
  const [count, setCount] = useState(0);
  const [scale, setScale] = useState(1); // 🚫 애니메이션에 state 사용

  const handlePress = () => {
    setScale(1.2); // 🚫 리렌더링 발생!
    setTimeout(() => setScale(1), 200); // 🚫 또 리렌더링!
    setCount(c => c + 1);
  };

  return (
    <Pressable onPress={handlePress}>
      <View style={[styles.counter, { transform: [{ scale }] }]}>
        <Text style={styles.counterText}>{count}</Text>
      </View>
    </Pressable>
  );
}

// ✅ 권장: SharedValue 사용
function GoodAnimatedCounter() {
  const [count, setCount] = useState(0);
  const scale = useSharedValue(1); // ✅ SharedValue

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    // 애니메이션은 리렌더링 없이 진행
    scale.value = withSpring(1.2, {}, (finished) => {
      if (finished) {
        scale.value = withSpring(1);
      }
    });
    // 상태 업데이트는 별도로
    setCount(c => c + 1);
  }, [scale]);

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.counter, animatedStyle]}>
        <Text style={styles.counterText}>{count}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  counter: {
    width: 100,
    height: 100,
    backgroundColor: '#7A4AE2',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
});
```

### 3. useDerivedValue로 계산 최적화

```typescript
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  interpolate,
  interpolateColor,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function OptimizedSwipeCard() {
  const translateX = useSharedValue(0);

  // ✅ useDerivedValue: UI Thread에서 계산, 리렌더 없음
  const progress = useDerivedValue(() => {
    return translateX.value / SCREEN_WIDTH;
  });

  const rotation = useDerivedValue(() => {
    return interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-15, 0, 15],
      Extrapolation.CLAMP
    );
  });

  const likeOpacity = useDerivedValue(() => {
    return interpolate(
      translateX.value,
      [0, SCREEN_WIDTH * 0.3],
      [0, 1],
      Extrapolation.CLAMP
    );
  });

  const nopeOpacity = useDerivedValue(() => {
    return interpolate(
      translateX.value,
      [-SCREEN_WIDTH * 0.3, 0],
      [1, 0],
      Extrapolation.CLAMP
    );
  });

  const backgroundColor = useDerivedValue(() => {
    return interpolateColor(
      translateX.value,
      [-SCREEN_WIDTH * 0.5, 0, SCREEN_WIDTH * 0.5],
      ['#FFE5E5', '#FFFFFF', '#E5FFE5']
    );
  });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
    });

  // 단일 useAnimatedStyle로 모든 파생 값 사용
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${rotation.value}deg` },
    ],
    backgroundColor: backgroundColor.value,
  }));

  const likeStyle = useAnimatedStyle(() => ({
    opacity: likeOpacity.value,
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: nopeOpacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Animated.View style={[styles.likeLabel, likeStyle]}>
          {/* LIKE 라벨 */}
        </Animated.View>
        <Animated.View style={[styles.nopeLabel, nopeStyle]}>
          {/* NOPE 라벨 */}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: 400,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  likeLabel: {
    position: 'absolute',
    top: 30,
    left: 30,
  },
  nopeLabel: {
    position: 'absolute',
    top: 30,
    right: 30,
  },
});
```

### 4. 컴포넌트 분리로 리렌더 최소화

```typescript
import React, { useState, useCallback, memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

// 애니메이션 전용 컴포넌트 (상태 없음)
const AnimatedButton = memo(function AnimatedButton({
  onPress,
  children,
}: {
  onPress: () => void;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, [scale]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.button, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
});

// 카운트 표시 컴포넌트 (상태 연동)
const CountDisplay = memo(function CountDisplay({
  count,
}: {
  count: number;
}) {
  return (
    <View style={styles.display}>
      <Text style={styles.countText}>{count}</Text>
    </View>
  );
});

// 부모 컴포넌트
function Counter() {
  const [count, setCount] = useState(0);

  // 메모이제이션된 핸들러
  const handleIncrement = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  const handleDecrement = useCallback(() => {
    setCount(c => c - 1);
  }, []);

  // count 변경 시:
  // - Counter 리렌더 ✅
  // - CountDisplay 리렌더 ✅ (props 변경)
  // - AnimatedButton 리렌더 ❌ (props 동일)
  return (
    <View style={styles.container}>
      <AnimatedButton onPress={handleDecrement}>
        <Text style={styles.buttonText}>-</Text>
      </AnimatedButton>

      <CountDisplay count={count} />

      <AnimatedButton onPress={handleIncrement}>
        <Text style={styles.buttonText}>+</Text>
      </AnimatedButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  button: {
    width: 60,
    height: 60,
    backgroundColor: '#7A4AE2',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  display: {
    width: 100,
    alignItems: 'center',
  },
  countText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
});
```

### 5. 리스트 렌더링 최적화

```typescript
import React, { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  Layout,
} from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Item {
  id: string;
  title: string;
  subtitle: string;
}

// 개별 아이템 컴포넌트 (완전 분리)
const ListItem = memo(function ListItem({
  item,
  onPress,
  onDelete,
}: {
  item: Item;
  onPress: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      translateX.value = Math.max(-100, event.translationX);
    })
    .onEnd(() => {
      if (translateX.value < -80) {
        onDelete(item.id);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.98);
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
    })
    .onEnd(() => {
      onPress(item.id);
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        layout={Layout.springify()}
        style={[styles.listItem, animatedStyle]}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </Animated.View>
    </GestureDetector>
  );
},
  // 커스텀 비교 함수
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.title === nextProps.item.title &&
      prevProps.onPress === nextProps.onPress &&
      prevProps.onDelete === nextProps.onDelete
    );
  }
);

// 리스트 컴포넌트
function OptimizedList({ initialData }: { initialData: Item[] }) {
  const [data, setData] = useState(initialData);

  // 메모이제이션된 핸들러
  const handlePress = useCallback((id: string) => {
    console.log('Pressed:', id);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setData(prev => prev.filter(item => item.id !== id));
  }, []);

  // renderItem 메모이제이션
  const renderItem = useCallback(({ item }: { item: Item }) => (
    <ListItem
      item={item}
      onPress={handlePress}
      onDelete={handleDelete}
    />
  ), [handlePress, handleDelete]);

  const keyExtractor = useCallback((item: Item) => item.id, []);

  // 헤더 메모이제이션
  const ListHeader = useMemo(() => (
    <View style={styles.header}>
      <Text style={styles.headerText}>
        {data.length} items
      </Text>
    </View>
  ), [data.length]);

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeader}
      estimatedItemSize={72}
    />
  );
}

const styles = StyleSheet.create({
  listItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  header: {
    padding: 16,
  },
  headerText: {
    fontSize: 14,
    color: '#999',
  },
});
```

### 6. Context 최적화

```typescript
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  memo,
} from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

// ❌ 안티패턴: 단일 Context에 모든 것
const BadThemeContext = createContext<{
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  primaryColor: string;
  secondaryColor: string;
} | null>(null);

// ✅ 권장: Context 분리
interface ThemeState {
  theme: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
}

interface ThemeActions {
  toggleTheme: () => void;
}

const ThemeStateContext = createContext<ThemeState | null>(null);
const ThemeActionsContext = createContext<ThemeActions | null>(null);

// Provider
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // 상태 값 메모이제이션
  const themeState = useMemo<ThemeState>(() => ({
    theme,
    primaryColor: theme === 'light' ? '#7A4AE2' : '#BB86FC',
    secondaryColor: theme === 'light' ? '#E2D5FF' : '#3700B3',
    backgroundColor: theme === 'light' ? '#FFFFFF' : '#121212',
  }), [theme]);

  // 액션 메모이제이션 (참조 안정성)
  const themeActions = useMemo<ThemeActions>(() => ({
    toggleTheme: () => setTheme(prev => prev === 'light' ? 'dark' : 'light'),
  }), []);

  return (
    <ThemeStateContext.Provider value={themeState}>
      <ThemeActionsContext.Provider value={themeActions}>
        {children}
      </ThemeActionsContext.Provider>
    </ThemeStateContext.Provider>
  );
}

// 상태만 사용하는 컴포넌트
const ThemedCard = memo(function ThemedCard() {
  const theme = useContext(ThemeStateContext);
  if (!theme) throw new Error('ThemeProvider required');

  return (
    <View style={[
      styles.card,
      { backgroundColor: theme.backgroundColor }
    ]}>
      <Text style={{ color: theme.primaryColor }}>
        Themed Card
      </Text>
    </View>
  );
});

// 액션만 사용하는 컴포넌트 (테마 변경 시 리렌더 안 됨!)
const ThemeToggleButton = memo(function ThemeToggleButton() {
  const actions = useContext(ThemeActionsContext);
  if (!actions) throw new Error('ThemeProvider required');

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    scale.value = withSpring(0.9, {}, () => {
      scale.value = withSpring(1);
    });
    actions.toggleTheme();
  }, [actions, scale]);

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.toggleButton, animatedStyle]}>
        <Text style={styles.toggleText}>Toggle Theme</Text>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 12,
    margin: 16,
  },
  toggleButton: {
    backgroundColor: '#7A4AE2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  toggleText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export { ThemeProvider, ThemeStateContext, ThemeActionsContext };
```

## sometimes-app 적용 사례

### 프로필 카드 리스트 최적화

```typescript
// src/features/matching/ui/optimized-profile-list.tsx
import React, { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { FlashList } from '@shopify/flash-list';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Profile {
  id: string;
  name: string;
  age: number;
  imageUrl: string;
  university: string;
  interests: string[];
}

// 관심사 뱃지 (완전 메모이제이션)
const InterestBadge = memo(function InterestBadge({
  interest,
}: {
  interest: string;
}) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{interest}</Text>
    </View>
  );
});

// 프로필 이미지 (이미지 로딩 최적화)
const ProfileImage = memo(function ProfileImage({
  uri,
  size,
}: {
  uri: string;
  size: number;
}) {
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleLoad = useCallback(() => {
    opacity.value = withTiming(1, { duration: 300 });
  }, [opacity]);

  return (
    <Animated.Image
      source={{ uri }}
      style={[
        styles.profileImage,
        { width: size, height: size },
        animatedStyle,
      ]}
      onLoad={handleLoad}
    />
  );
});

// 프로필 카드 (스와이프 가능)
const ProfileCard = memo(function ProfileCard({
  profile,
  index,
  onLike,
  onPass,
}: {
  profile: Profile;
  index: number;
  onLike: (id: string) => void;
  onPass: (id: string) => void;
}) {
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(1.02);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const threshold = SCREEN_WIDTH * 0.3;

      if (translateX.value > threshold) {
        translateX.value = withSpring(SCREEN_WIDTH, {}, () => {
          onLike(profile.id);
        });
      } else if (translateX.value < -threshold) {
        translateX.value = withSpring(-SCREEN_WIDTH, {}, () => {
          onPass(profile.id);
        });
      } else {
        translateX.value = withSpring(0);
      }

      scale.value = withSpring(1);
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-10, 0, 10],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotation}deg` },
        { scale: scale.value },
      ],
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SCREEN_WIDTH * 0.3],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const passStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SCREEN_WIDTH * 0.3, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  // 관심사 메모이제이션
  const renderedInterests = useMemo(() => (
    profile.interests.slice(0, 3).map(interest => (
      <InterestBadge key={interest} interest={interest} />
    ))
  ), [profile.interests]);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        entering={SlideInRight.delay(index * 100).springify()}
        style={[styles.card, cardStyle]}
      >
        <ProfileImage uri={profile.imageUrl} size={SCREEN_WIDTH - 48} />

        {/* Like/Pass 오버레이 */}
        <Animated.View style={[styles.likeOverlay, likeStyle]}>
          <Text style={styles.likeText}>LIKE</Text>
        </Animated.View>
        <Animated.View style={[styles.passOverlay, passStyle]}>
          <Text style={styles.passText}>PASS</Text>
        </Animated.View>

        {/* 프로필 정보 */}
        <View style={styles.info}>
          <Text style={styles.name}>
            {profile.name}, {profile.age}
          </Text>
          <Text style={styles.university}>{profile.university}</Text>
          <View style={styles.interests}>
            {renderedInterests}
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
},
  (prevProps, nextProps) => {
    return (
      prevProps.profile.id === nextProps.profile.id &&
      prevProps.index === nextProps.index
    );
  }
);

// 메인 리스트
export function OptimizedProfileList({
  profiles,
}: {
  profiles: Profile[];
}) {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set());

  // 필터링된 프로필
  const visibleProfiles = useMemo(() => {
    return profiles.filter(
      p => !likedIds.has(p.id) && !passedIds.has(p.id)
    );
  }, [profiles, likedIds, passedIds]);

  const handleLike = useCallback((id: string) => {
    setLikedIds(prev => new Set([...prev, id]));
  }, []);

  const handlePass = useCallback((id: string) => {
    setPassedIds(prev => new Set([...prev, id]));
  }, []);

  const renderItem = useCallback(({
    item,
    index,
  }: {
    item: Profile;
    index: number;
  }) => (
    <ProfileCard
      profile={item}
      index={index}
      onLike={handleLike}
      onPass={handlePass}
    />
  ), [handleLike, handlePass]);

  const keyExtractor = useCallback((item: Profile) => item.id, []);

  return (
    <FlashList
      data={visibleProfiles}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={400}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH - 32,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  profileImage: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  likeOverlay: {
    position: 'absolute',
    top: 30,
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
  passOverlay: {
    position: 'absolute',
    top: 30,
    right: 30,
    borderWidth: 4,
    borderColor: '#F44336',
    borderRadius: 8,
    padding: 10,
    transform: [{ rotate: '15deg' }],
  },
  passText: {
    color: '#F44336',
    fontSize: 32,
    fontWeight: 'bold',
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
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  badge: {
    backgroundColor: '#E2D5FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#7A4AE2',
    fontSize: 14,
    fontWeight: '500',
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 1. 인라인 객체/함수

```typescript
// ❌ 잘못된 예: 매 렌더마다 새 객체/함수 생성
<AnimatedComponent
  style={{ padding: 10 }} // 새 객체
  onPress={() => handlePress(item.id)} // 새 함수
/>

// ✅ 올바른 예
const style = useMemo(() => ({ padding: 10 }), []);
const handleItemPress = useCallback(() => handlePress(item.id), [item.id]);

<AnimatedComponent
  style={style}
  onPress={handleItemPress}
/>
```

### 2. 불필요한 메모이제이션

```typescript
// ❌ 과도한 메모이제이션
const value = useMemo(() => 1 + 1, []); // 단순 연산
const str = useMemo(() => 'hello', []); // 문자열

// ✅ 필요할 때만
const expensiveValue = useMemo(() => {
  return items.reduce((sum, item) => sum + item.value, 0);
}, [items]);
```

### 3. memo 없는 자식 컴포넌트

```typescript
// ❌ memo 없으면 부모 리렌더 시 같이 리렌더
function ParentComponent() {
  const [count, setCount] = useState(0);

  return (
    <>
      <ChildComponent /> {/* count 변경 시 리렌더됨! */}
      <button onClick={() => setCount(c => c + 1)} />
    </>
  );
}

// ✅ memo로 감싸기
const ChildComponent = memo(function ChildComponent() {
  return <View />;
});
```

## 💡 성능 최적화 팁

### 1. 렌더링 원인 추적

```typescript
// 개발용 렌더링 추적 훅
function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const previousProps = useRef<Record<string, any>>({});

  useEffect(() => {
    if (__DEV__) {
      const changedProps: Record<string, { from: any; to: any }> = {};

      Object.keys({ ...previousProps.current, ...props }).forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log(`[${name}] Changed props:`, changedProps);
      }
    }

    previousProps.current = props;
  });
}
```

### 2. 조건부 렌더링 최적화

```typescript
// 조건부 렌더링 시 컴포넌트 분리
const ConditionalAnimation = memo(function ConditionalAnimation({
  isVisible,
  children,
}: {
  isVisible: boolean;
  children: React.ReactNode;
}) {
  if (!isVisible) return null;

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      {children}
    </Animated.View>
  );
});
```

### 3. 지연 렌더링

```typescript
// 초기 렌더링 부하 분산
function LazyAnimatedList({ items }: { items: Item[] }) {
  const [renderedCount, setRenderedCount] = useState(10);

  useEffect(() => {
    if (renderedCount < items.length) {
      const timer = setTimeout(() => {
        setRenderedCount(prev => Math.min(prev + 10, items.length));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [renderedCount, items.length]);

  return (
    <View>
      {items.slice(0, renderedCount).map(item => (
        <AnimatedItem key={item.id} item={item} />
      ))}
    </View>
  );
}
```

## 🏋️ 연습 문제

### 문제 1: 렌더링 최적화

다음 컴포넌트의 불필요한 리렌더링을 제거하세요:

```typescript
function TodoList({ todos, onToggle }) {
  return (
    <View>
      {todos.map((todo, index) => (
        <TodoItem
          key={index}
          todo={todo}
          onToggle={() => onToggle(todo.id)}
        />
      ))}
    </View>
  );
}
```

### 문제 2: Context 분리

하나의 큰 Context를 상태와 액션으로 분리하세요.

### 문제 3: 리스트 가상화

1000개 이상의 애니메이션 아이템을 효율적으로 렌더링하세요.

<details>
<summary>정답 보기</summary>

```typescript
// 문제 1 정답
const TodoItem = memo(function TodoItem({
  todo,
  onToggle,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
}) {
  const handleToggle = useCallback(() => {
    onToggle(todo.id);
  }, [todo.id, onToggle]);

  return (
    <Pressable onPress={handleToggle}>
      <Text>{todo.text}</Text>
    </Pressable>
  );
});

function TodoList({ todos, onToggle }: {
  todos: Todo[];
  onToggle: (id: string) => void;
}) {
  const renderItem = useCallback(({ item }: { item: Todo }) => (
    <TodoItem
      todo={item}
      onToggle={onToggle}
    />
  ), [onToggle]);

  const keyExtractor = useCallback((item: Todo) => item.id, []);

  return (
    <FlashList
      data={todos}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={50}
    />
  );
}

// 문제 2 정답
const StateContext = createContext(null);
const ActionsContext = createContext(null);

function Provider({ children }) {
  const [state, setState] = useState(initialState);

  const actions = useMemo(() => ({
    action1: () => setState(/*...*/),
    action2: () => setState(/*...*/),
  }), []);

  return (
    <StateContext.Provider value={state}>
      <ActionsContext.Provider value={actions}>
        {children}
      </ActionsContext.Provider>
    </StateContext.Provider>
  );
}

// 문제 3 정답
function VirtualizedAnimatedList({ items }: { items: Item[] }) {
  const renderItem = useCallback(({ item, index }) => (
    <AnimatedListItem
      item={item}
      index={index}
    />
  ), []);

  return (
    <FlashList
      data={items}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      estimatedItemSize={80}
      // 뷰포트 외 아이템 제거
      removeClippedSubviews
      // 초기 렌더 개수 제한
      initialNumToRender={10}
      // 최대 렌더 개수 제한
      maxToRenderPerBatch={10}
      // 윈도우 크기
      windowSize={5}
    />
  );
}
```

</details>

## 📚 이 장에서 배운 내용

1. **리렌더링 원인**: State, Props, Context 변경으로 인한 리렌더
2. **SharedValue vs State**: 애니메이션은 SharedValue, UI 상태는 State
3. **useDerivedValue**: UI Thread에서 계산, 리렌더 없음
4. **컴포넌트 분리**: 애니메이션과 상태 로직 분리
5. **메모이제이션**: React.memo, useMemo, useCallback 적재적소 활용
6. **Context 최적화**: 상태와 액션 분리로 불필요한 리렌더 방지

## 다음 장 예고

**Chapter 59: 프로파일링 기법**에서는 React Native와 Reanimated 애니메이션의 성능을 측정하고 분석하는 도구와 기법을 배웁니다. Flipper, React DevTools, Performance Monitor 활용법을 다룹니다.
