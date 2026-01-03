# 부록 C: 애니메이션 레시피

실전에서 바로 사용할 수 있는 애니메이션 코드 모음입니다. 복사하여 프로젝트에 적용하세요.

---

## 🔘 버튼 애니메이션

### 1. 스케일 버튼

```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

function ScaleButton({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  const scale = useSharedValue(1);

  const gesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.95);
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
    })
    .onEnd(() => {
      runOnJS(onPress)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
```

### 2. 바운스 버튼

```typescript
function BounceButton({ onPress, children }: Props) {
  const scale = useSharedValue(1);

  const gesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSequence(
        withSpring(0.9, { damping: 10, stiffness: 400 }),
        withSpring(1.05, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 15, stiffness: 300 })
      );
    })
    .onEnd(() => {
      runOnJS(onPress)();
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={style}>{children}</Animated.View>
    </GestureDetector>
  );
}
```

### 3. 롱프레스 버튼

```typescript
function LongPressButton({ onLongPress, children }: Props) {
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  const gesture = Gesture.LongPress()
    .minDuration(1000)
    .onBegin(() => {
      scale.value = withSpring(0.98);
      progress.value = withTiming(1, { duration: 1000 });
    })
    .onEnd(() => {
      runOnJS(onLongPress)();
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
      progress.value = withTiming(0, { duration: 200 });
    });

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    height: 4,
    backgroundColor: '#7A4AE2',
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={{ transform: [{ scale: scale.value }] }}>
        {children}
        <Animated.View style={progressStyle} />
      </Animated.View>
    </GestureDetector>
  );
}
```

---

## 📱 카드 애니메이션

### 1. 플립 카드

```typescript
function FlipCard({ front, back }: { front: React.ReactNode; back: React.ReactNode }) {
  const rotateY = useSharedValue(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const flip = () => {
    const target = isFlipped ? 0 : 180;
    rotateY.value = withSpring(target, { damping: 15, stiffness: 100 });
    setIsFlipped(!isFlipped);
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rotateY.value}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rotateY.value + 180}deg` }],
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }));

  return (
    <Pressable onPress={flip}>
      <Animated.View style={frontStyle}>{front}</Animated.View>
      <Animated.View style={backStyle}>{back}</Animated.View>
    </Pressable>
  );
}
```

### 2. 스와이프 카드

```typescript
const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

function SwipeCard({ onSwipeLeft, onSwipeRight, children }: Props) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.5;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withSpring(direction * SCREEN_WIDTH * 1.5);
        runOnJS(direction > 0 ? onSwipeRight : onSwipeLeft)();
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${(translateX.value / SCREEN_WIDTH) * 20}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={cardStyle}>{children}</Animated.View>
    </GestureDetector>
  );
}
```

### 3. 확장 카드

```typescript
function ExpandableCard({ title, content }: Props) {
  const height = useSharedValue(0);
  const rotation = useSharedValue(0);
  const [expanded, setExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

  const toggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    height.value = withSpring(newExpanded ? contentHeight : 0);
    rotation.value = withSpring(newExpanded ? 180 : 0);
  };

  const contentStyle = useAnimatedStyle(() => ({
    height: height.value,
    overflow: 'hidden',
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.card}>
      <Pressable onPress={toggle} style={styles.header}>
        <Text>{title}</Text>
        <Animated.View style={iconStyle}>
          <Icon name="chevron-down" />
        </Animated.View>
      </Pressable>

      <Animated.View style={contentStyle}>
        <View
          onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
          style={styles.content}
        >
          {content}
        </View>
      </Animated.View>
    </View>
  );
}
```

---

## 📜 리스트 애니메이션

### 1. Staggered 리스트

```typescript
function StaggeredList({ items }: { items: Item[] }) {
  return (
    <View>
      {items.map((item, index) => (
        <Animated.View
          key={item.id}
          entering={FadeInUp.delay(index * 100).springify()}
        >
          <ListItem item={item} />
        </Animated.View>
      ))}
    </View>
  );
}
```

### 2. 삭제 가능 리스트 아이템

```typescript
function SwipeToDeleteItem({ onDelete, children }: Props) {
  const translateX = useSharedValue(0);
  const height = useSharedValue(60);
  const opacity = useSharedValue(1);

  const DELETE_THRESHOLD = -80;

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      translateX.value = Math.min(0, event.translationX);
    })
    .onEnd(() => {
      if (translateX.value < DELETE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH);
        height.value = withTiming(0);
        opacity.value = withTiming(0, undefined, () => {
          runOnJS(onDelete)();
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const itemStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
  }));

  const deleteIconOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [DELETE_THRESHOLD, 0], [1, 0]),
  }));

  return (
    <Animated.View style={containerStyle}>
      <Animated.View style={[styles.deleteBackground, deleteIconOpacity]}>
        <Icon name="trash" color="white" />
      </Animated.View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.item, itemStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}
```

### 3. 드래그 리오더

```typescript
function DraggableList({ items, onReorder }: Props) {
  const positions = useSharedValue<Record<string, number>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    const newPositions: Record<string, number> = {};
    items.forEach((item, index) => {
      newPositions[item.id] = index * ITEM_HEIGHT;
    });
    positions.value = newPositions;
  }, [items]);

  const moveItem = (id: string, newPosition: number) => {
    'worklet';
    const itemIndex = items.findIndex((i) => i.id === id);
    const newIndex = Math.round(newPosition / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, newIndex));

    if (itemIndex !== clampedIndex) {
      runOnJS(onReorder)(itemIndex, clampedIndex);
    }
  };

  return (
    <View style={{ height: items.length * ITEM_HEIGHT }}>
      {items.map((item) => (
        <DraggableItem
          key={item.id}
          item={item}
          positions={positions}
          onDragEnd={(position) => moveItem(item.id, position)}
        />
      ))}
    </View>
  );
}
```

---

## ⏳ 로딩 애니메이션

### 1. 펄스 로더

```typescript
function PulseLoader({ size = 40, color = '#7A4AE2' }: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1,
      true
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 600 }),
        withTiming(0.8, { duration: 600 })
      ),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={style} />;
}
```

### 2. 스피너

```typescript
function Spinner({ size = 40, color = '#7A4AE2' }: Props) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 3,
    borderColor: color,
    borderTopColor: 'transparent',
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return <Animated.View style={style} />;
}
```

### 3. 스켈레톤 로더

```typescript
function SkeletonLoader({ width, height, borderRadius = 4 }: Props) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-width, width]
    );

    return {
      width,
      height,
      borderRadius,
      backgroundColor: '#E0E0E0',
      overflow: 'hidden',
    };
  });

  const shimmerStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [
      { translateX: interpolate(shimmer.value, [0, 1], [-width, width]) },
      { skewX: '-20deg' },
    ],
  }));

  return (
    <Animated.View style={style}>
      <Animated.View style={shimmerStyle} />
    </Animated.View>
  );
}
```

---

## 🔔 알림 애니메이션

### 1. 토스트

```typescript
function Toast({ message, visible, onHide }: Props) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0);
      opacity.value = withTiming(1);

      // 자동 숨기기
      const timeout = setTimeout(() => {
        translateY.value = withSpring(-100);
        opacity.value = withTiming(0, undefined, () => {
          runOnJS(onHide)();
        });
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [visible]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, style]}>
      <Text>{message}</Text>
    </Animated.View>
  );
}
```

### 2. 뱃지 알림

```typescript
function NotificationBadge({ count }: { count: number }) {
  const scale = useSharedValue(0);
  const prevCount = useRef(count);

  useEffect(() => {
    if (count > 0 && prevCount.current !== count) {
      scale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );
    } else if (count === 0) {
      scale.value = withTiming(0);
    }

    prevCount.current = count;
  }, [count]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.badge, style]}>
      <Text style={styles.badgeText}>{count}</Text>
    </Animated.View>
  );
}
```

### 3. 셰이크 알림

```typescript
function ShakeNotification({ trigger }: { trigger: boolean }) {
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (trigger) {
      translateX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(5, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [trigger]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return <Animated.View style={style}>{/* content */}</Animated.View>;
}
```

---

## 🎭 전환 애니메이션

### 1. 페이드 전환

```typescript
function FadeTransition({ children, transitionKey }: Props) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 300 });
  }, [transitionKey]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}
```

### 2. 슬라이드 전환

```typescript
function SlideTransition({ children, direction = 'right' }: Props) {
  const translateX = useSharedValue(direction === 'right' ? 100 : -100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(0);
    opacity.value = withTiming(1);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}
```

### 3. 공유 요소 전환

```typescript
function SharedElementTransition({
  id,
  children,
  isActive,
}: {
  id: string;
  children: React.ReactNode;
  isActive: boolean;
}) {
  const viewRef = useAnimatedRef<Animated.View>();

  const sharedTransitionTag = `shared-${id}`;

  return (
    <Animated.View
      ref={viewRef}
      sharedTransitionTag={isActive ? sharedTransitionTag : undefined}
      sharedTransitionStyle={sharedElementTransition}
    >
      {children}
    </Animated.View>
  );
}

const sharedElementTransition = SharedTransition.custom((values) => {
  'worklet';
  return {
    width: withSpring(values.targetWidth),
    height: withSpring(values.targetHeight),
    originX: withSpring(values.targetOriginX),
    originY: withSpring(values.targetOriginY),
  };
});
```

---

## 🎮 인터랙티브 애니메이션

### 1. 슬라이더

```typescript
function AnimatedSlider({ min = 0, max = 100, onChange }: Props) {
  const translateX = useSharedValue(0);
  const TRACK_WIDTH = 280;
  const THUMB_SIZE = 24;

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      const newX = Math.max(0, Math.min(TRACK_WIDTH, event.x));
      translateX.value = newX;

      const value = min + (newX / TRACK_WIDTH) * (max - min);
      runOnJS(onChange)(Math.round(value));
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value - THUMB_SIZE / 2 }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: translateX.value,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.track, { width: TRACK_WIDTH }]}>
        <Animated.View style={[styles.fill, fillStyle]} />
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </View>
    </GestureDetector>
  );
}
```

### 2. 토글 스위치

```typescript
function AnimatedSwitch({ value, onValueChange }: Props) {
  const translateX = useSharedValue(value ? 20 : 0);
  const backgroundColor = useSharedValue(value ? '#7A4AE2' : '#E0E0E0');

  useEffect(() => {
    translateX.value = withSpring(value ? 20 : 0);
    backgroundColor.value = withTiming(value ? '#7A4AE2' : '#E0E0E0');
  }, [value]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
  }));

  return (
    <Pressable onPress={() => onValueChange(!value)}>
      <Animated.View style={[styles.switchTrack, trackStyle]}>
        <Animated.View style={[styles.switchThumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}
```

### 3. 핀치 줌

```typescript
function PinchToZoom({ children }: { children: React.ReactNode }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
      } else if (scale.value > 4) {
        scale.value = withSpring(4);
      }
      savedScale.value = scale.value;
    });

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: focalX.value },
      { translateY: focalY.value },
      { scale: scale.value },
      { translateX: -focalX.value },
      { translateY: -focalY.value },
    ],
  }));

  return (
    <GestureDetector gesture={pinchGesture}>
      <Animated.View style={style}>{children}</Animated.View>
    </GestureDetector>
  );
}
```

---

## 📐 레이아웃 애니메이션

### 1. 아코디언

```typescript
function Accordion({ sections }: { sections: Section[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <View>
      {sections.map((section, index) => (
        <AccordionItem
          key={section.id}
          section={section}
          isActive={activeIndex === index}
          onPress={() => setActiveIndex(activeIndex === index ? null : index)}
        />
      ))}
    </View>
  );
}

function AccordionItem({ section, isActive, onPress }: Props) {
  const height = useSharedValue(0);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    height.value = withSpring(isActive ? contentHeight : 0);
  }, [isActive, contentHeight]);

  const contentStyle = useAnimatedStyle(() => ({
    height: height.value,
    overflow: 'hidden',
  }));

  return (
    <View>
      <Pressable onPress={onPress}>
        <Text>{section.title}</Text>
      </Pressable>
      <Animated.View style={contentStyle}>
        <View onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}>
          <Text>{section.content}</Text>
        </View>
      </Animated.View>
    </View>
  );
}
```

### 2. 모핑 레이아웃

```typescript
function MorphingLayout({ layout }: { layout: 'grid' | 'list' }) {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <Animated.View
          key={item.id}
          layout={LinearTransition.springify()}
          style={layout === 'grid' ? styles.gridItem : styles.listItem}
        >
          <ItemContent item={item} />
        </Animated.View>
      ))}
    </View>
  );
}
```

---

## 사용 팁

1. **복사하여 사용**: 레시피를 그대로 복사한 후 필요에 맞게 수정
2. **스타일 커스터마이즈**: 색상, 크기, 타이밍 값 조정
3. **조합하기**: 여러 레시피를 조합하여 복잡한 효과 구현
4. **성능 확인**: 실제 기기에서 60fps 유지 확인
