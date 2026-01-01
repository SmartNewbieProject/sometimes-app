# Chapter 30: 무한 스크롤 최적화

대용량 리스트에서도 60fps를 유지하려면 철저한 최적화가 필요합니다. FlatList, FlashList와 Reanimated를 조합한 고성능 무한 스크롤을 구현합니다.

---

## 📌 학습 목표

- FlatList vs FlashList 성능 비교
- 아이템 애니메이션 최적화 전략
- 스켈레톤 로딩 구현
- 메모리 관리와 가상화
- 페이지네이션 패턴

---

## 📖 무한 스크롤 아키텍처

### 가상화 리스트의 원리

```
화면 밖 (렌더링 안함)
┌─────────────────────┐
│     Buffer Zone     │ ← removeClippedSubviews
├─────────────────────┤
│   ▲ 렌더링 영역     │
│   │                 │
│   │  [보이는 항목]   │ ← 실제 화면
│   │                 │
│   ▼                 │
├─────────────────────┤
│     Buffer Zone     │
└─────────────────────┘
화면 밖 (렌더링 안함)
```

### 최적화 레벨

| 레벨 | 기법 | 효과 |
|-----|-----|-----|
| L1 | 메모이제이션 | 리렌더 방지 |
| L2 | getItemLayout | 측정 비용 제거 |
| L3 | windowSize | 렌더 범위 조절 |
| L4 | FlashList | 재사용 풀 |
| L5 | Worklet 애니메이션 | UI 스레드 |

---

## 💻 기본 무한 스크롤

### FlatList 기반 구현

```tsx
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';

interface Item {
  id: string;
  title: string;
  subtitle: string;
}

const ITEM_HEIGHT = 80;
const PAGE_SIZE = 20;

// 데이터 생성 함수
const generateItems = (page: number): Item[] =>
  Array.from({ length: PAGE_SIZE }, (_, i) => ({
    id: `${page}-${i}`,
    title: `아이템 ${page * PAGE_SIZE + i + 1}`,
    subtitle: `페이지 ${page + 1}의 항목입니다`,
  }));

export default function BasicInfiniteScroll() {
  const [items, setItems] = useState<Item[]>(() => generateItems(0));
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // 더 불러오기
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    // API 호출 시뮬레이션
    await new Promise((r) => setTimeout(r, 1000));

    const nextPage = page + 1;
    const newItems = generateItems(nextPage);

    if (nextPage >= 5) {
      // 5페이지 후 종료
      setHasMore(false);
    }

    setItems((prev) => [...prev, ...newItems]);
    setPage(nextPage);
    setLoading(false);
  }, [loading, hasMore, page]);

  // 아이템 렌더러 (메모이제이션)
  const renderItem = useCallback(
    ({ item, index }: { item: Item; index: number }) => (
      <AnimatedListItem item={item} index={index} scrollY={scrollY} />
    ),
    []
  );

  // 키 추출 (메모이제이션)
  const keyExtractor = useCallback((item: Item) => item.id, []);

  // 아이템 레이아웃 (측정 건너뛰기)
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  // 푸터 컴포넌트
  const ListFooter = useMemo(
    () =>
      loading ? (
        <View style={styles.footer}>
          <ActivityIndicator color="#7A4AE2" />
          <Text style={styles.footerText}>불러오는 중...</Text>
        </View>
      ) : !hasMore ? (
        <View style={styles.footer}>
          <Text style={styles.footerText}>모든 항목을 불러왔습니다</Text>
        </View>
      ) : null,
    [loading, hasMore]
  );

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={ListFooter}
        // 성능 최적화 props
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
        updateCellsBatchingPeriod={50}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

// 애니메이션 아이템
const AnimatedListItem = React.memo(
  ({
    item,
    index,
    scrollY,
  }: {
    item: Item;
    index: number;
    scrollY: Animated.SharedValue<number>;
  }) => {
    return (
      <Animated.View
        entering={FadeIn.delay(index % 10 * 50).duration(300)}
        style={styles.item}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{index + 1}</Text>
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
        </View>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
  },
  item: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7A4AE2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
    color: '#666',
  },
});
```

---

## 💻 FlashList 최적화

### 고성능 리스트 라이브러리

```tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  FadeInUp,
} from 'react-native-reanimated';

interface Item {
  id: string;
  title: string;
  type: 'normal' | 'featured';
}

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

export default function FlashListOptimized() {
  const [items, setItems] = useState<Item[]>(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: `${i}`,
      title: `아이템 ${i + 1}`,
      type: i % 5 === 0 ? 'featured' : 'normal',
    }))
  );
  const [loading, setLoading] = useState(false);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    await new Promise((r) => setTimeout(r, 800));

    setItems((prev) => [
      ...prev,
      ...Array.from({ length: 20 }, (_, i) => ({
        id: `${prev.length + i}`,
        title: `아이템 ${prev.length + i + 1}`,
        type: (prev.length + i) % 5 === 0 ? 'featured' : ('normal' as const),
      })),
    ]);

    setLoading(false);
  }, [loading]);

  const renderItem = useCallback(
    ({ item, index }: { item: Item; index: number }) => {
      if (item.type === 'featured') {
        return <FeaturedItem item={item} index={index} />;
      }
      return <NormalItem item={item} index={index} />;
    },
    []
  );

  return (
    <View style={styles.container}>
      <AnimatedFlashList
        data={items}
        renderItem={renderItem}
        estimatedItemSize={80} // FlashList 필수
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <View style={styles.footer}>
              <ActivityIndicator color="#7A4AE2" />
            </View>
          ) : null
        }
        // FlashList 특화 최적화
        drawDistance={250}
        overrideItemLayout={(layout, item: Item) => {
          layout.size = item.type === 'featured' ? 160 : 80;
        }}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

// 일반 아이템
const NormalItem = React.memo(
  ({ item, index }: { item: Item; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index % 5 * 30).duration(200)}
      style={styles.normalItem}
    >
      <View style={styles.itemIcon} />
      <Text style={styles.itemTitle}>{item.title}</Text>
    </Animated.View>
  )
);

// 특성 아이템
const FeaturedItem = React.memo(
  ({ item, index }: { item: Item; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index % 5 * 30).duration(200)}
      style={styles.featuredItem}
    >
      <View style={styles.featuredImage} />
      <Text style={styles.featuredTitle}>{item.title}</Text>
      <Text style={styles.featuredLabel}>추천</Text>
    </Animated.View>
  )
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
  },
  normalItem: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  featuredItem: {
    height: 152,
    backgroundColor: '#7A4AE2',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    justifyContent: 'flex-end',
  },
  featuredImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 16,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  featuredLabel: {
    marginTop: 4,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
});
```

---

## 💻 스켈레톤 로딩

### 콘텐츠 로딩 중 플레이스홀더

```tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Item {
  id: string;
  title: string;
  description: string;
}

export default function SkeletonLoading() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 데이터 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setItems(
        Array.from({ length: 10 }, (_, i) => ({
          id: `${i}`,
          title: `아이템 ${i + 1}`,
          description: '상세 설명이 여기에 표시됩니다.',
        }))
      );
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonItem key={index} index={index} />
        ))}
      </View>
    );
  }

  return (
    <Animated.ScrollView
      entering={FadeIn.duration(300)}
      style={styles.container}
      contentContainerStyle={styles.listContent}
    >
      {items.map((item, index) => (
        <Animated.View
          key={item.id}
          entering={FadeIn.delay(index * 50).duration(300)}
          style={styles.item}
        >
          <View style={styles.avatar} />
          <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </Animated.View>
      ))}
    </Animated.ScrollView>
  );
}

// 스켈레톤 아이템
function SkeletonItem({ index }: { index: number }) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withDelay(
      index * 100,
      withRepeat(withTiming(1, { duration: 1000 }), -1, true)
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-SCREEN_WIDTH, SCREEN_WIDTH]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={styles.skeletonItem}>
      {/* 아바타 스켈레톤 */}
      <View style={styles.skeletonAvatar}>
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      </View>

      {/* 콘텐츠 스켈레톤 */}
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTitle}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        <View style={styles.skeletonDesc}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
      </View>
    </View>
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
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7A4AE2',
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  // 스켈레톤 스타일
  skeletonItem: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
  },
  skeletonAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
    overflow: 'hidden',
  },
  skeletonContent: {
    flex: 1,
    justifyContent: 'center',
  },
  skeletonTitle: {
    width: '60%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  skeletonDesc: {
    width: '90%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginTop: 8,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.5)',
    width: SCREEN_WIDTH,
  },
});
```

---

## 💻 스크롤 위치 기반 아이템 애니메이션

### 화면 중앙 아이템 강조

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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ITEM_HEIGHT = 100;
const VISIBLE_ITEMS = Math.ceil(SCREEN_HEIGHT / ITEM_HEIGHT);

interface Item {
  id: string;
  title: string;
  color: string;
}

const ITEMS: Item[] = Array.from({ length: 50 }, (_, i) => ({
  id: `${i}`,
  title: `아이템 ${i + 1}`,
  color: `hsl(${(i * 15) % 360}, 70%, 80%)`,
}));

export default function ScrollPositionAnimation() {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const renderItem = useCallback(
    ({ item, index }: { item: Item; index: number }) => (
      <AnimatedItem
        item={item}
        index={index}
        scrollY={scrollY}
      />
    ),
    []
  );

  const keyExtractor = useCallback((item: Item) => item.id, []);

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={ITEMS}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const AnimatedItem = React.memo(
  ({
    item,
    index,
    scrollY,
  }: {
    item: Item;
    index: number;
    scrollY: Animated.SharedValue<number>;
  }) => {
    const itemTop = index * ITEM_HEIGHT;

    const animatedStyle = useAnimatedStyle(() => {
      // 화면 상에서의 아이템 위치
      const relativeY = itemTop - scrollY.value;

      // 화면 중앙으로부터의 거리
      const distanceFromCenter = Math.abs(
        relativeY - SCREEN_HEIGHT / 2 + ITEM_HEIGHT / 2
      );

      // 스케일: 중앙에 가까울수록 크게
      const scale = interpolate(
        distanceFromCenter,
        [0, SCREEN_HEIGHT / 3],
        [1, 0.85],
        Extrapolation.CLAMP
      );

      // X 이동: 중앙에 가까울수록 안으로
      const translateX = interpolate(
        distanceFromCenter,
        [0, SCREEN_HEIGHT / 3],
        [0, 20],
        Extrapolation.CLAMP
      );

      // 투명도
      const opacity = interpolate(
        distanceFromCenter,
        [0, SCREEN_HEIGHT / 2],
        [1, 0.4],
        Extrapolation.CLAMP
      );

      // 회전
      const rotateZ = interpolate(
        relativeY - SCREEN_HEIGHT / 2,
        [-SCREEN_HEIGHT / 2, 0, SCREEN_HEIGHT / 2],
        [-2, 0, 2],
        Extrapolation.CLAMP
      );

      return {
        transform: [
          { scale },
          { translateX },
          { rotateZ: `${rotateZ}deg` },
        ],
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
        <Text style={styles.itemNumber}>{index + 1}</Text>
        <Text style={styles.itemTitle}>{item.title}</Text>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  listContent: {
    paddingVertical: SCREEN_HEIGHT / 3,
    paddingHorizontal: 20,
  },
  item: {
    height: ITEM_HEIGHT - 12,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  itemNumber: {
    fontSize: 32,
    fontWeight: '200',
    color: 'rgba(0,0,0,0.2)',
    marginRight: 16,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});
```

---

## 💻 Pull-Up 로딩 (상단 추가)

### 새 콘텐츠를 상단에 추가

```tsx
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';

interface Message {
  id: string;
  text: string;
  time: string;
  isNew?: boolean;
}

export default function PullUpLoading() {
  const [messages, setMessages] = useState<Message[]>(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: `${i}`,
      text: `메시지 ${20 - i}`,
      time: `${Math.floor(i / 2)}분 전`,
    }))
  );
  const [refreshing, setRefreshing] = useState(false);

  const listRef = useRef<Animated.FlatList<Message>>(null);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // 새 메시지 불러오기 (상단에 추가)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    await new Promise((r) => setTimeout(r, 1500));

    const newMessages: Message[] = Array.from({ length: 5 }, (_, i) => ({
      id: `new-${Date.now()}-${i}`,
      text: `새 메시지 ${i + 1}`,
      time: '방금',
      isNew: true,
    }));

    setMessages((prev) => [...newMessages, ...prev]);
    setRefreshing(false);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => (
      <MessageItem message={item} index={index} />
    ),
    []
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        inverted // 메시지 리스트는 보통 역순
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7A4AE2"
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const MessageItem = React.memo(
  ({ message, index }: { message: Message; index: number }) => (
    <Animated.View
      entering={
        message.isNew ? FadeInDown.delay(index * 50).duration(300) : undefined
      }
      style={[styles.messageItem, message.isNew && styles.newMessage]}
    >
      <View style={styles.messageContent}>
        <Text style={styles.messageText}>{message.text}</Text>
        <Text style={styles.messageTime}>{message.time}</Text>
      </View>
      {message.isNew && <View style={styles.newBadge} />}
    </Animated.View>
  )
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 8,
  },
  newMessage: {
    backgroundColor: '#f0e8ff',
    borderLeftWidth: 3,
    borderLeftColor: '#7A4AE2',
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  newBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7A4AE2',
  },
});
```

---

## 📊 FlatList vs FlashList 비교

| 특성 | FlatList | FlashList |
|-----|----------|-----------|
| 메모리 사용 | 높음 | 낮음 (재활용) |
| 초기 렌더링 | 보통 | 빠름 |
| 스크롤 성능 | 좋음 | 매우 좋음 |
| 다양한 높이 | 지원 | overrideItemLayout |
| 설치 크기 | 내장 | 추가 (~50KB) |
| 러닝 커브 | 낮음 | 낮음 |

---

## ⚠️ 흔한 실수와 해결법

### 1. renderItem 리렌더

```tsx
// ❌ 매 렌더마다 새 함수 생성
<FlatList
  renderItem={({ item }) => <Item item={item} />}
/>

// ✅ useCallback으로 메모이제이션
const renderItem = useCallback(
  ({ item }) => <Item item={item} />,
  []
);

<FlatList renderItem={renderItem} />
```

### 2. 아이템 컴포넌트 리렌더

```tsx
// ❌ 매번 리렌더
function Item({ item }) {
  return <View>{item.title}</View>;
}

// ✅ React.memo로 최적화
const Item = React.memo(({ item }) => {
  return <View>{item.title}</View>;
});
```

### 3. keyExtractor 누락

```tsx
// ❌ index 기반 (성능 저하)
<FlatList data={items} />

// ✅ 고유 키 사용
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
/>
```

---

## 💡 성능 최적화 팁

### 최적화 체크리스트

```tsx
<FlatList
  // 1. 렌더링 최적화
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={10}
  updateCellsBatchingPeriod={50}

  // 2. 측정 최적화
  getItemLayout={(_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}

  // 3. 메모이제이션
  renderItem={memoizedRenderItem}
  keyExtractor={memoizedKeyExtractor}

  // 4. 스크롤 최적화
  scrollEventThrottle={16}
  decelerationRate="fast"
/>
```

### 조건부 애니메이션

```tsx
// 화면에 보이는 아이템만 애니메이션
const AnimatedItem = React.memo(({ item, index, scrollY }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const itemTop = index * ITEM_HEIGHT;
    const isVisible =
      itemTop > scrollY.value - ITEM_HEIGHT &&
      itemTop < scrollY.value + SCREEN_HEIGHT + ITEM_HEIGHT;

    if (!isVisible) {
      return {}; // 화면 밖이면 애니메이션 건너뛰기
    }

    // 애니메이션 로직...
  });

  return <Animated.View style={animatedStyle} />;
});
```

---

## 🎯 실무 적용: sometimes-app 매칭 리스트

```tsx
// src/features/matching-history/ui/optimized-list.tsx
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useInfiniteQuery } from '@tanstack/react-query';

import { MatchingCard } from './matching-card';
import { SkeletonCard } from './skeleton-card';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

export function OptimizedMatchingList() {
  const scrollY = useSharedValue(0);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['matching-history'],
    queryFn: fetchMatchingHistory,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return (
      <View style={styles.skeletonContainer}>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </View>
    );
  }

  return (
    <AnimatedFlashList
      data={allItems}
      renderItem={({ item, index }) => (
        <MatchingCard
          match={item}
          index={index}
          scrollY={scrollY}
        />
      )}
      estimatedItemSize={120}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? <LoadingFooter /> : null
      }
    />
  );
}
```

---

## 🏋️ 연습 문제

### 문제 1: 검색 결과 하이라이트
검색 결과에서 검색어를 하이라이트하고, 스크롤 시 페이드 효과를 적용하세요.

**요구사항**:
- 검색어 텍스트 강조
- 화면 진입 시 순차 페이드인
- 무한 스크롤 지원

### 문제 2: 그리드 갤러리
2~3열 그리드 갤러리를 구현하세요.

**요구사항**:
- 이미지 로딩 스켈레톤
- 스크롤 시 스케일 애니메이션
- 열 수 전환 애니메이션

### 문제 3: 채팅 리스트 최적화
채팅방 목록을 최적화하세요.

**요구사항**:
- 읽지 않은 메시지 뱃지 펄스
- 마지막 메시지 시간 실시간 업데이트
- 스와이프 삭제

---

## 📚 이 장에서 배운 내용

1. **FlatList 최적화**: 메모이제이션, getItemLayout, windowSize
2. **FlashList**: estimatedItemSize, overrideItemLayout
3. **스켈레톤 로딩**: 시머 효과로 로딩 상태 표시
4. **위치 기반 애니메이션**: 화면 중앙 아이템 강조
5. **Pull-Up 로딩**: 상단에 새 콘텐츠 추가
6. **조건부 애니메이션**: 보이는 아이템만 처리

---

## 다음 장 예고

**Chapter 31: 스크롤 스냅**에서는 특정 위치로 자동 정렬되는 스크롤을 구현합니다.

- 카드 캐러셀 스냅
- 페이지 스냅
- 커스텀 스냅 포인트
- 자석 효과

사용자 경험을 향상시키는 스냅 스크롤을 만들어봅니다.
