# Chapter 31: 스크롤 스냅

스크롤 스냅은 특정 위치로 자동 정렬되어 사용자 경험을 향상시킵니다. 캐러셀, 페이지네이션, 피커 등 다양한 UI 패턴에 활용됩니다.

---

## 📌 학습 목표

- 기본 스냅 구현 (snapToInterval)
- 커스텀 스냅 포인트
- 자석 효과 (Magnetic Snap)
- 루프 캐러셀
- 피커 휠 스냅

---

## 📖 스크롤 스냅 개념

### 스냅 동작 원리

```
스크롤 종료 시점
        ↓
┌───────────────────────────┐
│   [카드1]   [카드2]   [카드3]   │
│        ↑                     │
│    현재 위치                  │
└───────────────────────────┘
        ↓
자동으로 가장 가까운 카드로 정렬
        ↓
┌───────────────────────────┐
│   [카드1]   [카드2]   [카드3]   │
│             ↑                │
│         스냅 완료             │
└───────────────────────────┘
```

### 스냅 유형

| 유형 | 설명 | 사용 사례 |
|-----|-----|----------|
| Interval | 고정 간격 | 동일 크기 카드 |
| Offsets | 커스텀 위치 | 다양한 크기 |
| Alignment | 정렬 기준 | 시작/중앙/끝 |
| Magnetic | 자석 효과 | 근접 시 끌림 |

---

## 💻 기본 스냅 캐러셀

### snapToInterval 사용

```tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CARD_WIDTH = SCREEN_WIDTH * 0.8;
const CARD_SPACING = 16;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;

const CARDS = [
  { id: '1', title: '첫 번째 카드', color: '#FF6B6B' },
  { id: '2', title: '두 번째 카드', color: '#4ECDC4' },
  { id: '3', title: '세 번째 카드', color: '#45B7D1' },
  { id: '4', title: '네 번째 카드', color: '#96CEB4' },
  { id: '5', title: '다섯 번째 카드', color: '#FFEAA7' },
];

export default function BasicSnapCarousel() {
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / SNAP_INTERVAL
          );
          setCurrentIndex(index);
        }}
      >
        {CARDS.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </Animated.ScrollView>

      {/* 페이지 인디케이터 */}
      <View style={styles.pagination}>
        {CARDS.map((_, index) => (
          <PaginationDot
            key={index}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </View>
    </View>
  );
}

function Card({
  card,
  index,
  scrollX,
}: {
  card: { id: string; title: string; color: string };
  index: number;
  scrollX: Animated.SharedValue<number>;
}) {
  const inputRange = [
    (index - 1) * SNAP_INTERVAL,
    index * SNAP_INTERVAL,
    (index + 1) * SNAP_INTERVAL,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.9, 1, 0.9],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: card.color },
        animatedStyle,
      ]}
    >
      <Text style={styles.cardTitle}>{card.title}</Text>
      <Text style={styles.cardIndex}>0{index + 1}</Text>
    </Animated.View>
  );
}

function PaginationDot({
  index,
  scrollX,
}: {
  index: number;
  scrollX: Animated.SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SNAP_INTERVAL,
      index * SNAP_INTERVAL,
      (index + 1) * SNAP_INTERVAL,
    ];

    const width = interpolate(
      scrollX.value,
      inputRange,
      [8, 24, 8],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolation.CLAMP
    );

    return {
      width,
      opacity,
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: 400,
    marginHorizontal: CARD_SPACING / 2,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'flex-end',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardIndex: {
    position: 'absolute',
    top: 24,
    right: 24,
    fontSize: 48,
    fontWeight: '200',
    color: 'rgba(255,255,255,0.3)',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});
```

---

## 💻 중앙 정렬 스냅

### 카드가 화면 중앙에 정렬

```tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CARD_WIDTH = 250;
const CARD_MARGIN = 10;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN * 2;
const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2 - CARD_MARGIN;

const ITEMS = Array.from({ length: 10 }, (_, i) => ({
  id: `${i}`,
  title: `Item ${i + 1}`,
  color: `hsl(${i * 36}, 70%, 60%)`,
}));

export default function CenterSnapCarousel() {
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: SIDE_PADDING },
        ]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {ITEMS.map((item, index) => (
          <CenterSnapCard
            key={item.id}
            item={item}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </Animated.ScrollView>

      {/* 중앙 표시선 (디버그용) */}
      <View style={styles.centerLine} pointerEvents="none" />
    </View>
  );
}

function CenterSnapCard({
  item,
  index,
  scrollX,
}: {
  item: { id: string; title: string; color: string };
  index: number;
  scrollX: Animated.SharedValue<number>;
}) {
  const inputRange = [
    (index - 1) * SNAP_INTERVAL,
    index * SNAP_INTERVAL,
    (index + 1) * SNAP_INTERVAL,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    // 3D 회전 효과
    const rotateY = interpolate(
      scrollX.value,
      inputRange,
      [30, 0, -30],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.85, 1, 0.85],
      Extrapolation.CLAMP
    );

    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [30, 0, -30],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
        { scale },
        { translateX },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: item.color },
        animatedStyle,
      ]}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  scrollContent: {
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: 350,
    marginHorizontal: CARD_MARGIN,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  centerLine: {
    position: 'absolute',
    left: SCREEN_WIDTH / 2 - 1,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,0,0,0.3)',
  },
});
```

---

## 💻 커스텀 스냅 포인트

### snapToOffsets 사용

```tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Section {
  id: string;
  title: string;
  height: number;
  color: string;
}

const SECTIONS: Section[] = [
  { id: '1', title: '히어로', height: 400, color: '#7A4AE2' },
  { id: '2', title: '소개', height: 300, color: '#4ECDC4' },
  { id: '3', title: '기능', height: 500, color: '#FF6B6B' },
  { id: '4', title: '가격', height: 350, color: '#45B7D1' },
  { id: '5', title: '문의', height: 400, color: '#96CEB4' },
];

export default function CustomSnapPoints() {
  const scrollY = useSharedValue(0);

  // 스냅 포인트 계산
  const snapOffsets = useMemo(() => {
    let offset = 0;
    return SECTIONS.map((section) => {
      const current = offset;
      offset += section.height;
      return current;
    });
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        snapToOffsets={snapOffsets}
        decelerationRate="fast"
      >
        {SECTIONS.map((section, index) => {
          const prevOffset = snapOffsets[index - 1] ?? 0;
          const currentOffset = snapOffsets[index];

          return (
            <SectionItem
              key={section.id}
              section={section}
              index={index}
              scrollY={scrollY}
              snapOffset={currentOffset}
            />
          );
        })}
      </Animated.ScrollView>

      {/* 섹션 네비게이션 */}
      <View style={styles.navigation}>
        {SECTIONS.map((section, index) => (
          <SectionIndicator
            key={section.id}
            index={index}
            scrollY={scrollY}
            snapOffsets={snapOffsets}
            sectionHeights={SECTIONS.map((s) => s.height)}
          />
        ))}
      </View>
    </View>
  );
}

function SectionItem({
  section,
  index,
  scrollY,
  snapOffset,
}: {
  section: Section;
  index: number;
  scrollY: Animated.SharedValue<number>;
  snapOffset: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      snapOffset - 100,
      snapOffset,
      snapOffset + section.height,
    ];

    const opacity = interpolate(
      scrollY.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );

    return { opacity };
  });

  return (
    <Animated.View
      style={[
        styles.section,
        { height: section.height, backgroundColor: section.color },
        animatedStyle,
      ]}
    >
      <Text style={styles.sectionNumber}>0{index + 1}</Text>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </Animated.View>
  );
}

function SectionIndicator({
  index,
  scrollY,
  snapOffsets,
  sectionHeights,
}: {
  index: number;
  scrollY: Animated.SharedValue<number>;
  snapOffsets: number[];
  sectionHeights: number[];
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const offset = snapOffsets[index];
    const height = sectionHeights[index];

    const isActive =
      scrollY.value >= offset - height * 0.3 &&
      scrollY.value < offset + height * 0.7;

    return {
      width: isActive ? 20 : 8,
      backgroundColor: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
    };
  });

  return <Animated.View style={[styles.indicator, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  section: {
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  sectionNumber: {
    fontSize: 80,
    fontWeight: '200',
    color: 'rgba(255,255,255,0.2)',
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: -20,
  },
  navigation: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -50 }],
    gap: 8,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
  },
});
```

---

## 💻 자석 스냅 효과

### 근접 시 자동으로 끌어당김

```tsx
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useAnimatedRef,
  scrollTo,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CARD_HEIGHT = 300;
const SNAP_THRESHOLD = 100; // 스냅 임계 거리

const CARDS = Array.from({ length: 5 }, (_, i) => ({
  id: `${i}`,
  title: `카드 ${i + 1}`,
  color: `hsl(${i * 60}, 70%, 60%)`,
}));

export default function MagneticSnap() {
  const scrollY = useSharedValue(0);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  const snapPoints = CARDS.map((_, i) => i * CARD_HEIGHT);

  // 가장 가까운 스냅 포인트 찾기
  const findNearestSnap = (y: number): number => {
    'worklet';
    let nearest = snapPoints[0];
    let minDistance = Math.abs(y - nearest);

    for (const point of snapPoints) {
      const distance = Math.abs(y - point);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    }

    return nearest;
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
    onEndDrag: (event) => {
      const y = event.contentOffset.y;
      const velocity = event.velocity?.y ?? 0;

      // 속도가 느리면 자석 효과 적용
      if (Math.abs(velocity) < 500) {
        const nearestSnap = findNearestSnap(y);
        const distance = Math.abs(y - nearestSnap);

        // 임계 거리 내에 있으면 스냅
        if (distance < SNAP_THRESHOLD) {
          scrollTo(scrollRef, 0, nearestSnap, true);
        }
      }
    },
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {CARDS.map((card, index) => (
          <MagneticCard
            key={card.id}
            card={card}
            index={index}
            scrollY={scrollY}
          />
        ))}
      </Animated.ScrollView>

      {/* 자석 인디케이터 */}
      <View style={styles.magnetIndicators}>
        {snapPoints.map((point, index) => (
          <MagnetIndicator
            key={index}
            snapPoint={point}
            scrollY={scrollY}
          />
        ))}
      </View>
    </View>
  );
}

function MagneticCard({
  card,
  index,
  scrollY,
}: {
  card: { id: string; title: string; color: string };
  index: number;
  scrollY: Animated.SharedValue<number>;
}) {
  const snapPoint = index * CARD_HEIGHT;

  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollY.value - snapPoint);
    const inRange = distance < SNAP_THRESHOLD;

    // 자석 범위 내에 있으면 약간 확대
    const scale = inRange
      ? 1 + (1 - distance / SNAP_THRESHOLD) * 0.05
      : 1;

    // 그림자 강도
    const shadowOpacity = inRange
      ? 0.3 * (1 - distance / SNAP_THRESHOLD)
      : 0.1;

    return {
      transform: [{ scale }],
      shadowOpacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: card.color },
        animatedStyle,
      ]}
    >
      <Text style={styles.cardTitle}>{card.title}</Text>
    </Animated.View>
  );
}

function MagnetIndicator({
  snapPoint,
  scrollY,
}: {
  snapPoint: number;
  scrollY: Animated.SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollY.value - snapPoint);
    const inRange = distance < SNAP_THRESHOLD;

    const scale = inRange
      ? 1 + (1 - distance / SNAP_THRESHOLD) * 0.5
      : 1;

    const backgroundColor = inRange
      ? `rgba(122, 74, 226, ${1 - distance / SNAP_THRESHOLD})`
      : 'rgba(122, 74, 226, 0.3)';

    return {
      transform: [{ scale }],
      backgroundColor,
    };
  });

  return <Animated.View style={[styles.magnetDot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingVertical: SCREEN_HEIGHT / 3,
    paddingHorizontal: 20,
  },
  card: {
    height: CARD_HEIGHT - 20,
    marginBottom: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  magnetIndicators: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -50 }],
    gap: 12,
  },
  magnetDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
```

---

## 💻 피커 휠 스냅

### iOS 피커 스타일 스냅

```tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

export default function PickerWheelSnap() {
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>시간 선택</Text>

      <View style={styles.pickerContainer}>
        {/* 선택 하이라이트 */}
        <View style={styles.selectionHighlight} />

        {/* 시간 피커 */}
        <WheelPicker
          items={HOURS}
          selectedValue={selectedHour}
          onValueChange={setSelectedHour}
          formatItem={(v) => v.toString().padStart(2, '0')}
        />

        <Text style={styles.separator}>:</Text>

        {/* 분 피커 */}
        <WheelPicker
          items={MINUTES}
          selectedValue={selectedMinute}
          onValueChange={setSelectedMinute}
          formatItem={(v) => v.toString().padStart(2, '0')}
        />
      </View>

      <Text style={styles.selected}>
        {selectedHour.toString().padStart(2, '0')}:
        {selectedMinute.toString().padStart(2, '0')}
      </Text>
    </View>
  );
}

function WheelPicker({
  items,
  selectedValue,
  onValueChange,
  formatItem,
}: {
  items: number[];
  selectedValue: number;
  onValueChange: (value: number) => void;
  formatItem: (value: number) => string;
}) {
  const scrollY = useSharedValue(selectedValue * ITEM_HEIGHT);

  const updateValue = (index: number) => {
    onValueChange(items[index]);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
    onMomentumEnd: (event) => {
      const index = Math.round(event.contentOffset.y / ITEM_HEIGHT);
      runOnJS(updateValue)(Math.max(0, Math.min(index, items.length - 1)));
    },
  });

  return (
    <View style={styles.wheelContainer}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * 2,
        }}
      >
        {items.map((item, index) => (
          <WheelItem
            key={item}
            value={item}
            index={index}
            scrollY={scrollY}
            formatItem={formatItem}
          />
        ))}
      </Animated.ScrollView>

      {/* 페이드 그라데이션 */}
      <View style={styles.fadeTop} pointerEvents="none" />
      <View style={styles.fadeBottom} pointerEvents="none" />
    </View>
  );
}

function WheelItem({
  value,
  index,
  scrollY,
  formatItem,
}: {
  value: number;
  index: number;
  scrollY: Animated.SharedValue<number>;
  formatItem: (value: number) => string;
}) {
  const inputRange = [
    (index - 2) * ITEM_HEIGHT,
    (index - 1) * ITEM_HEIGHT,
    index * ITEM_HEIGHT,
    (index + 1) * ITEM_HEIGHT,
    (index + 2) * ITEM_HEIGHT,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const rotateX = interpolate(
      scrollY.value,
      inputRange,
      [60, 30, 0, -30, -60],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      inputRange,
      [0.6, 0.8, 1, 0.8, 0.6],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      inputRange,
      [0.3, 0.6, 1, 0.6, 0.3],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      inputRange,
      [-10, -5, 0, 5, 10],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { perspective: 500 },
        { rotateX: `${rotateX}deg` },
        { scale },
        { translateY },
      ],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.wheelItem, animatedStyle]}>
      <Text style={styles.wheelItemText}>{formatItem(value)}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: PICKER_HEIGHT,
  },
  selectionHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(122, 74, 226, 0.3)',
    borderRadius: 8,
  },
  wheelContainer: {
    width: 80,
    height: PICKER_HEIGHT,
    overflow: 'hidden',
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  separator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 8,
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    backgroundColor: 'rgba(26,26,26,0.7)',
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    backgroundColor: 'rgba(26,26,26,0.7)',
  },
  selected: {
    marginTop: 40,
    fontSize: 48,
    fontWeight: '200',
    color: '#7A4AE2',
  },
});
```

---

## 💻 루프 캐러셀

### 무한 스크롤 캐러셀

```tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  runOnJS,
  useAnimatedRef,
  scrollTo,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CARD_WIDTH = SCREEN_WIDTH * 0.7;
const CARD_SPACING = 16;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;

const ORIGINAL_CARDS = [
  { id: '1', title: '카드 1', color: '#FF6B6B' },
  { id: '2', title: '카드 2', color: '#4ECDC4' },
  { id: '3', title: '카드 3', color: '#45B7D1' },
];

// 루프를 위해 카드 복제
const CARDS = [
  ...ORIGINAL_CARDS, // 원본
  ...ORIGINAL_CARDS, // 복사본 (앞)
  ...ORIGINAL_CARDS, // 복사본 (뒤)
];

const LOOP_OFFSET = ORIGINAL_CARDS.length * SNAP_INTERVAL;

export default function LoopCarousel() {
  const scrollX = useSharedValue(LOOP_OFFSET);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const isAdjusting = useRef(false);

  // 초기 위치 설정
  useEffect(() => {
    setTimeout(() => {
      scrollTo(scrollRef, LOOP_OFFSET, 0, false);
    }, 100);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      const x = event.contentOffset.x;

      // 끝에 도달하면 중앙으로 점프
      if (x <= SNAP_INTERVAL / 2) {
        runOnJS(adjustScroll)(x + LOOP_OFFSET);
      } else if (x >= LOOP_OFFSET * 2 - SNAP_INTERVAL / 2) {
        runOnJS(adjustScroll)(x - LOOP_OFFSET);
      }
    },
  });

  const adjustScroll = (newX: number) => {
    if (isAdjusting.current) return;
    isAdjusting.current = true;

    scrollTo(scrollRef, newX, 0, false);

    setTimeout(() => {
      isAdjusting.current = false;
    }, 50);
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 },
        ]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {CARDS.map((card, index) => (
          <LoopCard
            key={`${card.id}-${index}`}
            card={card}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

function LoopCard({
  card,
  index,
  scrollX,
}: {
  card: { id: string; title: string; color: string };
  index: number;
  scrollX: Animated.SharedValue<number>;
}) {
  const inputRange = [
    (index - 1) * SNAP_INTERVAL,
    index * SNAP_INTERVAL,
    (index + 1) * SNAP_INTERVAL,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.85, 1, 0.85],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: card.color },
        animatedStyle,
      ]}
    >
      <Text style={styles.cardTitle}>{card.title}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
  },
  scrollContent: {
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: 350,
    marginHorizontal: CARD_SPACING / 2,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
});
```

---

## 📊 스냅 방식 비교

| 방식 | 장점 | 단점 | 사용 사례 |
|-----|-----|-----|----------|
| snapToInterval | 간단함 | 고정 크기만 | 카드 캐러셀 |
| snapToOffsets | 유연함 | 계산 필요 | 섹션 네비게이션 |
| 수동 스냅 | 완전 제어 | 복잡함 | 자석 효과 |
| 피커 스냅 | 3D 효과 | 특정 용도 | 시간/날짜 선택 |

---

## ⚠️ 흔한 실수와 해결법

### 1. 스냅 간격 계산 오류

```tsx
// ❌ 마진 미포함
const SNAP_INTERVAL = CARD_WIDTH;

// ✅ 카드 너비 + 간격
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;
```

### 2. 패딩 계산 오류

```tsx
// ❌ 첫 카드가 중앙에 안 옴
paddingHorizontal: 20;

// ✅ 화면 중앙 정렬
paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 - CARD_SPACING / 2;
```

### 3. decelerationRate 누락

```tsx
// ❌ 너무 미끄러짐
<ScrollView snapToInterval={100} />

// ✅ 빠른 감속
<ScrollView
  snapToInterval={100}
  decelerationRate="fast"
/>
```

---

## 💡 성능 최적화 팁

### 렌더링 최적화

```tsx
// 화면에 보이는 카드만 렌더링
const visibleRange = useDerivedValue(() => {
  const start = Math.floor(scrollX.value / SNAP_INTERVAL) - 1;
  const end = start + 4;
  return { start: Math.max(0, start), end: Math.min(CARDS.length, end) };
});
```

### 메모이제이션

```tsx
// 스냅 오프셋 캐싱
const snapOffsets = useMemo(() =>
  ITEMS.map((_, i) => i * ITEM_HEIGHT),
  [ITEMS.length]
);
```

---

## 🎯 실무 적용: sometimes-app 온보딩

```tsx
// src/features/onboarding/ui/onboarding-carousel.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PAGES = [
  { title: '환영합니다', description: '새로운 인연을 만나보세요' },
  { title: '매칭', description: '매일 새로운 추천을 받아요' },
  { title: '시작하기', description: '지금 바로 시작해볼까요?' },
];

export function OnboardingCarousel() {
  const scrollX = useSharedValue(0);
  const [currentPage, setCurrentPage] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          setCurrentPage(
            Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH)
          );
        }}
      >
        {PAGES.map((page, index) => (
          <OnboardingPage
            key={index}
            page={page}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </Animated.ScrollView>

      <PageIndicator
        count={PAGES.length}
        currentPage={currentPage}
        scrollX={scrollX}
      />
    </View>
  );
}
```

---

## 🏋️ 연습 문제

### 문제 1: 날짜 피커
연도, 월, 일을 선택할 수 있는 3열 피커를 구현하세요.

**요구사항**:
- 3D 휠 효과
- 월에 따라 일수 동적 변경
- 선택 완료 버튼

### 문제 2: 이미지 갤러리
확대/축소가 되는 이미지 갤러리를 구현하세요.

**요구사항**:
- 중앙 스냅
- 선택 이미지 확대
- 좌우 이미지 미리보기

### 문제 3: 스토리 뷰어
Instagram 스토리 스타일 뷰어를 구현하세요.

**요구사항**:
- 전체 화면 스냅
- 진행률 바
- 좌우 탭 네비게이션

---

## 📚 이 장에서 배운 내용

1. **기본 스냅**: snapToInterval + decelerationRate
2. **중앙 정렬**: 패딩 계산으로 정확한 정렬
3. **커스텀 스냅**: snapToOffsets로 다양한 크기
4. **자석 효과**: 임계 거리 내에서 자동 스냅
5. **피커 휠**: 3D 회전으로 iOS 스타일
6. **루프**: 카드 복제로 무한 스크롤

---

## 다음 장 예고

**Chapter 32: 실전 - 인스타그램 스토리**에서는 지금까지 배운 모든 스크롤 기법을 종합합니다.

- 스토리 캐러셀
- 진행률 바
- 자동 재생
- 제스처 제어

완전한 스토리 뷰어를 구현합니다.
