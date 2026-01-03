# Chapter 34: Skia 그래픽스

react-native-skia를 사용해 GPU 가속 2D 그래픽을 구현합니다. 쉐이더, 블러, 그라데이션 등 고급 시각 효과를 다룹니다.

## 📌 학습 목표

- Skia 기초와 Canvas 개념
- 기본 도형과 경로 그리기
- 이미지 필터와 블러 효과
- 그라데이션과 쉐이더
- Reanimated와 통합

## 📖 Skia란?

```
┌────────────────────────────────────────────────────────┐
│                    Skia Engine                          │
├────────────────────────────────────────────────────────┤
│                                                         │
│   Chrome    Android    Flutter    react-native-skia   │
│     ▼          ▼          ▼              ▼             │
│                     ┌──────────┐                        │
│                     │   Skia   │                        │
│                     │  (C++)   │                        │
│                     └──────────┘                        │
│                          ▼                              │
│                    GPU Acceleration                     │
│                                                         │
└────────────────────────────────────────────────────────┘

특징:
• GPU 가속 렌더링
• 60fps 부드러운 애니메이션
• 복잡한 시각 효과 지원
• 플랫폼 독립적
```

### 설치

```bash
# react-native-skia 설치
npm install @shopify/react-native-skia

# iOS의 경우 pod 설치
cd ios && pod install
```

### 기본 구조

```typescript
// components/SkiaBasic.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Canvas,
  Circle,
  Fill,
  Group,
  Paint,
  Rect,
} from '@shopify/react-native-skia';

const { width, height } = Dimensions.get('window');

function SkiaBasicDemo() {
  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {/* 배경 채우기 */}
        <Fill color="#1A1A1A" />

        {/* 기본 원 */}
        <Circle cx={100} cy={100} r={50} color="#7A4AE2" />

        {/* 기본 사각형 */}
        <Rect x={200} y={50} width={100} height={100} color="#4AE27A" />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    width: width,
    height: height / 2,
  },
});

export default SkiaBasicDemo;
```

## 💻 기본 도형 그리기

### 다양한 도형

```typescript
// components/SkiaShapes.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Canvas,
  Circle,
  Rect,
  RoundedRect,
  Line,
  Path,
  Points,
  Oval,
  vec,
  Skia,
} from '@shopify/react-native-skia';

const { width } = Dimensions.get('window');

function SkiaShapesDemo() {
  // 별 경로 생성
  const starPath = Skia.Path.Make();
  const cx = 280;
  const cy = 100;
  const outerRadius = 40;
  const innerRadius = 20;
  const points = 5;

  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);

    if (i === 0) {
      starPath.moveTo(x, y);
    } else {
      starPath.lineTo(x, y);
    }
  }
  starPath.close();

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {/* 원 */}
        <Circle
          cx={60}
          cy={60}
          r={40}
          color="#7A4AE2"
        />

        {/* 타원 */}
        <Oval
          x={100}
          y={30}
          width={80}
          height={50}
          color="#4AE27A"
        />

        {/* 둥근 사각형 */}
        <RoundedRect
          x={20}
          y={130}
          width={100}
          height={60}
          r={15}
          color="#E24A7A"
        />

        {/* 선 */}
        <Line
          p1={vec(150, 130)}
          p2={vec(250, 190)}
          color="#FFD600"
          strokeWidth={4}
          style="stroke"
        />

        {/* 경로 (별) */}
        <Path
          path={starPath}
          color="#FF6B6B"
        />

        {/* 점들 */}
        <Points
          points={[
            vec(20, 220),
            vec(50, 240),
            vec(80, 220),
            vec(110, 250),
            vec(140, 230),
          ]}
          mode="polygon"
          color="#4A90D9"
          strokeWidth={3}
          style="stroke"
        />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  canvas: {
    width: width,
    height: 300,
  },
});

export default SkiaShapesDemo;
```

### Paint와 스타일링

```typescript
// components/SkiaPaint.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Canvas,
  Circle,
  Rect,
  Paint,
  Group,
  Shadow,
  BlurMask,
} from '@shopify/react-native-skia';

const { width } = Dimensions.get('window');

function SkiaPaintDemo() {
  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {/* 단색 채우기 */}
        <Circle cx={60} cy={60} r={40} color="#7A4AE2" />

        {/* 스트로크만 */}
        <Circle
          cx={160}
          cy={60}
          r={40}
          color="#7A4AE2"
          style="stroke"
          strokeWidth={4}
        />

        {/* 채우기 + 스트로크 */}
        <Group>
          <Circle cx={260} cy={60} r={40} color="#E8D5FF" />
          <Circle
            cx={260}
            cy={60}
            r={40}
            color="#7A4AE2"
            style="stroke"
            strokeWidth={4}
          />
        </Group>

        {/* 그림자 효과 */}
        <Group>
          <Shadow dx={4} dy={4} blur={10} color="rgba(0,0,0,0.3)" />
          <Rect x={20} y={130} width={100} height={60} color="#FFFFFF" />
        </Group>

        {/* 블러 효과 */}
        <Group>
          <BlurMask blur={5} style="normal" />
          <Circle cx={220} cy={160} r={40} color="#4AE27A" />
        </Group>

        {/* 점선 스트로크 */}
        <Circle
          cx={60}
          cy={250}
          r={40}
          color="#FF6B6B"
          style="stroke"
          strokeWidth={3}
          strokeDasharray={[10, 5]}
        />

        {/* 그라데이션 테두리 (다음 섹션에서) */}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  canvas: {
    width: width,
    height: 320,
  },
});

export default SkiaPaintDemo;
```

## 💻 그라데이션

### 선형 그라데이션

```typescript
// components/LinearGradientDemo.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Canvas,
  Rect,
  RoundedRect,
  Circle,
  LinearGradient,
  vec,
} from '@shopify/react-native-skia';

const { width } = Dimensions.get('window');

function LinearGradientDemo() {
  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {/* 수평 그라데이션 */}
        <Rect x={20} y={20} width={width - 40} height={80}>
          <LinearGradient
            start={vec(20, 0)}
            end={vec(width - 20, 0)}
            colors={['#7A4AE2', '#E24A7A']}
          />
        </Rect>

        {/* 수직 그라데이션 */}
        <Rect x={20} y={120} width={width - 40} height={80}>
          <LinearGradient
            start={vec(0, 120)}
            end={vec(0, 200)}
            colors={['#4AE27A', '#4A90D9']}
          />
        </Rect>

        {/* 대각선 그라데이션 */}
        <RoundedRect x={20} y={220} width={width - 40} height={80} r={20}>
          <LinearGradient
            start={vec(20, 220)}
            end={vec(width - 20, 300)}
            colors={['#FFD600', '#FF6B6B', '#7A4AE2']}
            positions={[0, 0.5, 1]}
          />
        </RoundedRect>

        {/* 원에 적용 */}
        <Circle cx={width / 2} cy={380} r={50}>
          <LinearGradient
            start={vec(width / 2 - 50, 330)}
            end={vec(width / 2 + 50, 430)}
            colors={['#00D9FF', '#7A4AE2']}
          />
        </Circle>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  canvas: {
    width: width,
    height: 450,
  },
});

export default LinearGradientDemo;
```

### 방사형 그라데이션

```typescript
// components/RadialGradientDemo.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Canvas,
  Circle,
  Rect,
  RadialGradient,
  SweepGradient,
  TwoPointConicalGradient,
  vec,
} from '@shopify/react-native-skia';

const { width } = Dimensions.get('window');

function RadialGradientDemo() {
  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {/* 기본 방사형 */}
        <Circle cx={80} cy={80} r={60}>
          <RadialGradient
            c={vec(80, 80)}
            r={60}
            colors={['#FFFFFF', '#7A4AE2', '#1A1A1A']}
          />
        </Circle>

        {/* 오프셋 중심 (3D 효과) */}
        <Circle cx={220} cy={80} r={60}>
          <RadialGradient
            c={vec(200, 60)}
            r={80}
            colors={['#FFFFFF', '#4AE27A', '#1A5A2A']}
          />
        </Circle>

        {/* Sweep 그라데이션 (원형) */}
        <Circle cx={80} cy={220} r={60}>
          <SweepGradient
            c={vec(80, 220)}
            colors={['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#8B00FF', '#FF0000']}
          />
        </Circle>

        {/* Two Point Conical (원뿔형) */}
        <Circle cx={220} cy={220} r={60}>
          <TwoPointConicalGradient
            start={vec(200, 200)}
            startR={10}
            end={vec(240, 240)}
            endR={60}
            colors={['#FFD600', '#FF6B6B']}
          />
        </Circle>

        {/* 버튼 스타일 */}
        <Rect x={20} y={320} width={width - 40} height={60} rx={30}>
          <RadialGradient
            c={vec(width / 2, 320)}
            r={width / 2}
            colors={['#9B6DFF', '#7A4AE2', '#5A2AD2']}
          />
        </Rect>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  canvas: {
    width: width,
    height: 420,
  },
});

export default RadialGradientDemo;
```

## 💻 이미지 필터와 블러

### 블러 효과

```typescript
// components/BlurEffects.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Canvas,
  Rect,
  Circle,
  Image,
  Blur,
  BackdropBlur,
  BackdropFilter,
  useImage,
  RoundedRect,
  Group,
  Text as SkiaText,
  useFont,
  Fill,
} from '@shopify/react-native-skia';

const { width, height } = Dimensions.get('window');

function BlurEffectsDemo() {
  const image = useImage(require('../assets/sample-image.jpg'));
  const font = useFont(require('../assets/fonts/Inter-Bold.ttf'), 24);

  if (!image || !font) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {/* 배경 이미지 */}
        <Image
          image={image}
          x={0}
          y={0}
          width={width}
          height={height / 2}
          fit="cover"
        />

        {/* 블러된 영역 (글래스모피즘) */}
        <BackdropBlur blur={15} clip={{ x: 20, y: 100, width: width - 40, height: 120 }}>
          <Fill color="rgba(255, 255, 255, 0.2)" />
        </BackdropBlur>

        {/* 블러 카드 테두리 */}
        <RoundedRect
          x={20}
          y={100}
          width={width - 40}
          height={120}
          r={16}
          color="rgba(255, 255, 255, 0.3)"
          style="stroke"
          strokeWidth={1}
        />

        {/* 카드 내용 */}
        <SkiaText
          x={40}
          y={160}
          text="Glass Morphism Card"
          font={font}
          color="#FFFFFF"
        />

        {/* 아래쪽: 다양한 블러 강도 비교 */}
        <Group transform={[{ translateY: height / 2 + 20 }]}>
          {/* 원본 */}
          <Group clip={{ x: 0, y: 0, width: width / 4, height: 100 }}>
            <Image
              image={image}
              x={0}
              y={-100}
              width={width / 4}
              height={200}
              fit="cover"
            />
          </Group>

          {/* 약한 블러 */}
          <Group clip={{ x: width / 4, y: 0, width: width / 4, height: 100 }}>
            <Image
              image={image}
              x={width / 4}
              y={-100}
              width={width / 4}
              height={200}
              fit="cover"
            >
              <Blur blur={5} />
            </Image>
          </Group>

          {/* 중간 블러 */}
          <Group clip={{ x: width / 2, y: 0, width: width / 4, height: 100 }}>
            <Image
              image={image}
              x={width / 2}
              y={-100}
              width={width / 4}
              height={200}
              fit="cover"
            >
              <Blur blur={15} />
            </Image>
          </Group>

          {/* 강한 블러 */}
          <Group clip={{ x: (width / 4) * 3, y: 0, width: width / 4, height: 100 }}>
            <Image
              image={image}
              x={(width / 4) * 3}
              y={-100}
              width={width / 4}
              height={200}
              fit="cover"
            >
              <Blur blur={30} />
            </Image>
          </Group>
        </Group>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
});

export default BlurEffectsDemo;
```

### 색상 필터

```typescript
// components/ColorFilters.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Canvas,
  Image,
  ColorMatrix,
  useImage,
  Group,
} from '@shopify/react-native-skia';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 60) / 3;

function ColorFiltersDemo() {
  const image = useImage(require('../assets/sample-image.jpg'));

  if (!image) {
    return null;
  }

  // 다양한 색상 매트릭스 정의
  const filters = {
    // 그레이스케일
    grayscale: [
      0.33, 0.33, 0.33, 0, 0,
      0.33, 0.33, 0.33, 0, 0,
      0.33, 0.33, 0.33, 0, 0,
      0, 0, 0, 1, 0,
    ],

    // 세피아
    sepia: [
      0.393, 0.769, 0.189, 0, 0,
      0.349, 0.686, 0.168, 0, 0,
      0.272, 0.534, 0.131, 0, 0,
      0, 0, 0, 1, 0,
    ],

    // 반전
    invert: [
      -1, 0, 0, 0, 1,
      0, -1, 0, 0, 1,
      0, 0, -1, 0, 1,
      0, 0, 0, 1, 0,
    ],

    // 채도 증가
    saturate: [
      1.5, -0.25, -0.25, 0, 0,
      -0.25, 1.5, -0.25, 0, 0,
      -0.25, -0.25, 1.5, 0, 0,
      0, 0, 0, 1, 0,
    ],

    // 밝기 증가
    brightness: [
      1.2, 0, 0, 0, 0.1,
      0, 1.2, 0, 0, 0.1,
      0, 0, 1.2, 0, 0.1,
      0, 0, 0, 1, 0,
    ],

    // 대비 증가
    contrast: [
      1.5, 0, 0, 0, -0.25,
      0, 1.5, 0, 0, -0.25,
      0, 0, 1.5, 0, -0.25,
      0, 0, 0, 1, 0,
    ],
  };

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {/* 원본 */}
        <Image
          image={image}
          x={20}
          y={20}
          width={TILE_SIZE}
          height={TILE_SIZE}
          fit="cover"
        />

        {/* 그레이스케일 */}
        <Image
          image={image}
          x={40 + TILE_SIZE}
          y={20}
          width={TILE_SIZE}
          height={TILE_SIZE}
          fit="cover"
        >
          <ColorMatrix matrix={filters.grayscale} />
        </Image>

        {/* 세피아 */}
        <Image
          image={image}
          x={60 + TILE_SIZE * 2}
          y={20}
          width={TILE_SIZE}
          height={TILE_SIZE}
          fit="cover"
        >
          <ColorMatrix matrix={filters.sepia} />
        </Image>

        {/* 반전 */}
        <Image
          image={image}
          x={20}
          y={40 + TILE_SIZE}
          width={TILE_SIZE}
          height={TILE_SIZE}
          fit="cover"
        >
          <ColorMatrix matrix={filters.invert} />
        </Image>

        {/* 채도 */}
        <Image
          image={image}
          x={40 + TILE_SIZE}
          y={40 + TILE_SIZE}
          width={TILE_SIZE}
          height={TILE_SIZE}
          fit="cover"
        >
          <ColorMatrix matrix={filters.saturate} />
        </Image>

        {/* 대비 */}
        <Image
          image={image}
          x={60 + TILE_SIZE * 2}
          y={40 + TILE_SIZE}
          width={TILE_SIZE}
          height={TILE_SIZE}
          fit="cover"
        >
          <ColorMatrix matrix={filters.contrast} />
        </Image>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  canvas: {
    width: width,
    height: TILE_SIZE * 2 + 80,
  },
});

export default ColorFiltersDemo;
```

## 💻 Reanimated 통합

### useSharedValue와 결합

```typescript
// components/SkiaWithReanimated.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Text } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  LinearGradient,
  vec,
  Blur,
  useCanvasRef,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  withSpring,
  useDerivedValue,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

function SkiaWithReanimated() {
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

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

  // 파생 값: 원의 위치
  const cx = useDerivedValue(() => {
    return 50 + progress.value * (width - 100);
  });

  const cy = useDerivedValue(() => {
    return height / 4 + Math.sin(progress.value * Math.PI * 4) * 50;
  });

  // 파생 값: 색상 변화
  const color = useDerivedValue(() => {
    const hue = progress.value * 360;
    return `hsl(${hue}, 80%, 60%)`;
  });

  // 크기 애니메이션
  const radius = useDerivedValue(() => {
    return 30 + Math.sin(progress.value * Math.PI * 2) * 10;
  });

  const handlePress = () => {
    scale.value = withSpring(scale.value === 1 ? 1.5 : 1);
  };

  const animatedScale = useDerivedValue(() => scale.value);

  return (
    <View style={styles.container}>
      <Pressable onPress={handlePress} style={StyleSheet.absoluteFill}>
        <Canvas style={styles.canvas}>
          <Group
            transform={[
              { translateX: width / 2 },
              { translateY: height / 4 },
              { scale: animatedScale },
              { translateX: -width / 2 },
              { translateY: -height / 4 },
            ]}
          >
            {/* 블러된 그림자 */}
            <Circle cx={cx} cy={cy} r={radius} color="rgba(0,0,0,0.3)">
              <Blur blur={15} />
            </Circle>

            {/* 메인 원 */}
            <Circle cx={cx} cy={cy} r={radius} color={color} />
          </Group>
        </Canvas>
      </Pressable>
      <Text style={styles.hint}>Tap to scale</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  canvas: {
    flex: 1,
  },
  hint: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default SkiaWithReanimated;
```

### 제스처와 결합

```typescript
// components/SkiaGestureExample.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  LinearGradient,
  RadialGradient,
  vec,
  Shadow,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useDerivedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

function SkiaGestureDemo() {
  const translateX = useSharedValue(width / 2);
  const translateY = useSharedValue(height / 2);
  const scale = useSharedValue(1);
  const isPressed = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isPressed.value = true;
      scale.value = withSpring(1.2);
    })
    .onUpdate((event) => {
      translateX.value = event.absoluteX;
      translateY.value = event.absoluteY;
    })
    .onEnd(() => {
      isPressed.value = false;
      scale.value = withSpring(1);
    });

  // 파생 값들
  const cx = useDerivedValue(() => translateX.value);
  const cy = useDerivedValue(() => translateY.value);
  const animatedScale = useDerivedValue(() => scale.value);
  const animatedRadius = useDerivedValue(() => 40 * scale.value);

  // 그라데이션 위치
  const gradientStart = useDerivedValue(() =>
    vec(translateX.value - 30, translateY.value - 30)
  );
  const gradientEnd = useDerivedValue(() =>
    vec(translateX.value + 30, translateY.value + 30)
  );

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Canvas style={styles.canvas}>
          {/* 트레일 효과 (잔상) */}
          {[0.2, 0.4, 0.6, 0.8].map((opacity, index) => (
            <Circle
              key={index}
              cx={cx}
              cy={cy}
              r={useDerivedValue(() => animatedRadius.value * (1 + index * 0.1))}
              color={`rgba(122, 74, 226, ${opacity * 0.3})`}
            />
          ))}

          {/* 그림자 */}
          <Group>
            <Shadow dx={0} dy={10} blur={20} color="rgba(0,0,0,0.3)" />
            <Circle cx={cx} cy={cy} r={animatedRadius}>
              <LinearGradient
                start={gradientStart}
                end={gradientEnd}
                colors={['#9B6DFF', '#7A4AE2']}
              />
            </Circle>
          </Group>

          {/* 하이라이트 */}
          <Circle
            cx={useDerivedValue(() => translateX.value - 10)}
            cy={useDerivedValue(() => translateY.value - 10)}
            r={useDerivedValue(() => animatedRadius.value * 0.3)}
            color="rgba(255, 255, 255, 0.4)"
          />
        </Canvas>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  canvas: {
    flex: 1,
  },
});

export default SkiaGestureDemo;
```

## 💻 쉐이더 프로그래밍

### GLSL 쉐이더 기초

```typescript
// components/SkiaShaders.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Canvas,
  Rect,
  Shader,
  Skia,
  Fill,
  vec,
  useClock,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// GLSL 쉐이더 소스
const GRADIENT_SHADER = Skia.RuntimeEffect.Make(`
  uniform float2 resolution;
  uniform float time;

  half4 main(float2 pos) {
    // 정규화된 좌표 (0~1)
    float2 uv = pos / resolution;

    // 시간에 따라 변화하는 색상
    float r = 0.5 + 0.5 * sin(time + uv.x * 3.14159);
    float g = 0.5 + 0.5 * sin(time * 1.3 + uv.y * 3.14159);
    float b = 0.5 + 0.5 * sin(time * 0.7 + (uv.x + uv.y) * 3.14159);

    return half4(r, g, b, 1.0);
  }
`);

// 물결 쉐이더
const WAVE_SHADER = Skia.RuntimeEffect.Make(`
  uniform float2 resolution;
  uniform float time;
  uniform float4 color1;
  uniform float4 color2;

  half4 main(float2 pos) {
    float2 uv = pos / resolution;

    // 물결 효과
    float wave = sin(uv.x * 10.0 + time * 2.0) * 0.1;
    wave += sin(uv.x * 5.0 - time) * 0.05;

    float y = uv.y + wave;
    float gradient = smoothstep(0.3, 0.7, y);

    return mix(color1, color2, gradient);
  }
`);

function SkiaShaderDemo() {
  const time = useSharedValue(0);

  useEffect(() => {
    time.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: 4000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [time]);

  const uniforms = useDerivedValue(() => ({
    resolution: vec(width, height / 2),
    time: time.value,
  }));

  const waveUniforms = useDerivedValue(() => ({
    resolution: vec(width, height / 2),
    time: time.value,
    color1: vec(0.478, 0.29, 0.886, 1), // #7A4AE2
    color2: vec(0.886, 0.29, 0.478, 1), // #E24A7A
  }));

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {/* 색상 변화 쉐이더 */}
        <Fill>
          <Shader source={GRADIENT_SHADER} uniforms={uniforms} />
        </Fill>
      </Canvas>

      <Canvas style={styles.canvas}>
        {/* 물결 쉐이더 */}
        <Fill>
          <Shader source={WAVE_SHADER} uniforms={waveUniforms} />
        </Fill>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  canvas: {
    width: width,
    height: height / 2,
  },
});

export default SkiaShaderDemo;
```

### 노이즈 쉐이더

```typescript
// components/NoiseShader.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Canvas,
  Fill,
  Shader,
  Skia,
  vec,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Simplex Noise 쉐이더
const NOISE_SHADER = Skia.RuntimeEffect.Make(`
  uniform float2 resolution;
  uniform float time;

  // 간단한 노이즈 함수
  float hash(float2 p) {
    return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
  }

  float noise(float2 p) {
    float2 i = floor(p);
    float2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + float2(1.0, 0.0));
    float c = hash(i + float2(0.0, 1.0));
    float d = hash(i + float2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // FBM (Fractal Brownian Motion)
  float fbm(float2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }

    return value;
  }

  half4 main(float2 pos) {
    float2 uv = pos / resolution;

    // 시간에 따라 움직이는 노이즈
    float n = fbm(uv * 5.0 + time * 0.5);

    // 색상 매핑
    float3 color1 = float3(0.478, 0.29, 0.886); // Purple
    float3 color2 = float3(0.886, 0.29, 0.478); // Pink
    float3 color3 = float3(0.29, 0.886, 0.478); // Green

    float3 color = mix(color1, color2, n);
    color = mix(color, color3, n * n);

    return half4(color, 1.0);
  }
`);

function NoiseShaderDemo() {
  const time = useSharedValue(0);

  useEffect(() => {
    time.value = withRepeat(
      withTiming(100, {
        duration: 100000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [time]);

  const uniforms = useDerivedValue(() => ({
    resolution: vec(width, height),
    time: time.value,
  }));

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Fill>
          <Shader source={NOISE_SHADER} uniforms={uniforms} />
        </Fill>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
});

export default NoiseShaderDemo;
```

## 💻 sometimes-app 적용 사례

### 프로필 카드 글래스모피즘

```typescript
// src/features/profile/ui/glass-profile-card.tsx
import React from 'react';
import { View, StyleSheet, Dimensions, Text, Image } from 'react-native';
import {
  Canvas,
  RoundedRect,
  Image as SkiaImage,
  BackdropBlur,
  Fill,
  LinearGradient,
  vec,
  useImage,
  Group,
  Blur,
  Circle,
} from '@shopify/react-native-skia';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/src/shared/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = 200;

interface GlassProfileCardProps {
  name: string;
  university: string;
  age: number;
  backgroundUrl: string;
  avatarUrl: string;
}

function GlassProfileCard({
  name,
  university,
  age,
  backgroundUrl,
  avatarUrl,
}: GlassProfileCardProps) {
  const backgroundImage = useImage(backgroundUrl);

  if (!backgroundImage) {
    return <View style={styles.placeholder} />;
  }

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {/* 배경 이미지 (블러 처리) */}
        <Group clip={{ x: 0, y: 0, width: CARD_WIDTH, height: CARD_HEIGHT }}>
          <SkiaImage
            image={backgroundImage}
            x={0}
            y={0}
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            fit="cover"
          >
            <Blur blur={20} />
          </SkiaImage>
        </Group>

        {/* 글래스 오버레이 */}
        <RoundedRect
          x={0}
          y={0}
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          r={24}
        >
          <LinearGradient
            start={vec(0, 0)}
            end={vec(CARD_WIDTH, CARD_HEIGHT)}
            colors={[
              'rgba(255, 255, 255, 0.4)',
              'rgba(255, 255, 255, 0.1)',
            ]}
          />
        </RoundedRect>

        {/* 테두리 */}
        <RoundedRect
          x={0}
          y={0}
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          r={24}
          color="rgba(255, 255, 255, 0.3)"
          style="stroke"
          strokeWidth={1}
        />

        {/* 장식용 원 */}
        <Circle
          cx={CARD_WIDTH - 30}
          cy={30}
          r={60}
          color={`${colors.primaryPurple}30`}
        >
          <Blur blur={30} />
        </Circle>
      </Canvas>

      {/* 내용 (React Native 컴포넌트) */}
      <View style={styles.content}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.name}>{name}, {age}</Text>
          <Text style={styles.university}>{university}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholder: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: colors.lightPurple,
    borderRadius: 24,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  info: {
    marginLeft: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  university: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default GlassProfileCard;
```

### 매칭 성공 파티클 효과

```typescript
// src/features/matching/ui/match-success-particles.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  vec,
  Blur,
  LinearGradient,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import colors from '@/src/shared/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PARTICLE_COUNT = 50;
const COLORS = [colors.primaryPurple, '#E24A7A', '#FFD600', '#4AE27A', '#4A90D9'];

interface Particle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  color: string;
  delay: number;
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }).map((_, index) => {
    const angle = (Math.random() * Math.PI * 2);
    const distance = 100 + Math.random() * 300;
    const startX = SCREEN_WIDTH / 2;
    const startY = SCREEN_HEIGHT / 2;

    return {
      id: index,
      startX,
      startY,
      endX: startX + Math.cos(angle) * distance,
      endY: startY + Math.sin(angle) * distance - 100 - Math.random() * 200,
      size: 4 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 300,
    };
  });
}

interface MatchSuccessParticlesProps {
  isVisible: boolean;
}

function MatchSuccessParticles({ isVisible }: MatchSuccessParticlesProps) {
  const particles = React.useMemo(generateParticles, []);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: 2000,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [isVisible, progress]);

  if (!isVisible) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFill}>
        {particles.map((particle) => (
          <ParticleCircle
            key={particle.id}
            particle={particle}
            progress={progress}
          />
        ))}
      </Canvas>
    </View>
  );
}

interface ParticleCircleProps {
  particle: Particle;
  progress: Animated.SharedValue<number>;
}

function ParticleCircle({ particle, progress }: ParticleCircleProps) {
  const cx = useDerivedValue(() => {
    const delayedProgress = Math.max(0, (progress.value * 2000 - particle.delay) / (2000 - particle.delay));
    return interpolate(
      delayedProgress,
      [0, 1],
      [particle.startX, particle.endX],
      Extrapolation.CLAMP
    );
  });

  const cy = useDerivedValue(() => {
    const delayedProgress = Math.max(0, (progress.value * 2000 - particle.delay) / (2000 - particle.delay));
    // 중력 효과 추가
    const linearY = interpolate(
      delayedProgress,
      [0, 1],
      [particle.startY, particle.endY],
      Extrapolation.CLAMP
    );
    const gravity = delayedProgress * delayedProgress * 200;
    return linearY + gravity;
  });

  const opacity = useDerivedValue(() => {
    const delayedProgress = Math.max(0, (progress.value * 2000 - particle.delay) / (2000 - particle.delay));
    return interpolate(
      delayedProgress,
      [0, 0.2, 0.8, 1],
      [0, 1, 1, 0],
      Extrapolation.CLAMP
    );
  });

  const scale = useDerivedValue(() => {
    const delayedProgress = Math.max(0, (progress.value * 2000 - particle.delay) / (2000 - particle.delay));
    return interpolate(
      delayedProgress,
      [0, 0.1, 0.5, 1],
      [0, 1.5, 1, 0.5],
      Extrapolation.CLAMP
    );
  });

  const r = useDerivedValue(() => particle.size * scale.value);

  return (
    <Group opacity={opacity}>
      {/* 글로우 효과 */}
      <Circle cx={cx} cy={cy} r={useDerivedValue(() => r.value * 2)} color={`${particle.color}40`}>
        <Blur blur={10} />
      </Circle>

      {/* 메인 파티클 */}
      <Circle cx={cx} cy={cy} r={r} color={particle.color} />
    </Group>
  );
}

export default MatchSuccessParticles;
```

## ⚠️ 흔한 실수와 해결법

### 1. 이미지 로딩 처리

```typescript
// ❌ 잘못된 예: 이미지 null 체크 없음
function BadExample() {
  const image = useImage(require('./image.jpg'));
  return (
    <Canvas>
      <Image image={image} ... /> {/* 크래시 발생 가능 */}
    </Canvas>
  );
}

// ✅ 올바른 예: null 체크
function GoodExample() {
  const image = useImage(require('./image.jpg'));

  if (!image) {
    return <ActivityIndicator />; // 로딩 표시
  }

  return (
    <Canvas>
      <Image image={image} ... />
    </Canvas>
  );
}
```

### 2. useDerivedValue 사용

```typescript
// ❌ 잘못된 예: 일반 값을 Skia에 전달
<Circle cx={sharedValue.value} ... /> // 반응하지 않음

// ✅ 올바른 예: useDerivedValue 사용
const cx = useDerivedValue(() => sharedValue.value);
<Circle cx={cx} ... /> // 정상 작동
```

### 3. 쉐이더 컴파일 오류

```typescript
// ❌ GLSL 문법 오류 확인
const SHADER = Skia.RuntimeEffect.Make(`
  half4 main(float2 pos) {
    return half4(1, 0, 0, 1) // 세미콜론 누락!
  }
`);

// ✅ 런타임에 null 체크
if (!SHADER) {
  console.error('Shader compilation failed');
  return null;
}
```

## 💡 성능 최적화 팁

### 1. Canvas 분리

```typescript
// ❌ 비효율적: 모든 것을 하나의 Canvas에
<Canvas>
  <StaticBackground /> {/* 정적 */}
  <AnimatedElement />   {/* 동적 */}
</Canvas>

// ✅ 효율적: 정적/동적 분리
<View>
  <Canvas style={StyleSheet.absoluteFill}>
    <StaticBackground />
  </Canvas>
  <Canvas style={StyleSheet.absoluteFill}>
    <AnimatedElement />
  </Canvas>
</View>
```

### 2. 불필요한 리렌더링 방지

```typescript
// 쉐이더 uniforms 메모이제이션
const uniforms = useDerivedValue(() => ({
  resolution: vec(width, height),
  time: time.value,
})); // time.value가 변경될 때만 업데이트
```

### 3. 복잡한 경로 캐싱

```typescript
// 경로를 한 번만 생성
const path = React.useMemo(() => {
  const p = Skia.Path.Make();
  // 복잡한 경로 생성...
  return p;
}, []); // 의존성이 없으면 한 번만 실행
```

## 🏋️ 연습 문제

### 문제 1: 물 물결 효과
터치한 위치에서 물결이 퍼져나가는 효과:
- 터치 시 동심원 생성
- 퍼져나가며 투명해지기
- 여러 터치 동시 지원

### 문제 2: 네온 텍스트
글로우 효과가 있는 네온 사인 텍스트:
- 외곽선 글로우
- 깜빡이는 효과
- 그라데이션 적용

### 문제 3: 플라즈마 배경
움직이는 플라즈마 효과:
- sin/cos 기반 패턴
- 다중 색상 혼합
- 시간에 따른 변화

## 📚 이 장에서 배운 내용

1. **Skia 기초**: Canvas, 도형, Paint 개념
2. **그라데이션**: Linear, Radial, Sweep, TwoPointConical
3. **이미지 필터**: 블러, 색상 매트릭스, BackdropBlur
4. **Reanimated 통합**: useDerivedValue로 애니메이션 연결
5. **쉐이더 프로그래밍**: GLSL 기초와 커스텀 효과

**다음 장 예고**: **Chapter 35: 3D 효과 구현**에서는 perspective, rotateX/Y, 카드 플립 등 3D 시각 효과를 다룹니다.
