# Chapter 69: 다크 모드와 테마

테마 전환 애니메이션과 다양한 테마를 지원하는 디자인 시스템 구축 방법을 학습합니다.

## 📌 학습 목표

- 부드러운 테마 전환 애니메이션
- 시스템 테마 연동
- 커스텀 테마 시스템 구축
- 색상 보간 최적화

## 📖 개념 이해

### 테마 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                   Theme Architecture                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐                                   │
│  │  System Theme   │                                   │
│  │  (light/dark)   │                                   │
│  └────────┬────────┘                                   │
│           │                                            │
│           ▼                                            │
│  ┌─────────────────────────────────────────────────┐  │
│  │              ThemeProvider                       │  │
│  │  ┌───────────────┐  ┌───────────────────────┐  │  │
│  │  │ Theme Config  │  │ Animation State       │  │  │
│  │  │ • colors      │  │ • themeProgress       │  │  │
│  │  │ • spacing     │  │ • transitionConfig    │  │  │
│  │  │ • typography  │  │ • interpolatedColors  │  │  │
│  │  └───────────────┘  └───────────────────────┘  │  │
│  └─────────────────────────────────────────────────┘  │
│           │                                            │
│           ▼                                            │
│  ┌─────────────────────────────────────────────────┐  │
│  │              Themed Components                   │  │
│  │  • useTheme()                                   │  │
│  │  • useAnimatedTheme()                           │  │
│  │  • ThemedView, ThemedText                       │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 색상 보간 방식

```
┌─────────────────────────────────────────────────────────┐
│              Color Interpolation Methods                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. RGB 선형 보간                                       │
│     ┌─────────┐     progress     ┌─────────┐           │
│     │ #FFFFFF │ ──────────────▶  │ #1A1A1A │           │
│     └─────────┘    0 ─▶ 1        └─────────┘           │
│     • 단순하지만 중간 색상이 탁해질 수 있음             │
│                                                         │
│  2. HSL 보간                                            │
│     ┌─────────┐                  ┌─────────┐           │
│     │ H:0 S:0 │ ──────────────▶  │ H:0 S:0 │           │
│     │ L:100%  │                  │ L:10%   │           │
│     └─────────┘                  └─────────┘           │
│     • 더 자연스러운 색상 전환                          │
│                                                         │
│  3. 교차 페이드 (Cross-fade)                            │
│     ┌─────────┐                  ┌─────────┐           │
│     │ Layer A │ opacity: 1 → 0   │ Layer B │           │
│     │ (light) │──────────────────│ (dark)  │           │
│     └─────────┘ opacity: 0 → 1   └─────────┘           │
│     • 복잡한 UI에 적합                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 💻 코드 예제

### 예제 1: 테마 정의 및 Provider

```typescript
// theme/types.ts
export interface ThemeColors {
  // 기본 색상
  primary: string;
  secondary: string;
  accent: string;

  // 배경 색상
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };

  // 텍스트 색상
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };

  // 상태 색상
  state: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };

  // 보더 색상
  border: {
    primary: string;
    secondary: string;
  };

  // 그림자
  shadow: string;
}

export interface Theme {
  name: 'light' | 'dark' | 'custom';
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
}

// theme/themes.ts
export const lightTheme: Theme = {
  name: 'light',
  colors: {
    primary: '#7C4DFF',
    secondary: '#6C63FF',
    accent: '#FF6B6B',

    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      tertiary: '#EEEEEE',
    },

    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
      tertiary: '#999999',
      inverse: '#FFFFFF',
    },

    state: {
      success: '#4CAF50',
      error: '#F44336',
      warning: '#FF9800',
      info: '#2196F3',
    },

    border: {
      primary: '#E0E0E0',
      secondary: '#F0F0F0',
    },

    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 9999,
  },
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    primary: '#BB86FC',
    secondary: '#9575CD',
    accent: '#FF8A80',

    background: {
      primary: '#121212',
      secondary: '#1E1E1E',
      tertiary: '#2D2D2D',
    },

    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      tertiary: '#707070',
      inverse: '#1A1A1A',
    },

    state: {
      success: '#81C784',
      error: '#E57373',
      warning: '#FFB74D',
      info: '#64B5F6',
    },

    border: {
      primary: '#333333',
      secondary: '#444444',
    },

    shadow: 'rgba(0, 0, 0, 0.5)',
  },
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
};

// theme/ThemeProvider.tsx
import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useCallback,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  interpolateColor,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  // 현재 테마
  theme: Theme;
  themeMode: ThemeMode;

  // 애니메이션 상태
  themeProgress: SharedValue<number>;
  isDark: boolean;

  // 제어
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;

  // 애니메이션 색상
  animatedColors: {
    background: SharedValue<string>;
    text: SharedValue<string>;
    primary: SharedValue<string>;
    secondary: SharedValue<string>;
    border: SharedValue<string>;
  };
}

const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

export function ThemeProvider({
  children,
  defaultMode = 'system',
}: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultMode);

  // 실제 적용되는 테마 결정
  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const theme = isDark ? darkTheme : lightTheme;

  // 테마 진행도 (0: light, 1: dark)
  const themeProgress = useSharedValue(isDark ? 1 : 0);

  // 테마 변경 시 애니메이션
  useEffect(() => {
    themeProgress.value = withTiming(isDark ? 1 : 0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
  }, [isDark]);

  // 애니메이션 색상
  const animatedColors = useMemo(() => {
    const background = useDerivedValue(() =>
      interpolateColor(
        themeProgress.value,
        [0, 1],
        [lightTheme.colors.background.primary, darkTheme.colors.background.primary]
      )
    );

    const text = useDerivedValue(() =>
      interpolateColor(
        themeProgress.value,
        [0, 1],
        [lightTheme.colors.text.primary, darkTheme.colors.text.primary]
      )
    );

    const primary = useDerivedValue(() =>
      interpolateColor(
        themeProgress.value,
        [0, 1],
        [lightTheme.colors.primary, darkTheme.colors.primary]
      )
    );

    const secondary = useDerivedValue(() =>
      interpolateColor(
        themeProgress.value,
        [0, 1],
        [lightTheme.colors.secondary, darkTheme.colors.secondary]
      )
    );

    const border = useDerivedValue(() =>
      interpolateColor(
        themeProgress.value,
        [0, 1],
        [lightTheme.colors.border.primary, darkTheme.colors.border.primary]
      )
    );

    return { background, text, primary, secondary, border };
  }, []);

  // 테마 모드 변경
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem('themeMode', mode);
  }, []);

  // 테마 토글
  const toggleTheme = useCallback(() => {
    const newMode: ThemeMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  }, [isDark, setThemeMode]);

  // 저장된 테마 모드 로드
  useEffect(() => {
    AsyncStorage.getItem('themeMode').then((stored) => {
      if (stored) {
        setThemeModeState(stored as ThemeMode);
      }
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      themeMode,
      themeProgress,
      isDark,
      setThemeMode,
      toggleTheme,
      animatedColors,
    }),
    [theme, themeMode, isDark, animatedColors]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### 예제 2: 테마 애니메이션 컴포넌트

```typescript
// components/ThemedView.tsx
import React from 'react';
import { ViewStyle, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';

type BackgroundType = 'primary' | 'secondary' | 'tertiary';

interface ThemedViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  background?: BackgroundType;
  animated?: boolean;
}

export function ThemedView({
  children,
  style,
  background = 'primary',
  animated = true,
}: ThemedViewProps) {
  const { theme, animatedColors, themeProgress } = useTheme();

  // 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => {
    if (!animated) {
      return {};
    }

    // 배경 타입에 따른 색상 선택
    const getBackgroundColor = () => {
      switch (background) {
        case 'secondary':
          return interpolateColor(
            themeProgress.value,
            [0, 1],
            [lightTheme.colors.background.secondary, darkTheme.colors.background.secondary]
          );
        case 'tertiary':
          return interpolateColor(
            themeProgress.value,
            [0, 1],
            [lightTheme.colors.background.tertiary, darkTheme.colors.background.tertiary]
          );
        default:
          return animatedColors.background.value;
      }
    };

    return {
      backgroundColor: getBackgroundColor(),
    };
  });

  if (!animated) {
    return (
      <View
        style={[
          { backgroundColor: theme.colors.background[background] },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
  );
}

// components/ThemedText.tsx
type TextType = 'primary' | 'secondary' | 'tertiary' | 'inverse';

interface ThemedTextProps {
  children: React.ReactNode;
  type?: TextType;
  style?: TextStyle;
  animated?: boolean;
}

export function ThemedText({
  children,
  type = 'primary',
  style,
  animated = true,
}: ThemedTextProps) {
  const { theme, themeProgress } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    if (!animated) {
      return {};
    }

    const getTextColor = () => {
      switch (type) {
        case 'secondary':
          return interpolateColor(
            themeProgress.value,
            [0, 1],
            [lightTheme.colors.text.secondary, darkTheme.colors.text.secondary]
          );
        case 'tertiary':
          return interpolateColor(
            themeProgress.value,
            [0, 1],
            [lightTheme.colors.text.tertiary, darkTheme.colors.text.tertiary]
          );
        case 'inverse':
          return interpolateColor(
            themeProgress.value,
            [0, 1],
            [lightTheme.colors.text.inverse, darkTheme.colors.text.inverse]
          );
        default:
          return interpolateColor(
            themeProgress.value,
            [0, 1],
            [lightTheme.colors.text.primary, darkTheme.colors.text.primary]
          );
      }
    };

    return {
      color: getTextColor(),
    };
  });

  if (!animated) {
    return (
      <Text style={[{ color: theme.colors.text[type] }, style]}>
        {children}
      </Text>
    );
  }

  return (
    <Animated.Text style={[animatedStyle, style]}>{children}</Animated.Text>
  );
}
```

### 예제 3: 테마 전환 애니메이션

```typescript
// components/ThemeToggle.tsx
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  interpolate,
  interpolateColor,
  Extrapolation,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';

export function ThemeToggle() {
  const { isDark, toggleTheme, themeProgress } = useTheme();
  const pressScale = useSharedValue(1);

  // 썬/문 아이콘 위치
  const iconPosition = useSharedValue(isDark ? 1 : 0);

  React.useEffect(() => {
    iconPosition.value = withSpring(isDark ? 1 : 0, {
      damping: 15,
      stiffness: 100,
    });
  }, [isDark]);

  const handlePress = () => {
    pressScale.value = withSequence(
      withSpring(0.9),
      withSpring(1)
    );
    toggleTheme();
  };

  // 컨테이너 스타일
  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      ['#E3F2FD', '#1A237E']
    ),
    transform: [{ scale: pressScale.value }],
  }));

  // 해/달 아이콘 스타일
  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          iconPosition.value,
          [0, 1],
          [4, 32],
          Extrapolation.CLAMP
        ),
      },
      {
        rotate: `${interpolate(iconPosition.value, [0, 1], [0, 360])}deg`,
      },
    ],
  }));

  // 해 스타일 (라이트 모드)
  const sunStyle = useAnimatedStyle(() => ({
    opacity: interpolate(iconPosition.value, [0, 0.5], [1, 0]),
    transform: [
      {
        scale: interpolate(iconPosition.value, [0, 0.5], [1, 0.5]),
      },
    ],
  }));

  // 달 스타일 (다크 모드)
  const moonStyle = useAnimatedStyle(() => ({
    opacity: interpolate(iconPosition.value, [0.5, 1], [0, 1]),
    transform: [
      {
        scale: interpolate(iconPosition.value, [0.5, 1], [0.5, 1]),
      },
    ],
  }));

  // 별 스타일
  const starsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(iconPosition.value, [0.7, 1], [0, 1]),
  }));

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.container, containerStyle]}>
        {/* 별 (다크 모드) */}
        <Animated.View style={[styles.stars, starsStyle]}>
          <View style={[styles.star, styles.star1]} />
          <View style={[styles.star, styles.star2]} />
          <View style={[styles.star, styles.star3]} />
        </Animated.View>

        {/* 아이콘 컨테이너 */}
        <Animated.View style={[styles.iconContainer, iconStyle]}>
          {/* 해 */}
          <Animated.View style={[styles.sun, sunStyle]}>
            <View style={styles.sunCore} />
            {/* 태양 광선 */}
            {[...Array(8)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.sunRay,
                  { transform: [{ rotate: `${i * 45}deg` }] },
                ]}
              />
            ))}
          </Animated.View>

          {/* 달 */}
          <Animated.View style={[styles.moon, moonStyle]}>
            <View style={styles.moonCore} />
            <View style={styles.moonCrater1} />
            <View style={styles.moonCrater2} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sun: {
    position: 'absolute',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sunCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFC107',
  },
  sunRay: {
    position: 'absolute',
    width: 2,
    height: 6,
    backgroundColor: '#FFC107',
    top: -2,
  },
  moon: {
    position: 'absolute',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moonCore: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFF9C4',
  },
  moonCrater1: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    top: 8,
    left: 6,
  },
  moonCrater2: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#E0E0E0',
    bottom: 6,
    right: 8,
  },
  stars: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFF',
  },
  star1: { top: 8, left: 8 },
  star2: { top: 16, left: 16 },
  star3: { top: 6, right: 20 },
});
```

### 예제 4: 전체 화면 테마 전환 효과

```typescript
// components/ThemeTransitionOverlay.tsx
import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DIAGONAL = Math.sqrt(SCREEN_WIDTH ** 2 + SCREEN_HEIGHT ** 2);

interface ThemeTransitionOverlayProps {
  originX?: number;
  originY?: number;
}

export function ThemeTransitionOverlay({
  originX = SCREEN_WIDTH / 2,
  originY = SCREEN_HEIGHT / 2,
}: ThemeTransitionOverlayProps) {
  const { isDark, themeProgress } = useTheme();
  const circleRadius = useSharedValue(0);
  const isVisible = useSharedValue(false);

  // 테마 변경 감지
  React.useEffect(() => {
    // 원형 확장 애니메이션
    isVisible.value = true;
    circleRadius.value = 0;
    circleRadius.value = withTiming(
      DIAGONAL,
      {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(() => {
            isVisible.value = false;
          })();
        }
      }
    );
  }, [isDark]);

  const overlayStyle = useAnimatedStyle(() => {
    if (!isVisible.value) {
      return { display: 'none' };
    }

    return {
      display: 'flex',
      transform: [
        { translateX: originX - circleRadius.value },
        { translateY: originY - circleRadius.value },
      ],
      width: circleRadius.value * 2,
      height: circleRadius.value * 2,
      borderRadius: circleRadius.value,
    };
  });

  const backgroundColor = isDark
    ? darkTheme.colors.background.primary
    : lightTheme.colors.background.primary;

  return (
    <Animated.View
      style={[styles.overlay, { backgroundColor }, overlayStyle]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    zIndex: 9999,
  },
});

// 물결 효과 버전
export function RippleThemeTransition({
  originX = SCREEN_WIDTH / 2,
  originY = SCREEN_HEIGHT / 2,
}) {
  const { isDark, themeProgress } = useTheme();
  const ripples = useSharedValue<number[]>([]);
  const maxRipples = 3;

  React.useEffect(() => {
    // 여러 개의 물결 생성
    const newRipples: number[] = [];
    for (let i = 0; i < maxRipples; i++) {
      setTimeout(() => {
        // 물결 추가 로직
      }, i * 100);
    }
  }, [isDark]);

  // ... 물결 렌더링
}
```

### 예제 5: 색상 보간 유틸리티

```typescript
// utils/colorInterpolation.ts
import { interpolateColor } from 'react-native-reanimated';

// 여러 테마 간 보간
export function interpolateThemeColors(
  progress: number,
  themes: Theme[],
  colorPath: string
): string {
  'worklet';

  if (themes.length < 2) {
    return getColorByPath(themes[0], colorPath);
  }

  // 진행도에 따른 테마 인덱스 계산
  const segmentCount = themes.length - 1;
  const scaledProgress = progress * segmentCount;
  const themeIndex = Math.min(
    Math.floor(scaledProgress),
    segmentCount - 1
  );
  const segmentProgress = scaledProgress - themeIndex;

  const fromColor = getColorByPath(themes[themeIndex], colorPath);
  const toColor = getColorByPath(themes[themeIndex + 1], colorPath);

  return interpolateColor(segmentProgress, [0, 1], [fromColor, toColor]);
}

function getColorByPath(theme: Theme, path: string): string {
  const parts = path.split('.');
  let value: any = theme.colors;

  for (const part of parts) {
    value = value[part];
  }

  return value as string;
}

// HSL 기반 색상 보간 (더 자연스러운 전환)
export function interpolateColorHSL(
  color1: string,
  color2: string,
  progress: number
): string {
  'worklet';

  const hsl1 = hexToHSL(color1);
  const hsl2 = hexToHSL(color2);

  const h = hsl1.h + (hsl2.h - hsl1.h) * progress;
  const s = hsl1.s + (hsl2.s - hsl1.s) * progress;
  const l = hsl1.l + (hsl2.l - hsl1.l) * progress;

  return hslToHex(h, s, l);
}

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  'worklet';

  // hex를 RGB로 변환
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  'worklet';

  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// 대비 보장 색상 생성
export function getContrastColor(
  backgroundColor: string,
  lightColor = '#FFFFFF',
  darkColor = '#000000'
): string {
  'worklet';

  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // 상대적 휘도 계산
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? darkColor : lightColor;
}
```

## 🎨 sometimes-app 적용 사례

### 테마 지원 프로필 카드

```typescript
// features/matching/ui/ThemedProfileCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme, lightTheme, darkTheme } from '@/theme/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProfileCardProps {
  profile: {
    id: string;
    name: string;
    age: number;
    university: string;
    photo: string;
    bio: string;
    interests: string[];
  };
}

export function ThemedProfileCard({ profile }: ProfileCardProps) {
  const { theme, themeProgress, isDark } = useTheme();

  // 카드 배경 애니메이션
  const cardStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [lightTheme.colors.background.primary, darkTheme.colors.background.secondary]
    ),
    shadowColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']
    ),
  }));

  // 텍스트 색상 애니메이션
  const nameStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [lightTheme.colors.text.primary, darkTheme.colors.text.primary]
    ),
  }));

  const secondaryTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [lightTheme.colors.text.secondary, darkTheme.colors.text.secondary]
    ),
  }));

  // 태그 스타일 애니메이션
  const tagStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [lightTheme.colors.background.secondary, darkTheme.colors.background.tertiary]
    ),
  }));

  const tagTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [lightTheme.colors.primary, darkTheme.colors.primary]
    ),
  }));

  // 그라데이션 오버레이 (이미지 위)
  const gradientStyle = useAnimatedStyle(() => {
    const isDarkMode = themeProgress.value > 0.5;
    return {
      backgroundColor: isDarkMode
        ? 'rgba(0,0,0,0.4)'
        : 'rgba(255,255,255,0.1)',
    };
  });

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      {/* 프로필 이미지 */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: profile.photo }} style={styles.image} />
        <Animated.View style={[styles.imageGradient, gradientStyle]} />
      </View>

      {/* 프로필 정보 */}
      <View style={styles.info}>
        <View style={styles.header}>
          <Animated.Text style={[styles.name, nameStyle]}>
            {profile.name}, {profile.age}
          </Animated.Text>
          <VerifiedBadge />
        </View>

        <Animated.Text style={[styles.university, secondaryTextStyle]}>
          {profile.university}
        </Animated.Text>

        <Animated.Text style={[styles.bio, secondaryTextStyle]}>
          {profile.bio}
        </Animated.Text>

        {/* 관심사 태그 */}
        <View style={styles.interests}>
          {profile.interests.slice(0, 3).map((interest, index) => (
            <Animated.View key={index} style={[styles.tag, tagStyle]}>
              <Animated.Text style={[styles.tagText, tagTextStyle]}>
                {interest}
              </Animated.Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* 액션 버튼 */}
      <ThemedActionButtons />
    </Animated.View>
  );
}

// 테마 지원 액션 버튼
function ThemedActionButtons() {
  const { themeProgress } = useTheme();

  const buttonStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      ['#FFFFFF', darkTheme.colors.background.tertiary]
    ),
    borderColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [lightTheme.colors.border.primary, darkTheme.colors.border.primary]
    ),
  }));

  return (
    <View style={styles.actions}>
      <ActionButton
        icon="✕"
        color="#FF6B6B"
        buttonStyle={buttonStyle}
      />
      <ActionButton
        icon="★"
        color="#6C63FF"
        size="small"
        buttonStyle={buttonStyle}
      />
      <ActionButton
        icon="♥"
        color="#4ECDC4"
        buttonStyle={buttonStyle}
      />
    </View>
  );
}

// 인증 배지 (테마 지원)
function VerifiedBadge() {
  const { themeProgress } = useTheme();

  const badgeStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [lightTheme.colors.primary, darkTheme.colors.primary]
    ),
  }));

  return (
    <Animated.View style={[styles.badge, badgeStyle]}>
      <Text style={styles.badgeText}>✓</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH - 40,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: SCREEN_WIDTH * 0.8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  info: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  university: {
    fontSize: 16,
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 16,
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 실수 1: 성능 문제 - 과도한 보간

```typescript
// ❌ 잘못된 방식 - 모든 색상을 개별 보간
function BadThemedComponent() {
  const { themeProgress } = useTheme();

  // 20개 이상의 색상을 개별 보간 - 성능 저하
  const style1 = useAnimatedStyle(() => ({
    color: interpolateColor(themeProgress.value, ...),
  }));
  const style2 = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(themeProgress.value, ...),
  }));
  // ... 20개 더

  return <View>...</View>;
}

// ✅ 올바른 방식 - 통합 스타일 + 메모이제이션
function GoodThemedComponent() {
  const { theme, themeProgress } = useTheme();

  // 하나의 애니메이션 스타일에 필요한 것만 포함
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [lightTheme.colors.background.primary, darkTheme.colors.background.primary]
    ),
    borderColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [lightTheme.colors.border.primary, darkTheme.colors.border.primary]
    ),
  }));

  // 나머지는 정적 테마 값 사용
  return (
    <Animated.View style={animatedStyle}>
      <Text style={{ color: theme.colors.text.primary }}>...</Text>
    </Animated.View>
  );
}
```

### 실수 2: 시스템 테마 변경 미감지

```typescript
// ❌ 잘못된 방식 - 초기값만 확인
function BadThemeProvider() {
  const systemTheme = useColorScheme(); // 변경 감지 안 됨

  const [theme, setTheme] = useState(systemTheme);
  // theme이 업데이트 안 됨
}

// ✅ 올바른 방식 - useEffect로 감지
function GoodThemeProvider() {
  const systemTheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemTheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemTheme]);

  // systemTheme 변경 시 자동 업데이트
}
```

## 💡 테마 팁

### 1. 성능 최적화

```typescript
// 애니메이션이 필요 없는 컴포넌트는 정적 테마 사용
const StaticThemedView = memo(({ children }) => {
  const { theme } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background.primary }}>
      {children}
    </View>
  );
});

// 애니메이션이 필요한 컴포넌트만 동적 보간
const AnimatedThemedView = ({ children }) => {
  const { themeProgress } = useTheme();
  // ...
};
```

### 2. 접근성 고려

```typescript
// 고대비 모드 지원
const useHighContrastTheme = () => {
  const { theme, isDark } = useTheme();
  const isHighContrast = useAccessibilityHighContrast();

  if (isHighContrast) {
    return {
      ...theme,
      colors: {
        ...theme.colors,
        text: {
          primary: isDark ? '#FFFFFF' : '#000000',
          // ... 더 높은 대비
        },
      },
    };
  }

  return theme;
};
```

## 🏋️ 연습 문제

### 문제 1: 커스텀 테마 선택기

사용자가 여러 커스텀 테마 중 선택할 수 있는 테마 선택기를 구현하세요.

<details>
<summary>정답 보기</summary>

```typescript
const themes = [
  { id: 'default', name: '기본', primary: '#7C4DFF' },
  { id: 'ocean', name: '오션', primary: '#00BCD4' },
  { id: 'sunset', name: '석양', primary: '#FF5722' },
  { id: 'forest', name: '숲', primary: '#4CAF50' },
];

function ThemeSelector() {
  const { theme, setCustomTheme } = useTheme();
  const selectedScale = useSharedValue(1);

  return (
    <View style={styles.selector}>
      {themes.map((t, index) => {
        const isSelected = theme.id === t.id;

        const circleStyle = useAnimatedStyle(() => ({
          transform: [
            { scale: isSelected ? withSpring(1.2) : withSpring(1) },
          ],
          borderWidth: isSelected ? 3 : 0,
          borderColor: '#FFF',
        }));

        return (
          <Pressable
            key={t.id}
            onPress={() => setCustomTheme(t.id)}
          >
            <Animated.View
              style={[
                styles.themeCircle,
                { backgroundColor: t.primary },
                circleStyle,
              ]}
            >
              {isSelected && <Text style={styles.check}>✓</Text>}
            </Animated.View>
            <Text style={styles.themeName}>{t.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
```

</details>

## 📚 이 장에서 배운 내용

1. **테마 시스템**: Provider 기반 테마 관리
2. **색상 보간**: RGB, HSL 기반 부드러운 전환
3. **시스템 연동**: 시스템 다크 모드 자동 감지
4. **전환 효과**: 원형 확장, 페이드 등 전환 애니메이션
5. **성능 최적화**: 필요한 곳에만 동적 보간

## 다음 장 예고

**Chapter 70: 국제화**에서는 RTL(Right-to-Left) 레이아웃 지원과 다국어 환경에서의 애니메이션 처리 방법을 배웁니다.
