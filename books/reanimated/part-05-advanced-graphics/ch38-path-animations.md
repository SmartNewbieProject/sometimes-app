# Chapter 38: 복잡한 패스 애니메이션

SVG 경로를 따라 이동하는 애니메이션, 모프 효과, 경로 기반 모션 등 고급 패스 애니메이션을 다룹니다.

## 📌 학습 목표

- SVG Path 문법 이해
- 경로를 따라 이동하는 애니메이션
- Path 모핑 (형태 변환)
- 경로 드로잉 애니메이션
- 베지어 곡선 활용

## 📖 SVG Path 기초

### Path 명령어

```
┌─────────────────────────────────────────────────────────┐
│                   SVG Path 명령어                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   M x y     - Move to (시작점 이동)                      │
│   L x y     - Line to (직선)                            │
│   H x       - Horizontal line (수평선)                   │
│   V y       - Vertical line (수직선)                     │
│   Z         - Close path (경로 닫기)                     │
│                                                          │
│   C x1 y1, x2 y2, x y - Cubic Bezier (3차 베지어)       │
│   S x2 y2, x y        - Smooth cubic (부드러운 3차)      │
│   Q x1 y1, x y        - Quadratic Bezier (2차 베지어)   │
│   T x y               - Smooth quadratic (부드러운 2차) │
│                                                          │
│   A rx ry rotation large-arc sweep x y - Arc (호)       │
│                                                          │
│   소문자 = 상대 좌표 (예: l 10 20 = 현재 위치 기준)      │
│   대문자 = 절대 좌표 (예: L 10 20 = 원점 기준)           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 경로 예시

```typescript
// 기본 도형 경로
const PATHS = {
  // 삼각형
  triangle: 'M 50 10 L 90 90 L 10 90 Z',

  // 사각형
  square: 'M 10 10 H 90 V 90 H 10 Z',

  // 원 (4개의 베지어 곡선으로 근사)
  circle: `
    M 50 10
    C 72 10 90 28 90 50
    C 90 72 72 90 50 90
    C 28 90 10 72 10 50
    C 10 28 28 10 50 10
    Z
  `,

  // 하트
  heart: `
    M 50 20
    C 30 0 0 20 0 50
    C 0 80 50 100 50 100
    C 50 100 100 80 100 50
    C 100 20 70 0 50 20
    Z
  `,

  // 별
  star: `
    M 50 0
    L 61 35 L 98 35 L 68 57
    L 79 91 L 50 70 L 21 91
    L 32 57 L 2 35 L 39 35 Z
  `,
};
```

## 💻 경로 따라 이동

### 기본 경로 따라가기

```typescript
// components/FollowPath.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import { parse, getPointAtLength, getTotalLength } from 'react-native-redash';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// 물결 모양 경로
const WAVE_PATH = `
  M 20 100
  Q 95 50 170 100
  Q 245 150 320 100
  Q 395 50 470 100
`;

function FollowPath() {
  const progress = useSharedValue(0);

  const parsedPath = parse(WAVE_PATH);
  const pathLength = getTotalLength(parsedPath);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true
    );
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    const point = getPointAtLength(parsedPath, progress.value * pathLength);

    return {
      cx: point.x,
      cy: point.y,
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={SCREEN_WIDTH} height={200} viewBox="0 0 500 200">
        {/* 경로 표시 */}
        <Path
          d={WAVE_PATH}
          stroke="#3A3A3A"
          strokeWidth={2}
          fill="none"
          strokeDasharray="5,5"
        />

        {/* 따라가는 원 */}
        <AnimatedCircle
          r={15}
          fill="#7A4AE2"
          animatedProps={animatedProps}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
});

export default FollowPath;
```

### 방향을 따라 회전

```typescript
// components/FollowPathWithRotation.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, G, Polygon } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  parse,
  getPointAtLength,
  getTotalLength,
  getYForX,
} from 'react-native-redash';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedG = Animated.createAnimatedComponent(G);

const CURVE_PATH = `
  M 30 150
  C 100 50, 200 50, 270 150
  C 340 250, 400 200, 470 100
`;

function FollowPathWithRotation() {
  const progress = useSharedValue(0);

  const parsedPath = parse(CURVE_PATH);
  const pathLength = getTotalLength(parsedPath);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 4000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    const currentLength = progress.value * pathLength;
    const point = getPointAtLength(parsedPath, currentLength);

    // 다음 지점과의 각도 계산
    const nextPoint = getPointAtLength(
      parsedPath,
      Math.min(currentLength + 1, pathLength)
    );

    const angle = Math.atan2(
      nextPoint.y - point.y,
      nextPoint.x - point.x
    ) * (180 / Math.PI);

    return {
      transform: [
        { translateX: point.x },
        { translateY: point.y },
        { rotate: `${angle}deg` },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={SCREEN_WIDTH} height={300} viewBox="0 0 500 300">
        {/* 경로 */}
        <Path
          d={CURVE_PATH}
          stroke="#4A4A4A"
          strokeWidth={2}
          fill="none"
        />

        {/* 화살표 (경로 따라가며 회전) */}
        <AnimatedG animatedProps={animatedProps}>
          <Polygon
            points="-15,-10 15,0 -15,10"
            fill="#7A4AE2"
          />
        </AnimatedG>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
});

export default FollowPathWithRotation;
```

## 💻 Path 모핑

### 기본 모핑

```typescript
// components/PathMorph.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Text, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
} from 'react-native-reanimated';
import { interpolatePath } from 'react-native-redash';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

// 같은 수의 점을 가진 두 경로 (모핑 필수 조건)
const SHAPES = {
  square: `
    M 50 50
    L 250 50
    L 250 250
    L 50 250
    Z
  `,
  circle: `
    M 150 50
    C 205 50 250 95 250 150
    C 250 205 205 250 150 250
    C 95 250 50 205 50 150
    C 50 95 95 50 150 50
    Z
  `,
  triangle: `
    M 150 50
    L 250 250
    L 250 250
    L 50 250
    L 50 250
    L 150 50
    Z
  `,
};

type ShapeType = keyof typeof SHAPES;

function PathMorph() {
  const [currentShape, setCurrentShape] = useState<ShapeType>('square');
  const progress = useSharedValue(0);

  const shapes: ShapeType[] = ['square', 'circle', 'triangle'];
  const currentIndex = shapes.indexOf(currentShape);

  const nextShape = () => {
    const nextIndex = (currentIndex + 1) % shapes.length;
    setCurrentShape(shapes[nextIndex]);
  };

  useEffect(() => {
    progress.value = 0;
    progress.value = withSpring(1, { damping: 15, stiffness: 100 });
  }, [currentShape, progress]);

  const animatedProps = useAnimatedProps(() => {
    const prevShape = shapes[(currentIndex - 1 + shapes.length) % shapes.length];

    const d = interpolatePath(
      progress.value,
      [0, 1],
      [SHAPES[prevShape], SHAPES[currentShape]]
    );

    return { d };
  });

  return (
    <View style={styles.container}>
      <Svg width={SCREEN_WIDTH} height={300} viewBox="0 0 300 300">
        <AnimatedPath
          fill="#7A4AE2"
          animatedProps={animatedProps}
        />
      </Svg>

      <View style={styles.controls}>
        <Pressable style={styles.button} onPress={nextShape}>
          <Text style={styles.buttonText}>Next Shape: {shapes[(currentIndex + 1) % shapes.length]}</Text>
        </Pressable>
      </View>

      <View style={styles.shapeIndicators}>
        {shapes.map((shape, index) => (
          <View
            key={shape}
            style={[
              styles.indicator,
              index === currentIndex && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  controls: {
    marginTop: 32,
  },
  button: {
    backgroundColor: '#4A4A4A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  shapeIndicators: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4A4A4A',
  },
  activeIndicator: {
    backgroundColor: '#7A4AE2',
  },
});

export default PathMorph;
```

### 아이콘 모핑

```typescript
// components/IconMorph.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { interpolatePath } from 'react-native-redash';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// 재생/일시정지 아이콘 (같은 점 수로 설계)
const PLAY_ICON = 'M 8 5 L 8 5 L 19 12 L 19 12 L 8 19 L 8 19 Z';
const PAUSE_ICON = 'M 6 5 L 10 5 L 10 19 L 6 19 L 6 5 M 14 5 L 18 5 L 18 19 L 14 19 L 14 5';

// 햄버거/X 아이콘
const MENU_ICON = `
  M 4 6 L 20 6
  M 4 12 L 20 12
  M 4 18 L 20 18
`;

const CLOSE_ICON = `
  M 6 6 L 18 18
  M 6 12 L 6 12
  M 6 18 L 18 6
`;

interface IconMorphProps {
  type: 'play-pause' | 'menu-close';
}

function IconMorph({ type }: IconMorphProps) {
  const [isFirst, setIsFirst] = useState(true);
  const progress = useSharedValue(0);

  const icons = type === 'play-pause'
    ? { first: PLAY_ICON, second: PAUSE_ICON }
    : { first: MENU_ICON, second: CLOSE_ICON };

  const toggle = () => {
    setIsFirst(!isFirst);
  };

  useEffect(() => {
    progress.value = withSpring(isFirst ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    });
  }, [isFirst, progress]);

  const animatedProps = useAnimatedProps(() => {
    const d = interpolatePath(
      progress.value,
      [0, 1],
      [icons.first, icons.second]
    );

    return { d };
  });

  return (
    <Pressable style={styles.iconButton} onPress={toggle}>
      <Svg width={48} height={48} viewBox="0 0 24 24">
        <AnimatedPath
          stroke="#FFFFFF"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animatedProps={animatedProps}
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7A4AE2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default IconMorph;
```

## 💻 경로 드로잉 애니메이션

### strokeDashoffset 기법

```typescript
// components/DrawPath.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

// 복잡한 서명 경로
const SIGNATURE_PATHS = [
  {
    d: 'M 30 80 Q 60 20 90 60 T 150 50',
    length: 200,
    delay: 0,
  },
  {
    d: 'M 130 30 Q 180 80 220 50 T 280 70',
    length: 220,
    delay: 400,
  },
  {
    d: 'M 260 40 C 290 30 310 60 330 40 T 380 60',
    length: 180,
    delay: 800,
  },
];

function DrawPath() {
  return (
    <View style={styles.container}>
      <Svg
        width={SCREEN_WIDTH - 40}
        height={150}
        viewBox="0 0 420 120"
        style={styles.svg}
      >
        {SIGNATURE_PATHS.map((path, index) => (
          <AnimatedSignaturePath key={index} {...path} />
        ))}
      </Svg>
    </View>
  );
}

interface AnimatedSignaturePathProps {
  d: string;
  length: number;
  delay: number;
}

function AnimatedSignaturePath({ d, length, delay }: AnimatedSignaturePathProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration: 1000,
        easing: Easing.inOut(Easing.cubic),
      })
    );
  }, [delay, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: length * (1 - progress.value),
  }));

  return (
    <AnimatedPath
      d={d}
      stroke="#7A4AE2"
      strokeWidth={3}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  svg: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
});

export default DrawPath;
```

### 그라데이션 드로잉

```typescript
// components/GradientDrawPath.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, ClipPath, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const HEART_PATH = `
  M 150 30
  C 130 10 100 10 80 30
  C 50 60 50 100 80 130
  C 110 160 150 200 150 200
  C 150 200 190 160 220 130
  C 250 100 250 60 220 30
  C 200 10 170 10 150 30
  Z
`;

function GradientDrawPath() {
  const clipWidth = useSharedValue(0);

  useEffect(() => {
    clipWidth.value = withTiming(300, {
      duration: 2000,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [clipWidth]);

  const clipProps = useAnimatedProps(() => ({
    width: clipWidth.value,
  }));

  return (
    <View style={styles.container}>
      <Svg width={300} height={220} viewBox="0 0 300 220">
        <Defs>
          {/* 그라데이션 정의 */}
          <LinearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#7A4AE2" />
            <Stop offset="50%" stopColor="#E24A7A" />
            <Stop offset="100%" stopColor="#FFD600" />
          </LinearGradient>

          {/* 애니메이션 클립 영역 */}
          <ClipPath id="drawClip">
            <AnimatedRect
              x={0}
              y={0}
              height={220}
              animatedProps={clipProps}
            />
          </ClipPath>
        </Defs>

        {/* 배경 경로 (흐린 색) */}
        <Path
          d={HEART_PATH}
          fill="none"
          stroke="rgba(122, 74, 226, 0.2)"
          strokeWidth={4}
        />

        {/* 그라데이션 경로 (클립으로 드로잉 효과) */}
        <Path
          d={HEART_PATH}
          fill="none"
          stroke="url(#heartGradient)"
          strokeWidth={4}
          strokeLinecap="round"
          clipPath="url(#drawClip)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
});

export default GradientDrawPath;
```

## 💻 베지어 곡선 활용

### 동적 베지어 곡선

```typescript
// components/DynamicBezier.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, G, Text as SvgText } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useDerivedValue,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);

// 컨트롤 포인트
const P0 = { x: 50, y: 200 };   // 시작점
const P3 = { x: 350, y: 200 };  // 끝점

function DynamicBezier() {
  // 조절 가능한 컨트롤 포인트
  const cp1x = useSharedValue(100);
  const cp1y = useSharedValue(50);
  const cp2x = useSharedValue(300);
  const cp2y = useSharedValue(50);

  // 컨트롤 포인트 1 드래그
  const gesture1 = Gesture.Pan()
    .onUpdate((event) => {
      cp1x.value = Math.max(50, Math.min(350, event.absoluteX));
      cp1y.value = Math.max(20, Math.min(280, event.absoluteY - 100));
    });

  // 컨트롤 포인트 2 드래그
  const gesture2 = Gesture.Pan()
    .onUpdate((event) => {
      cp2x.value = Math.max(50, Math.min(350, event.absoluteX));
      cp2y.value = Math.max(20, Math.min(280, event.absoluteY - 100));
    });

  // 베지어 경로
  const pathProps = useAnimatedProps(() => ({
    d: `M ${P0.x} ${P0.y} C ${cp1x.value} ${cp1y.value}, ${cp2x.value} ${cp2y.value}, ${P3.x} ${P3.y}`,
  }));

  // 컨트롤 포인트 1
  const cp1Props = useAnimatedProps(() => ({
    cx: cp1x.value,
    cy: cp1y.value,
  }));

  // 컨트롤 포인트 2
  const cp2Props = useAnimatedProps(() => ({
    cx: cp2x.value,
    cy: cp2y.value,
  }));

  // 가이드 라인 1
  const line1Props = useAnimatedProps(() => ({
    x1: P0.x,
    y1: P0.y,
    x2: cp1x.value,
    y2: cp1y.value,
  }));

  // 가이드 라인 2
  const line2Props = useAnimatedProps(() => ({
    x1: cp2x.value,
    y1: cp2y.value,
    x2: P3.x,
    y2: P3.y,
  }));

  return (
    <View style={styles.container}>
      <Svg width={SCREEN_WIDTH} height={300} viewBox="0 0 400 300">
        {/* 가이드 라인 */}
        <AnimatedLine
          stroke="rgba(122, 74, 226, 0.3)"
          strokeWidth={1}
          strokeDasharray="4,4"
          animatedProps={line1Props}
        />
        <AnimatedLine
          stroke="rgba(122, 74, 226, 0.3)"
          strokeWidth={1}
          strokeDasharray="4,4"
          animatedProps={line2Props}
        />

        {/* 베지어 곡선 */}
        <AnimatedPath
          stroke="#7A4AE2"
          strokeWidth={3}
          fill="none"
          animatedProps={pathProps}
        />

        {/* 시작/끝점 */}
        <Circle cx={P0.x} cy={P0.y} r={8} fill="#4AE27A" />
        <Circle cx={P3.x} cy={P3.y} r={8} fill="#E24A7A" />

        {/* 라벨 */}
        <SvgText x={P0.x} y={P0.y + 25} fontSize={12} fill="#888" textAnchor="middle">P0</SvgText>
        <SvgText x={P3.x} y={P3.y + 25} fontSize={12} fill="#888" textAnchor="middle">P3</SvgText>
      </Svg>

      {/* 드래그 가능한 컨트롤 포인트 */}
      <GestureDetector gesture={gesture1}>
        <Animated.View style={[styles.controlPoint, styles.cp1]}>
          <Svg width={40} height={40}>
            <AnimatedCircle
              cx={20}
              cy={20}
              r={15}
              fill="#FFD600"
              stroke="#FFA500"
              strokeWidth={2}
            />
            <SvgText x={20} y={25} fontSize={10} fill="#000" textAnchor="middle">CP1</SvgText>
          </Svg>
        </Animated.View>
      </GestureDetector>

      <GestureDetector gesture={gesture2}>
        <Animated.View style={[styles.controlPoint, styles.cp2]}>
          <Svg width={40} height={40}>
            <AnimatedCircle
              cx={20}
              cy={20}
              r={15}
              fill="#4A90D9"
              stroke="#2A70B9"
              strokeWidth={2}
            />
            <SvgText x={20} y={25} fontSize={10} fill="#FFF" textAnchor="middle">CP2</SvgText>
          </Svg>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
  controlPoint: {
    position: 'absolute',
    width: 40,
    height: 40,
  },
  cp1: {
    left: 80,
    top: 150,
  },
  cp2: {
    left: 280,
    top: 150,
  },
});

export default DynamicBezier;
```

## 💻 sometimes-app 적용 사례

### 채팅 타이핑 인디케이터

```typescript
// src/features/chat/ui/typing-indicator.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface TypingIndicatorProps {
  color?: string;
}

function TypingIndicator({ color = '#7A4AE2' }: TypingIndicatorProps) {
  const dot1Y = useSharedValue(0);
  const dot2Y = useSharedValue(0);
  const dot3Y = useSharedValue(0);
  const waveProgress = useSharedValue(0);

  useEffect(() => {
    // 점 애니메이션
    const createDotAnimation = (delay: number) =>
      withRepeat(
        withDelay(
          delay,
          withSequence(
            withTiming(-6, { duration: 200, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) })
          )
        ),
        -1,
        false
      );

    dot1Y.value = createDotAnimation(0);
    dot2Y.value = createDotAnimation(100);
    dot3Y.value = createDotAnimation(200);

    // 물결 경로 애니메이션
    waveProgress.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );
  }, [dot1Y, dot2Y, dot3Y, waveProgress]);

  const dot1Props = useAnimatedProps(() => ({
    cy: 15 + dot1Y.value,
  }));

  const dot2Props = useAnimatedProps(() => ({
    cy: 15 + dot2Y.value,
  }));

  const dot3Props = useAnimatedProps(() => ({
    cy: 15 + dot3Y.value,
  }));

  // 물결 경로
  const waveProps = useAnimatedProps(() => {
    const offset = waveProgress.value * 40;

    return {
      d: `
        M 0 15
        Q ${10 - offset % 20} ${10 + Math.sin(waveProgress.value * Math.PI * 2) * 3}
          ${20} 15
        T 40 15
        T 60 15
      `,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Svg width={60} height={30} viewBox="0 0 60 30">
          {/* 물결 배경 (옵션) */}
          <AnimatedPath
            stroke={`${color}30`}
            strokeWidth={2}
            fill="none"
            animatedProps={waveProps}
          />

          {/* 점들 */}
          <AnimatedCircle cx={15} r={4} fill={color} animatedProps={dot1Props} />
          <AnimatedCircle cx={30} r={4} fill={color} animatedProps={dot2Props} />
          <AnimatedCircle cx={45} r={4} fill={color} animatedProps={dot3Props} />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bubble: {
    backgroundColor: '#F0F0F0',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});

export default TypingIndicator;
```

### 매칭 연결 애니메이션

```typescript
// src/features/matching/ui/connection-animation.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image, Text } from 'react-native';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import colors from '@/src/shared/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ConnectionAnimationProps {
  myAvatar: string;
  partnerAvatar: string;
  partnerName: string;
}

function ConnectionAnimation({
  myAvatar,
  partnerAvatar,
  partnerName,
}: ConnectionAnimationProps) {
  const pathProgress = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const heartScale = useSharedValue(0);

  const CONNECTION_PATH = `
    M 80 150
    C 150 100, 200 200, 270 150
  `;
  const PATH_LENGTH = 300;

  useEffect(() => {
    // 연결선 드로잉
    pathProgress.value = withTiming(1, {
      duration: 1500,
      easing: Easing.inOut(Easing.cubic),
    });

    // 맥박 효과
    pulseScale.value = withDelay(
      1500,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      )
    );

    // 하트 팝업
    heartScale.value = withDelay(
      1200,
      withSequence(
        withTiming(1.3, { duration: 300, easing: Easing.out(Easing.back) }),
        withTiming(1, { duration: 200 })
      )
    );
  }, [pathProgress, pulseScale, heartScale]);

  const pathProps = useAnimatedProps(() => ({
    strokeDashoffset: PATH_LENGTH * (1 - pathProgress.value),
  }));

  const heartProps = useAnimatedProps(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartScale.value,
  }));

  const pulse1Props = useAnimatedProps(() => ({
    r: 40 * pulseScale.value,
    opacity: 2 - pulseScale.value,
  }));

  const pulse2Props = useAnimatedProps(() => ({
    r: 40 * pulseScale.value,
    opacity: 2 - pulseScale.value,
  }));

  return (
    <View style={styles.container}>
      <Svg
        width={SCREEN_WIDTH}
        height={200}
        viewBox="0 0 350 200"
        style={styles.svg}
      >
        <Defs>
          <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.primaryPurple} />
            <Stop offset="50%" stopColor="#E24A7A" />
            <Stop offset="100%" stopColor={colors.primaryPurple} />
          </LinearGradient>
        </Defs>

        {/* 맥박 효과 - 나 */}
        <AnimatedCircle
          cx={80}
          cy={150}
          fill={`${colors.primaryPurple}20`}
          animatedProps={pulse1Props}
        />

        {/* 맥박 효과 - 상대 */}
        <AnimatedCircle
          cx={270}
          cy={150}
          fill={`${colors.primaryPurple}20`}
          animatedProps={pulse2Props}
        />

        {/* 연결선 */}
        <AnimatedPath
          d={CONNECTION_PATH}
          stroke="url(#lineGradient)"
          strokeWidth={4}
          strokeDasharray={PATH_LENGTH}
          fill="none"
          strokeLinecap="round"
          animatedProps={pathProps}
        />

        {/* 중앙 하트 */}
        <G transform="translate(160, 135)">
          <AnimatedG animatedProps={heartProps}>
            <Path
              d="M 15 5 C 10 0 0 5 0 15 C 0 25 15 35 15 35 C 15 35 30 25 30 15 C 30 5 20 0 15 5 Z"
              fill="#E24A7A"
            />
          </AnimatedG>
        </G>
      </Svg>

      {/* 아바타들 */}
      <View style={styles.avatarsContainer}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: myAvatar }} style={styles.avatar} />
          <Text style={styles.label}>나</Text>
        </View>

        <View style={styles.avatarWrapper}>
          <Image source={{ uri: partnerAvatar }} style={styles.avatar} />
          <Text style={styles.label}>{partnerName}</Text>
        </View>
      </View>
    </View>
  );
}

// AnimatedG 컴포넌트 정의 필요
const AnimatedG = Animated.createAnimatedComponent(G);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  svg: {
    position: 'absolute',
    top: 40,
  },
  avatarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SCREEN_WIDTH - 80,
    marginTop: 100,
  },
  avatarWrapper: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.primaryPurple,
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default ConnectionAnimation;
```

## ⚠️ 흔한 실수와 해결법

### 1. 모핑 시 점 수 불일치

```typescript
// ❌ 잘못된 예: 점 수가 다름
const square = 'M 0 0 L 100 0 L 100 100 L 0 100 Z'; // 4개의 점
const circle = 'M 50 0 A 50 50 0 1 1 50 100 A 50 50 0 1 1 50 0'; // 2개의 호

// ✅ 올바른 예: 점 수 맞추기
const square = 'M 0 0 L 50 0 L 100 0 L 100 50 L 100 100 L 50 100 L 0 100 L 0 50 Z';
const circle = 'M 50 0 C 78 0 100 22 100 50 C 100 78 78 100 50 100 C 22 100 0 78 0 50 C 0 22 22 0 50 0 Z';
```

### 2. 경로 길이 계산 오류

```typescript
// ❌ 잘못된 예: 하드코딩된 길이
strokeDasharray={100} // 실제 길이와 다를 수 있음

// ✅ 올바른 예: 동적 계산
import { getTotalLength, parse } from 'react-native-redash';

const parsedPath = parse(pathD);
const pathLength = getTotalLength(parsedPath);
```

### 3. 상대/절대 좌표 혼용

```typescript
// ❌ 잘못된 예: 예상치 못한 결과
const path = 'M 0 0 l 50 50 L 100 0'; // 소문자 l은 상대 좌표

// ✅ 올바른 예: 일관된 좌표계
const path = 'M 0 0 L 50 50 L 100 0'; // 모두 대문자 (절대 좌표)
```

## 💡 성능 최적화 팁

### 1. 경로 파싱 캐싱

```typescript
// 경로 파싱은 비용이 많이 드므로 캐싱
const parsedPath = useMemo(() => parse(pathD), [pathD]);
```

### 2. 복잡한 경로 단순화

```typescript
// SVG 최적화 도구 사용: SVGO, SVGOMG
// 불필요한 정밀도 제거
const optimized = 'M 10 20 L 30 40'; // vs 'M 10.123456 20.789012 L 30.456789 40.123456'
```

### 3. 레이어 분리

```typescript
// 정적 경로와 애니메이션 경로 분리
<Svg>
  <StaticPath /> {/* 리렌더링 안됨 */}
  <AnimatedPath animatedProps={...} /> {/* 애니메이션만 */}
</Svg>
```

## 🏋️ 연습 문제

### 문제 1: 물결 로딩
물결 모양이 흐르는 로딩 표시기:
- 사인파 경로 생성
- 경로를 따라 원이 이동
- 여러 개의 원이 순차적으로

### 문제 2: 글씨 쓰기 애니메이션
손글씨 효과:
- 여러 획으로 구성된 글자
- 순서대로 드로잉
- 펜 굵기 변화

### 문제 3: 지도 경로
두 지점 사이의 경로 애니메이션:
- 시작점에서 끝점까지 곡선
- 경로 위를 이동하는 마커
- 이동 거리 표시

## 📚 이 장에서 배운 내용

1. **Path 문법**: M, L, C, Q, A 등 SVG 경로 명령어
2. **경로 따라가기**: getPointAtLength로 위치 계산
3. **모핑**: 같은 점 수의 경로 간 보간
4. **드로잉 효과**: strokeDasharray/offset 기법
5. **베지어 곡선**: 컨트롤 포인트와 곡선 형태

**다음 장 예고**: **Chapter 39: 실전 프로젝트 - 데이터 시각화**에서는 지금까지 배운 그래픽 기술을 종합해 차트, 그래프, 대시보드를 구현합니다.
