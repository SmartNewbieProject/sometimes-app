# Chapter 33: SVG 애니메이션

Part 5의 첫 번째 장입니다. SVG(Scalable Vector Graphics)를 Reanimated와 결합해 해상도에 독립적인 고품질 애니메이션을 구현합니다.

## 📌 학습 목표

- react-native-svg와 Reanimated 통합
- Path 애니메이션 (드로잉 효과)
- SVG Transform 애니메이션
- 모프 애니메이션 (형태 변환)
- 복잡한 아이콘 애니메이션

## 📖 SVG + Reanimated 기초

### 왜 SVG인가?

```
┌────────────────────────────────────────────────┐
│              래스터 vs 벡터                     │
├───────────────────────┬────────────────────────┤
│      PNG/JPG          │         SVG            │
├───────────────────────┼────────────────────────┤
│ • 픽셀 기반            │ • 수학적 경로 기반      │
│ • 확대 시 깨짐         │ • 무한 확대 가능        │
│ • 파일 크기 큼         │ • 파일 크기 작음        │
│ • 애니메이션 제한적    │ • 속성별 애니메이션     │
│ • 색상 변경 불가       │ • 동적 색상 변경        │
└───────────────────────┴────────────────────────┘
```

### 기본 설정

```bash
# 필수 패키지 설치
npm install react-native-svg
npm install react-native-reanimated

# Babel 설정은 Reanimated 기본 설정과 동일
```

### Animated SVG 컴포넌트 생성

```typescript
// utils/animated-svg.ts
import Animated from 'react-native-reanimated';
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
  Polygon,
  Polyline,
  G,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
  Mask,
} from 'react-native-svg';

// Animated 버전 생성
export const AnimatedPath = Animated.createAnimatedComponent(Path);
export const AnimatedCircle = Animated.createAnimatedComponent(Circle);
export const AnimatedRect = Animated.createAnimatedComponent(Rect);
export const AnimatedLine = Animated.createAnimatedComponent(Line);
export const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
export const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);
export const AnimatedG = Animated.createAnimatedComponent(G);
export const AnimatedSvg = Animated.createAnimatedComponent(Svg);

// 타입 내보내기
export type { PathProps } from 'react-native-svg';
```

## 💻 Path 드로잉 애니메이션

### stroke-dasharray와 stroke-dashoffset

```typescript
// components/DrawingPath.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface DrawingPathProps {
  d: string;
  stroke?: string;
  strokeWidth?: number;
  duration?: number;
  delay?: number;
}

function DrawingPath({
  d,
  stroke = '#7A4AE2',
  strokeWidth = 3,
  duration = 2000,
  delay = 0,
}: DrawingPathProps) {
  const progress = useSharedValue(0);

  // Path 길이 계산을 위한 임시 측정
  const pathLength = 1000; // 실제로는 getPointAtLength로 계산

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.inOut(Easing.cubic),
      })
    );
  }, [delay, duration, progress]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: pathLength * (1 - progress.value),
    };
  });

  return (
    <AnimatedPath
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={pathLength}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      animatedProps={animatedProps}
    />
  );
}

export default DrawingPath;
```

### 체크마크 드로잉 애니메이션

```typescript
// components/AnimatedCheckmark.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AnimatedCheckmarkProps {
  size?: number;
  checked: boolean;
  onToggle: () => void;
  activeColor?: string;
  inactiveColor?: string;
}

const CHECKMARK_PATH = 'M 20 52 L 40 72 L 80 28';
const CHECKMARK_LENGTH = 90; // 대략적인 체크마크 길이

function AnimatedCheckmark({
  size = 100,
  checked,
  onToggle,
  activeColor = '#7A4AE2',
  inactiveColor = '#E0E0E0',
}: AnimatedCheckmarkProps) {
  const progress = useSharedValue(checked ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (checked) {
      // 체크 시: 스케일 효과 + 드로잉
      scale.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withSpring(1, { damping: 10 })
      );
      progress.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      // 체크 해제: 역방향 드로잉
      progress.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      });
    }
  }, [checked, progress, scale]);

  const circleProps = useAnimatedProps(() => {
    return {
      fill: interpolate(progress.value, [0, 1], [0, 1]) > 0.5
        ? activeColor
        : inactiveColor,
      stroke: interpolate(progress.value, [0, 1], [0, 1]) > 0.5
        ? activeColor
        : inactiveColor,
    };
  });

  const checkmarkProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: CHECKMARK_LENGTH * (1 - progress.value),
      opacity: progress.value,
    };
  });

  const containerProps = useAnimatedProps(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={onToggle}>
      <Animated.View style={containerProps}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* 배경 원 */}
          <AnimatedCircle
            cx={50}
            cy={50}
            r={45}
            strokeWidth={3}
            animatedProps={circleProps}
          />

          {/* 체크마크 */}
          <AnimatedPath
            d={CHECKMARK_PATH}
            stroke="#FFFFFF"
            strokeWidth={8}
            strokeDasharray={CHECKMARK_LENGTH}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            animatedProps={checkmarkProps}
          />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}

export default AnimatedCheckmark;
```

### 서명 애니메이션

```typescript
// components/SignatureAnimation.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 복잡한 서명 경로 (여러 스트로크)
const SIGNATURE_PATHS = [
  {
    d: 'M 20 80 Q 40 20, 60 60 T 100 40',
    length: 150,
    delay: 0,
  },
  {
    d: 'M 80 30 Q 100 80, 140 50 T 180 70',
    length: 160,
    delay: 600,
  },
  {
    d: 'M 160 40 L 200 80 Q 220 60, 250 70',
    length: 120,
    delay: 1200,
  },
];

function SignatureAnimation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const progresses = SIGNATURE_PATHS.map(() => useSharedValue(0));

  const playAnimation = () => {
    setIsPlaying(true);

    SIGNATURE_PATHS.forEach((path, index) => {
      progresses[index].value = 0;
      progresses[index].value = withDelay(
        path.delay,
        withTiming(1, {
          duration: 800,
          easing: Easing.inOut(Easing.quad),
        })
      );
    });

    // 애니메이션 완료 후 상태 업데이트
    setTimeout(() => {
      setIsPlaying(false);
    }, 2000);
  };

  const resetAnimation = () => {
    progresses.forEach((progress) => {
      progress.value = 0;
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.signatureBox}>
        <Svg
          width={SCREEN_WIDTH - 40}
          height={150}
          viewBox="0 0 280 100"
        >
          {SIGNATURE_PATHS.map((path, index) => (
            <SignaturePath
              key={index}
              d={path.d}
              length={path.length}
              progress={progresses[index]}
            />
          ))}
        </Svg>
      </View>

      <View style={styles.buttons}>
        <Pressable
          style={[styles.button, isPlaying && styles.buttonDisabled]}
          onPress={playAnimation}
          disabled={isPlaying}
        >
          <Text style={styles.buttonText}>재생</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={resetAnimation}>
          <Text style={styles.buttonText}>초기화</Text>
        </Pressable>
      </View>
    </View>
  );
}

interface SignaturePathProps {
  d: string;
  length: number;
  progress: Animated.SharedValue<number>;
}

function SignaturePath({ d, length, progress }: SignaturePathProps) {
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: length * (1 - progress.value),
  }));

  return (
    <AnimatedPath
      d={d}
      stroke="#1A1A1A"
      strokeWidth={2}
      strokeDasharray={length}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      animatedProps={animatedProps}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  signatureBox: {
    backgroundColor: '#FFFEF0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  button: {
    backgroundColor: '#7A4AE2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignatureAnimation;
```

## 💻 SVG Transform 애니메이션

### 기본 Transform

```typescript
// components/SVGTransforms.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

function SVGTransformDemo() {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);

  useEffect(() => {
    // 회전 애니메이션
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // 스케일 애니메이션
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(0.8, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );

    // 이동 애니메이션
    translateX.value = withRepeat(
      withSequence(
        withTiming(50, { duration: 1500 }),
        withTiming(-50, { duration: 1500 })
      ),
      -1,
      true
    );
  }, [rotation, scale, translateX]);

  // 회전하는 사각형
  const rotatingProps = useAnimatedProps(() => ({
    transform: [
      { translateX: 50 },
      { translateY: 50 },
      { rotate: `${rotation.value}deg` },
      { translateX: -25 },
      { translateY: -25 },
    ],
  }));

  // 스케일 변화하는 사각형
  const scalingProps = useAnimatedProps(() => ({
    transform: [
      { translateX: 150 },
      { translateY: 50 },
      { scale: scale.value },
      { translateX: -25 },
      { translateY: -25 },
    ],
  }));

  // 이동하는 사각형
  const movingProps = useAnimatedProps(() => ({
    transform: [
      { translateX: 250 + translateX.value },
      { translateY: 25 },
    ],
  }));

  return (
    <View style={styles.container}>
      <Svg width={350} height={100} viewBox="0 0 350 100">
        {/* 회전 */}
        <AnimatedG animatedProps={rotatingProps}>
          <Rect
            width={50}
            height={50}
            fill="#7A4AE2"
            rx={8}
          />
        </AnimatedG>

        {/* 스케일 */}
        <AnimatedG animatedProps={scalingProps}>
          <Rect
            width={50}
            height={50}
            fill="#4AE27A"
            rx={8}
          />
        </AnimatedG>

        {/* 이동 */}
        <AnimatedG animatedProps={movingProps}>
          <Rect
            width={50}
            height={50}
            fill="#E27A4A"
            rx={8}
          />
        </AnimatedG>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
});

export default SVGTransformDemo;
```

### 로딩 스피너

```typescript
// components/SVGLoadingSpinner.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

interface SVGLoadingSpinnerProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function SVGLoadingSpinner({
  size = 60,
  color = '#7A4AE2',
  strokeWidth = 4,
}: SVGLoadingSpinnerProps) {
  const rotation = useSharedValue(0);
  const strokeDashoffset = useSharedValue(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // 회전 애니메이션
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // 대시 오프셋 애니메이션 (늘어났다 줄어들기)
    strokeDashoffset.value = withRepeat(
      withSequence(
        withTiming(circumference * 0.75, {
          duration: 750,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(circumference * 0.25, {
          duration: 750,
          easing: Easing.inOut(Easing.quad),
        })
      ),
      -1,
      false
    );
  }, [circumference, rotation, strokeDashoffset]);

  const groupProps = useAnimatedProps(() => ({
    transform: [
      { translateX: size / 2 },
      { translateY: size / 2 },
      { rotate: `${rotation.value}deg` },
      { translateX: -size / 2 },
      { translateY: -size / 2 },
    ],
  }));

  const circleProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 배경 원 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`${color}20`}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* 애니메이션 원 */}
        <AnimatedG animatedProps={groupProps}>
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            fill="none"
            strokeLinecap="round"
            animatedProps={circleProps}
          />
        </AnimatedG>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SVGLoadingSpinner;
```

### 원형 프로그레스

```typescript
// components/CircularProgress.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useDerivedValue,
  withTiming,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0 to 1
  duration?: number;
  showPercentage?: boolean;
  gradientColors?: [string, string];
}

function CircularProgress({
  size = 120,
  strokeWidth = 12,
  progress,
  duration = 1000,
  showPercentage = true,
  gradientColors = ['#7A4AE2', '#E24A7A'],
}: CircularProgressProps) {
  const animatedProgress = useSharedValue(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, duration, animatedProgress]);

  const circleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  // 퍼센트 텍스트
  const percentage = useDerivedValue(() => {
    return Math.round(animatedProgress.value * 100);
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradientColors[0]} />
            <Stop offset="100%" stopColor={gradientColors[1]} />
          </LinearGradient>
        </Defs>

        {/* 배경 원 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E8E8E8"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* 진행 원 */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          fill="none"
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          animatedProps={circleProps}
        />
      </Svg>

      {showPercentage && (
        <View style={styles.percentageContainer}>
          <AnimatedPercentageText value={percentage} />
        </View>
      )}
    </View>
  );
}

interface AnimatedPercentageTextProps {
  value: Animated.SharedValue<number>;
}

function AnimatedPercentageText({ value }: AnimatedPercentageTextProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1,
  }));

  // ReText 사용 시 (react-native-redash)
  // return <ReText text={value} style={styles.percentageText} />;

  // 간단한 버전
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      // JS 스레드에서 값 읽기 (성능상 권장하지 않음)
      // 실제로는 ReText나 다른 방법 사용
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.Text style={[styles.percentageText, animatedStyle]}>
      {Math.round(value.value * 100)}%
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});

export default CircularProgress;
```

## 💻 모프(Morph) 애니메이션

### Path 모핑 기초

```typescript
// components/PathMorph.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { interpolatePath } from 'react-native-redash';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// 같은 수의 포인트를 가진 두 경로
const PLAY_PATH = 'M 30 20 L 80 50 L 30 80 Z';
const PAUSE_PATH = 'M 25 20 L 40 20 L 40 80 L 25 80 Z M 60 20 L 75 20 L 75 80 L 60 80 Z';

// 단순화된 버전 (포인트 수 맞추기)
const PLAY_SIMPLIFIED = 'M 30 20 L 30 20 L 80 50 L 80 50 L 30 80 L 30 80';
const PAUSE_SIMPLIFIED = 'M 25 20 L 40 20 L 40 80 L 60 80 L 75 20 L 75 80';

function PlayPauseMorph() {
  const [isPlaying, setIsPlaying] = useState(false);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(isPlaying ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isPlaying, progress]);

  const animatedProps = useAnimatedProps(() => {
    const d = interpolatePath(progress.value, [0, 1], [PLAY_SIMPLIFIED, PAUSE_SIMPLIFIED]);
    return { d };
  });

  return (
    <Pressable
      style={styles.button}
      onPress={() => setIsPlaying(!isPlaying)}
    >
      <Svg width={100} height={100} viewBox="0 0 100 100">
        <AnimatedPath
          fill="#7A4AE2"
          animatedProps={animatedProps}
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 100,
    height: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlayPauseMorph;
```

### 햄버거 메뉴 → X 변환

```typescript
// components/HamburgerToX.tsx
import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Line, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedG = Animated.createAnimatedComponent(G);

interface HamburgerToXProps {
  size?: number;
  color?: string;
  isOpen: boolean;
  onToggle: () => void;
}

function HamburgerToX({
  size = 30,
  color = '#1A1A1A',
  isOpen,
  onToggle,
}: HamburgerToXProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(isOpen ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [isOpen, progress]);

  // 상단 라인: 회전하여 X의 한쪽이 됨
  const topLineProps = useAnimatedProps(() => {
    const y1 = interpolate(progress.value, [0, 1], [8, 15], Extrapolation.CLAMP);
    const y2 = interpolate(progress.value, [0, 1], [8, 15], Extrapolation.CLAMP);
    const rotate = interpolate(progress.value, [0, 1], [0, 45], Extrapolation.CLAMP);

    return {
      y1,
      y2,
      transform: [
        { translateX: 15 },
        { translateY: 15 },
        { rotate: `${rotate}deg` },
        { translateX: -15 },
        { translateY: -15 },
      ],
    };
  });

  // 중간 라인: 사라짐
  const middleLineProps = useAnimatedProps(() => {
    const opacity = interpolate(progress.value, [0, 0.5], [1, 0], Extrapolation.CLAMP);
    const scaleX = interpolate(progress.value, [0, 0.5], [1, 0], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [{ scaleX }],
    };
  });

  // 하단 라인: 반대 방향으로 회전
  const bottomLineProps = useAnimatedProps(() => {
    const y1 = interpolate(progress.value, [0, 1], [22, 15], Extrapolation.CLAMP);
    const y2 = interpolate(progress.value, [0, 1], [22, 15], Extrapolation.CLAMP);
    const rotate = interpolate(progress.value, [0, 1], [0, -45], Extrapolation.CLAMP);

    return {
      y1,
      y2,
      transform: [
        { translateX: 15 },
        { translateY: 15 },
        { rotate: `${rotate}deg` },
        { translateX: -15 },
        { translateY: -15 },
      ],
    };
  });

  return (
    <Pressable style={styles.button} onPress={onToggle}>
      <Svg width={size} height={size} viewBox="0 0 30 30">
        {/* 상단 라인 */}
        <AnimatedG animatedProps={topLineProps}>
          <AnimatedLine
            x1={6}
            x2={24}
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            animatedProps={topLineProps}
          />
        </AnimatedG>

        {/* 중간 라인 */}
        <AnimatedLine
          x1={6}
          y1={15}
          x2={24}
          y2={15}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          animatedProps={middleLineProps}
        />

        {/* 하단 라인 */}
        <AnimatedG animatedProps={bottomLineProps}>
          <AnimatedLine
            x1={6}
            x2={24}
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            animatedProps={bottomLineProps}
          />
        </AnimatedG>
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});

export default HamburgerToX;
```

### 날씨 아이콘 모프

```typescript
// components/WeatherIconMorph.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import Svg, { Path, Circle, G, Defs, ClipPath, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Extrapolation,
  Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

type WeatherType = 'sunny' | 'cloudy' | 'rainy';

interface WeatherIconMorphProps {
  weather: WeatherType;
  size?: number;
}

function WeatherIconMorph({ weather, size = 100 }: WeatherIconMorphProps) {
  const sunProgress = useSharedValue(0);
  const cloudProgress = useSharedValue(0);
  const rainProgress = useSharedValue(0);

  // 해 광선 회전
  const sunRotation = useSharedValue(0);

  // 비 애니메이션
  const rainOffset = useSharedValue(0);

  useEffect(() => {
    // 날씨에 따른 요소 표시/숨김
    sunProgress.value = withSpring(weather === 'sunny' ? 1 : 0);
    cloudProgress.value = withSpring(weather !== 'sunny' ? 1 : 0);
    rainProgress.value = withSpring(weather === 'rainy' ? 1 : 0);

    // 해 회전 애니메이션
    if (weather === 'sunny') {
      sunRotation.value = withRepeat(
        withTiming(360, { duration: 10000, easing: Easing.linear }),
        -1,
        false
      );
    }

    // 비 애니메이션
    if (weather === 'rainy') {
      rainOffset.value = withRepeat(
        withTiming(20, { duration: 500, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [weather, sunProgress, cloudProgress, rainProgress, sunRotation, rainOffset]);

  // 해 광선 애니메이션
  const sunRaysProps = useAnimatedProps(() => ({
    transform: [
      { translateX: 50 },
      { translateY: 35 },
      { rotate: `${sunRotation.value}deg` },
      { translateX: -50 },
      { translateY: -35 },
    ],
    opacity: sunProgress.value,
  }));

  // 해 본체 스케일
  const sunBodyProps = useAnimatedProps(() => ({
    r: interpolate(sunProgress.value, [0, 1], [10, 18], Extrapolation.CLAMP),
    opacity: sunProgress.value,
  }));

  // 구름 이동
  const cloudProps = useAnimatedProps(() => ({
    transform: [
      { translateX: interpolate(cloudProgress.value, [0, 1], [30, 0]) },
    ],
    opacity: cloudProgress.value,
  }));

  // 비 방울 애니메이션
  const rainProps = useAnimatedProps(() => ({
    transform: [{ translateY: rainOffset.value }],
    opacity: rainProgress.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* 해 */}
        <AnimatedG animatedProps={sunRaysProps}>
          {/* 광선 */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
            <Path
              key={index}
              d={`M 50 ${35 - 22} L 50 ${35 - 28}`}
              stroke="#FFB800"
              strokeWidth={3}
              strokeLinecap="round"
              transform={`rotate(${angle} 50 35)`}
            />
          ))}
        </AnimatedG>

        {/* 해 본체 */}
        <AnimatedCircle
          cx={50}
          cy={35}
          fill="#FFD600"
          animatedProps={sunBodyProps}
        />

        {/* 구름 */}
        <AnimatedG animatedProps={cloudProps}>
          <Path
            d="M 25 60 Q 20 60 20 55 Q 20 50 25 50 Q 25 45 32 45 Q 35 40 45 40 Q 55 40 60 45 Q 70 45 75 50 Q 80 50 80 55 Q 80 60 75 60 Z"
            fill="#E0E0E0"
          />
        </AnimatedG>

        {/* 비 */}
        <AnimatedG animatedProps={rainProps}>
          <Defs>
            <ClipPath id="rainClip">
              <Rect x={25} y={65} width={50} height={30} />
            </ClipPath>
          </Defs>
          <G clipPath="url(#rainClip)">
            {[30, 45, 60, 37, 52, 67].map((x, index) => (
              <Path
                key={index}
                d={`M ${x} ${65 + (index % 2) * 10} L ${x - 3} ${75 + (index % 2) * 10}`}
                stroke="#4A90D9"
                strokeWidth={2}
                strokeLinecap="round"
              />
            ))}
          </G>
        </AnimatedG>
      </Svg>
    </View>
  );
}

// 사용 예시
function WeatherIconDemo() {
  const [weather, setWeather] = useState<WeatherType>('sunny');

  const cycleWeather = () => {
    setWeather(current => {
      if (current === 'sunny') return 'cloudy';
      if (current === 'cloudy') return 'rainy';
      return 'sunny';
    });
  };

  return (
    <View style={styles.demo}>
      <Pressable onPress={cycleWeather}>
        <WeatherIconMorph weather={weather} size={150} />
      </Pressable>
      <Text style={styles.weatherText}>{weather.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  demo: {
    alignItems: 'center',
  },
  weatherText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
});

export default WeatherIconMorph;
```

## 💻 복잡한 아이콘 애니메이션

### 알림 벨 아이콘

```typescript
// components/NotificationBell.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface NotificationBellProps {
  hasNotification?: boolean;
  notificationCount?: number;
  onPress?: () => void;
}

function NotificationBell({
  hasNotification = false,
  notificationCount = 0,
  onPress,
}: NotificationBellProps) {
  const rotation = useSharedValue(0);
  const badgeScale = useSharedValue(0);

  useEffect(() => {
    if (hasNotification) {
      // 흔들림 애니메이션
      rotation.value = withRepeat(
        withSequence(
          withTiming(15, { duration: 100 }),
          withTiming(-15, { duration: 100 }),
          withTiming(10, { duration: 100 }),
          withTiming(-10, { duration: 100 }),
          withTiming(0, { duration: 100 })
        ),
        2,
        false
      );

      // 뱃지 팝 애니메이션
      badgeScale.value = withSpring(1, {
        damping: 8,
        stiffness: 300,
      });
    } else {
      badgeScale.value = withSpring(0);
    }
  }, [hasNotification, rotation, badgeScale]);

  const bellProps = useAnimatedProps(() => ({
    transform: [
      { translateX: 50 },
      { translateY: 10 },
      { rotate: `${rotation.value}deg` },
      { translateX: -50 },
      { translateY: -10 },
    ],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity: badgeScale.value,
  }));

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Svg width={60} height={60} viewBox="0 0 100 100">
        <AnimatedG animatedProps={bellProps}>
          {/* 벨 본체 */}
          <Path
            d="M 50 15 C 35 15 25 30 25 45 C 25 55 20 65 20 70 L 80 70 C 80 65 75 55 75 45 C 75 30 65 15 50 15"
            fill="#FFD600"
            stroke="#E6B800"
            strokeWidth={2}
          />

          {/* 벨 아래 부분 */}
          <Path
            d="M 40 70 Q 50 85 60 70"
            fill="#FFD600"
            stroke="#E6B800"
            strokeWidth={2}
          />

          {/* 벨 꼭대기 */}
          <Circle cx={50} cy={15} r={5} fill="#FFD600" stroke="#E6B800" strokeWidth={2} />
        </AnimatedG>
      </Svg>

      {/* 알림 뱃지 */}
      {notificationCount > 0 && (
        <Animated.View style={[styles.badge, badgeStyle]}>
          <Text style={styles.badgeText}>
            {notificationCount > 99 ? '99+' : notificationCount}
          </Text>
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default NotificationBell;
```

### 좋아요 하트 아이콘

```typescript
// components/LikeHeart.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Svg, { Path, Circle, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  interpolate,
  interpolateColor,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

interface LikeHeartProps {
  size?: number;
  isLiked: boolean;
  onToggle: (newState: boolean) => void;
}

const HEART_PATH = 'M 50 25 C 50 25 40 10 25 10 C 10 10 5 25 5 35 C 5 55 50 85 50 85 C 50 85 95 55 95 35 C 95 25 90 10 75 10 C 60 10 50 25 50 25';

function LikeHeart({ size = 80, isLiked, onToggle }: LikeHeartProps) {
  const scale = useSharedValue(1);
  const fillProgress = useSharedValue(isLiked ? 1 : 0);
  const particlesProgress = useSharedValue(0);

  // 파티클 위치
  const particles = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return {
      initialX: 50,
      initialY: 45,
      targetX: 50 + Math.cos(angle) * 60,
      targetY: 45 + Math.sin(angle) * 60,
    };
  });

  const handlePress = useCallback(() => {
    const newState = !isLiked;
    runOnJS(onToggle)(newState);

    if (newState) {
      // 좋아요 애니메이션
      scale.value = withSequence(
        withTiming(0.8, { duration: 100 }),
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );

      fillProgress.value = withSpring(1, { damping: 12 });

      // 파티클 애니메이션
      particlesProgress.value = 0;
      particlesProgress.value = withSequence(
        withDelay(100, withTiming(1, { duration: 400 })),
        withTiming(0, { duration: 200 })
      );
    } else {
      // 좋아요 취소
      scale.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withSpring(1)
      );

      fillProgress.value = withSpring(0);
    }
  }, [isLiked, onToggle, scale, fillProgress, particlesProgress]);

  const heartProps = useAnimatedProps(() => {
    const color = interpolateColor(
      fillProgress.value,
      [0, 1],
      ['transparent', '#FF3B30']
    );

    return {
      fill: color,
    };
  });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.container, { width: size, height: size }, containerStyle]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* 파티클 */}
          {particles.map((particle, index) => (
            <AnimatedParticle
              key={index}
              particle={particle}
              progress={particlesProgress}
              delay={index * 30}
            />
          ))}

          {/* 하트 테두리 */}
          <Path
            d={HEART_PATH}
            fill="none"
            stroke="#FF3B30"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 하트 채우기 */}
          <AnimatedPath
            d={HEART_PATH}
            strokeWidth={0}
            animatedProps={heartProps}
          />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}

interface Particle {
  initialX: number;
  initialY: number;
  targetX: number;
  targetY: number;
}

interface AnimatedParticleProps {
  particle: Particle;
  progress: Animated.SharedValue<number>;
  delay: number;
}

function AnimatedParticle({ particle, progress, delay }: AnimatedParticleProps) {
  const particleProps = useAnimatedProps(() => {
    const x = interpolate(
      progress.value,
      [0, 1],
      [particle.initialX, particle.targetX],
      Extrapolation.CLAMP
    );

    const y = interpolate(
      progress.value,
      [0, 1],
      [particle.initialY, particle.targetY],
      Extrapolation.CLAMP
    );

    const r = interpolate(
      progress.value,
      [0, 0.5, 1],
      [0, 4, 0],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      progress.value,
      [0, 0.3, 1],
      [0, 1, 0],
      Extrapolation.CLAMP
    );

    return {
      cx: x,
      cy: y,
      r,
      opacity,
    };
  });

  return (
    <AnimatedCircle
      fill="#FF3B30"
      animatedProps={particleProps}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LikeHeart;
```

## 💻 sometimes-app 적용 사례

### 매칭 진행률 표시

```typescript
// src/features/matching/ui/matching-progress-ring.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import colors from '@/src/shared/constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

interface MatchingProgressRingProps {
  progress: number; // 0 to 1
  isSearching: boolean;
  size?: number;
}

function MatchingProgressRing({
  progress,
  isSearching,
  size = 200,
}: MatchingProgressRingProps) {
  const animatedProgress = useSharedValue(0);
  const searchRotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, animatedProgress]);

  useEffect(() => {
    if (isSearching) {
      // 검색 중 회전 애니메이션
      searchRotation.value = withRepeat(
        withTiming(360, {
          duration: 2000,
          easing: Easing.linear,
        }),
        -1,
        false
      );

      // 펄스 애니메이션
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        false
      );
    }
  }, [isSearching, searchRotation, pulseScale]);

  const progressProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const searchIndicatorProps = useAnimatedProps(() => ({
    transform: [
      { translateX: size / 2 },
      { translateY: size / 2 },
      { rotate: `${searchRotation.value}deg` },
      { translateX: -size / 2 },
      { translateY: -size / 2 },
    ],
  }));

  const containerProps = useAnimatedProps(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={containerProps}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <LinearGradient id="matchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.primaryPurple} />
              <Stop offset="100%" stopColor="#E24A7A" />
            </LinearGradient>
          </Defs>

          {/* 배경 원 */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.lightPurple}
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* 진행 원 */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#matchGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            fill="none"
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            animatedProps={progressProps}
          />

          {/* 검색 표시기 */}
          {isSearching && (
            <AnimatedG animatedProps={searchIndicatorProps}>
              <Circle
                cx={size / 2}
                cy={strokeWidth / 2 + 2}
                r={6}
                fill={colors.primaryPurple}
              />
            </AnimatedG>
          )}

          {/* 중앙 하트 아이콘 */}
          <G transform={`translate(${size / 2 - 30}, ${size / 2 - 25})`}>
            <Path
              d="M 30 10 C 30 10 22 0 12 0 C 4 0 0 8 0 15 C 0 30 30 50 30 50 C 30 50 60 30 60 15 C 60 8 56 0 48 0 C 38 0 30 10 30 10"
              fill={colors.primaryPurple}
            />
          </G>
        </Svg>
      </Animated.View>

      {/* 진행률 텍스트 */}
      <View style={styles.textContainer}>
        <Text style={styles.progressText}>
          {Math.round(progress * 100)}%
        </Text>
        <Text style={styles.statusText}>
          {isSearching ? '매칭 상대를 찾는 중...' : '매칭 준비 완료'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    bottom: -60,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primaryPurple,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default MatchingProgressRing;
```

## ⚠️ 흔한 실수와 해결법

### 1. Path 길이 계산 오류

```typescript
// ❌ 잘못된 예: 하드코딩된 길이
const PATH_LENGTH = 1000; // 실제 길이와 다를 수 있음

// ✅ 올바른 예: 런타임에 측정
import { useRef, useEffect, useState } from 'react';
import { Path } from 'react-native-svg';

function MeasuredPath({ d, ...props }) {
  const pathRef = useRef<Path>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    // react-native-svg에서는 직접 측정이 어려움
    // 대안: SVG 에디터에서 측정하거나 근사값 사용
  }, []);

  return <Path ref={pathRef} d={d} {...props} />;
}
```

### 2. Transform 순서 문제

```typescript
// ❌ 잘못된 예: 순서가 중요함을 무시
transform: [
  { rotate: '45deg' },
  { translateX: 100 },
]

// ✅ 올바른 예: 중심점 기준 회전
transform: [
  { translateX: centerX },
  { translateY: centerY },
  { rotate: '45deg' },
  { translateX: -centerX },
  { translateY: -centerY },
]
```

### 3. 애니메이션 Props 타입 오류

```typescript
// ❌ 잘못된 예: 문자열 보간
const animatedProps = useAnimatedProps(() => ({
  fill: `rgba(255, 0, 0, ${opacity.value})`, // 문자열은 지원 안됨
}));

// ✅ 올바른 예: interpolateColor 사용
import { interpolateColor } from 'react-native-reanimated';

const animatedProps = useAnimatedProps(() => ({
  fill: interpolateColor(
    opacity.value,
    [0, 1],
    ['rgba(255, 0, 0, 0)', 'rgba(255, 0, 0, 1)']
  ),
}));
```

## 💡 성능 최적화 팁

### 1. 복잡한 SVG 단순화

```typescript
// SVG 경로 최적화
// 도구: SVGO, SVGOMG

// Before: 복잡한 경로
const COMPLEX_PATH = 'M 10.5 20.3 C 15.2 25.1 20.8 30.5 ...'; // 수천 개의 점

// After: 단순화된 경로
const OPTIMIZED_PATH = 'M 10 20 C 15 25 21 31 ...'; // 필수 점만
```

### 2. 레이어 분리

```typescript
// 정적 요소와 애니메이션 요소 분리
function OptimizedIcon() {
  return (
    <Svg width={100} height={100}>
      {/* 정적 레이어: 리렌더링 안됨 */}
      <StaticBackground />

      {/* 애니메이션 레이어만 업데이트 */}
      <AnimatedForeground />
    </Svg>
  );
}

const StaticBackground = React.memo(() => (
  <G>
    <Circle cx={50} cy={50} r={40} fill="#E0E0E0" />
  </G>
));
```

### 3. useAnimatedProps 최소화

```typescript
// ❌ 비효율적: 여러 개의 useAnimatedProps
const props1 = useAnimatedProps(() => ({ fill: color1.value }));
const props2 = useAnimatedProps(() => ({ stroke: color2.value }));

// ✅ 효율적: 하나로 통합
const animatedProps = useAnimatedProps(() => ({
  fill: color1.value,
  stroke: color2.value,
}));
```

## 🏋️ 연습 문제

### 문제 1: 비밀번호 강도 표시기
SVG로 비밀번호 강도를 시각화하세요:
- 4단계 호 진행률 (약함/보통/강함/매우강함)
- 색상 변화 (빨강→노랑→초록)
- 텍스트 라벨 표시

### 문제 2: 오디오 파형 시각화
음악 재생 시 파형을 표시하세요:
- 여러 개의 막대가 높이 변화
- 랜덤한 높이 애니메이션
- 재생/일시정지 상태 반영

### 문제 3: 다운로드 진행률 아이콘
다운로드 상태를 표시하는 아이콘:
- 화살표 → 원형 프로그레스 → 체크마크 변환
- 상태별 모프 애니메이션
- 진행률 퍼센트 표시

## 📚 이 장에서 배운 내용

1. **SVG + Reanimated**: createAnimatedComponent로 애니메이션 가능한 SVG 요소 생성
2. **Path 드로잉**: strokeDasharray와 strokeDashoffset으로 드로잉 효과
3. **Transform 애니메이션**: 회전, 스케일, 이동의 조합
4. **모프 애니메이션**: interpolatePath로 형태 변환
5. **복잡한 아이콘**: 다중 요소 조합과 파티클 효과

**다음 장 예고**: **Chapter 34: Skia 그래픽스**에서는 react-native-skia를 사용해 고성능 2D 그래픽을 구현합니다. 쉐이더, 블러, 그라데이션 등 고급 효과를 다룹니다.
