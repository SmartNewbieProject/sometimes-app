# Chapter 28: 패럴랙스 스크롤

패럴랙스는 서로 다른 속도로 움직이는 레이어를 통해 깊이감을 만듭니다. 모바일 앱에 시각적 몰입감을 더하는 효과를 구현합니다.

---

## 📌 학습 목표

- 패럴랙스 기본 원리 이해
- 다층 배경 패럴랙스 구현
- 수평 패럴랙스 카드
- 카드 스택 효과
- 3D 원근감 표현

---

## 📖 패럴랙스 원리

### 속도 차이로 깊이 표현

```
스크롤 방향 ↓
                   속도
┌─────────────┐
│  먼 배경    │   0.2x (느림)
├─────────────┤
│  중간 레이어 │   0.5x
├─────────────┤
│  콘텐츠     │   1.0x (기준)
├─────────────┤
│  전경 요소  │   1.5x (빠름)
└─────────────┘
```

### 패럴랙스 계산 공식

```tsx
// 기본 공식
translateY = scrollY * (1 - speed)

// speed: 레이어 속도 비율
// 0.0 = 고정 (움직이지 않음)
// 0.5 = 스크롤의 절반 속도
// 1.0 = 스크롤과 동일 (패럴랙스 없음)
// 1.5 = 스크롤보다 빠름 (전경)
```

---

## 💻 기본 수직 패럴랙스

### 배경 이미지 패럴랙스

```tsx
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HEADER_HEIGHT = 300;
const PARALLAX_SPEED = 0.5;

export default function BasicParallax() {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // 배경 이미지 패럴랙스
  const backgroundStyle = useAnimatedStyle(() => {
    // 배경은 스크롤의 절반 속도로 움직임
    const translateY = scrollY.value * PARALLAX_SPEED;

    return {
      transform: [{ translateY }],
    };
  });

  // 타이틀 페이드 아웃
  const titleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT * 0.5],
      [1, 0]
    );

    const translateY = scrollY.value * 0.3;

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View style={styles.container}>
      {/* 패럴랙스 배경 */}
      <Animated.View style={[styles.backgroundContainer, backgroundStyle]}>
        <Image
          source={{ uri: 'https://picsum.photos/800/600' }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
      </Animated.View>

      {/* 헤더 타이틀 */}
      <Animated.View style={[styles.titleContainer, titleStyle]}>
        <Text style={styles.title}>패럴랙스 스크롤</Text>
        <Text style={styles.subtitle}>깊이감 있는 스크롤 경험</Text>
      </Animated.View>

      {/* 스크롤 콘텐츠 */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 헤더 공간 */}
        <View style={{ height: HEADER_HEIGHT }} />

        {/* 콘텐츠 카드들 */}
        <View style={styles.content}>
          {Array.from({ length: 20 }).map((_, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>카드 {index + 1}</Text>
              <Text style={styles.cardDesc}>
                패럴랙스 효과로 배경이 천천히 움직입니다.
              </Text>
            </View>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundContainer: {
    position: 'absolute',
    top: -50, // 패럴랙스 여유 공간
    left: 0,
    right: 0,
    height: HEADER_HEIGHT + 150,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  titleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  scrollContent: {
    minHeight: SCREEN_HEIGHT + 500,
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    minHeight: SCREEN_HEIGHT,
  },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
```

---

## 💻 다층 패럴랙스 배경

### 여러 레이어가 다른 속도로 이동

```tsx
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ParallaxLayer {
  image: string;
  speed: number; // 0~1, 작을수록 느림 (멀리 있음)
  opacity: number;
  zIndex: number;
}

const LAYERS: ParallaxLayer[] = [
  {
    image: 'https://picsum.photos/800/600?sky',
    speed: 0.1, // 가장 먼 배경 (하늘)
    opacity: 1,
    zIndex: 1,
  },
  {
    image: 'https://picsum.photos/800/600?mountains',
    speed: 0.3, // 산
    opacity: 0.9,
    zIndex: 2,
  },
  {
    image: 'https://picsum.photos/800/600?trees',
    speed: 0.5, // 나무
    opacity: 0.8,
    zIndex: 3,
  },
  {
    image: 'https://picsum.photos/800/600?grass',
    speed: 0.7, // 풀밭
    opacity: 0.7,
    zIndex: 4,
  },
];

export default function MultiLayerParallax() {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <View style={styles.container}>
      {/* 패럴랙스 레이어들 */}
      {LAYERS.map((layer, index) => (
        <ParallaxLayerView
          key={index}
          layer={layer}
          scrollY={scrollY}
        />
      ))}

      {/* 스크롤 콘텐츠 */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={{ height: 400 }} />

        <View style={styles.content}>
          <Text style={styles.title}>다층 패럴랙스</Text>
          <Text style={styles.description}>
            여러 레이어가 각기 다른 속도로 움직여
            자연스러운 깊이감을 만듭니다.
          </Text>

          {Array.from({ length: 15 }).map((_, i) => (
            <View key={i} style={styles.card}>
              <Text>콘텐츠 {i + 1}</Text>
            </View>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

function ParallaxLayerView({
  layer,
  scrollY,
}: {
  layer: ParallaxLayer;
  scrollY: Animated.SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const translateY = scrollY.value * layer.speed;

    return {
      transform: [{ translateY }],
      opacity: layer.opacity,
      zIndex: layer.zIndex,
    };
  });

  return (
    <Animated.View style={[styles.layer, style]}>
      <Image
        source={{ uri: layer.image }}
        style={styles.layerImage}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  layer: {
    position: 'absolute',
    top: -100,
    left: 0,
    right: 0,
    height: 500,
  },
  layerImage: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    minHeight: SCREEN_HEIGHT * 2,
  },
  content: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: SCREEN_HEIGHT,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  card: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    marginBottom: 12,
  },
});
```

---

## 💻 수평 패럴랙스 카드

### 수평 스크롤에서의 패럴랙스

```tsx
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_HEIGHT = 400;
const CARD_SPACING = 16;
const IMAGE_OVERFLOW = 50; // 이미지가 카드보다 큰 정도

const CARDS = [
  { id: '1', title: '파리', image: 'https://picsum.photos/600/800?paris' },
  { id: '2', title: '도쿄', image: 'https://picsum.photos/600/800?tokyo' },
  { id: '3', title: '뉴욕', image: 'https://picsum.photos/600/800?newyork' },
  { id: '4', title: '런던', image: 'https://picsum.photos/600/800?london' },
  { id: '5', title: '시드니', image: 'https://picsum.photos/600/800?sydney' },
];

export default function HorizontalParallaxCards() {
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>여행지 둘러보기</Text>

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
          <ParallaxCard
            key={card.id}
            card={card}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

function ParallaxCard({
  card,
  index,
  scrollX,
}: {
  card: { id: string; title: string; image: string };
  index: number;
  scrollX: Animated.SharedValue<number>;
}) {
  const inputRange = [
    (index - 1) * (CARD_WIDTH + CARD_SPACING),
    index * (CARD_WIDTH + CARD_SPACING),
    (index + 1) * (CARD_WIDTH + CARD_SPACING),
  ];

  // 이미지 패럴랙스 (카드보다 느리게)
  const imageStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [IMAGE_OVERFLOW, 0, -IMAGE_OVERFLOW]
    );

    return {
      transform: [{ translateX }],
    };
  });

  // 카드 스케일 및 투명도
  const cardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.9, 1, 0.9],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.7, 1, 0.7],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // 타이틀 위치
  const titleStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [20, 0, 20],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      {/* 이미지 (패럴랙스) */}
      <View style={styles.imageContainer}>
        <Animated.Image
          source={{ uri: card.image }}
          style={[styles.image, imageStyle]}
          resizeMode="cover"
        />
      </View>

      {/* 그라데이션 오버레이 */}
      <View style={styles.gradient} />

      {/* 타이틀 */}
      <Animated.View style={[styles.titleContainer, titleStyle]}>
        <Text style={styles.cardTitle}>{card.title}</Text>
        <Text style={styles.cardSubtitle}>둘러보기 →</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
    paddingVertical: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: CARD_SPACING / 2,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  image: {
    width: CARD_WIDTH + IMAGE_OVERFLOW * 2,
    height: '100%',
    marginLeft: -IMAGE_OVERFLOW,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  titleContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
});
```

---

## 💻 카드 스택 패럴랙스

### 카드가 쌓이는 효과

```tsx
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CARD_HEIGHT = SCREEN_HEIGHT * 0.7;

const CARDS = [
  { id: '1', title: '첫 번째 카드', color: '#FF6B6B', image: 'https://picsum.photos/400/600?1' },
  { id: '2', title: '두 번째 카드', color: '#4ECDC4', image: 'https://picsum.photos/400/600?2' },
  { id: '3', title: '세 번째 카드', color: '#45B7D1', image: 'https://picsum.photos/400/600?3' },
  { id: '4', title: '네 번째 카드', color: '#96CEB4', image: 'https://picsum.photos/400/600?4' },
  { id: '5', title: '다섯 번째 카드', color: '#FFEAA7', image: 'https://picsum.photos/400/600?5' },
];

export default function CardStackParallax() {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <View style={styles.container}>
      {/* 고정된 카드 스택 */}
      <View style={styles.cardStack}>
        {CARDS.map((card, index) => (
          <StackCard
            key={card.id}
            card={card}
            index={index}
            scrollY={scrollY}
            totalCards={CARDS.length}
          />
        ))}
      </View>

      {/* 스크롤 영역 */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          height: CARD_HEIGHT * CARDS.length + SCREEN_HEIGHT,
        }}
      />
    </View>
  );
}

function StackCard({
  card,
  index,
  scrollY,
  totalCards,
}: {
  card: { id: string; title: string; color: string; image: string };
  index: number;
  scrollY: Animated.SharedValue<number>;
  totalCards: number;
}) {
  const cardStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * CARD_HEIGHT,
      index * CARD_HEIGHT,
      (index + 1) * CARD_HEIGHT,
    ];

    // 카드가 위로 이동하며 사라짐
    const translateY = interpolate(
      scrollY.value,
      inputRange,
      [CARD_HEIGHT, 0, -CARD_HEIGHT * 0.3],
      Extrapolation.CLAMP
    );

    // 뒤에 있는 카드는 더 작게
    const scale = interpolate(
      scrollY.value,
      inputRange,
      [0.85, 1, 1],
      Extrapolation.CLAMP
    );

    // 투명도
    const opacity = interpolate(
      scrollY.value,
      [
        (index - 0.5) * CARD_HEIGHT,
        index * CARD_HEIGHT,
        (index + 0.5) * CARD_HEIGHT,
      ],
      [0, 1, 0],
      Extrapolation.CLAMP
    );

    // zIndex: 현재 보이는 카드가 가장 위로
    const progress = scrollY.value / CARD_HEIGHT;
    const isCurrentCard = Math.abs(progress - index) < 0.5;

    return {
      transform: [{ translateY }, { scale }],
      opacity,
      zIndex: isCurrentCard ? totalCards : totalCards - index,
    };
  });

  // 이미지 패럴랙스
  const imageStyle = useAnimatedStyle(() => {
    const inputRange = [
      index * CARD_HEIGHT,
      (index + 1) * CARD_HEIGHT,
    ];

    const translateY = interpolate(
      scrollY.value,
      inputRange,
      [0, -50],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  return (
    <Animated.View style={[styles.stackCard, cardStyle]}>
      <View style={[styles.cardBackground, { backgroundColor: card.color }]}>
        <Animated.Image
          source={{ uri: card.image }}
          style={[styles.cardImage, imageStyle]}
          resizeMode="cover"
        />
        <View style={styles.cardOverlay} />
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardIndex}>0{index + 1}</Text>
        <Text style={styles.cardTitle}>{card.title}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  cardStack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stackCard: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  cardImage: {
    width: '100%',
    height: '120%',
    marginTop: -25,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  cardContent: {
    position: 'absolute',
    bottom: 40,
    left: 30,
  },
  cardIndex: {
    fontSize: 60,
    fontWeight: '200',
    color: 'rgba(255,255,255,0.3)',
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: -10,
  },
});
```

---

## 💻 3D 원근감 패럴랙스

### rotateX/Y로 깊이 표현

```tsx
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ITEM_HEIGHT = 250;
const PERSPECTIVE = 800;

const ITEMS = [
  { id: '1', title: '프리미엄 멤버십', color: '#6C5CE7' },
  { id: '2', title: '골드 플랜', color: '#00B894' },
  { id: '3', title: '플래티넘', color: '#FDCB6E' },
  { id: '4', title: '다이아몬드', color: '#E17055' },
  { id: '5', title: '얼티밋', color: '#A29BFE' },
];

export default function Perspective3DParallax() {
  const scrollY = useSharedValue(0);

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
        contentContainerStyle={styles.scrollContent}
      >
        {ITEMS.map((item, index) => (
          <PerspectiveCard
            key={item.id}
            item={item}
            index={index}
            scrollY={scrollY}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

function PerspectiveCard({
  item,
  index,
  scrollY,
}: {
  item: { id: string; title: string; color: string };
  index: number;
  scrollY: Animated.SharedValue<number>;
}) {
  const inputRange = [
    (index - 1) * ITEM_HEIGHT,
    index * ITEM_HEIGHT,
    (index + 1) * ITEM_HEIGHT,
  ];

  const cardStyle = useAnimatedStyle(() => {
    // 3D 회전
    const rotateX = interpolate(
      scrollY.value,
      inputRange,
      [30, 0, -30],
      Extrapolation.CLAMP
    );

    // 스케일
    const scale = interpolate(
      scrollY.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolation.CLAMP
    );

    // Y축 이동 (원근감)
    const translateY = interpolate(
      scrollY.value,
      inputRange,
      [30, 0, -30],
      Extrapolation.CLAMP
    );

    // 투명도
    const opacity = interpolate(
      scrollY.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { perspective: PERSPECTIVE },
        { rotateX: `${rotateX}deg` },
        { scale },
        { translateY },
      ],
      opacity,
    };
  });

  // 그림자 스타일
  const shadowStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      scrollY.value,
      inputRange,
      [0.1, 0.3, 0.1],
      Extrapolation.CLAMP
    );

    const shadowScale = interpolate(
      scrollY.value,
      inputRange,
      [0.9, 1, 0.9],
      Extrapolation.CLAMP
    );

    return {
      opacity: shadowOpacity,
      transform: [
        { scaleX: shadowScale },
        { scaleY: 0.5 },
        { translateY: 60 },
      ],
    };
  });

  return (
    <View style={styles.cardContainer}>
      {/* 그림자 */}
      <Animated.View style={[styles.shadow, shadowStyle]} />

      {/* 카드 */}
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: item.color },
          cardStyle,
        ]}
      >
        <Text style={styles.cardNumber}>0{index + 1}</Text>
        <Text style={styles.cardTitle}>{item.title}</Text>

        {/* 3D 효과를 위한 하이라이트 */}
        <View style={styles.highlight} />
        <View style={styles.bottomEdge} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    paddingVertical: SCREEN_HEIGHT / 3,
  },
  cardContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    position: 'absolute',
    width: SCREEN_WIDTH - 80,
    height: ITEM_HEIGHT - 40,
    backgroundColor: '#000',
    borderRadius: 20,
  },
  card: {
    width: SCREEN_WIDTH - 60,
    height: ITEM_HEIGHT - 40,
    borderRadius: 20,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardNumber: {
    fontSize: 48,
    fontWeight: '200',
    color: 'rgba(255,255,255,0.3)',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomEdge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
});
```

---

## 💻 아이템별 패럴랙스

### 리스트 아이템 개별 애니메이션

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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ITEM_HEIGHT = 120;

const DATA = Array.from({ length: 20 }, (_, i) => ({
  id: `${i}`,
  title: `아이템 ${i + 1}`,
  subtitle: '패럴랙스 효과가 적용된 아이템입니다',
}));

export default function ItemParallax() {
  const scrollY = useSharedValue(0);

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
        contentContainerStyle={styles.scrollContent}
      >
        {DATA.map((item, index) => (
          <ParallaxItem
            key={item.id}
            item={item}
            index={index}
            scrollY={scrollY}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

function ParallaxItem({
  item,
  index,
  scrollY,
}: {
  item: { id: string; title: string; subtitle: string };
  index: number;
  scrollY: Animated.SharedValue<number>;
}) {
  // 아이템이 화면에 들어오는 시점 계산
  const itemTop = index * ITEM_HEIGHT;

  const containerStyle = useAnimatedStyle(() => {
    // 뷰포트 기준 위치
    const relativeOffset = itemTop - scrollY.value;

    // 화면 중앙에서의 거리
    const distanceFromCenter = relativeOffset - SCREEN_HEIGHT / 2 + ITEM_HEIGHT / 2;

    // 스케일: 중앙에 가까울수록 1, 멀수록 작아짐
    const scale = interpolate(
      Math.abs(distanceFromCenter),
      [0, SCREEN_HEIGHT / 2],
      [1, 0.85],
      Extrapolation.CLAMP
    );

    // X축 이동: 좌우에서 들어오는 효과
    const translateX = interpolate(
      distanceFromCenter,
      [-SCREEN_HEIGHT / 2, 0, SCREEN_HEIGHT / 2],
      [-30, 0, 30],
      Extrapolation.CLAMP
    );

    // 투명도
    const opacity = interpolate(
      Math.abs(distanceFromCenter),
      [0, SCREEN_HEIGHT / 2],
      [1, 0.5],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }, { translateX }],
      opacity,
    };
  });

  // 내부 콘텐츠는 반대 방향으로 이동 (패럴랙스)
  const contentStyle = useAnimatedStyle(() => {
    const relativeOffset = itemTop - scrollY.value;
    const distanceFromCenter = relativeOffset - SCREEN_HEIGHT / 2;

    const translateX = interpolate(
      distanceFromCenter,
      [-SCREEN_HEIGHT / 2, 0, SCREEN_HEIGHT / 2],
      [20, 0, -20],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <Animated.View style={[styles.itemContainer, containerStyle]}>
      <Animated.View style={[styles.itemContent, contentStyle]}>
        <View style={styles.iconPlaceholder} />
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    marginBottom: 12,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7A4AE2',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  arrow: {
    fontSize: 20,
    color: '#ccc',
  },
});
```

---

## 📊 패럴랙스 유형 비교

| 유형 | 효과 | 복잡도 | 적합한 용도 |
|-----|-----|-------|-----------|
| 기본 수직 | 배경 느리게 | 낮음 | 프로필 헤더 |
| 다층 배경 | 깊이감 | 중간 | 랜딩 페이지 |
| 수평 카드 | 카드 슬라이드 | 중간 | 갤러리, 온보딩 |
| 카드 스택 | 쌓임 효과 | 높음 | 탐색 화면 |
| 3D 원근 | 회전+원근 | 높음 | 프리미엄 UI |
| 아이템별 | 개별 변환 | 중간 | 리스트 강조 |

---

## ⚠️ 흔한 실수와 해결법

### 1. 이미지 잘림

```tsx
// ❌ 이미지가 잘림
const backgroundStyle = {
  height: 300,
};

// ✅ 패럴랙스 여유분 추가
const backgroundStyle = {
  height: 300 + 100, // 패럴랙스 범위만큼 추가
  marginTop: -50,
};
```

### 2. 역방향 패럴랙스

```tsx
// ❌ 콘텐츠와 같은 방향 (패럴랙스 안됨)
const translateY = scrollY.value;

// ✅ 반대 방향 (배경이 느리게)
const translateY = scrollY.value * 0.5;
```

### 3. perspective 누락

```tsx
// ❌ 3D 효과 없음
transform: [{ rotateX: '30deg' }]

// ✅ perspective 필수
transform: [
  { perspective: 800 },
  { rotateX: '30deg' }
]
```

---

## 💡 성능 최적화 팁

### 레이어 최적화

```tsx
// 레이어 수 제한 (3-4개 권장)
const LAYERS = [
  { speed: 0.1 }, // 하늘
  { speed: 0.4 }, // 중경
  { speed: 0.7 }, // 전경
];

// 화면 밖 레이어는 렌더링 제외
const shouldRender = useDerivedValue(() => {
  const top = index * ITEM_HEIGHT - scrollY.value;
  return top > -ITEM_HEIGHT && top < SCREEN_HEIGHT + ITEM_HEIGHT;
});
```

### 이미지 최적화

```tsx
// 적절한 이미지 크기 사용
<Image
  source={{ uri: image }}
  style={{ width: 400, height: 300 }} // 디바이스에 맞게
  resizeMode="cover"
  // 캐싱 설정
/>
```

---

## 🎯 실무 적용: sometimes-app 프로필 헤더

```tsx
// src/features/profile/ui/parallax-profile-header.tsx
import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 350;
const PARALLAX_FACTOR = 0.5;

interface Props {
  scrollY: Animated.SharedValue<number>;
  user: {
    name: string;
    university: string;
    profileImage: string;
    coverImage: string;
  };
}

export function ParallaxProfileHeader({ scrollY, user }: Props) {
  // 커버 이미지 패럴랙스
  const coverStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: scrollY.value * PARALLAX_FACTOR },
      {
        scale: interpolate(
          scrollY.value,
          [-100, 0],
          [1.5, 1],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  // 프로필 정보 페이드
  const infoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 100], [1, 0]),
    transform: [
      { translateY: scrollY.value * 0.3 },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.Image
        source={{ uri: user.coverImage }}
        style={[styles.coverImage, coverStyle]}
      />

      <View style={styles.overlay} />

      <Animated.View style={[styles.profileInfo, infoStyle]}>
        <Image source={{ uri: user.profileImage }} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.university}>{user.university}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  coverImage: {
    position: 'absolute',
    top: -50,
    left: 0,
    width: SCREEN_WIDTH,
    height: HEADER_HEIGHT + 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  university: {
    marginTop: 4,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
});
```

---

## 🏋️ 연습 문제

### 문제 1: 온보딩 패럴랙스
3개의 온보딩 화면을 수평 패럴랙스로 구현하세요.

**요구사항**:
- 배경 이미지, 아이콘, 텍스트 각각 다른 속도
- 페이지 인디케이터 연동
- 자동 스냅

### 문제 2: 상품 상세 패럴랙스
상품 상세 페이지를 구현하세요.

**요구사항**:
- 이미지 갤러리 (수평 패럴랙스)
- 상품 정보 (수직 스크롤)
- 플로팅 구매 버튼 (스크롤 시 등장)

### 문제 3: 날씨 앱 패럴랙스
날씨 앱 스타일 배경을 구현하세요.

**요구사항**:
- 구름, 산, 건물 다층 레이어
- 시간대별 배경색 변화
- 날씨 아이콘 개별 애니메이션

---

## 📚 이 장에서 배운 내용

1. **패럴랙스 원리**: speed 값으로 레이어별 속도 차이
2. **수직 패럴랙스**: 배경 이미지와 콘텐츠 분리
3. **다층 배경**: 여러 레이어로 깊이감 연출
4. **수평 카드**: 카드 슬라이더 + 이미지 오프셋
5. **카드 스택**: 쌓이고 사라지는 효과
6. **3D 원근**: perspective + rotateX/Y
7. **아이템별**: 개별 요소 변환

---

## 다음 장 예고

**Chapter 29: Sticky 요소**에서는 스크롤 중 고정되는 요소를 구현합니다.

- Sticky 헤더
- 섹션 헤더 고정
- 플로팅 버튼 제어
- 스크롤 위치 기반 표시/숨김

스크롤해도 특정 위치에 고정되는 UI를 만들어봅니다.
