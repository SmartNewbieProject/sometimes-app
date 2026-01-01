# Chapter 25: 스크롤 이벤트 기초

스크롤은 모바일 앱에서 가장 빈번한 사용자 인터랙션입니다. Reanimated를 사용하면 60fps 스크롤 연동 애니메이션을 쉽게 구현할 수 있습니다.

---

## 📌 학습 목표

- useAnimatedScrollHandler 이해
- 스크롤 이벤트 타입 (onScroll, onBeginDrag, onEndDrag)
- scrollTo를 사용한 프로그래매틱 스크롤
- FlatList/ScrollView와 Reanimated 통합
- 스크롤 위치 기반 조건부 렌더링

---

## 📖 스크롤 이벤트의 이해

### 일반 스크롤 vs 애니메이션 스크롤

```
일반 방식 (JS 스레드)
┌──────────┐     ┌──────────┐     ┌──────────┐
│ onScroll │ ──> │ setState │ ──> │ 리렌더링  │
└──────────┘     └──────────┘     └──────────┘
      │                                │
      └── 매 프레임 JS 브릿지 ──────────┘
           (성능 저하 원인)

Reanimated 방식 (UI 스레드)
┌──────────────────────┐     ┌──────────────┐
│ useAnimatedScrollHandler │ ──> │ SharedValue │
└──────────────────────┘     └──────────────┘
           │                        │
           └── UI 스레드에서 직접 처리 ─┘
               (60fps 보장)
```

### 스크롤 이벤트 타입

| 이벤트 | 발생 시점 | 용도 |
|-------|----------|-----|
| `onScroll` | 스크롤 중 | 위치 추적 |
| `onBeginDrag` | 드래그 시작 | 상태 변경 |
| `onEndDrag` | 드래그 종료 | 스냅/관성 |
| `onMomentumBegin` | 관성 시작 | 관성 추적 |
| `onMomentumEnd` | 관성 종료 | 정지 감지 |

---

## 💻 기본 스크롤 핸들러

### useAnimatedScrollHandler 사용법

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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function BasicScrollHandler() {
  const scrollY = useSharedValue(0);

  // 스크롤 핸들러 정의
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // 스크롤 진행률 표시
  const progressStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [0, 1000],
      [0, 100],
      Extrapolation.CLAMP
    );

    return {
      width: `${progress}%`,
    };
  });

  return (
    <View style={styles.container}>
      {/* 진행률 바 */}
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, progressStyle]} />
      </View>

      {/* 스크롤 가능한 콘텐츠 */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {Array.from({ length: 50 }).map((_, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.itemText}>Item {index + 1}</Text>
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#eee',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#7A4AE2',
  },
  scrollContent: {
    padding: 16,
  },
  item: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
  },
});
```

---

## 💻 스크롤 방향 감지

### 상향/하향 스크롤 구분

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

type ScrollDirection = 'up' | 'down' | 'none';

export default function ScrollDirectionDetector() {
  const scrollY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);
  const direction = useSharedValue<ScrollDirection>('none');
  const headerVisible = useSharedValue(1);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      const diff = currentY - lastScrollY.value;

      // 최소 이동 거리 (노이즈 필터링)
      if (Math.abs(diff) > 5) {
        if (diff > 0 && currentY > 50) {
          // 아래로 스크롤 (헤더 숨김)
          direction.value = 'down';
          headerVisible.value = withTiming(0, { duration: 200 });
        } else if (diff < 0) {
          // 위로 스크롤 (헤더 표시)
          direction.value = 'up';
          headerVisible.value = withTiming(1, { duration: 200 });
        }
      }

      lastScrollY.value = currentY;
      scrollY.value = currentY;
    },
    onBeginDrag: () => {
      // 드래그 시작 시 현재 위치 저장
      lastScrollY.value = scrollY.value;
    },
  });

  // 헤더 애니메이션
  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(headerVisible.value, [0, 1], [-60, 0]) },
    ],
    opacity: headerVisible.value,
  }));

  return (
    <View style={styles.container}>
      {/* 숨겨지는 헤더 */}
      <Animated.View style={[styles.header, headerStyle]}>
        <Text style={styles.headerText}>스크롤 방향 감지</Text>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {Array.from({ length: 30 }).map((_, index) => (
          <View key={index} style={styles.item}>
            <Text>아이템 {index + 1}</Text>
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#7A4AE2',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingTop: 70,
    padding: 16,
  },
  item: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    borderRadius: 8,
  },
});
```

---

## 💻 드래그 상태 추적

### onBeginDrag, onEndDrag 활용

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

export default function DragStateTracker() {
  const isDragging = useSharedValue(false);
  const scrollY = useSharedValue(0);
  const indicatorScale = useSharedValue(1);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
    onBeginDrag: () => {
      isDragging.value = true;
      indicatorScale.value = withSpring(1.2);
    },
    onEndDrag: () => {
      isDragging.value = false;
      indicatorScale.value = withSpring(1);
    },
    onMomentumBegin: () => {
      // 관성 스크롤 시작
      indicatorScale.value = withSpring(0.8);
    },
    onMomentumEnd: () => {
      // 스크롤 완전 정지
      indicatorScale.value = withSpring(1);
    },
  });

  // 스크롤 인디케이터
  const indicatorStyle = useAnimatedStyle(() => {
    const containerHeight = 500; // 스크롤 영역 높이
    const contentHeight = 1500; // 콘텐츠 높이
    const scrollRange = contentHeight - containerHeight;

    const indicatorY = (scrollY.value / scrollRange) * (containerHeight - 50);

    return {
      transform: [
        { translateY: Math.max(0, Math.min(indicatorY, containerHeight - 50)) },
        { scale: indicatorScale.value },
      ],
      backgroundColor: isDragging.value ? '#7A4AE2' : '#ccc',
    };
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {Array.from({ length: 30 }).map((_, index) => (
          <View key={index} style={styles.item}>
            <Text>아이템 {index + 1}</Text>
          </View>
        ))}
      </Animated.ScrollView>

      {/* 커스텀 스크롤 인디케이터 */}
      <View style={styles.indicatorTrack}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  item: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    borderRadius: 8,
  },
  indicatorTrack: {
    width: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 4,
  },
  indicator: {
    width: 8,
    height: 50,
    borderRadius: 4,
  },
});
```

---

## 💻 프로그래매틱 스크롤

### scrollTo로 원하는 위치로 이동

```tsx
import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedRef,
  scrollTo,
  runOnUI,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export default function ProgrammaticScroll() {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // 맨 위로 스크롤
  const scrollToTop = () => {
    runOnUI(() => {
      scrollTo(scrollRef, 0, 0, true);
    })();
  };

  // 맨 아래로 스크롤
  const scrollToBottom = () => {
    runOnUI(() => {
      scrollTo(scrollRef, 0, 2000, true); // 콘텐츠 높이
    })();
  };

  // 특정 위치로 스크롤
  const scrollToPosition = (y: number) => {
    runOnUI(() => {
      scrollTo(scrollRef, 0, y, true);
    })();
  };

  // 섹션으로 스크롤 (아이템 높이 기반)
  const scrollToSection = (sectionIndex: number) => {
    const itemHeight = 60; // 아이템 높이 + 마진
    const targetY = sectionIndex * itemHeight * 10; // 섹션당 10개 아이템

    runOnUI(() => {
      scrollTo(scrollRef, 0, targetY, true);
    })();
  };

  return (
    <View style={styles.container}>
      {/* 네비게이션 버튼 */}
      <View style={styles.navigation}>
        <Pressable style={styles.navButton} onPress={scrollToTop}>
          <Text style={styles.navButtonText}>⬆ Top</Text>
        </Pressable>

        <Pressable
          style={styles.navButton}
          onPress={() => scrollToSection(1)}
        >
          <Text style={styles.navButtonText}>Section 2</Text>
        </Pressable>

        <Pressable
          style={styles.navButton}
          onPress={() => scrollToSection(2)}
        >
          <Text style={styles.navButtonText}>Section 3</Text>
        </Pressable>

        <Pressable style={styles.navButton} onPress={scrollToBottom}>
          <Text style={styles.navButtonText}>⬇ Bottom</Text>
        </Pressable>
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {[1, 2, 3].map((section) => (
          <View key={section}>
            <Text style={styles.sectionTitle}>Section {section}</Text>
            {Array.from({ length: 10 }).map((_, index) => (
              <View key={index} style={styles.item}>
                <Text>
                  {section}-{index + 1}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navigation: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
    backgroundColor: '#f0f0f0',
  },
  navButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#7A4AE2',
    borderRadius: 8,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  item: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    borderRadius: 8,
  },
});
```

---

## 💻 FlatList와 Reanimated

### Animated.FlatList 사용법

```tsx
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ItemData {
  id: string;
  title: string;
  color: string;
}

const DATA: ItemData[] = Array.from({ length: 50 }, (_, i) => ({
  id: `item-${i}`,
  title: `Item ${i + 1}`,
  color: `hsl(${(i * 7) % 360}, 70%, 80%)`,
}));

const ITEM_HEIGHT = 80;

export default function AnimatedFlatListExample() {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const renderItem = useCallback(
    ({ item, index }: { item: ItemData; index: number }) => (
      <AnimatedListItem
        item={item}
        index={index}
        scrollY={scrollY}
      />
    ),
    []
  );

  const keyExtractor = useCallback((item: ItemData) => item.id, []);

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContent}
        // 성능 최적화
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
}

// 개별 아이템 애니메이션
function AnimatedListItem({
  item,
  index,
  scrollY,
}: {
  item: ItemData;
  index: number;
  scrollY: Animated.SharedValue<number>;
}) {
  const inputRange = [
    (index - 2) * ITEM_HEIGHT,
    (index - 1) * ITEM_HEIGHT,
    index * ITEM_HEIGHT,
    (index + 1) * ITEM_HEIGHT,
    (index + 2) * ITEM_HEIGHT,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      inputRange,
      [0.9, 0.95, 1, 0.95, 0.9],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      inputRange,
      [0.5, 0.75, 1, 0.75, 0.5],
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
        styles.item,
        { backgroundColor: item.color },
        animatedStyle,
      ]}
    >
      <Text style={styles.itemTitle}>{item.title}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
  },
  item: {
    height: ITEM_HEIGHT - 8,
    marginBottom: 8,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});
```

---

## 💻 수평 스크롤 처리

### 수평 스크롤 이벤트

```tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.8;
const CARD_SPACING = 16;

const CARDS = [
  { id: '1', title: '카드 1', color: '#FFE5E5' },
  { id: '2', title: '카드 2', color: '#E5FFE5' },
  { id: '3', title: '카드 3', color: '#E5E5FF' },
  { id: '4', title: '카드 4', color: '#FFFFE5' },
  { id: '5', title: '카드 5', color: '#FFE5FF' },
];

export default function HorizontalScrollCards() {
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  // 페이지 인디케이터
  const indicatorStyle = useAnimatedStyle(() => {
    const currentPage = scrollX.value / (CARD_WIDTH + CARD_SPACING);

    return {
      transform: [{ translateX: currentPage * 16 }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {CARDS.map((card, index) => (
          <CardItem
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
          <View key={index} style={styles.dot} />
        ))}
        <Animated.View style={[styles.activeDot, indicatorStyle]} />
      </View>
    </View>
  );
}

function CardItem({
  card,
  index,
  scrollX,
}: {
  card: { id: string; title: string; color: string };
  index: number;
  scrollX: Animated.SharedValue<number>;
}) {
  const inputRange = [
    (index - 1) * (CARD_WIDTH + CARD_SPACING),
    index * (CARD_WIDTH + CARD_SPACING),
    (index + 1) * (CARD_WIDTH + CARD_SPACING),
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.9, 1, 0.9]
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5]
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
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: 200,
    marginHorizontal: CARD_SPACING / 2,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    position: 'relative',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  activeDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7A4AE2',
    left: 4,
  },
});
```

---

## 📊 스크롤 이벤트 비교

| 방식 | 스레드 | 성능 | 용도 |
|-----|-------|-----|-----|
| onScroll + setState | JS | 낮음 | 단순 상태 업데이트 |
| useAnimatedScrollHandler | UI | 높음 | 실시간 애니메이션 |
| scrollEventThrottle=1 | JS | 매우 낮음 | 피해야 함 |
| scrollEventThrottle=16 | JS/UI | 적절 | 일반적 사용 |

---

## ⚠️ 흔한 실수와 해결법

### 1. scrollEventThrottle 누락

```tsx
// ❌ 누락 시 이벤트가 드문드문 발생
<Animated.ScrollView onScroll={scrollHandler}>

// ✅ 16ms (60fps) 간격으로 이벤트 발생
<Animated.ScrollView
  onScroll={scrollHandler}
  scrollEventThrottle={16}
>
```

### 2. 잘못된 SharedValue 사용

```tsx
// ❌ useState 사용 (JS 스레드)
const [scrollY, setScrollY] = useState(0);
const scrollHandler = useAnimatedScrollHandler({
  onScroll: (event) => {
    setScrollY(event.contentOffset.y); // 성능 저하!
  },
});

// ✅ useSharedValue 사용 (UI 스레드)
const scrollY = useSharedValue(0);
const scrollHandler = useAnimatedScrollHandler({
  onScroll: (event) => {
    scrollY.value = event.contentOffset.y;
  },
});
```

### 3. Animated.ScrollView 미사용

```tsx
// ❌ 일반 ScrollView
import { ScrollView } from 'react-native';
<ScrollView onScroll={scrollHandler} />

// ✅ Animated.ScrollView
import Animated from 'react-native-reanimated';
<Animated.ScrollView onScroll={scrollHandler} />
```

---

## 💡 성능 최적화 팁

### FlatList 최적화

```tsx
<Animated.FlatList
  // 필수 최적화 props
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={10}

  // 스크롤 성능
  scrollEventThrottle={16}

  // 아이템 크기 고정 시
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}

  // 메모이제이션
  keyExtractor={useCallback((item) => item.id, [])}
  renderItem={useCallback(({ item }) => <Item item={item} />, [])}
/>
```

### 스크롤 핸들러 최적화

```tsx
const scrollHandler = useAnimatedScrollHandler({
  onScroll: (event) => {
    // 불필요한 계산 피하기
    const y = event.contentOffset.y;

    // 조건부 업데이트
    if (Math.abs(y - scrollY.value) > 1) {
      scrollY.value = y;
    }
  },
});
```

---

## 🎯 실무 적용: sometimes-app 무한 스크롤

### 매칭 카드 목록

```tsx
// src/features/matching-history/ui/matching-list.tsx
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useInfiniteQuery } from '@tanstack/react-query';

export function MatchingList() {
  const scrollY = useSharedValue(0);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['matching-history'],
      queryFn: ({ pageParam = 0 }) => fetchMatches(pageParam),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allMatches = data?.pages.flatMap((page) => page.matches) ?? [];

  return (
    <Animated.FlatList
      data={allMatches}
      renderItem={({ item, index }) => (
        <MatchingCard
          match={item}
          index={index}
          scrollY={scrollY}
        />
      )}
      keyExtractor={(item) => item.id}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
});
```

---

## 🏋️ 연습 문제

### 문제 1: 스크롤 위치 저장/복원
스크롤 위치를 AsyncStorage에 저장하고, 앱 재시작 시 복원하는 기능을 구현하세요.

**힌트**: onMomentumEnd에서 저장, useEffect에서 복원

### 문제 2: 무한 스크롤 로딩 인디케이터
스크롤이 하단에 도달하면 로딩 인디케이터가 나타나는 기능을 구현하세요.

**요구사항**:
- 하단 100px 내에서 로딩 표시
- 스프링 애니메이션으로 등장
- 로딩 완료 시 사라짐

### 문제 3: 양방향 스크롤 감지
수평, 수직 스크롤을 동시에 감지하고 각각 다른 UI에 반영하세요.

**요구사항**:
- 수평 스크롤: 헤더 색상 변경
- 수직 스크롤: 사이드바 표시/숨김

---

## 📚 이 장에서 배운 내용

1. **useAnimatedScrollHandler**: UI 스레드에서 스크롤 처리
2. **이벤트 타입**: onScroll, onBeginDrag, onEndDrag, onMomentum
3. **스크롤 방향**: lastScrollY와 비교로 감지
4. **프로그래매틱 스크롤**: scrollTo + useAnimatedRef
5. **FlatList 통합**: Animated.FlatList 사용
6. **수평 스크롤**: contentOffset.x 활용
7. **성능 최적화**: scrollEventThrottle, 메모이제이션

---

## 다음 장 예고

**Chapter 26: 스크롤 연동 헤더**에서는 스크롤에 반응하는 헤더를 구현합니다.

- 축소/확대 헤더
- Sticky 헤더
- 투명도 변화 헤더
- 검색창 등장 효과

스크롤 위치에 따라 동적으로 변하는 헤더를 만들어봅니다.
