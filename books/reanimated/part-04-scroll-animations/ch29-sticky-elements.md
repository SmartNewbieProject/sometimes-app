# Chapter 29: Sticky 요소

스크롤해도 특정 위치에 고정되는 Sticky 요소는 네비게이션, 필터, 액션 버튼 등에 필수적입니다. Reanimated로 부드러운 Sticky 동작을 구현합니다.

---

## 📌 학습 목표

- Sticky 헤더 구현 패턴
- 섹션별 Sticky 헤더
- 플로팅 액션 버튼 제어
- 스크롤 방향 기반 표시/숨김
- 임계점 기반 스타일 변화

---

## 📖 Sticky 요소의 이해

### Sticky 동작 원리

```
초기 상태 (스크롤 전)
┌─────────────────────┐
│   일반 헤더         │
├─────────────────────┤
│   Sticky 요소       │ ← 일반 위치
├─────────────────────┤
│   콘텐츠           │
└─────────────────────┘

스크롤 후
┌─────────────────────┐
│   Sticky 요소       │ ← 상단 고정
├─────────────────────┤
│   콘텐츠           │
│                    │
│                    │
└─────────────────────┘
```

### 구현 방식 비교

| 방식 | 장점 | 단점 |
|-----|-----|-----|
| stickyHeaderIndices | 간단함 | 커스터마이징 제한 |
| position: absolute | 유연함 | 수동 계산 필요 |
| Reanimated | 애니메이션 가능 | 복잡도 높음 |

---

## 💻 기본 Sticky 헤더

### 스크롤 시 상단 고정

```tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BANNER_HEIGHT = 200;
const STICKY_HEADER_HEIGHT = 50;

export default function BasicStickyHeader() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const stickyPoint = BANNER_HEIGHT - STICKY_HEADER_HEIGHT - insets.top;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Sticky 헤더 스타일
  const stickyHeaderStyle = useAnimatedStyle(() => {
    // 스크롤이 stickyPoint를 넘으면 고정
    const translateY = scrollY.value > stickyPoint
      ? scrollY.value - stickyPoint
      : 0;

    const backgroundColor = interpolate(
      scrollY.value,
      [stickyPoint - 50, stickyPoint],
      [0, 1],
      Extrapolation.CLAMP
    );

    const shadowOpacity = interpolate(
      scrollY.value,
      [stickyPoint, stickyPoint + 20],
      [0, 0.15],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }],
      backgroundColor: `rgba(255,255,255,${backgroundColor})`,
      shadowOpacity,
    };
  });

  // 배경 투명도
  const backgroundStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [stickyPoint - 30, stickyPoint],
      [0, 1],
      Extrapolation.CLAMP
    );

    return { opacity };
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 배너 */}
        <View style={[styles.banner, { height: BANNER_HEIGHT }]}>
          <Text style={styles.bannerTitle}>프로모션 배너</Text>
        </View>

        {/* Sticky 헤더 */}
        <Animated.View
          style={[
            styles.stickyHeader,
            { top: insets.top },
            stickyHeaderStyle,
          ]}
        >
          <Animated.View style={[styles.stickyBg, backgroundStyle]} />
          <Text style={styles.stickyTitle}>카테고리</Text>
        </Animated.View>

        {/* 콘텐츠 */}
        <View style={styles.content}>
          {Array.from({ length: 30 }).map((_, i) => (
            <View key={i} style={styles.item}>
              <Text>아이템 {i + 1}</Text>
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
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 50,
  },
  banner: {
    backgroundColor: '#7A4AE2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  stickyHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: STICKY_HEADER_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  stickyBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  stickyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    marginTop: STICKY_HEADER_HEIGHT,
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

## 💻 섹션 Sticky 헤더

### 연락처 앱 스타일 섹션 헤더

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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Contact {
  id: string;
  name: string;
  section: string;
}

// 샘플 데이터
const CONTACTS: Contact[] = [
  { id: '1', name: '김민수', section: 'ㄱ' },
  { id: '2', name: '김영희', section: 'ㄱ' },
  { id: '3', name: '김철수', section: 'ㄱ' },
  { id: '4', name: '나영수', section: 'ㄴ' },
  { id: '5', name: '박지현', section: 'ㅂ' },
  { id: '6', name: '박현우', section: 'ㅂ' },
  { id: '7', name: '이서연', section: 'ㅇ' },
  { id: '8', name: '이지훈', section: 'ㅇ' },
  { id: '9', name: '정민호', section: 'ㅈ' },
  { id: '10', name: '최수진', section: 'ㅊ' },
];

const SECTION_HEIGHT = 32;
const ITEM_HEIGHT = 60;

export default function SectionStickyHeaders() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  // 섹션 그룹화
  const sections = useMemo(() => {
    const grouped: { [key: string]: Contact[] } = {};
    CONTACTS.forEach((contact) => {
      if (!grouped[contact.section]) {
        grouped[contact.section] = [];
      }
      grouped[contact.section].push(contact);
    });
    return Object.entries(grouped).map(([title, items]) => ({
      title,
      items,
    }));
  }, []);

  // 섹션 오프셋 계산
  const sectionOffsets = useMemo(() => {
    let offset = insets.top + 60; // 헤더 높이
    return sections.map((section, index) => {
      const currentOffset = offset;
      offset += SECTION_HEIGHT + section.items.length * ITEM_HEIGHT;
      return { title: section.title, offset: currentOffset };
    });
  }, [sections, insets.top]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>연락처</Text>
      </View>

      {/* 현재 섹션 표시 (Sticky) */}
      <StickySection
        sections={sectionOffsets}
        scrollY={scrollY}
        topOffset={insets.top + 60}
      />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60 },
        ]}
      >
        {sections.map((section) => (
          <View key={section.title}>
            {/* 섹션 헤더 (일반) */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            {/* 연락처 목록 */}
            {section.items.map((contact) => (
              <View key={contact.id} style={styles.contactItem}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {contact.name.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.contactName}>{contact.name}</Text>
              </View>
            ))}
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

// Sticky 섹션 컴포넌트
function StickySection({
  sections,
  scrollY,
  topOffset,
}: {
  sections: { title: string; offset: number }[];
  scrollY: Animated.SharedValue<number>;
  topOffset: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    // 현재 스크롤 위치에 해당하는 섹션 찾기
    let currentSection = sections[0]?.title || '';
    let nextSectionOffset = Infinity;

    for (let i = 0; i < sections.length; i++) {
      if (scrollY.value >= sections[i].offset - topOffset - SECTION_HEIGHT) {
        currentSection = sections[i].title;
        if (i < sections.length - 1) {
          nextSectionOffset = sections[i + 1].offset - topOffset - SECTION_HEIGHT;
        }
      }
    }

    // 다음 섹션이 가까워지면 밀어내기 효과
    const pushUp = interpolate(
      scrollY.value,
      [nextSectionOffset - SECTION_HEIGHT, nextSectionOffset],
      [0, -SECTION_HEIGHT],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY: pushUp }],
    };
  });

  // 현재 섹션 텍스트
  const textStyle = useAnimatedStyle(() => {
    let currentSection = sections[0]?.title || '';

    for (let i = 0; i < sections.length; i++) {
      if (scrollY.value >= sections[i].offset - topOffset - SECTION_HEIGHT) {
        currentSection = sections[i].title;
      }
    }

    // 텍스트 값을 직접 설정할 수 없으므로
    // 각 섹션별 opacity로 제어
    return {};
  });

  return (
    <Animated.View
      style={[styles.stickySectionHeader, { top: topOffset }, animatedStyle]}
    >
      {sections.map((section, index) => (
        <StickySectionText
          key={section.title}
          title={section.title}
          index={index}
          sections={sections}
          scrollY={scrollY}
          topOffset={topOffset}
        />
      ))}
    </Animated.View>
  );
}

function StickySectionText({
  title,
  index,
  sections,
  scrollY,
  topOffset,
}: {
  title: string;
  index: number;
  sections: { title: string; offset: number }[];
  scrollY: Animated.SharedValue<number>;
  topOffset: number;
}) {
  const style = useAnimatedStyle(() => {
    const currentOffset = sections[index].offset - topOffset - SECTION_HEIGHT;
    const nextOffset =
      index < sections.length - 1
        ? sections[index + 1].offset - topOffset - SECTION_HEIGHT
        : Infinity;

    const isActive =
      scrollY.value >= currentOffset && scrollY.value < nextOffset;

    return {
      opacity: isActive ? 1 : 0,
      position: 'absolute',
    };
  });

  return (
    <Animated.Text style={[styles.stickySectionTitle, style]}>
      {title}
    </Animated.Text>
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
    backgroundColor: '#fff',
    zIndex: 200,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  stickySectionHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SECTION_HEIGHT,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 150,
  },
  stickySectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  scrollContent: {
    paddingBottom: 50,
  },
  sectionHeader: {
    height: SECTION_HEIGHT,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  contactItem: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  contactName: {
    fontSize: 16,
  },
});
```

---

## 💻 스크롤 방향 기반 표시/숨김

### 아래로 스크롤 시 숨김, 위로 스크롤 시 표시

```tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const HEADER_HEIGHT = 60;
const TAB_BAR_HEIGHT = 80;

export default function DirectionalHideShow() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);
  const headerVisible = useSharedValue(1);
  const tabBarVisible = useSharedValue(1);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      const diff = currentY - lastScrollY.value;

      // 스크롤 방향 감지 (임계값 적용)
      if (Math.abs(diff) > 10) {
        if (diff > 0 && currentY > 50) {
          // 아래로 스크롤 → 숨김
          headerVisible.value = withTiming(0, { duration: 200 });
          tabBarVisible.value = withTiming(0, { duration: 200 });
        } else if (diff < 0) {
          // 위로 스크롤 → 표시
          headerVisible.value = withTiming(1, { duration: 200 });
          tabBarVisible.value = withTiming(1, { duration: 200 });
        }
      }

      lastScrollY.value = currentY;
      scrollY.value = currentY;
    },
    onEndDrag: (event) => {
      // 맨 위에 도달하면 항상 표시
      if (event.contentOffset.y <= 0) {
        headerVisible.value = withTiming(1, { duration: 200 });
        tabBarVisible.value = withTiming(1, { duration: 200 });
      }
    },
  });

  // 헤더 스타일
  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          headerVisible.value,
          [0, 1],
          [-(HEADER_HEIGHT + insets.top), 0]
        ),
      },
    ],
    opacity: headerVisible.value,
  }));

  // 탭바 스타일
  const tabBarStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          tabBarVisible.value,
          [0, 1],
          [TAB_BAR_HEIGHT + insets.bottom, 0]
        ),
      },
    ],
    opacity: tabBarVisible.value,
  }));

  // FAB 스타일 (탭바 따라가기)
  const fabStyle = useAnimatedStyle(() => ({
    bottom: interpolate(
      tabBarVisible.value,
      [0, 1],
      [20, TAB_BAR_HEIGHT + insets.bottom + 20]
    ),
  }));

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <Animated.View
        style={[
          styles.header,
          { height: HEADER_HEIGHT + insets.top, paddingTop: insets.top },
          headerStyle,
        ]}
      >
        <Text style={styles.headerTitle}>피드</Text>
        <Ionicons name="search" size={24} color="#333" />
      </Animated.View>

      {/* 콘텐츠 */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: HEADER_HEIGHT + insets.top,
            paddingBottom: TAB_BAR_HEIGHT + insets.bottom,
          },
        ]}
      >
        {Array.from({ length: 30 }).map((_, i) => (
          <View key={i} style={styles.feedItem}>
            <View style={styles.feedHeader}>
              <View style={styles.userAvatar} />
              <Text style={styles.userName}>사용자 {i + 1}</Text>
            </View>
            <View style={styles.feedImage} />
            <Text style={styles.feedContent}>
              피드 콘텐츠가 여기에 표시됩니다. #{i + 1}
            </Text>
          </View>
        ))}
      </Animated.ScrollView>

      {/* 탭바 */}
      <Animated.View
        style={[
          styles.tabBar,
          { paddingBottom: insets.bottom },
          tabBarStyle,
        ]}
      >
        {['home', 'search', 'add-circle', 'heart', 'person'].map(
          (icon, index) => (
            <Pressable key={icon} style={styles.tabItem}>
              <Ionicons
                name={icon as any}
                size={24}
                color={index === 0 ? '#7A4AE2' : '#999'}
              />
            </Pressable>
          )
        )}
      </Animated.View>

      {/* FAB */}
      <Animated.View style={[styles.fab, fabStyle]}>
        <Ionicons name="create" size={24} color="#fff" />
      </Animated.View>
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
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
  },
  feedItem: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7A4AE2',
    marginRight: 10,
  },
  userName: {
    fontWeight: '600',
  },
  feedImage: {
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  feedContent: {
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7A4AE2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7A4AE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
```

---

## 💻 임계점 기반 스타일 변화

### 스크롤 위치에 따른 스타일 전환

```tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const HERO_HEIGHT = 300;
const HEADER_HEIGHT = 56;

export default function ThresholdStyleChange() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const threshold = HERO_HEIGHT - HEADER_HEIGHT - insets.top;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // 헤더 배경 스타일
  const headerBgStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollY.value,
      [threshold - 50, threshold],
      ['rgba(0,0,0,0)', 'rgba(255,255,255,1)']
    );

    const borderColor = interpolateColor(
      scrollY.value,
      [threshold - 10, threshold],
      ['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)']
    );

    return {
      backgroundColor,
      borderBottomColor: borderColor,
      borderBottomWidth: 1,
    };
  });

  // 아이콘 색상 스타일
  const iconStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      scrollY.value,
      [threshold - 50, threshold],
      ['#FFFFFF', '#000000']
    );

    return { color };
  });

  // 타이틀 스타일
  const titleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [threshold - 30, threshold],
      [0, 1],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [threshold - 30, threshold],
      [20, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // 히어로 타이틀 스타일
  const heroTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, threshold * 0.5],
      [1, 0],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [0, threshold * 0.5],
      [1, 0.8],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <View style={styles.container}>
      {/* 고정 헤더 */}
      <Animated.View
        style={[
          styles.header,
          { height: HEADER_HEIGHT + insets.top, paddingTop: insets.top },
          headerBgStyle,
        ]}
      >
        <Pressable style={styles.iconButton}>
          <Animated.Text style={iconStyle}>
            <Ionicons name="chevron-back" size={24} />
          </Animated.Text>
        </Pressable>

        <Animated.Text style={[styles.headerTitle, titleStyle]}>
          상품 상세
        </Animated.Text>

        <View style={styles.headerRight}>
          <Pressable style={styles.iconButton}>
            <Animated.Text style={iconStyle}>
              <Ionicons name="share-outline" size={24} />
            </Animated.Text>
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Animated.Text style={iconStyle}>
              <Ionicons name="cart-outline" size={24} />
            </Animated.Text>
          </Pressable>
        </View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 히어로 이미지 */}
        <View style={styles.hero}>
          <View style={styles.heroImage} />
          <Animated.View style={[styles.heroTitleContainer, heroTitleStyle]}>
            <Text style={styles.heroTitle}>프리미엄 상품</Text>
            <Text style={styles.heroSubtitle}>특별한 경험을 선사합니다</Text>
          </Animated.View>
        </View>

        {/* 상품 정보 */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>프리미엄 상품</Text>
          <Text style={styles.productPrice}>₩99,000</Text>
          <Text style={styles.productDesc}>
            최고급 소재로 제작된 프리미엄 상품입니다.
            장인의 손길로 하나하나 정성껏 만들었습니다.
          </Text>
        </View>

        {/* 추가 콘텐츠 */}
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>섹션 {i + 1}</Text>
            <Text style={styles.sectionContent}>
              상품에 대한 자세한 설명이 여기에 표시됩니다.
            </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    zIndex: 100,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
  },
  scrollContent: {
    paddingBottom: 50,
  },
  hero: {
    height: HERO_HEIGHT,
    backgroundColor: '#7A4AE2',
    justifyContent: 'flex-end',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#6C5CE7',
  },
  heroTitleContainer: {
    padding: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  productInfo: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 8,
    borderBottomColor: '#f5f5f5',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7A4AE2',
    marginTop: 8,
  },
  productDesc: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginTop: 12,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
});
```

---

## 💻 플로팅 액션 버튼 (FAB) 제어

### 스크롤에 따른 FAB 상태 변화

```tsx
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SCROLL_THRESHOLD = 200;

export default function FABControl() {
  const scrollY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);
  const fabExpanded = useSharedValue(true);
  const fabVisible = useSharedValue(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuOpen = useSharedValue(0);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    menuOpen.value = withSpring(isMenuOpen ? 0 : 1);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      const diff = currentY - lastScrollY.value;

      // 스크롤 방향에 따라 FAB 표시/숨김
      if (diff > 20 && currentY > 100) {
        fabVisible.value = withTiming(0, { duration: 200 });
        fabExpanded.value = false;
      } else if (diff < -20) {
        fabVisible.value = withTiming(1, { duration: 200 });
      }

      // 상단 근처에서는 확장 상태
      if (currentY < SCROLL_THRESHOLD) {
        fabExpanded.value = true;
      } else {
        fabExpanded.value = false;
      }

      lastScrollY.value = currentY;
      scrollY.value = currentY;
    },
    onEndDrag: () => {
      // 스크롤 종료 시 FAB 표시
      fabVisible.value = withSpring(1);
    },
  });

  // FAB 컨테이너 스타일
  const fabContainerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          fabVisible.value,
          [0, 1],
          [100, 0]
        ),
      },
    ],
    opacity: fabVisible.value,
  }));

  // FAB 너비 (확장/축소)
  const fabStyle = useAnimatedStyle(() => {
    const width = fabExpanded.value
      ? withSpring(140)
      : withSpring(56);

    return { width };
  });

  // FAB 텍스트
  const fabTextStyle = useAnimatedStyle(() => {
    const opacity = fabExpanded.value
      ? withTiming(1, { duration: 200 })
      : withTiming(0, { duration: 100 });

    const width = fabExpanded.value
      ? withTiming(70)
      : withTiming(0);

    return {
      opacity,
      width,
      marginLeft: fabExpanded.value ? 8 : 0,
    };
  });

  // 메뉴 아이템 스타일들
  const menuItem1Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(menuOpen.value, [0, 1], [0, -70]) },
      { scale: menuOpen.value },
    ],
    opacity: menuOpen.value,
  }));

  const menuItem2Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(menuOpen.value, [0, 1], [0, -140]) },
      { scale: menuOpen.value },
    ],
    opacity: menuOpen.value,
  }));

  const menuItem3Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(menuOpen.value, [0, 1], [0, -210]) },
      { scale: menuOpen.value },
    ],
    opacity: menuOpen.value,
  }));

  // FAB 회전
  const fabIconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(menuOpen.value, [0, 1], [0, 45])}deg` },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {Array.from({ length: 30 }).map((_, i) => (
          <View key={i} style={styles.item}>
            <Text style={styles.itemTitle}>아이템 {i + 1}</Text>
            <Text style={styles.itemDesc}>FAB 동작을 확인해보세요</Text>
          </View>
        ))}
      </Animated.ScrollView>

      {/* FAB 메뉴 */}
      <Animated.View style={[styles.fabContainer, fabContainerStyle]}>
        {/* 메뉴 아이템들 */}
        <Animated.View style={[styles.fabMenuItem, menuItem3Style]}>
          <Ionicons name="image" size={24} color="#fff" />
        </Animated.View>

        <Animated.View style={[styles.fabMenuItem, menuItem2Style]}>
          <Ionicons name="camera" size={24} color="#fff" />
        </Animated.View>

        <Animated.View style={[styles.fabMenuItem, menuItem1Style]}>
          <Ionicons name="document-text" size={24} color="#fff" />
        </Animated.View>

        {/* 메인 FAB */}
        <Pressable onPress={toggleMenu}>
          <Animated.View style={[styles.fab, fabStyle]}>
            <Animated.View style={fabIconStyle}>
              <Ionicons name="add" size={28} color="#fff" />
            </Animated.View>
            <Animated.Text style={[styles.fabText, fabTextStyle]}>
              글쓰기
            </Animated.Text>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    alignItems: 'center',
  },
  fab: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7A4AE2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    shadowColor: '#7A4AE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    overflow: 'hidden',
  },
  fabMenuItem: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#9B7DE8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

---

## 📊 Sticky 패턴 비교

| 패턴 | 적합한 상황 | 복잡도 |
|-----|-----------|-------|
| 기본 Sticky | 단일 요소 고정 | 낮음 |
| 섹션 Sticky | 연락처, 목록 | 중간 |
| 방향 기반 | 피드, SNS | 중간 |
| 임계점 스타일 | 상품 상세 | 중간 |
| FAB 제어 | 글쓰기, 액션 | 높음 |

---

## ⚠️ 흔한 실수와 해결법

### 1. z-index 문제

```tsx
// ❌ Sticky 요소가 콘텐츠 아래로 감
<View style={styles.sticky} />

// ✅ zIndex 명시
<View style={[styles.sticky, { zIndex: 100 }]} />
```

### 2. Safe Area 무시

```tsx
// ❌ 노치에 가려짐
const stickyTop = 0;

// ✅ Safe Area 고려
const insets = useSafeAreaInsets();
const stickyTop = insets.top;
```

### 3. 스크롤 콘텐츠 패딩 누락

```tsx
// ❌ 콘텐츠가 Sticky 아래에 가려짐
contentContainerStyle={styles.content}

// ✅ Sticky 높이만큼 패딩
contentContainerStyle={[
  styles.content,
  { paddingTop: STICKY_HEIGHT }
]}
```

---

## 💡 성능 최적화 팁

### interpolate 캐싱

```tsx
// 공통 입력 범위 캐싱
const inputRange = useMemo(
  () => [threshold - 50, threshold],
  [threshold]
);

const headerStyle = useAnimatedStyle(() => {
  const opacity = interpolate(scrollY.value, inputRange, [0, 1]);
  return { opacity };
});
```

### 조건부 렌더링

```tsx
// 화면 밖 요소 숨기기
const shouldRender = useDerivedValue(() => {
  return scrollY.value < MAX_SCROLL;
});

return shouldRender.value ? <StickyElement /> : null;
```

---

## 🎯 실무 적용: sometimes-app 채팅 입력창

```tsx
// src/features/chat/ui/sticky-input.tsx
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  scrollY: Animated.SharedValue<number>;
}

export function StickyInput({ scrollY }: Props) {
  const insets = useSafeAreaInsets();

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolate(
      scrollY.value,
      [0, 50],
      [1, 0.95]
    ) > 0.5 ? '#fff' : '#f9f9f9',
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingBottom: insets.bottom || 16 },
        containerStyle,
      ]}
    >
      <TextInput
        style={styles.input}
        placeholder="메시지 입력..."
        placeholderTextColor="#999"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 12,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
});
```

---

## 🏋️ 연습 문제

### 문제 1: 네비게이션 바 전환
스크롤 시 일반 헤더가 검색바로 전환되는 기능을 구현하세요.

**요구사항**:
- 초기: 타이틀 + 검색 아이콘
- 스크롤 후: 검색 입력창으로 전환
- 부드러운 모프 애니메이션

### 문제 2: 다중 Sticky 영역
여러 개의 Sticky 요소가 순차적으로 쌓이는 기능을 구현하세요.

**요구사항**:
- 필터 바 (첫 번째 Sticky)
- 정렬 바 (두 번째 Sticky)
- 둘 다 상단에 쌓임

### 문제 3: 스크롤 진행률 인디케이터
페이지 상단에 스크롤 진행률 바를 표시하세요.

**요구사항**:
- 가로 진행률 바
- 색상 그라데이션
- 퍼센트 텍스트 표시

---

## 📚 이 장에서 배운 내용

1. **기본 Sticky**: position absolute + translateY
2. **섹션 Sticky**: 연락처 스타일 그룹 헤더
3. **방향 기반**: 스크롤 방향 감지로 표시/숨김
4. **임계점 스타일**: 특정 위치에서 스타일 전환
5. **FAB 제어**: 확장/축소 + 메뉴 애니메이션
6. **최적화**: z-index, Safe Area, 패딩 처리

---

## 다음 장 예고

**Chapter 30: 무한 스크롤 최적화**에서는 대용량 리스트 처리를 다룹니다.

- FlatList vs FlashList
- 아이템 애니메이션 최적화
- 스켈레톤 로딩
- 메모리 관리

대량의 데이터를 부드럽게 표시하는 기법을 배웁니다.
