# Chapter 18: Layout 애니메이션 심화

## 📌 개요

컴포넌트의 위치나 크기가 변경될 때 자동으로 부드러운 애니메이션을 적용할 수 있습니다. Reanimated의 Layout Transition은 이러한 변화를 감지하고 자동으로 보간 애니메이션을 생성합니다. 이는 리스트 재정렬, 아코디언 펼치기, 그리드 변경 등에서 매우 유용합니다.

### 학습 목표

- Layout Transition 기본 사용법
- 내장 레이아웃 애니메이션 종류
- 리스트 아이템 재정렬 애니메이션
- 크기 변경 애니메이션
- 성능 최적화 기법

---

## 📖 Layout Transition이란?

### entering/exiting vs layout

| 속성 | 용도 | 트리거 |
|-----|------|--------|
| `entering` | 마운트 시 | 조건부 렌더링으로 나타날 때 |
| `exiting` | 언마운트 시 | 조건부 렌더링으로 사라질 때 |
| `layout` | 레이아웃 변경 시 | 위치/크기 변경될 때 |

### Layout이 변경되는 상황

1. 다른 요소 추가/삭제로 밀려남
2. flexbox 정렬 변경
3. 요소 크기 변경
4. 순서 변경 (재정렬)

---

## 💻 기본 사용법

### LinearTransition

```typescript
import Animated, { LinearTransition } from 'react-native-reanimated';

function LayoutExample() {
  const [items, setItems] = useState(['A', 'B', 'C']);

  const shuffleItems = () => {
    setItems([...items].sort(() => Math.random() - 0.5));
  };

  return (
    <View style={styles.container}>
      <Button title="Shuffle" onPress={shuffleItems} />

      {items.map((item) => (
        <Animated.View
          key={item}
          layout={LinearTransition}
          style={styles.item}
        >
          <Text>{item}</Text>
        </Animated.View>
      ))}
    </View>
  );
}
```

### 커스터마이징

```typescript
// 지속 시간 변경
layout={LinearTransition.duration(300)}

// 스프링으로 변경
layout={LinearTransition.springify()}

// 스프링 옵션
layout={LinearTransition.springify().damping(15).stiffness(100)}

// 지연
layout={LinearTransition.delay(100)}
```

---

## 📖 내장 Layout Transition

### LinearTransition

가장 기본적인 선형 보간 애니메이션입니다.

```typescript
import { LinearTransition } from 'react-native-reanimated';

<Animated.View layout={LinearTransition.duration(300)} />

// 스프링으로
<Animated.View layout={LinearTransition.springify()} />
```

### SequencedTransition

순차적으로 X → Y 또는 Y → X 순서로 이동합니다.

```typescript
import { SequencedTransition } from 'react-native-reanimated';

// 기본 (X 먼저, Y 나중)
<Animated.View layout={SequencedTransition} />

// 역순 (Y 먼저, X 나중)
<Animated.View layout={SequencedTransition.reverse()} />
```

### FadingTransition

페이드 아웃 → 이동 → 페이드 인 효과입니다.

```typescript
import { FadingTransition } from 'react-native-reanimated';

<Animated.View layout={FadingTransition.duration(500)} />
```

### JumpingTransition

점프하며 이동하는 효과입니다.

```typescript
import { JumpingTransition } from 'react-native-reanimated';

<Animated.View layout={JumpingTransition} />
```

### CurvedTransition

곡선 경로를 따라 이동합니다.

```typescript
import { CurvedTransition } from 'react-native-reanimated';

// 기본 곡선
<Animated.View layout={CurvedTransition} />

// 커스텀 이징
<Animated.View layout={CurvedTransition.easingX(Easing.ease)} />
<Animated.View layout={CurvedTransition.easingY(Easing.bounce)} />
```

### EntryExitTransition

entering/exiting 애니메이션을 layout에 적용합니다.

```typescript
import {
  EntryExitTransition,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

<Animated.View
  layout={EntryExitTransition
    .entering(FadeIn.duration(300))
    .exiting(FadeOut.duration(300))
  }
/>
```

---

## 💻 리스트 재정렬 애니메이션

### 기본 예제

```typescript
function ReorderableList() {
  const [items, setItems] = useState([
    { id: '1', title: 'First' },
    { id: '2', title: 'Second' },
    { id: '3', title: 'Third' },
    { id: '4', title: 'Fourth' },
  ]);

  const moveToTop = (id: string) => {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index === -1) return prev;

      const newItems = [...prev];
      const [removed] = newItems.splice(index, 1);
      newItems.unshift(removed);
      return newItems;
    });
  };

  return (
    <ScrollView>
      {items.map((item) => (
        <Animated.View
          key={item.id}
          layout={LinearTransition.springify().damping(15)}
          style={styles.listItem}
        >
          <Text>{item.title}</Text>
          <Button title="Move to Top" onPress={() => moveToTop(item.id)} />
        </Animated.View>
      ))}
    </ScrollView>
  );
}
```

### 필터링된 리스트

```typescript
function FilterableList() {
  const [items] = useState([
    { id: '1', title: 'Apple', category: 'fruit' },
    { id: '2', title: 'Banana', category: 'fruit' },
    { id: '3', title: 'Carrot', category: 'vegetable' },
    { id: '4', title: 'Date', category: 'fruit' },
  ]);
  const [filter, setFilter] = useState<string | null>(null);

  const filteredItems = filter
    ? items.filter((item) => item.category === filter)
    : items;

  return (
    <View>
      <View style={styles.filters}>
        <Button title="All" onPress={() => setFilter(null)} />
        <Button title="Fruits" onPress={() => setFilter('fruit')} />
        <Button title="Vegetables" onPress={() => setFilter('vegetable')} />
      </View>

      {filteredItems.map((item) => (
        <Animated.View
          key={item.id}
          layout={LinearTransition.springify()}
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.listItem}
        >
          <Text>{item.title}</Text>
        </Animated.View>
      ))}
    </View>
  );
}
```

---

## 💻 크기 변경 애니메이션

### 아코디언 펼치기

```typescript
function Accordion({ title, children }: AccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(15)}
      style={styles.accordion}
    >
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.header}
      >
        <Text style={styles.title}>{title}</Text>
        <Animated.View
          style={{
            transform: [{ rotate: isExpanded ? '90deg' : '0deg' }],
          }}
        >
          <Text>›</Text>
        </Animated.View>
      </Pressable>

      {isExpanded && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.content}
        >
          {children}
        </Animated.View>
      )}
    </Animated.View>
  );
}

function AccordionList() {
  return (
    <View>
      <Accordion title="Section 1">
        <Text>Content 1</Text>
      </Accordion>
      <Animated.View layout={LinearTransition}>
        <Accordion title="Section 2">
          <Text>Content 2</Text>
        </Accordion>
      </Animated.View>
      <Animated.View layout={LinearTransition}>
        <Accordion title="Section 3">
          <Text>Content 3</Text>
        </Accordion>
      </Animated.View>
    </View>
  );
}
```

### 동적 높이 컨텐츠

```typescript
function ExpandableCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Animated.View
      layout={LinearTransition.springify()}
      style={styles.card}
    >
      <Text style={styles.title}>Card Title</Text>
      <Text numberOfLines={isExpanded ? undefined : 2}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        Ut enim ad minim veniam, quis nostrud exercitation ullamco.
      </Text>
      <Button
        title={isExpanded ? 'Show Less' : 'Show More'}
        onPress={() => setIsExpanded(!isExpanded)}
      />
    </Animated.View>
  );
}
```

---

## 💻 그리드 레이아웃 애니메이션

### 열 수 변경

```typescript
function DynamicGrid() {
  const [columns, setColumns] = useState(2);
  const [items] = useState([1, 2, 3, 4, 5, 6, 7, 8]);

  return (
    <View>
      <View style={styles.controls}>
        <Button title="2 Columns" onPress={() => setColumns(2)} />
        <Button title="3 Columns" onPress={() => setColumns(3)} />
        <Button title="4 Columns" onPress={() => setColumns(4)} />
      </View>

      <View style={[styles.grid, { flexWrap: 'wrap' }]}>
        {items.map((item) => (
          <Animated.View
            key={item}
            layout={LinearTransition.springify().damping(15)}
            style={[
              styles.gridItem,
              { width: `${100 / columns}%` },
            ]}
          >
            <Text>{item}</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
```

---

## 💻 결합 예제: 할 일 리스트

```typescript
interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', title: 'Learn Reanimated', completed: false },
    { id: '2', title: 'Build an app', completed: false },
    { id: '3', title: 'Deploy to store', completed: false },
  ]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  // 완료된 항목을 아래로 정렬
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <FilterButton title="All" active={filter === 'all'} onPress={() => setFilter('all')} />
        <FilterButton title="Active" active={filter === 'active'} onPress={() => setFilter('active')} />
        <FilterButton title="Done" active={filter === 'completed'} onPress={() => setFilter('completed')} />
      </View>

      {sortedTodos.map((todo) => (
        <Animated.View
          key={todo.id}
          layout={LinearTransition.springify().damping(15)}
          entering={FadeInRight.duration(300)}
          exiting={FadeOutLeft.duration(300)}
          style={[
            styles.todoItem,
            todo.completed && styles.completedItem,
          ]}
        >
          <Pressable
            onPress={() => toggleTodo(todo.id)}
            style={styles.checkbox}
          >
            {todo.completed && <Text>✓</Text>}
          </Pressable>
          <Text
            style={[
              styles.todoText,
              todo.completed && styles.completedText,
            ]}
          >
            {todo.title}
          </Text>
          <Pressable onPress={() => deleteTodo(todo.id)}>
            <Text>×</Text>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}
```

---

## 📊 Layout Transition 비교

| Transition | 효과 | 사용 사례 |
|------------|------|----------|
| `LinearTransition` | 직선 이동 | 일반적인 재정렬 |
| `SequencedTransition` | X→Y 순차 이동 | 그리드 재정렬 |
| `FadingTransition` | 페이드 아웃→이동→페이드 인 | 카드 전환 |
| `JumpingTransition` | 점프하며 이동 | 게임 UI |
| `CurvedTransition` | 곡선 경로 | 부드러운 전환 |

---

## ⚠️ 흔한 실수와 해결법

### 1. key 누락

```typescript
// ❌ key 없으면 layout 애니메이션 오작동
{items.map((item) => (
  <Animated.View layout={LinearTransition}>
    {item.title}
  </Animated.View>
))}

// ✅ 고유 key 필수
{items.map((item) => (
  <Animated.View key={item.id} layout={LinearTransition}>
    {item.title}
  </Animated.View>
))}
```

### 2. FlashList/FlatList와 충돌

```typescript
// ❌ FlatList 내부에서 layout 사용 시 문제
<FlatList
  data={items}
  renderItem={({ item }) => (
    <Animated.View layout={LinearTransition} />
  )}
/>

// ✅ 스크롤이 없거나 적은 아이템일 때만 사용
// 또는 ScrollView + map 조합
<ScrollView>
  {items.map((item) => (
    <Animated.View key={item.id} layout={LinearTransition} />
  ))}
</ScrollView>
```

### 3. position: absolute와 충돌

```typescript
// ❌ absolute 포지션은 layout 감지 안 됨
<Animated.View
  layout={LinearTransition}
  style={{ position: 'absolute', top: 100 }}
/>

// ✅ relative 포지션 사용
<Animated.View
  layout={LinearTransition}
  style={{ position: 'relative' }}
/>
```

### 4. 부모 컴포넌트 layout 누락

```typescript
// ❌ 자식만 layout 있으면 부모 크기 변경 시 점프
<View>
  <Animated.View layout={LinearTransition} />
</View>

// ✅ 부모에도 layout 적용
<Animated.View layout={LinearTransition}>
  <Animated.View layout={LinearTransition} />
</Animated.View>
```

---

## 💡 성능 최적화 팁

### 1. 많은 아이템에서 주의

```typescript
// ✅ 화면에 보이는 아이템만 layout 적용
const visibleItems = items.slice(0, 20);

{visibleItems.map((item) => (
  <Animated.View key={item.id} layout={LinearTransition} />
))}
```

### 2. Transition 메모이제이션

```typescript
const layoutTransition = useMemo(() =>
  LinearTransition.springify().damping(15),
  []
);

<Animated.View layout={layoutTransition} />
```

### 3. 불필요한 리렌더 방지

```typescript
// ✅ React.memo로 아이템 메모이제이션
const ListItem = React.memo(({ item }) => (
  <Animated.View layout={LinearTransition}>
    <Text>{item.title}</Text>
  </Animated.View>
));
```

---

## 🎯 실무 적용: Sometimes 앱 사례

### 채팅 메시지 정렬

```typescript
// src/features/chat/ui/chat-list.tsx 참고
function ChatMessageList({ messages }) {
  return (
    <ScrollView>
      {messages.map((message) => (
        <Animated.View
          key={message.id}
          layout={LinearTransition.springify()}
          entering={FadeInDown.duration(300)}
          style={[
            styles.message,
            message.isMe ? styles.myMessage : styles.theirMessage,
          ]}
        >
          <Text>{message.text}</Text>
        </Animated.View>
      ))}
    </ScrollView>
  );
}
```

### 프로필 섹션 펼치기

```typescript
// src/features/profile/ui/profile-sections.tsx 참고
function ProfileSections() {
  return (
    <View>
      <Animated.View layout={LinearTransition}>
        <ExpandableSection title="About Me" />
      </Animated.View>
      <Animated.View layout={LinearTransition}>
        <ExpandableSection title="Interests" />
      </Animated.View>
      <Animated.View layout={LinearTransition}>
        <ExpandableSection title="Photos" />
      </Animated.View>
    </View>
  );
}
```

---

## 🏋️ 연습 문제

### 연습 1: 기본 재정렬
3개의 박스를 가진 리스트를 만들고, 클릭하면 맨 위로 이동하게 구현하세요.

### 연습 2: 필터 리스트
카테고리별로 필터링 가능한 리스트를 만들고, 필터 변경 시 부드럽게 전환되게 하세요.

### 연습 3: 아코디언
여러 섹션이 있고, 한 섹션을 펼치면 다른 섹션들이 밀려나는 아코디언을 구현하세요.

<details>
<summary>힌트 보기</summary>

```typescript
// 각 아코디언 항목에 layout 적용
<Animated.View layout={LinearTransition}>
  <AccordionItem />
</Animated.View>
```

</details>

### 연습 4: 그리드 변경
2열/3열/4열로 전환 가능한 그리드를 만들고, 열 수 변경 시 애니메이션되게 하세요.

---

## 📚 요약

### 핵심 개념

| 개념 | 설명 |
|-----|------|
| layout | 위치/크기 변경 시 자동 애니메이션 |
| LinearTransition | 기본 선형 이동 |
| SequencedTransition | X→Y 순차 이동 |
| FadingTransition | 페이드 효과 포함 |
| springify() | 스프링 물리 적용 |

### Layout 애니메이션 체크리스트

- [ ] 고유 key 제공
- [ ] 부모 컴포넌트에도 layout 적용
- [ ] FlatList 대신 ScrollView + map 사용
- [ ] position: absolute 피하기
- [ ] 많은 아이템에서 성능 주의

### 다음 장 예고

다음 장에서는 **커스텀 레이아웃 트랜지션**을 배웁니다. 내장 트랜지션으로 충분하지 않을 때, worklet을 사용해 완전히 커스텀한 레이아웃 애니메이션을 만드는 방법을 다룹니다.
