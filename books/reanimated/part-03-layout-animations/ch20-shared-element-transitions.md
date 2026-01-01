# Chapter 20: 공유 엘리먼트 트랜지션

## 📌 개요

공유 엘리먼트 트랜지션(Shared Element Transition)은 화면 전환 시 동일한 요소가 한 화면에서 다른 화면으로 자연스럽게 이동하는 애니메이션입니다. 리스트에서 상세 화면으로 이동할 때 이미지가 확대되며 이동하는 효과가 대표적입니다.

### 학습 목표

- Shared Element Transition 개념 이해
- sharedTransitionTag 사용법
- 리스트 → 상세 화면 전환 구현
- 커스텀 공유 트랜지션 정의
- Expo Router와의 통합

---

## 📖 공유 엘리먼트란?

### 개념

두 화면에 동일한 요소(이미지, 카드 등)가 있을 때, 화면 전환 시 그 요소가 부드럽게 이동/변형되는 효과입니다.

```
┌─────────────┐         ┌─────────────┐
│   List      │         │   Detail    │
│             │         │             │
│ ┌───┐       │ ──────> │ ┌─────────┐ │
│ │img│       │         │ │         │ │
│ └───┘ Title │         │ │   img   │ │
│             │         │ │         │ │
│ ┌───┐       │         │ └─────────┘ │
│ │img│       │         │   Title     │
│ └───┘ Title │         │   Content   │
└─────────────┘         └─────────────┘
```

### 사용 사례

- 갤러리 이미지 → 전체 화면 보기
- 카드 리스트 → 상세 페이지
- 아바타 → 프로필 화면
- 상품 썸네일 → 상품 상세

---

## 💻 기본 사용법

### sharedTransitionTag

```typescript
import Animated from 'react-native-reanimated';

// 리스트 화면
function ListScreen() {
  return (
    <View>
      {items.map((item) => (
        <Pressable key={item.id} onPress={() => navigate('Detail', { id: item.id })}>
          <Animated.Image
            sharedTransitionTag={`image-${item.id}`}
            source={{ uri: item.imageUrl }}
            style={styles.thumbnail}
          />
        </Pressable>
      ))}
    </View>
  );
}

// 상세 화면
function DetailScreen({ route }) {
  const { id } = route.params;
  const item = getItemById(id);

  return (
    <View>
      <Animated.Image
        sharedTransitionTag={`image-${id}`}
        source={{ uri: item.imageUrl }}
        style={styles.fullImage}
      />
      <Text>{item.title}</Text>
    </View>
  );
}
```

### 핵심 규칙

1. **동일한 tag**: 두 화면의 요소가 같은 `sharedTransitionTag`를 가져야 함
2. **고유한 tag**: 각 공유 요소는 앱 전체에서 고유한 tag 필요
3. **Animated 컴포넌트**: `Animated.View`, `Animated.Image` 등 사용 필수

---

## 💻 Expo Router와 통합

### 네비게이션 설정

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        // 공유 트랜지션 활성화
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="detail/[id]"
        options={{
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
```

### 리스트 화면

```typescript
// app/index.tsx
import { Link } from 'expo-router';
import Animated from 'react-native-reanimated';

const ITEMS = [
  { id: '1', title: 'Mountain', image: 'https://example.com/mountain.jpg' },
  { id: '2', title: 'Ocean', image: 'https://example.com/ocean.jpg' },
  { id: '3', title: 'Forest', image: 'https://example.com/forest.jpg' },
];

export default function ListScreen() {
  return (
    <ScrollView style={styles.container}>
      {ITEMS.map((item) => (
        <Link
          key={item.id}
          href={`/detail/${item.id}`}
          asChild
        >
          <Pressable style={styles.card}>
            <Animated.Image
              sharedTransitionTag={`photo-${item.id}`}
              source={{ uri: item.image }}
              style={styles.thumbnail}
            />
            <Animated.Text
              sharedTransitionTag={`title-${item.id}`}
              style={styles.title}
            >
              {item.title}
            </Animated.Text>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 200,
  },
  title: {
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
  },
});
```

### 상세 화면

```typescript
// app/detail/[id].tsx
import { useLocalSearchParams, router } from 'expo-router';
import Animated from 'react-native-reanimated';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = ITEMS.find((i) => i.id === id);

  if (!item) return null;

  return (
    <View style={styles.container}>
      <Animated.Image
        sharedTransitionTag={`photo-${id}`}
        source={{ uri: item.image }}
        style={styles.fullImage}
      />
      <View style={styles.content}>
        <Animated.Text
          sharedTransitionTag={`title-${id}`}
          style={styles.title}
        >
          {item.title}
        </Animated.Text>
        <Text style={styles.description}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  fullImage: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
});
```

---

## 💻 커스텀 공유 트랜지션

### SharedTransition 클래스

```typescript
import { SharedTransition } from 'react-native-reanimated';

// 커스텀 트랜지션 정의
const customTransition = SharedTransition.custom((values) => {
  'worklet';

  return {
    originX: withSpring(values.targetOriginX, { damping: 15 }),
    originY: withSpring(values.targetOriginY, { damping: 15 }),
    width: withSpring(values.targetWidth, { damping: 15 }),
    height: withSpring(values.targetHeight, { damping: 15 }),
  };
});

// 사용
<Animated.Image
  sharedTransitionTag="my-image"
  sharedTransitionStyle={customTransition}
/>
```

### 내장 트랜지션 스타일

```typescript
import { SharedTransition } from 'react-native-reanimated';

// 스프링 트랜지션
const springTransition = SharedTransition.duration(500).defaultTransitionType('spring');

// 타이밍 트랜지션
const timingTransition = SharedTransition.duration(300).defaultTransitionType('timing');

// 프로그레시브 트랜지션 (점진적)
const progressiveTransition = SharedTransition.progressiveTransition();
```

### 스프링 옵션 설정

```typescript
const bouncyTransition = SharedTransition.custom((values) => {
  'worklet';

  const springConfig = {
    damping: 10,
    stiffness: 200,
    mass: 0.5,
  };

  return {
    originX: withSpring(values.targetOriginX, springConfig),
    originY: withSpring(values.targetOriginY, springConfig),
    width: withSpring(values.targetWidth, springConfig),
    height: withSpring(values.targetHeight, springConfig),
  };
});
```

---

## 💻 여러 요소 공유

### 카드 전체 공유

```typescript
function ListItem({ item }) {
  return (
    <Pressable onPress={() => navigate('Detail', { id: item.id })}>
      <Animated.View
        sharedTransitionTag={`card-${item.id}`}
        style={styles.card}
      >
        <Animated.Image
          sharedTransitionTag={`image-${item.id}`}
          source={{ uri: item.image }}
          style={styles.image}
        />
        <Animated.Text
          sharedTransitionTag={`title-${item.id}`}
          style={styles.title}
        >
          {item.title}
        </Animated.Text>
        <Animated.Text
          sharedTransitionTag={`subtitle-${item.id}`}
          style={styles.subtitle}
        >
          {item.subtitle}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

function DetailScreen({ route }) {
  const { id } = route.params;
  const item = getItemById(id);

  return (
    <Animated.View
      sharedTransitionTag={`card-${id}`}
      style={styles.detailCard}
    >
      <Animated.Image
        sharedTransitionTag={`image-${id}`}
        source={{ uri: item.image }}
        style={styles.detailImage}
      />
      <Animated.Text
        sharedTransitionTag={`title-${id}`}
        style={styles.detailTitle}
      >
        {item.title}
      </Animated.Text>
      <Animated.Text
        sharedTransitionTag={`subtitle-${id}`}
        style={styles.detailSubtitle}
      >
        {item.subtitle}
      </Animated.Text>
      {/* 추가 콘텐츠 */}
      <Text style={styles.description}>{item.description}</Text>
    </Animated.View>
  );
}
```

---

## 💻 실전: 갤러리 뷰어

### 그리드 갤러리

```typescript
function Gallery({ images }: { images: Image[] }) {
  return (
    <View style={styles.grid}>
      {images.map((image, index) => (
        <Link
          key={image.id}
          href={`/viewer/${image.id}`}
          asChild
        >
          <Pressable style={styles.gridItem}>
            <Animated.Image
              sharedTransitionTag={`gallery-image-${image.id}`}
              source={{ uri: image.url }}
              style={styles.gridImage}
              resizeMode="cover"
            />
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 2,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
});
```

### 전체 화면 뷰어

```typescript
function ImageViewer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const image = getImageById(id);

  return (
    <View style={styles.container}>
      <Animated.Image
        sharedTransitionTag={`gallery-image-${id}`}
        source={{ uri: image.url }}
        style={styles.fullImage}
        resizeMode="contain"
      />

      {/* 닫기 버튼 */}
      <Animated.View
        entering={FadeIn.delay(300)}
        style={styles.closeButton}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </Animated.View>

      {/* 이미지 정보 */}
      <Animated.View
        entering={FadeInUp.delay(300)}
        style={styles.infoOverlay}
      >
        <Text style={styles.infoTitle}>{image.title}</Text>
        <Text style={styles.infoDate}>{image.date}</Text>
      </Animated.View>
    </View>
  );
}
```

---

## 💻 실전: 프로필 카드 확장

```typescript
function ProfileCard({ user }: { user: User }) {
  return (
    <Link href={`/profile/${user.id}`} asChild>
      <Pressable style={styles.card}>
        <Animated.View
          sharedTransitionTag={`profile-card-${user.id}`}
          style={styles.cardContent}
        >
          <Animated.Image
            sharedTransitionTag={`avatar-${user.id}`}
            source={{ uri: user.avatar }}
            style={styles.avatar}
          />
          <View style={styles.info}>
            <Animated.Text
              sharedTransitionTag={`name-${user.id}`}
              style={styles.name}
            >
              {user.name}
            </Animated.Text>
            <Text style={styles.status}>{user.status}</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Link>
  );
}

function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = getUserById(id);

  return (
    <ScrollView style={styles.container}>
      <Animated.View
        sharedTransitionTag={`profile-card-${id}`}
        style={styles.header}
      >
        <Animated.Image
          sharedTransitionTag={`avatar-${id}`}
          source={{ uri: user.avatar }}
          style={styles.largeAvatar}
        />
        <Animated.Text
          sharedTransitionTag={`name-${id}`}
          style={styles.largeName}
        >
          {user.name}
        </Animated.Text>
      </Animated.View>

      {/* 추가 정보 (페이드인) */}
      <Animated.View entering={FadeInUp.delay(200)}>
        <Text style={styles.bio}>{user.bio}</Text>
        <View style={styles.stats}>
          <StatItem label="Posts" value={user.posts} />
          <StatItem label="Followers" value={user.followers} />
          <StatItem label="Following" value={user.following} />
        </View>
      </Animated.View>
    </ScrollView>
  );
}
```

---

## 📊 sharedTransitionStyle 옵션

| 옵션 | 설명 |
|-----|------|
| `SharedTransition.duration()` | 지속 시간 설정 |
| `SharedTransition.delay()` | 시작 지연 |
| `.defaultTransitionType('spring')` | 스프링 애니메이션 |
| `.defaultTransitionType('timing')` | 타이밍 애니메이션 |
| `.progressiveTransition()` | 점진적 트랜지션 |
| `.custom()` | 커스텀 애니메이션 정의 |

---

## ⚠️ 흔한 실수와 해결법

### 1. tag 불일치

```typescript
// ❌ 리스트와 상세에서 다른 tag
// ListScreen
<Animated.Image sharedTransitionTag={`image-${id}`} />

// DetailScreen
<Animated.Image sharedTransitionTag={`photo-${id}`} />  // 다름!

// ✅ 동일한 tag 사용
<Animated.Image sharedTransitionTag={`image-${id}`} />
```

### 2. 일반 컴포넌트 사용

```typescript
// ❌ Image는 공유 트랜지션 불가
<Image sharedTransitionTag="my-image" />

// ✅ Animated.Image 사용
<Animated.Image sharedTransitionTag="my-image" />
```

### 3. 중복 tag

```typescript
// ❌ 같은 화면에서 동일 tag (한 화면에 하나만)
<Animated.Image sharedTransitionTag="image" />
<Animated.Image sharedTransitionTag="image" />

// ✅ 고유한 tag
<Animated.Image sharedTransitionTag={`image-${item1.id}`} />
<Animated.Image sharedTransitionTag={`image-${item2.id}`} />
```

### 4. 레이아웃 불일치

```typescript
// ❌ 시작과 끝 레이아웃이 너무 다르면 이상하게 보임
// ListScreen: width 100, height 100
// DetailScreen: width 100%, height 50%

// ✅ 비율 유지 또는 자연스러운 변형
// aspectRatio 사용
style={{ aspectRatio: 1 }}
```

---

## 💡 성능 최적화 팁

### 1. 이미지 최적화

```typescript
// 썸네일과 원본 분리
<Animated.Image
  sharedTransitionTag={`image-${id}`}
  source={{ uri: isDetail ? item.fullImage : item.thumbnail }}
/>
```

### 2. 불필요한 공유 요소 제한

```typescript
// 핵심 요소만 공유 (1-3개 권장)
// 이미지 + 제목 정도
```

### 3. 트랜지션 도중 무거운 렌더링 피하기

```typescript
// 트랜지션 후 데이터 로드
const [isTransitionComplete, setTransitionComplete] = useState(false);

<Animated.Image
  sharedTransitionTag={`image-${id}`}
  onTransitionEnd={() => setTransitionComplete(true)}
/>

{isTransitionComplete && <HeavyComponent />}
```

---

## 🎯 실무 적용: Sometimes 앱 사례

### 매칭 카드 → 프로필 상세

```typescript
// src/features/matching/ui/matching-card.tsx 참고
function MatchingCard({ profile }) {
  return (
    <Animated.View sharedTransitionTag={`profile-${profile.id}`}>
      <Animated.Image
        sharedTransitionTag={`photo-${profile.id}`}
        source={{ uri: profile.mainPhoto }}
      />
      <Animated.Text sharedTransitionTag={`name-${profile.id}`}>
        {profile.name}, {profile.age}
      </Animated.Text>
    </Animated.View>
  );
}

// src/features/profile/ui/profile-detail.tsx
function ProfileDetail({ profile }) {
  return (
    <Animated.ScrollView>
      <Animated.Image
        sharedTransitionTag={`photo-${profile.id}`}
        source={{ uri: profile.mainPhoto }}
      />
      <Animated.Text sharedTransitionTag={`name-${profile.id}`}>
        {profile.name}, {profile.age}
      </Animated.Text>
      {/* 추가 정보 */}
    </Animated.ScrollView>
  );
}
```

---

## 🏋️ 연습 문제

### 연습 1: 기본 공유 이미지
리스트에서 상세 화면으로 이동할 때 이미지가 확대되는 트랜지션을 구현하세요.

### 연습 2: 다중 요소 공유
이미지, 제목, 부제목이 모두 공유되는 카드 트랜지션을 구현하세요.

### 연습 3: 커스텀 트랜지션
더 바운시한 스프링 효과를 가진 커스텀 SharedTransition을 만드세요.

<details>
<summary>힌트 보기</summary>

```typescript
const bouncyTransition = SharedTransition.custom((values) => {
  'worklet';
  return {
    originX: withSpring(values.targetOriginX, { damping: 8 }),
    originY: withSpring(values.targetOriginY, { damping: 8 }),
    width: withSpring(values.targetWidth, { damping: 8 }),
    height: withSpring(values.targetHeight, { damping: 8 }),
  };
});
```

</details>

### 연습 4: 갤러리 그리드
3열 그리드 갤러리에서 이미지를 탭하면 전체 화면으로 확대되는 뷰어를 구현하세요.

---

## 📚 요약

### 핵심 개념

| 개념 | 설명 |
|-----|------|
| sharedTransitionTag | 공유 요소 식별자 (고유해야 함) |
| sharedTransitionStyle | 트랜지션 스타일 설정 |
| SharedTransition | 커스텀 트랜지션 정의 |

### 공유 트랜지션 체크리스트

- [ ] 양쪽 화면에서 동일한 tag 사용
- [ ] Animated 컴포넌트 사용
- [ ] 앱 전체에서 고유한 tag
- [ ] 핵심 요소만 공유 (1-3개)
- [ ] 레이아웃 비율 고려

### 다음 장 예고

다음 장에서는 **키프레임 애니메이션**을 더 깊이 다룹니다. 복잡한 다단계 애니메이션을 Keyframe 클래스로 정의하고, 다양한 UX 패턴에 적용하는 방법을 배웁니다.
