# Chapter 22: 리스트 아이템 애니메이션

## 📌 개요

모바일 앱에서 리스트는 가장 흔한 UI 패턴입니다. FlatList, FlashList 등 가상화된 리스트에서 아이템이 등장하거나 삭제될 때 애니메이션을 적용하면 사용자 경험이 크게 향상됩니다. 이 장에서는 리스트 아이템 애니메이션의 다양한 패턴을 다룹니다.

### 학습 목표

- 리스트 아이템 등장 애니메이션
- 스태거(순차) 등장 효과
- 아이템 삭제 애니메이션
- 스와이프 삭제 구현
- 가상화 리스트에서의 주의점

---

## 📖 리스트 애니메이션의 특수성

### ScrollView vs FlatList

| 특징 | ScrollView + map | FlatList |
|-----|------------------|----------|
| 가상화 | ❌ | ✅ |
| 아이템 수 | 적을 때 적합 (< 50) | 많을 때 적합 |
| 메모리 | 모든 아이템 렌더 | 보이는 것만 렌더 |
| 애니메이션 | 쉬움 | 주의 필요 |

### 가상화의 도전

```typescript
// FlatList는 화면 밖 아이템을 언마운트함
// → entering 애니메이션이 스크롤할 때마다 재실행될 수 있음

// 해결책:
// 1. 처음 마운트 시에만 애니메이션
// 2. 아이템별 애니메이션 상태 추적
// 3. 레이아웃 애니메이션 사용
```

---

## 💻 기본 등장 애니메이션

### ScrollView + map (소규모 리스트)

```typescript
import Animated, { FadeInUp } from 'react-native-reanimated';

function SimpleAnimatedList({ items }: { items: Item[] }) {
  return (
    <ScrollView>
      {items.map((item, index) => (
        <Animated.View
          key={item.id}
          entering={FadeInUp.delay(index * 50).duration(400)}
          style={styles.item}
        >
          <Text>{item.title}</Text>
        </Animated.View>
      ))}
    </ScrollView>
  );
}
```

### 스태거 효과 (순차 등장)

```typescript
const STAGGER_DELAY = 50; // ms
const MAX_STAGGER = 500; // 최대 지연

function StaggeredList({ items }) {
  return (
    <ScrollView>
      {items.map((item, index) => {
        const delay = Math.min(index * STAGGER_DELAY, MAX_STAGGER);

        return (
          <Animated.View
            key={item.id}
            entering={FadeInUp
              .delay(delay)
              .duration(400)
              .springify()
              .damping(15)
            }
            style={styles.item}
          >
            <Text>{item.title}</Text>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}
```

---

## 💻 FlatList에서 애니메이션

### 처음 마운트 시에만 애니메이션

```typescript
function AnimatedFlatList({ items }: { items: Item[] }) {
  // 이미 애니메이션된 아이템 추적
  const animatedItems = useRef(new Set<string>()).current;

  const renderItem = useCallback(({ item, index }: { item: Item; index: number }) => {
    const shouldAnimate = !animatedItems.has(item.id);

    if (shouldAnimate) {
      animatedItems.add(item.id);
    }

    return (
      <Animated.View
        entering={shouldAnimate ? FadeInUp.delay(index * 30) : undefined}
        style={styles.item}
      >
        <Text>{item.title}</Text>
      </Animated.View>
    );
  }, []);

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
}
```

### Layout 애니메이션 활용

```typescript
import { LinearTransition } from 'react-native-reanimated';

function LayoutAnimatedList({ items }) {
  const renderItem = useCallback(({ item }) => (
    <Animated.View
      layout={LinearTransition.springify()}
      entering={FadeIn}
      exiting={FadeOut}
      style={styles.item}
    >
      <Text>{item.title}</Text>
    </Animated.View>
  ), []);

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
}
```

---

## 💻 아이템 삭제 애니메이션

### 기본 삭제

```typescript
function DeletableList() {
  const [items, setItems] = useState([
    { id: '1', title: 'Item 1' },
    { id: '2', title: 'Item 2' },
    { id: '3', title: 'Item 3' },
  ]);

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <ScrollView>
      {items.map((item) => (
        <Animated.View
          key={item.id}
          entering={FadeInRight}
          exiting={FadeOutLeft}
          layout={LinearTransition}
          style={styles.item}
        >
          <Text>{item.title}</Text>
          <Pressable onPress={() => deleteItem(item.id)}>
            <Text>Delete</Text>
          </Pressable>
        </Animated.View>
      ))}
    </ScrollView>
  );
}
```

### 슬라이드 아웃 삭제

```typescript
import { SlideOutRight, FadeOutRight } from 'react-native-reanimated';

function SlideDeleteList() {
  const [items, setItems] = useState([/* ... */]);

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <ScrollView>
      {items.map((item) => (
        <Animated.View
          key={item.id}
          entering={SlideInRight.duration(300)}
          exiting={SlideOutRight.duration(300)}
          layout={LinearTransition.springify().damping(15)}
          style={styles.item}
        >
          <Text>{item.title}</Text>
          <Pressable onPress={() => deleteItem(item.id)}>
            <Text>×</Text>
          </Pressable>
        </Animated.View>
      ))}
    </ScrollView>
  );
}
```

---

## 💻 스와이프 삭제 구현

### 완전한 스와이프 삭제 컴포넌트

```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  LinearTransition,
  FadeIn,
  FadeOut,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const SWIPE_THRESHOLD = -100;
const DELETE_WIDTH = 80;

interface SwipeableItemProps {
  item: Item;
  onDelete: (id: string) => void;
}

function SwipeableItem({ item, onDelete }: SwipeableItemProps) {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(70);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onUpdate((event) => {
      translateX.value = Math.min(0, event.translationX);
    })
    .onEnd((event) => {
      if (translateX.value < SWIPE_THRESHOLD) {
        // 삭제 확정
        translateX.value = withTiming(-500, { duration: 200 });
        itemHeight.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(onDelete)(item.id);
        });
      } else if (translateX.value < -DELETE_WIDTH / 2) {
        // 삭제 버튼 노출
        translateX.value = withSpring(-DELETE_WIDTH);
      } else {
        // 원위치
        translateX.value = withSpring(0);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    height: itemHeight.value,
    overflow: 'hidden',
  }));

  const deleteButtonStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-DELETE_WIDTH, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <Animated.View
      layout={LinearTransition}
      style={[styles.itemContainer, containerStyle]}
    >
      {/* 삭제 버튼 (뒤에 숨겨져 있음) */}
      <Animated.View style={[styles.deleteButton, deleteButtonStyle]}>
        <Pressable
          onPress={() => {
            translateX.value = withTiming(-500, { duration: 200 });
            itemHeight.value = withTiming(0, { duration: 200 }, () => {
              runOnJS(onDelete)(item.id);
            });
          }}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </Animated.View>

      {/* 메인 콘텐츠 */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.item, rowStyle]}>
          <Text>{item.title}</Text>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

function SwipeableList() {
  const [items, setItems] = useState([/* ... */]);

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <ScrollView>
      {items.map((item) => (
        <SwipeableItem
          key={item.id}
          item={item}
          onDelete={handleDelete}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    position: 'relative',
  },
  item: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_WIDTH,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
```

---

## 💻 새 아이템 추가 애니메이션

```typescript
function AddItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addItem = () => {
    if (!inputValue.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      title: inputValue,
    };

    setItems((prev) => [newItem, ...prev]); // 상단에 추가
    setInputValue('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Add item..."
          style={styles.input}
        />
        <Button title="Add" onPress={addItem} />
      </View>

      <ScrollView>
        {items.map((item, index) => (
          <Animated.View
            key={item.id}
            entering={SlideInLeft.duration(300).springify()}
            exiting={SlideOutRight.duration(300)}
            layout={LinearTransition}
            style={styles.item}
          >
            <Text>{item.title}</Text>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}
```

---

## 💻 체크리스트 애니메이션

```typescript
interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
}

function AnimatedTodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', title: 'Learn Reanimated', completed: false },
    { id: '2', title: 'Build an app', completed: false },
    { id: '3', title: 'Deploy', completed: false },
  ]);

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // 완료된 항목을 아래로 정렬
  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });
  }, [todos]);

  return (
    <ScrollView>
      {sortedTodos.map((todo) => (
        <Animated.View
          key={todo.id}
          layout={LinearTransition.springify().damping(15)}
          style={styles.todoItem}
        >
          <Pressable
            onPress={() => toggleTodo(todo.id)}
            style={styles.todoContent}
          >
            <AnimatedCheckbox checked={todo.completed} />
            <Animated.Text
              style={[
                styles.todoText,
                todo.completed && styles.completedText,
              ]}
            >
              {todo.title}
            </Animated.Text>
          </Pressable>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

function AnimatedCheckbox({ checked }: { checked: boolean }) {
  return (
    <View style={[styles.checkbox, checked && styles.checkedBox]}>
      {checked && (
        <Animated.Text
          entering={ZoomIn.duration(200)}
          exiting={ZoomOut.duration(200)}
          style={styles.checkmark}
        >
          ✓
        </Animated.Text>
      )}
    </View>
  );
}
```

---

## 💻 FlashList와 함께 사용

```typescript
import { FlashList } from '@shopify/flash-list';

function AnimatedFlashList({ items }: { items: Item[] }) {
  const animatedItems = useRef(new Set<string>()).current;

  const renderItem = useCallback(({ item, index }: { item: Item; index: number }) => {
    const isFirstRender = !animatedItems.has(item.id);

    if (isFirstRender) {
      animatedItems.add(item.id);
    }

    return (
      <Animated.View
        entering={isFirstRender ? FadeInUp.delay(Math.min(index * 30, 300)) : undefined}
        style={styles.item}
      >
        <Text>{item.title}</Text>
      </Animated.View>
    );
  }, []);

  return (
    <FlashList
      data={items}
      renderItem={renderItem}
      estimatedItemSize={70}
      keyExtractor={(item) => item.id}
    />
  );
}
```

---

## 📊 리스트 애니메이션 패턴 가이드

| 상황 | 추천 방법 |
|-----|----------|
| 소규모 리스트 (< 50) | ScrollView + map + entering |
| 대규모 리스트 | FlatList + 애니메이션 상태 추적 |
| 아이템 추가/삭제 | entering + exiting + layout |
| 순서 변경 | layout (LinearTransition) |
| 스와이프 삭제 | Gesture + 높이 애니메이션 |

---

## ⚠️ 흔한 실수와 해결법

### 1. 모든 스크롤에서 애니메이션 재실행

```typescript
// ❌ FlatList에서 스크롤할 때마다 entering 재실행
<Animated.View entering={FadeIn} />

// ✅ 첫 렌더만 애니메이션
const animated = useRef(new Set()).current;
const shouldAnimate = !animated.has(item.id);
if (shouldAnimate) animated.add(item.id);

<Animated.View entering={shouldAnimate ? FadeIn : undefined} />
```

### 2. key 변경으로 의도치 않은 애니메이션

```typescript
// ❌ key가 변경되면 리마운트 → entering 재실행
<Animated.View key={`${item.id}-${item.status}`} />

// ✅ 안정적인 key 사용
<Animated.View key={item.id} />
```

### 3. layout 없이 삭제

```typescript
// ❌ 삭제 후 나머지 아이템이 점프
<Animated.View exiting={FadeOut} />

// ✅ layout으로 부드럽게 이동
<Animated.View
  exiting={FadeOut}
  layout={LinearTransition}
/>
```

### 4. 스태거 지연 과다

```typescript
// ❌ 100개 아이템 × 100ms = 10초 대기
delay(index * 100)

// ✅ 최대 지연 제한
const delay = Math.min(index * 50, 500);
```

---

## 💡 성능 최적화 팁

### 1. 아이템 컴포넌트 메모이제이션

```typescript
const ListItem = React.memo(({ item, onDelete }) => (
  <Animated.View
    entering={FadeIn}
    exiting={FadeOut}
    layout={LinearTransition}
  >
    {/* ... */}
  </Animated.View>
));
```

### 2. 애니메이션 조건부 적용

```typescript
const shouldAnimate = items.length < 100; // 많은 아이템에서는 비활성화

<Animated.View
  entering={shouldAnimate ? FadeIn : undefined}
/>
```

### 3. getItemLayout 활용 (FlatList)

```typescript
<FlatList
  data={items}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

---

## 🎯 실무 적용: Sometimes 앱 사례

### 채팅 메시지 리스트

```typescript
// src/features/chat/ui/chat-list.tsx 참고
function ChatMessageList({ messages }) {
  return (
    <FlatList
      data={messages}
      inverted
      renderItem={({ item }) => (
        <Animated.View
          entering={SlideInUp.duration(200)}
          layout={LinearTransition}
          style={[
            styles.message,
            item.isMe ? styles.myMessage : styles.theirMessage,
          ]}
        >
          <MessageContent message={item} />
        </Animated.View>
      )}
    />
  );
}
```

### 알림 리스트

```typescript
// src/features/notification/ui/notification-list.tsx 참고
function NotificationList({ notifications, onDismiss }) {
  return (
    <ScrollView>
      {notifications.map((notification, index) => (
        <SwipeableNotification
          key={notification.id}
          notification={notification}
          onDismiss={() => onDismiss(notification.id)}
          entering={FadeInRight.delay(index * 50)}
        />
      ))}
    </ScrollView>
  );
}
```

---

## 🏋️ 연습 문제

### 연습 1: 스태거 리스트
10개의 아이템이 50ms 간격으로 순차적으로 등장하는 리스트를 구현하세요.

### 연습 2: 삭제 애니메이션
아이템을 탭하면 슬라이드 아웃되며 삭제되고, 나머지 아이템이 부드럽게 위로 이동하게 구현하세요.

### 연습 3: 스와이프 삭제
왼쪽으로 스와이프하면 삭제 버튼이 나타나고, 더 스와이프하면 삭제되는 리스트를 구현하세요.

<details>
<summary>힌트 보기</summary>

```typescript
const panGesture = Gesture.Pan()
  .onUpdate((e) => {
    translateX.value = Math.min(0, e.translationX);
  })
  .onEnd(() => {
    if (translateX.value < -100) {
      // 삭제
    } else if (translateX.value < -40) {
      // 버튼 노출
      translateX.value = withSpring(-80);
    } else {
      translateX.value = withSpring(0);
    }
  });
```

</details>

### 연습 4: 할 일 리스트
체크하면 완료 표시되고 아래로 이동하는 할 일 리스트를 구현하세요.

---

## 📚 요약

### 리스트 애니메이션 핵심

| 상황 | 해결책 |
|-----|--------|
| 등장 | entering + stagger delay |
| 삭제 | exiting + layout |
| 순서 변경 | layout (LinearTransition) |
| 스와이프 | Pan gesture + height animation |
| FlatList | 애니메이션 상태 추적 |

### 체크리스트

- [ ] ScrollView vs FlatList 선택
- [ ] 첫 렌더만 애니메이션 (FlatList)
- [ ] layout으로 밀림 효과
- [ ] 스태거 지연 제한 (최대 500ms)
- [ ] 아이템 메모이제이션

### 다음 장 예고

다음 장에서는 **실전: 모달과 바텀시트**를 구현합니다. Entering/Exiting, 제스처, 레이아웃 애니메이션을 모두 활용해 프로덕션 레벨의 모달과 바텀시트를 만들어봅니다.
