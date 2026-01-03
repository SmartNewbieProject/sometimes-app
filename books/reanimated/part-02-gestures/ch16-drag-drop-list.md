# Chapter 16: 실전 - 드래그 앤 드롭 리스트

## 📌 개요

드래그 앤 드롭 리스트는 모바일 앱에서 가장 복잡한 인터랙션 중 하나입니다. Long Press로 아이템을 선택하고, 드래그로 위치를 변경하며, 다른 아이템들이 자연스럽게 밀려나는 애니메이션까지 구현해야 합니다. 이 장에서는 프로덕션 레벨의 드래그 앤 드롭 리스트를 처음부터 구현합니다.

### 학습 목표

- Long Press + Pan 조합 제스처
- 아이템 위치 계산과 재정렬 로직
- 다른 아이템의 밀려남 애니메이션
- 햅틱 피드백 통합
- 성능 최적화 기법

---

## 💻 프로젝트 구조

```
src/features/drag-list/
├── types.ts              # 타입 정의
├── constants.ts          # 상수
├── utils/
│   └── positions.ts      # 위치 계산 유틸리티
├── hooks/
│   ├── useDragGesture.ts     # 드래그 제스처 훅
│   └── useListPositions.ts   # 리스트 위치 관리 훅
└── ui/
    ├── DraggableItem.tsx     # 드래그 가능 아이템
    └── DraggableList.tsx     # 드래그 리스트 컨테이너
```

---

## 💻 Step 1: 타입과 상수

### types.ts

```typescript
export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface ItemLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const DragState = {
  IDLE: 'IDLE',
  LONG_PRESSING: 'LONG_PRESSING',
  DRAGGING: 'DRAGGING',
  DROPPING: 'DROPPING',
} as const;

export type DragStateType = typeof DragState[keyof typeof DragState];
```

### constants.ts

```typescript
export const ITEM_HEIGHT = 70;
export const ITEM_MARGIN = 8;
export const TOTAL_ITEM_HEIGHT = ITEM_HEIGHT + ITEM_MARGIN;

export const LONG_PRESS_DURATION = 300; // ms
export const ANIMATION_DURATION = 200; // ms

export const DRAG_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 10,
};
```

---

## 💻 Step 2: 위치 계산 유틸리티

### utils/positions.ts

```typescript
import { TOTAL_ITEM_HEIGHT } from '../constants';

// 인덱스로부터 Y 위치 계산
export function getYForIndex(index: number): number {
  'worklet';
  return index * TOTAL_ITEM_HEIGHT;
}

// Y 위치로부터 인덱스 계산
export function getIndexForY(y: number, itemCount: number): number {
  'worklet';
  const index = Math.round(y / TOTAL_ITEM_HEIGHT);
  return Math.max(0, Math.min(index, itemCount - 1));
}

// 아이템 순서 재정렬
export function reorderItems<T>(
  items: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  'worklet';
  const result = [...items];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

// 두 인덱스 사이의 아이템들이 밀려야 하는 오프셋
export function getOffsetForReorder(
  currentIndex: number,
  fromIndex: number,
  toIndex: number
): number {
  'worklet';
  if (fromIndex === toIndex) return 0;

  // 드래그 중인 아이템보다 위에 있는 아이템
  if (fromIndex < toIndex) {
    // 아래로 드래그 중
    if (currentIndex > fromIndex && currentIndex <= toIndex) {
      return -TOTAL_ITEM_HEIGHT; // 위로 밀림
    }
  } else {
    // 위로 드래그 중
    if (currentIndex >= toIndex && currentIndex < fromIndex) {
      return TOTAL_ITEM_HEIGHT; // 아래로 밀림
    }
  }

  return 0;
}
```

---

## 💻 Step 3: 리스트 위치 관리 훅

### hooks/useListPositions.ts

```typescript
import { useSharedValue, withSpring } from 'react-native-reanimated';
import { getYForIndex, getOffsetForReorder } from '../utils/positions';
import { TOTAL_ITEM_HEIGHT } from '../constants';

export function useListPositions(itemCount: number) {
  // 각 아이템의 현재 Y 오프셋 (밀려남 애니메이션용)
  const offsets = useSharedValue<number[]>(
    new Array(itemCount).fill(0)
  );

  // 현재 드래그 중인 아이템의 인덱스
  const activeIndex = useSharedValue(-1);

  // 드래그 중인 아이템이 이동할 목표 인덱스
  const targetIndex = useSharedValue(-1);

  // 아이템들의 오프셋 업데이트
  const updateOffsets = (fromIndex: number, toIndex: number) => {
    'worklet';
    const newOffsets = [...offsets.value];

    for (let i = 0; i < itemCount; i++) {
      if (i === fromIndex) continue; // 드래그 중인 아이템은 제외

      const offset = getOffsetForReorder(i, fromIndex, toIndex);
      newOffsets[i] = offset;
    }

    offsets.value = newOffsets;
  };

  // 오프셋 리셋 (애니메이션과 함께)
  const resetOffsets = () => {
    'worklet';
    offsets.value = new Array(itemCount).fill(0);
  };

  // 드래그 시작
  const startDrag = (index: number) => {
    'worklet';
    activeIndex.value = index;
    targetIndex.value = index;
  };

  // 드래그 중 위치 업데이트
  const updateDrag = (y: number) => {
    'worklet';
    if (activeIndex.value === -1) return;

    const newTargetIndex = Math.max(
      0,
      Math.min(
        Math.round(y / TOTAL_ITEM_HEIGHT),
        itemCount - 1
      )
    );

    if (newTargetIndex !== targetIndex.value) {
      targetIndex.value = newTargetIndex;
      updateOffsets(activeIndex.value, newTargetIndex);
    }
  };

  // 드래그 종료
  const endDrag = () => {
    'worklet';
    const from = activeIndex.value;
    const to = targetIndex.value;

    activeIndex.value = -1;
    targetIndex.value = -1;
    resetOffsets();

    return { from, to };
  };

  return {
    offsets,
    activeIndex,
    targetIndex,
    startDrag,
    updateDrag,
    endDrag,
  };
}
```

---

## 💻 Step 4: 드래그 제스처 훅

### hooks/useDragGesture.ts

```typescript
import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { DragState, DragStateType } from '../types';
import { ITEM_HEIGHT, TOTAL_ITEM_HEIGHT, LONG_PRESS_DURATION } from '../constants';
import { getYForIndex } from '../utils/positions';

interface UseDragGestureProps {
  index: number;
  itemCount: number;
  onDragStart?: () => void;
  onDragEnd?: (from: number, to: number) => void;
  updateDrag: (y: number) => void;
  startDrag: (index: number) => void;
  endDrag: () => { from: number; to: number };
}

export function useDragGesture({
  index,
  itemCount,
  onDragStart,
  onDragEnd,
  updateDrag,
  startDrag,
  endDrag,
}: UseDragGestureProps) {
  const state = useSharedValue<DragStateType>(DragState.IDLE);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(0);

  const initialY = getYForIndex(index);

  // Long Press 제스처
  const longPress = Gesture.LongPress()
    .minDuration(LONG_PRESS_DURATION)
    .onStart(() => {
      state.value = DragState.LONG_PRESSING;
      scale.value = withSpring(1.05);
      zIndex.value = 100;

      // 햅틱 피드백
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);

      // 드래그 시작 콜백
      if (onDragStart) {
        runOnJS(onDragStart)();
      }
    });

  // Pan 제스처 (Long Press 후에만 활성화)
  const pan = Gesture.Pan()
    .activateAfterLongPress(LONG_PRESS_DURATION)
    .onStart(() => {
      state.value = DragState.DRAGGING;
      startDrag(index);
    })
    .onUpdate((event) => {
      if (state.value !== DragState.DRAGGING) return;

      // 드래그 위치 업데이트
      translateY.value = event.translationY;

      // 현재 절대 Y 위치
      const absoluteY = initialY + event.translationY;

      // 다른 아이템들 밀기
      updateDrag(absoluteY);
    })
    .onEnd(() => {
      state.value = DragState.DROPPING;

      const { from, to } = endDrag();

      // 최종 위치로 애니메이션
      const finalY = getYForIndex(to) - initialY;
      translateY.value = withSpring(finalY, { damping: 20, stiffness: 300 }, () => {
        // 애니메이션 완료 후 리셋
        translateY.value = 0;
        scale.value = withSpring(1);
        zIndex.value = 0;
        state.value = DragState.IDLE;
      });

      // 순서 변경 콜백
      if (onDragEnd && from !== to) {
        runOnJS(onDragEnd)(from, to);
      }

      // 햅틱 피드백
      runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
    })
    .onFinalize(() => {
      if (state.value === DragState.LONG_PRESSING) {
        // Long Press만 하고 드래그 안 한 경우
        scale.value = withSpring(1);
        zIndex.value = 0;
        state.value = DragState.IDLE;
      }
    });

  // 제스처 조합
  const gesture = Gesture.Simultaneous(longPress, pan);

  // 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
    shadowOpacity: state.value === DragState.DRAGGING ? 0.3 : 0,
  }));

  return {
    gesture,
    animatedStyle,
    state,
  };
}
```

---

## 💻 Step 5: 드래그 가능 아이템 컴포넌트

### ui/DraggableItem.tsx

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ListItem } from '../types';
import { ITEM_HEIGHT, TOTAL_ITEM_HEIGHT, DRAG_SHADOW } from '../constants';
import { useDragGesture } from '../hooks/useDragGesture';
import { getYForIndex } from '../utils/positions';

interface DraggableItemProps {
  item: ListItem;
  index: number;
  itemCount: number;
  offset: Animated.SharedValue<number>;
  onDragStart?: () => void;
  onDragEnd?: (from: number, to: number) => void;
  updateDrag: (y: number) => void;
  startDrag: (index: number) => void;
  endDrag: () => { from: number; to: number };
  activeIndex: Animated.SharedValue<number>;
}

export function DraggableItem({
  item,
  index,
  itemCount,
  offset,
  onDragStart,
  onDragEnd,
  updateDrag,
  startDrag,
  endDrag,
  activeIndex,
}: DraggableItemProps) {
  const {
    gesture,
    animatedStyle: dragStyle,
    state,
  } = useDragGesture({
    index,
    itemCount,
    onDragStart,
    onDragEnd,
    updateDrag,
    startDrag,
    endDrag,
  });

  // 기본 위치 + 밀림 오프셋
  const containerStyle = useAnimatedStyle(() => {
    const isActive = activeIndex.value === index;
    const offsetValue = isActive ? 0 : offset.value;

    return {
      position: 'absolute',
      top: getYForIndex(index),
      left: 0,
      right: 0,
      transform: [
        { translateY: withSpring(offsetValue, { damping: 20, stiffness: 200 }) },
      ],
    };
  });

  return (
    <Animated.View style={containerStyle}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.item, dragStyle]}>
          <View style={styles.handle}>
            <Text style={styles.handleIcon}>☰</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  item: {
    height: ITEM_HEIGHT,
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginHorizontal: 16,
    ...DRAG_SHADOW,
    shadowOpacity: 0.1,
  },
  handle: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handleIcon: {
    fontSize: 18,
    color: '#999',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
```

---

## 💻 Step 6: 드래그 리스트 컨테이너

### ui/DraggableList.tsx

```typescript
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';
import { ListItem } from '../types';
import { TOTAL_ITEM_HEIGHT } from '../constants';
import { useListPositions } from '../hooks/useListPositions';
import { DraggableItem } from './DraggableItem';
import { reorderItems } from '../utils/positions';

interface DraggableListProps {
  initialItems: ListItem[];
  onReorder?: (items: ListItem[]) => void;
}

export function DraggableList({ initialItems, onReorder }: DraggableListProps) {
  const [items, setItems] = useState(initialItems);

  const {
    offsets,
    activeIndex,
    targetIndex,
    startDrag,
    updateDrag,
    endDrag,
  } = useListPositions(items.length);

  const handleDragEnd = useCallback((from: number, to: number) => {
    const newItems = reorderItems(items, from, to);
    setItems(newItems);
    onReorder?.(newItems);
  }, [items, onReorder]);

  // 컨테이너 높이
  const containerHeight = items.length * TOTAL_ITEM_HEIGHT;

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={[styles.container, { height: containerHeight }]}>
        {items.map((item, index) => (
          <DraggableItemWrapper
            key={item.id}
            item={item}
            index={index}
            itemCount={items.length}
            offsets={offsets}
            activeIndex={activeIndex}
            onDragEnd={handleDragEnd}
            updateDrag={updateDrag}
            startDrag={startDrag}
            endDrag={endDrag}
          />
        ))}
      </View>
    </GestureHandlerRootView>
  );
}

// 개별 아이템 래퍼 (offset 추출)
function DraggableItemWrapper({
  item,
  index,
  itemCount,
  offsets,
  activeIndex,
  onDragEnd,
  updateDrag,
  startDrag,
  endDrag,
}: {
  item: ListItem;
  index: number;
  itemCount: number;
  offsets: Animated.SharedValue<number[]>;
  activeIndex: Animated.SharedValue<number>;
  onDragEnd: (from: number, to: number) => void;
  updateDrag: (y: number) => void;
  startDrag: (index: number) => void;
  endDrag: () => { from: number; to: number };
}) {
  // 해당 인덱스의 오프셋만 추출
  const offset = useDerivedValue(() => offsets.value[index] || 0);

  return (
    <DraggableItem
      item={item}
      index={index}
      itemCount={itemCount}
      offset={offset}
      activeIndex={activeIndex}
      onDragEnd={onDragEnd}
      updateDrag={updateDrag}
      startDrag={startDrag}
      endDrag={endDrag}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    position: 'relative',
  },
});
```

---

## 💻 Step 7: 최종 통합

### DragListScreen.tsx

```typescript
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { DraggableList } from './ui/DraggableList';
import { ListItem } from './types';

const INITIAL_ITEMS: ListItem[] = [
  { id: '1', title: 'Item 1', subtitle: 'Subtitle 1' },
  { id: '2', title: 'Item 2', subtitle: 'Subtitle 2' },
  { id: '3', title: 'Item 3', subtitle: 'Subtitle 3' },
  { id: '4', title: 'Item 4', subtitle: 'Subtitle 4' },
  { id: '5', title: 'Item 5', subtitle: 'Subtitle 5' },
  { id: '6', title: 'Item 6', subtitle: 'Subtitle 6' },
];

export function DragListScreen() {
  const handleReorder = (items: ListItem[]) => {
    console.log('New order:', items.map(i => i.id));
    // API 호출로 순서 저장
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Drag to Reorder</Text>
      <DraggableList
        initialItems={INITIAL_ITEMS}
        onReorder={handleReorder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
});
```

---

## 💻 고급 기능: 자동 스크롤

### 리스트가 스크롤 가능할 때

```typescript
import { ScrollView } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS } from 'react-native-reanimated';

function ScrollableDraggableList({ items, containerHeight }) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);

  // 화면 상/하단 근처에서 자동 스크롤
  const handleAutoScroll = (y: number) => {
    const SCROLL_THRESHOLD = 100;
    const SCROLL_SPEED = 5;

    if (y < SCROLL_THRESHOLD) {
      // 상단 근처 - 위로 스크롤
      scrollRef.current?.scrollTo({
        y: scrollY.value - SCROLL_SPEED,
        animated: false,
      });
    } else if (y > containerHeight - SCROLL_THRESHOLD) {
      // 하단 근처 - 아래로 스크롤
      scrollRef.current?.scrollTo({
        y: scrollY.value + SCROLL_SPEED,
        animated: false,
      });
    }
  };

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      // 자동 스크롤 체크
      runOnJS(handleAutoScroll)(event.absoluteY);

      // 기존 드래그 로직...
    });

  return (
    <ScrollView
      ref={scrollRef}
      onScroll={(e) => {
        scrollY.value = e.nativeEvent.contentOffset.y;
      }}
      scrollEventThrottle={16}
    >
      {/* 아이템들 */}
    </ScrollView>
  );
}
```

---

## 💻 고급 기능: 그리드 레이아웃

### 2열 그리드 드래그

```typescript
const COLUMNS = 2;
const ITEM_SIZE = (SCREEN_WIDTH - 48) / COLUMNS;

function getPositionForIndex(index: number) {
  'worklet';
  const row = Math.floor(index / COLUMNS);
  const col = index % COLUMNS;
  return {
    x: col * (ITEM_SIZE + 16) + 16,
    y: row * (ITEM_SIZE + 16),
  };
}

function getIndexForPosition(x: number, y: number, itemCount: number) {
  'worklet';
  const col = Math.round((x - 16) / (ITEM_SIZE + 16));
  const row = Math.round(y / (ITEM_SIZE + 16));
  const index = row * COLUMNS + col;
  return Math.max(0, Math.min(index, itemCount - 1));
}
```

---

## ⚠️ 성능 최적화

### 1. 메모이제이션

```typescript
// 아이템 컴포넌트 메모이제이션
const MemoizedItem = React.memo(DraggableItem, (prev, next) => {
  return prev.item.id === next.item.id && prev.index === next.index;
});
```

### 2. 배열 업데이트 최적화

```typescript
// Shared Value 배열 업데이트 시 새 배열 생성 최소화
const updateOffsets = (fromIndex: number, toIndex: number) => {
  'worklet';
  // 변경된 인덱스만 업데이트
  const newOffsets = offsets.value.slice();

  for (let i = 0; i < itemCount; i++) {
    if (i === fromIndex) continue;
    const offset = getOffsetForReorder(i, fromIndex, toIndex);
    if (newOffsets[i] !== offset) {
      newOffsets[i] = offset;
    }
  }

  offsets.value = newOffsets;
};
```

### 3. 불필요한 리렌더 방지

```typescript
// 드래그 상태를 Context로 공유하지 않고 Shared Value로 직접 전달
// 이렇게 하면 드래그 중 다른 아이템 리렌더 방지
```

---

## 🎯 실무 적용: Sometimes 앱 사례

### 프로필 사진 순서 변경

```typescript
// src/features/profile/ui/photo-grid.tsx 참고
function PhotoGrid({ photos, onReorder }) {
  // 2x3 그리드로 사진 순서 변경
  // 첫 번째 사진은 대표 사진으로 고정

  return (
    <DraggableGrid
      items={photos}
      columns={3}
      onReorder={(newPhotos) => {
        onReorder(newPhotos);
        // API 호출로 순서 저장
      }}
      renderItem={(photo, index) => (
        <PhotoThumbnail
          photo={photo}
          isPrimary={index === 0}
        />
      )}
    />
  );
}
```

---

## 🏋️ 연습 문제

### 연습 1: 기본 드래그 리스트
Long Press + Pan으로 순서 변경 가능한 리스트를 구현하세요.

### 연습 2: 삭제 기능 추가
왼쪽으로 스와이프하면 삭제되는 기능을 드래그 리스트에 추가하세요.

### 연습 3: 그리드 드래그
2열 그리드에서 드래그 앤 드롭으로 순서를 변경할 수 있게 구현하세요.

### 연습 4: 섹션별 드래그
여러 섹션이 있고, 같은 섹션 내에서만 드래그로 순서 변경이 가능하게 구현하세요.

---

## 📚 요약

### 드래그 앤 드롭 구현 체크리스트

| 요소 | 구현 방법 |
|-----|----------|
| 선택 | Long Press (300ms) |
| 드래그 | Pan.activateAfterLongPress() |
| 밀림 효과 | 다른 아이템 translateY 애니메이션 |
| 드롭 | 최종 위치로 스프링 애니메이션 |
| 햅틱 | 선택/드롭 시 피드백 |
| 그림자 | 드래그 중 elevation 증가 |

### 핵심 포인트

- [ ] Long Press와 Pan 제스처 조합
- [ ] 아이템 위치 계산 로직 분리
- [ ] Shared Value로 성능 최적화
- [ ] 다른 아이템 밀림 애니메이션
- [ ] 햅틱 피드백으로 UX 향상
- [ ] 스크롤 영역에서 자동 스크롤

### Part 2 완료!

축하합니다! Part 2: 제스처 마스터를 모두 완료했습니다. 이제 Tap, Pan, Pinch, Rotation 제스처와 그 조합을 자유자재로 다룰 수 있습니다.

다음 Part 3에서는 **레이아웃 애니메이션**을 배웁니다. 컴포넌트가 추가/삭제되거나 위치가 변경될 때 자연스러운 애니메이션을 적용하는 방법을 다룹니다.
