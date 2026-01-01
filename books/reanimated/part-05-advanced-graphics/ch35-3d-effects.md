# Chapter 35: 3D 효과 구현

perspective, rotateX/Y를 활용한 3D 시각 효과를 구현합니다. 카드 플립, 큐브 회전, 3D 캐러셀 등 입체적인 UI를 다룹니다.

## 📌 학습 목표

- CSS 3D Transform 원리 이해
- perspective 속성 활용
- rotateX, rotateY, rotateZ 조합
- 카드 플립 애니메이션
- 3D 캐러셀과 큐브 효과

## 📖 3D Transform 기초

### perspective란?

```
┌─────────────────────────────────────────────────────┐
│                    시점 (Eye Point)                  │
│                         👁️                          │
│                         │                           │
│                    ─────┼───── Perspective          │
│                         │                           │
│           ┌─────────────┼─────────────┐             │
│           │             │             │             │
│           │      ┌──────┴──────┐      │             │
│           │      │   Object    │      │             │
│           │      └─────────────┘      │             │
│           │                           │             │
│           └───────────────────────────┘             │
│                      Screen                          │
│                                                      │
│  • perspective 값이 작을수록 = 가까이서 보는 느낌     │
│  • perspective 값이 클수록 = 멀리서 보는 느낌        │
│  • 권장값: 500~1500                                  │
└─────────────────────────────────────────────────────┘
```

### 기본 3D Transform

```typescript
// components/Basic3D.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

function Basic3DDemo() {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const rotateZ = useSharedValue(0);

  useEffect(() => {
    // X축 회전 (앞뒤로 기울어짐)
    rotateX.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );

    // Y축 회전 (좌우로 돌아감)
    rotateY.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );

    // Z축 회전 (평면에서 회전)
    rotateZ.value = withRepeat(
      withTiming(360, { duration: 5000, easing: Easing.linear }),
      -1,
      false
    );
  }, [rotateX, rotateY, rotateZ]);

  const boxXStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateX: `${rotateX.value}deg` },
    ],
  }));

  const boxYStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotateY.value}deg` },
    ],
  }));

  const boxZStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateZ: `${rotateZ.value}deg` },
    ],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.boxContainer}>
          <Animated.View style={[styles.box, styles.boxPurple, boxXStyle]}>
            <Text style={styles.label}>rotateX</Text>
          </Animated.View>
        </View>

        <View style={styles.boxContainer}>
          <Animated.View style={[styles.box, styles.boxGreen, boxYStyle]}>
            <Text style={styles.label}>rotateY</Text>
          </Animated.View>
        </View>

        <View style={styles.boxContainer}>
          <Animated.View style={[styles.box, styles.boxOrange, boxZStyle]}>
            <Text style={styles.label}>rotateZ</Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#1A1A1A',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  boxContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxPurple: {
    backgroundColor: '#7A4AE2',
  },
  boxGreen: {
    backgroundColor: '#4AE27A',
  },
  boxOrange: {
    backgroundColor: '#E27A4A',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Basic3DDemo;
```

## 💻 카드 플립 애니메이션

### 기본 카드 플립

```typescript
// components/FlipCard.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

interface FlipCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
}

function FlipCard({ frontContent, backContent }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const rotation = useSharedValue(0);

  const handleFlip = () => {
    const newValue = isFlipped ? 0 : 180;
    rotation.value = withTiming(newValue, {
      duration: 600,
      easing: Easing.inOut(Easing.cubic),
    });
    setIsFlipped(!isFlipped);
  };

  // 앞면 스타일: 0도에서 보이고 90도 이후 숨김
  const frontStyle = useAnimatedStyle(() => {
    const rotateY = `${rotation.value}deg`;

    // 90도 이상이면 숨김
    const opacity = interpolate(
      rotation.value,
      [0, 89, 90, 180],
      [1, 1, 0, 0]
    );

    return {
      transform: [
        { perspective: 1200 },
        { rotateY },
      ],
      opacity,
      backfaceVisibility: 'hidden',
    };
  });

  // 뒷면 스타일: 180도에서 시작하여 0도가 되면 보임
  const backStyle = useAnimatedStyle(() => {
    // 뒷면은 180도 회전된 상태에서 시작
    const rotateY = `${rotation.value + 180}deg`;

    // 90도 이상 회전하면 보임
    const opacity = interpolate(
      rotation.value,
      [0, 89, 90, 180],
      [0, 0, 1, 1]
    );

    return {
      transform: [
        { perspective: 1200 },
        { rotateY },
      ],
      opacity,
      backfaceVisibility: 'hidden',
    };
  });

  return (
    <Pressable onPress={handleFlip} style={styles.container}>
      {/* 앞면 */}
      <Animated.View style={[styles.card, styles.front, frontStyle]}>
        {frontContent}
      </Animated.View>

      {/* 뒷면 */}
      <Animated.View style={[styles.card, styles.back, backStyle]}>
        {backContent}
      </Animated.View>
    </Pressable>
  );
}

// 사용 예시
function FlipCardDemo() {
  return (
    <View style={demoStyles.container}>
      <FlipCard
        frontContent={
          <View style={demoStyles.cardContent}>
            <Text style={demoStyles.emoji}>🎴</Text>
            <Text style={demoStyles.title}>Tap to Flip</Text>
            <Text style={demoStyles.subtitle}>Front Side</Text>
          </View>
        }
        backContent={
          <View style={demoStyles.cardContent}>
            <Text style={demoStyles.emoji}>✨</Text>
            <Text style={demoStyles.title}>Secret!</Text>
            <Text style={demoStyles.subtitle}>Back Side</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  front: {
    backgroundColor: '#7A4AE2',
  },
  back: {
    backgroundColor: '#E24A7A',
  },
});

const demoStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
  cardContent: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
});

export default FlipCard;
```

### 수평 플립 (책 넘기기)

```typescript
// components/HorizontalFlip.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const PAGE_WIDTH = width * 0.4;
const PAGE_HEIGHT = PAGE_WIDTH * 1.5;

interface PageFlipProps {
  pages: string[];
}

function PageFlip({ pages }: PageFlipProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const rotation = useSharedValue(0);

  const flipToNext = () => {
    if (currentPage < pages.length - 1) {
      rotation.value = withSpring(-180, { damping: 15 }, () => {
        // 애니메이션 완료 후 페이지 업데이트
      });
      setCurrentPage(prev => prev + 1);
    }
  };

  const flipToPrev = () => {
    if (currentPage > 0) {
      rotation.value = withSpring(0, { damping: 15 });
      setCurrentPage(prev => prev - 1);
    }
  };

  // 왼쪽 페이지 (고정)
  const leftPageStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }],
  }));

  // 오른쪽 페이지 (플립됨)
  const rightPageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotation.value}deg` },
      ],
      transformOrigin: 'left center',
    };
  });

  return (
    <View style={styles.bookContainer}>
      {/* 왼쪽 페이지 */}
      <Animated.View style={[styles.page, styles.leftPage, leftPageStyle]}>
        <Text style={styles.pageNumber}>
          {currentPage > 0 ? pages[currentPage - 1] : ''}
        </Text>
      </Animated.View>

      {/* 오른쪽 페이지 */}
      <Pressable onPress={flipToNext}>
        <Animated.View style={[styles.page, styles.rightPage, rightPageStyle]}>
          <Text style={styles.pageNumber}>{pages[currentPage]}</Text>
        </Animated.View>
      </Pressable>

      {/* 네비게이션 */}
      <View style={styles.navigation}>
        <Pressable
          onPress={flipToPrev}
          style={[styles.navButton, currentPage === 0 && styles.disabled]}
          disabled={currentPage === 0}
        >
          <Text style={styles.navText}>← Prev</Text>
        </Pressable>

        <Text style={styles.pageIndicator}>
          {currentPage + 1} / {pages.length}
        </Text>

        <Pressable
          onPress={flipToNext}
          style={[styles.navButton, currentPage === pages.length - 1 && styles.disabled]}
          disabled={currentPage === pages.length - 1}
        >
          <Text style={styles.navText}>Next →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bookContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  page: {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    backgroundColor: '#FFFEF5',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  leftPage: {
    position: 'absolute',
    left: width / 2 - PAGE_WIDTH,
  },
  rightPage: {
    marginLeft: PAGE_WIDTH,
  },
  pageNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    gap: 20,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#7A4AE2',
    borderRadius: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pageIndicator: {
    fontSize: 16,
    color: '#666',
  },
});

export default PageFlip;
```

## 💻 3D 큐브

### 회전하는 큐브

```typescript
// components/Cube3D.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CUBE_SIZE = 120;
const HALF_SIZE = CUBE_SIZE / 2;

interface CubeFaceProps {
  color: string;
  label: string;
  transform: object[];
}

function CubeFace({ color, label, transform }: CubeFaceProps) {
  return (
    <Animated.View
      style={[
        faceStyles.face,
        { backgroundColor: color, transform },
      ]}
    >
      <Text style={faceStyles.label}>{label}</Text>
    </Animated.View>
  );
}

function Cube3D() {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  useEffect(() => {
    rotateX.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );

    rotateY.value = withRepeat(
      withTiming(360, { duration: 6000, easing: Easing.linear }),
      -1,
      false
    );
  }, [rotateX, rotateY]);

  const cubeStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
    ],
  }));

  // 각 면의 Transform 정의
  const faces = [
    {
      // Front
      color: '#7A4AE2',
      label: 'Front',
      transform: [{ translateZ: HALF_SIZE }],
    },
    {
      // Back
      color: '#E24A7A',
      label: 'Back',
      transform: [{ rotateY: '180deg' }, { translateZ: HALF_SIZE }],
    },
    {
      // Right
      color: '#4AE27A',
      label: 'Right',
      transform: [{ rotateY: '90deg' }, { translateZ: HALF_SIZE }],
    },
    {
      // Left
      color: '#FFD600',
      label: 'Left',
      transform: [{ rotateY: '-90deg' }, { translateZ: HALF_SIZE }],
    },
    {
      // Top
      color: '#4A90D9',
      label: 'Top',
      transform: [{ rotateX: '90deg' }, { translateZ: HALF_SIZE }],
    },
    {
      // Bottom
      color: '#FF6B6B',
      label: 'Bottom',
      transform: [{ rotateX: '-90deg' }, { translateZ: HALF_SIZE }],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.scene}>
        <Animated.View style={[styles.cube, cubeStyle]}>
          {faces.map((face, index) => (
            <CubeFace
              key={index}
              color={face.color}
              label={face.label}
              transform={face.transform}
            />
          ))}
        </Animated.View>
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
  scene: {
    width: CUBE_SIZE * 2,
    height: CUBE_SIZE * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cube: {
    width: CUBE_SIZE,
    height: CUBE_SIZE,
    transformStyle: 'preserve-3d', // Web에서만 작동
  },
});

const faceStyles = StyleSheet.create({
  face: {
    position: 'absolute',
    width: CUBE_SIZE,
    height: CUBE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default Cube3D;
```

### 제스처로 조작하는 큐브

```typescript
// components/InteractiveCube.tsx
import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDecay,
  withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CUBE_SIZE = 150;

function InteractiveCube() {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const velocityX = useSharedValue(0);
  const velocityY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // 드래그 방향에 따라 회전
      rotateY.value += event.changeX * 0.5;
      rotateX.value -= event.changeY * 0.5;

      velocityX.value = event.velocityX;
      velocityY.value = event.velocityY;
    })
    .onEnd(() => {
      // 관성 효과
      rotateY.value = withDecay({
        velocity: velocityX.value * 0.1,
        deceleration: 0.997,
      });

      rotateX.value = withDecay({
        velocity: -velocityY.value * 0.1,
        deceleration: 0.997,
      });
    });

  const cubeStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
    ],
  }));

  const faces = [
    { color: '#7A4AE2', transform: [{ translateZ: CUBE_SIZE / 2 }] },
    { color: '#E24A7A', transform: [{ rotateY: '180deg' }, { translateZ: CUBE_SIZE / 2 }] },
    { color: '#4AE27A', transform: [{ rotateY: '90deg' }, { translateZ: CUBE_SIZE / 2 }] },
    { color: '#FFD600', transform: [{ rotateY: '-90deg' }, { translateZ: CUBE_SIZE / 2 }] },
    { color: '#4A90D9', transform: [{ rotateX: '90deg' }, { translateZ: CUBE_SIZE / 2 }] },
    { color: '#FF6B6B', transform: [{ rotateX: '-90deg' }, { translateZ: CUBE_SIZE / 2 }] },
  ];

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.scene}>
          <Animated.View style={[styles.cube, cubeStyle]}>
            {faces.map((face, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.face,
                  { backgroundColor: face.color, transform: face.transform },
                ]}
              />
            ))}
          </Animated.View>
        </View>
      </GestureDetector>

      <Text style={styles.hint}>Drag to rotate</Text>
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
  scene: {
    width: CUBE_SIZE * 2,
    height: CUBE_SIZE * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cube: {
    width: CUBE_SIZE,
    height: CUBE_SIZE,
  },
  face: {
    position: 'absolute',
    width: CUBE_SIZE,
    height: CUBE_SIZE,
    backfaceVisibility: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  hint: {
    position: 'absolute',
    bottom: 50,
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default InteractiveCube;
```

## 💻 3D 캐러셀

### 원형 캐러셀

```typescript
// components/Carousel3D.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text, Image, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDecay,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.6;
const CARD_HEIGHT = CARD_WIDTH * 1.3;
const RADIUS = SCREEN_WIDTH * 0.8;

interface CarouselItem {
  id: string;
  image: string;
  title: string;
}

interface Carousel3DProps {
  items: CarouselItem[];
  onItemPress?: (item: CarouselItem) => void;
}

function Carousel3D({ items, onItemPress }: Carousel3DProps) {
  const rotation = useSharedValue(0);
  const velocity = useSharedValue(0);

  const ANGLE_PER_ITEM = 360 / items.length;

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      rotation.value -= event.changeX * 0.3;
      velocity.value = event.velocityX;
    })
    .onEnd(() => {
      // 스냅 또는 관성
      const targetAngle = Math.round(rotation.value / ANGLE_PER_ITEM) * ANGLE_PER_ITEM;
      rotation.value = withSpring(targetAngle, {
        damping: 20,
        stiffness: 100,
      });
    });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.carousel}>
          {items.map((item, index) => (
            <CarouselCard
              key={item.id}
              item={item}
              index={index}
              totalItems={items.length}
              rotation={rotation}
              onPress={() => onItemPress?.(item)}
            />
          ))}
        </View>
      </GestureDetector>
    </View>
  );
}

interface CarouselCardProps {
  item: CarouselItem;
  index: number;
  totalItems: number;
  rotation: Animated.SharedValue<number>;
  onPress: () => void;
}

function CarouselCard({
  item,
  index,
  totalItems,
  rotation,
  onPress,
}: CarouselCardProps) {
  const ANGLE_PER_ITEM = 360 / totalItems;
  const itemAngle = index * ANGLE_PER_ITEM;

  const cardStyle = useAnimatedStyle(() => {
    const currentAngle = rotation.value + itemAngle;
    const radians = (currentAngle * Math.PI) / 180;

    // 3D 위치 계산
    const translateX = Math.sin(radians) * RADIUS;
    const translateZ = Math.cos(radians) * RADIUS - RADIUS;

    // 스케일과 투명도 (뒤로 갈수록 작고 흐려짐)
    const scale = interpolate(
      translateZ,
      [-RADIUS * 2, 0],
      [0.5, 1],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      translateZ,
      [-RADIUS * 2, -RADIUS, 0],
      [0.3, 0.7, 1],
      Extrapolation.CLAMP
    );

    // Z-index 시뮬레이션
    const zIndex = Math.round(interpolate(
      translateZ,
      [-RADIUS * 2, 0],
      [0, 100],
      Extrapolation.CLAMP
    ));

    return {
      transform: [
        { perspective: 1000 },
        { translateX },
        { scale },
        { rotateY: `${-currentAngle}deg` },
      ],
      opacity,
      zIndex,
    };
  });

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      <Pressable onPress={onPress} style={styles.cardPressable}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardOverlay}>
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  carousel: {
    width: SCREEN_WIDTH,
    height: CARD_HEIGHT + 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardPressable: {
    flex: 1,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default Carousel3D;
```

### 커버플로우 효과

```typescript
// components/CoverFlow.tsx
import React from 'react';
import { View, StyleSheet, Dimensions, Image, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH * 0.5;
const ITEM_HEIGHT = ITEM_WIDTH * 1.4;
const SPACING = 16;
const SIDE_ITEM_SCALE = 0.7;
const SIDE_ITEM_OPACITY = 0.5;
const ROTATION_ANGLE = 45;

interface CoverFlowItem {
  id: string;
  image: string;
  title: string;
}

interface CoverFlowProps {
  items: CoverFlowItem[];
}

function CoverFlow({ items }: CoverFlowProps) {
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const contentPadding = (SCREEN_WIDTH - ITEM_WIDTH) / 2;

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + SPACING}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: contentPadding,
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {items.map((item, index) => (
          <CoverFlowItem
            key={item.id}
            item={item}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

interface CoverFlowItemProps {
  item: CoverFlowItem;
  index: number;
  scrollX: Animated.SharedValue<number>;
}

function CoverFlowItem({ item, index, scrollX }: CoverFlowItemProps) {
  const itemPosition = index * (ITEM_WIDTH + SPACING);

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      itemPosition - ITEM_WIDTH - SPACING,
      itemPosition,
      itemPosition + ITEM_WIDTH + SPACING,
    ];

    // 스케일
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [SIDE_ITEM_SCALE, 1, SIDE_ITEM_SCALE],
      Extrapolation.CLAMP
    );

    // 투명도
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [SIDE_ITEM_OPACITY, 1, SIDE_ITEM_OPACITY],
      Extrapolation.CLAMP
    );

    // 3D 회전
    const rotateY = interpolate(
      scrollX.value,
      inputRange,
      [ROTATION_ANGLE, 0, -ROTATION_ANGLE],
      Extrapolation.CLAMP
    );

    // X축 이동 (가까이 모이는 효과)
    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [ITEM_WIDTH * 0.3, 0, -ITEM_WIDTH * 0.3],
      Extrapolation.CLAMP
    );

    // Z-index 시뮬레이션 (elevation)
    const elevation = interpolate(
      scrollX.value,
      inputRange,
      [5, 20, 5],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { perspective: 1000 },
        { translateX },
        { scale },
        { rotateY: `${rotateY}deg` },
      ],
      opacity,
      elevation,
      shadowOpacity: interpolate(
        scrollX.value,
        inputRange,
        [0.2, 0.5, 0.2],
        Extrapolation.CLAMP
      ),
    };
  });

  return (
    <Animated.View style={[styles.item, animatedStyle]}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.overlay}>
        <Text style={styles.title}>{item.title}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
  item: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    marginRight: SPACING,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#2A2A2A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CoverFlow;
```

## 💻 sometimes-app 적용 사례

### 프로필 카드 플립

```typescript
// src/features/matching/ui/profile-flip-card.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, Image, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, Info } from 'lucide-react-native';
import colors from '@/src/shared/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = CARD_WIDTH * 1.3;

interface ProfileData {
  name: string;
  age: number;
  university: string;
  photos: string[];
  bio: string;
  interests: string[];
  mbti: string;
  height: number;
}

interface ProfileFlipCardProps {
  profile: ProfileData;
  onLike: () => void;
  onMessage: () => void;
}

function ProfileFlipCard({ profile, onLike, onMessage }: ProfileFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const rotation = useSharedValue(0);

  const handleFlip = useCallback(() => {
    const newFlipped = !isFlipped;
    rotation.value = withSpring(newFlipped ? 180 : 0, {
      damping: 15,
      stiffness: 100,
    });
    setIsFlipped(newFlipped);
  }, [isFlipped, rotation]);

  // 앞면 스타일
  const frontStyle = useAnimatedStyle(() => {
    const rotateY = rotation.value;
    const opacity = interpolate(rotateY, [0, 90, 180], [1, 0, 0]);

    return {
      transform: [
        { perspective: 1500 },
        { rotateY: `${rotateY}deg` },
      ],
      opacity,
      backfaceVisibility: 'hidden',
    };
  });

  // 뒷면 스타일
  const backStyle = useAnimatedStyle(() => {
    const rotateY = rotation.value - 180;
    const opacity = interpolate(rotation.value, [0, 90, 180], [0, 0, 1]);

    return {
      transform: [
        { perspective: 1500 },
        { rotateY: `${rotateY}deg` },
      ],
      opacity,
      backfaceVisibility: 'hidden',
    };
  });

  return (
    <View style={styles.container}>
      {/* 앞면: 프로필 사진 */}
      <Animated.View style={[styles.card, frontStyle]}>
        <Image
          source={{ uri: profile.photos[0] }}
          style={styles.profileImage}
        />

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        />

        <View style={styles.frontContent}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.name}, {profile.age}</Text>
            <Pressable onPress={handleFlip} style={styles.infoButton}>
              <Info size={24} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={styles.university}>{profile.university}</Text>
        </View>

        {/* 액션 버튼 */}
        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={onMessage}>
            <MessageCircle size={28} color={colors.primaryPurple} />
          </Pressable>
          <Pressable style={[styles.actionButton, styles.likeButton]} onPress={onLike}>
            <Heart size={28} color="#FFFFFF" fill="#FFFFFF" />
          </Pressable>
        </View>
      </Animated.View>

      {/* 뒷면: 상세 정보 */}
      <Animated.View style={[styles.card, styles.backCard, backStyle]}>
        <Pressable onPress={handleFlip} style={styles.backContent}>
          <Text style={styles.backName}>{profile.name}</Text>

          <View style={styles.infoSection}>
            <InfoRow label="나이" value={`${profile.age}세`} />
            <InfoRow label="키" value={`${profile.height}cm`} />
            <InfoRow label="MBTI" value={profile.mbti} />
            <InfoRow label="학교" value={profile.university} />
          </View>

          <View style={styles.bioSection}>
            <Text style={styles.bioLabel}>자기소개</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>

          <View style={styles.interestsSection}>
            <Text style={styles.interestsLabel}>관심사</Text>
            <View style={styles.interestsTags}>
              {profile.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.tapHint}>탭하여 사진 보기</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  backCard: {
    backgroundColor: colors.primaryPurple,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  frontContent: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  university: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  actions: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  likeButton: {
    backgroundColor: colors.primaryPurple,
  },
  backContent: {
    flex: 1,
    padding: 24,
  },
  backName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bioSection: {
    marginBottom: 24,
  },
  bioLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  interestsSection: {},
  interestsLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
  },
  interestsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  tapHint: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export default ProfileFlipCard;
```

## ⚠️ 흔한 실수와 해결법

### 1. Transform 순서 문제

```typescript
// ❌ 잘못된 예: 순서가 결과에 영향
transform: [
  { rotateY: '45deg' },
  { translateX: 100 },  // 회전된 축으로 이동
]

// ✅ 올바른 예: 의도에 맞는 순서
transform: [
  { translateX: 100 },  // 먼저 이동
  { rotateY: '45deg' }, // 그 다음 회전
]
```

### 2. perspective 누락

```typescript
// ❌ 잘못된 예: 3D 효과가 평면으로 보임
transform: [
  { rotateY: '45deg' },
]

// ✅ 올바른 예: perspective 추가
transform: [
  { perspective: 1000 },  // 필수!
  { rotateY: '45deg' },
]
```

### 3. backfaceVisibility 문제

```typescript
// ❌ 잘못된 예: 뒷면이 보임
<Animated.View style={[styles.front, frontStyle]} />
<Animated.View style={[styles.back, backStyle]} />

// ✅ 올바른 예: backfaceVisibility 설정
const frontStyle = useAnimatedStyle(() => ({
  ...transform,
  backfaceVisibility: 'hidden', // 뒤집혔을 때 숨김
}));
```

## 💡 성능 최적화 팁

### 1. 레이어 분리

```typescript
// 3D 효과가 있는 요소만 분리하여 렌더링 최적화
const Card = React.memo(({ data, style }) => (
  <Animated.View style={style}>
    <StaticContent data={data} />
  </Animated.View>
));
```

### 2. 이미지 최적화

```typescript
// 큰 이미지는 썸네일 사용
<Image
  source={{ uri: `${imageUrl}?w=400` }}
  style={styles.image}
  resizeMode="cover"
/>
```

### 3. 애니메이션 최소화

```typescript
// 보이지 않는 요소는 애니메이션 제외
const shouldAnimate = useDerivedValue(() => {
  return Math.abs(scrollX.value - itemPosition) < SCREEN_WIDTH * 2;
});
```

## 🏋️ 연습 문제

### 문제 1: 포커 카드 딜링
카드가 딜러에서 플레이어에게 날아가는 효과:
- 3D 회전하며 이동
- 그림자 변화
- 뒤집어지며 공개

### 문제 2: 사진 갤러리 큐브
각 면에 사진이 있는 회전 큐브:
- 스와이프로 회전
- 면 선택 시 확대
- 부드러운 관성 효과

### 문제 3: 롤링 다이스
주사위 굴리기 애니메이션:
- 랜덤 회전
- 바운스 효과
- 결과 표시

## 📚 이 장에서 배운 내용

1. **3D Transform 기초**: perspective, rotateX/Y/Z 원리
2. **카드 플립**: 앞뒤면 전환과 backfaceVisibility
3. **3D 큐브**: 6면체 구성과 제스처 조작
4. **3D 캐러셀**: 원형 배치와 커버플로우 효과
5. **실전 적용**: 프로필 카드 플립 구현

**다음 장 예고**: **Chapter 36: 파티클 시스템**에서는 수백 개의 입자를 활용한 시각 효과를 다룹니다. 눈, 불꽃, 폭발 등 다양한 파티클 애니메이션을 구현합니다.
