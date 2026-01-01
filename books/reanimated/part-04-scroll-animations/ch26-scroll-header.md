# Chapter 26: 스크롤 연동 헤더

스크롤에 반응하는 헤더는 현대 모바일 앱의 필수 요소입니다. 공간 효율성과 사용자 경험을 동시에 높이는 다양한 헤더 패턴을 구현합니다.

---

## 📌 학습 목표

- 축소/확대 헤더 (Collapsible Header) 구현
- Sticky 헤더 패턴
- 투명도 변화 헤더
- 검색창 등장 효과
- 헤더 내 요소 개별 애니메이션

---

## 📖 스크롤 헤더 패턴 개요

### 주요 헤더 패턴

```
1. 축소 헤더 (Collapsible)
┌─────────────────────┐
│     큰 타이틀       │ ← 스크롤 시 축소
│     서브타이틀      │
├─────────────────────┤
│ 콘텐츠              │

2. Sticky 헤더
┌─────────────────────┐
│ 고정 헤더           │ ← 항상 상단 고정
├─────────────────────┤
│ 스크롤 콘텐츠       │

3. 숨김 헤더 (Hide on Scroll)
┌─────────────────────┐
│ (헤더 숨김)         │ ← 스크롤 다운 시 사라짐
├─────────────────────┤
│ 콘텐츠              │
```

### interpolate 활용 패턴

```tsx
// 스크롤 위치 → 애니메이션 값 변환
const headerHeight = interpolate(
  scrollY.value,
  [0, SCROLL_THRESHOLD],  // 입력 범위
  [MAX_HEIGHT, MIN_HEIGHT] // 출력 범위
);
```

---

## 💻 기본 축소 헤더

### Collapsible Header 구현

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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HEADER_MAX_HEIGHT = 200;
const HEADER_MIN_HEIGHT = 60;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function CollapsibleHeader() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // 헤더 컨테이너 스타일
  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT + insets.top, HEADER_MIN_HEIGHT + insets.top],
      Extrapolation.CLAMP
    );

    return { height };
  });

  // 큰 타이틀 스타일
  const largeTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE * 0.5],
      [1, 0],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [0, -20],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // 작은 타이틀 스타일
  const smallTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HEADER_SCROLL_DISTANCE * 0.5, HEADER_SCROLL_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP
    );

    return { opacity };
  });

  return (
    <View style={styles.container}>
      {/* 애니메이션 헤더 */}
      <Animated.View style={[styles.header, headerStyle]}>
        {/* 큰 타이틀 */}
        <Animated.View style={[styles.largeTitleContainer, largeTitleStyle]}>
          <Text style={styles.largeTitle}>프로필</Text>
          <Text style={styles.subtitle}>나의 정보를 관리하세요</Text>
        </Animated.View>

        {/* 작은 타이틀 (축소 시 표시) */}
        <Animated.View style={[styles.smallTitleContainer, smallTitleStyle]}>
          <Text style={styles.smallTitle}>프로필</Text>
        </Animated.View>
      </Animated.View>

      {/* 스크롤 콘텐츠 */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: HEADER_MAX_HEIGHT + insets.top },
        ]}
      >
        {Array.from({ length: 20 }).map((_, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.itemText}>설정 항목 {index + 1}</Text>
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
    backgroundColor: '#7A4AE2',
    zIndex: 100,
    overflow: 'hidden',
  },
  largeTitleContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  smallTitleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  item: {
    padding: 16,
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

## 💻 이미지 패럴랙스 헤더

### 이미지가 있는 축소 헤더

```tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HEADER_MAX_HEIGHT = 300;
const HEADER_MIN_HEIGHT = 90;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function ParallaxHeader() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // 헤더 컨테이너
  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolation.CLAMP
    );

    return { height };
  });

  // 이미지 패럴랙스 효과
  const imageStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-100, 0, HEADER_SCROLL_DISTANCE],
      [-50, 0, HEADER_SCROLL_DISTANCE / 2],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [-100, 0],
      [1.5, 1],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  // 오버레이 그라데이션
  const overlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [0.3, 0.7],
      Extrapolation.CLAMP
    );

    return { opacity };
  });

  // 프로필 정보
  const profileStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE * 0.5],
      [1, 0],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [1, 0.8],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // 축소된 헤더 타이틀
  const collapsedTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HEADER_SCROLL_DISTANCE * 0.7, HEADER_SCROLL_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP
    );

    return { opacity };
  });

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <Animated.View style={[styles.header, headerStyle]}>
        {/* 배경 이미지 */}
        <Animated.Image
          source={{ uri: 'https://picsum.photos/800/600' }}
          style={[styles.headerImage, imageStyle]}
          resizeMode="cover"
        />

        {/* 어두운 오버레이 */}
        <Animated.View style={[styles.overlay, overlayStyle]} />

        {/* Safe Area 상단 영역 */}
        <View style={[styles.safeArea, { height: insets.top }]} />

        {/* 프로필 정보 (확장 시) */}
        <Animated.View style={[styles.profileContainer, profileStyle]}>
          <Image
            source={{ uri: 'https://picsum.photos/200/200' }}
            style={styles.avatar}
          />
          <Text style={styles.profileName}>홍길동</Text>
          <Text style={styles.profileBio}>안녕하세요! 반갑습니다 👋</Text>
        </Animated.View>

        {/* 축소된 타이틀 */}
        <Animated.View
          style={[
            styles.collapsedHeader,
            { top: insets.top },
            collapsedTitleStyle,
          ]}
        >
          <Image
            source={{ uri: 'https://picsum.photos/200/200' }}
            style={styles.smallAvatar}
          />
          <Text style={styles.collapsedTitle}>홍길동</Text>
        </Animated.View>
      </Animated.View>

      {/* 스크롤 콘텐츠 */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: HEADER_MAX_HEIGHT },
        ]}
      >
        {Array.from({ length: 20 }).map((_, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.itemTitle}>게시물 {index + 1}</Text>
            <Text style={styles.itemDesc}>게시물 내용이 여기에 표시됩니다.</Text>
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
    zIndex: 100,
    overflow: 'hidden',
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MAX_HEIGHT + 50,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileName: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileBio: {
    marginTop: 4,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  collapsedHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  collapsedTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  item: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
    borderRadius: 12,
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
});
```

---

## 💻 검색창 등장 헤더

### 스크롤 시 검색창 표시

```tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const HEADER_HEIGHT = 100;
const SEARCH_BAR_HEIGHT = 44;
const SCROLL_THRESHOLD = 50;

export default function SearchHeader() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const [searchText, setSearchText] = useState('');

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // 헤더 배경 스타일
  const headerBgStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

  // 큰 타이틀 스타일
  const largeTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD * 0.5],
      [1, 0],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [0, -10],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // 검색바 스타일
  const searchBarStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [HEADER_HEIGHT - 10, insets.top + 8],
      Extrapolation.CLAMP
    );

    const width = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [100, 70], // 퍼센트
      Extrapolation.CLAMP
    );

    const marginHorizontal = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [16, 50],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }],
      width: `${width}%`,
      marginHorizontal,
    };
  });

  // 백 버튼 스타일
  const backButtonStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.5, SCROLL_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );

    return { opacity };
  });

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        {/* 배경 (스크롤 시 나타남) */}
        <Animated.View style={[styles.headerBg, headerBgStyle]} />

        {/* 백 버튼 (스크롤 시 나타남) */}
        <Animated.View style={[styles.backButton, backButtonStyle]}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </Animated.View>

        {/* 큰 타이틀 */}
        <Animated.Text style={[styles.largeTitle, largeTitleStyle]}>
          검색
        </Animated.Text>

        {/* 검색바 */}
        <Animated.View style={[styles.searchBar, searchBarStyle]}>
          <Ionicons
            name="search"
            size={18}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="검색어를 입력하세요"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </Pressable>
          )}
        </Animated.View>
      </View>

      {/* 스크롤 콘텐츠 */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: HEADER_HEIGHT + SEARCH_BAR_HEIGHT + 20 },
        ]}
      >
        <Text style={styles.sectionTitle}>최근 검색</Text>
        {['React Native', 'Reanimated', '애니메이션', '스크롤'].map(
          (item, index) => (
            <View key={index} style={styles.searchItem}>
              <Ionicons name="time-outline" size={20} color="#999" />
              <Text style={styles.searchItemText}>{item}</Text>
            </View>
          )
        )}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          인기 검색어
        </Text>
        {Array.from({ length: 10 }).map((_, index) => (
          <View key={index} style={styles.searchItem}>
            <Text style={styles.rank}>{index + 1}</Text>
            <Text style={styles.searchItemText}>인기 검색어 {index + 1}</Text>
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
    zIndex: 100,
    height: HEADER_HEIGHT + SEARCH_BAR_HEIGHT + 60,
  },
  headerBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  largeTitle: {
    position: 'absolute',
    left: 20,
    top: 50,
    fontSize: 34,
    fontWeight: 'bold',
  },
  searchBar: {
    position: 'absolute',
    left: 0,
    height: SEARCH_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchItemText: {
    marginLeft: 12,
    fontSize: 16,
  },
  rank: {
    width: 24,
    fontSize: 16,
    fontWeight: '600',
    color: '#7A4AE2',
  },
});
```

---

## 💻 Sticky 탭 헤더

### 스크롤 시 탭바가 상단에 고정

```tsx
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
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

const HEADER_HEIGHT = 200;
const TAB_BAR_HEIGHT = 48;
const TABS = ['게시물', '릴스', '태그됨'];

export default function StickyTabHeader() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const [activeTab, setActiveTab] = useState(0);

  const stickyPoint = HEADER_HEIGHT - TAB_BAR_HEIGHT - insets.top;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // 프로필 헤더 스타일
  const profileHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, stickyPoint * 0.5],
      [1, 0],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [0, stickyPoint],
      [0, -stickyPoint],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // 탭바 스타일 (Sticky)
  const tabBarStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, stickyPoint, stickyPoint + 1],
      [0, -stickyPoint, -stickyPoint],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  // 탭 인디케이터
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(activeTab * (SCREEN_WIDTH / TABS.length)),
      },
    ],
  }));

  // 축소된 헤더 타이틀
  const collapsedTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [stickyPoint * 0.7, stickyPoint],
      [0, 1],
      Extrapolation.CLAMP
    );

    return { opacity };
  });

  return (
    <View style={styles.container}>
      {/* 축소된 헤더 (상단 고정) */}
      <Animated.View
        style={[
          styles.collapsedHeader,
          { paddingTop: insets.top },
          collapsedTitleStyle,
        ]}
      >
        <Text style={styles.collapsedTitle}>username</Text>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[1]}
      >
        {/* 프로필 헤더 */}
        <Animated.View style={[styles.profileHeader, profileHeaderStyle]}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar} />
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>128</Text>
                <Text style={styles.statLabel}>게시물</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>1.2K</Text>
                <Text style={styles.statLabel}>팔로워</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>456</Text>
                <Text style={styles.statLabel}>팔로잉</Text>
              </View>
            </View>
          </View>
          <Text style={styles.username}>username</Text>
          <Text style={styles.bio}>소개글이 여기에 표시됩니다 ✨</Text>
        </Animated.View>

        {/* 탭바 (Sticky) */}
        <Animated.View style={[styles.tabBar, tabBarStyle]}>
          {TABS.map((tab, index) => (
            <Pressable
              key={tab}
              style={styles.tab}
              onPress={() => setActiveTab(index)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === index && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
          <Animated.View
            style={[
              styles.indicator,
              { width: SCREEN_WIDTH / TABS.length },
              indicatorStyle,
            ]}
          />
        </Animated.View>

        {/* 콘텐츠 그리드 */}
        <View style={styles.grid}>
          {Array.from({ length: 30 }).map((_, index) => (
            <View key={index} style={styles.gridItem}>
              <Text style={styles.gridItemText}>{index + 1}</Text>
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
  collapsedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 12,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  collapsedTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 50,
  },
  profileHeader: {
    height: HEADER_HEIGHT,
    padding: 16,
    paddingTop: 100,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  username: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  bio: {
    marginTop: 4,
    fontSize: 14,
    color: '#333',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  tab: {
    flex: 1,
    height: TAB_BAR_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: '#000',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: SCREEN_WIDTH / 3,
    height: SCREEN_WIDTH / 3,
    backgroundColor: '#f0f0f0',
    borderWidth: 0.5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridItemText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ccc',
  },
});
```

---

## 💻 투명도 변화 헤더

### 스크롤에 따라 헤더 배경 투명도 변화

```tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar } from 'react-native';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HEADER_HEIGHT = 56;
const FADE_START = 50;
const FADE_END = 150;

export default function FadingHeader() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // 헤더 배경 스타일
  const headerBgStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollY.value,
      [FADE_START, FADE_END],
      ['rgba(255,255,255,0)', 'rgba(255,255,255,1)']
    );

    const borderBottomColor = interpolateColor(
      scrollY.value,
      [FADE_START, FADE_END],
      ['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)']
    );

    return {
      backgroundColor,
      borderBottomColor,
      borderBottomWidth: 1,
    };
  });

  // 아이콘 색상 변화
  const iconStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      scrollY.value,
      [FADE_START, FADE_END],
      ['#FFFFFF', '#000000']
    );

    return { color };
  });

  // 타이틀 스타일
  const titleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [FADE_START, FADE_END],
      [0, 1],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [FADE_START, FADE_END],
      [10, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 고정 헤더 */}
      <Animated.View
        style={[
          styles.header,
          { paddingTop: insets.top, height: HEADER_HEIGHT + insets.top },
          headerBgStyle,
        ]}
      >
        <Animated.View style={iconStyle}>
          <Ionicons name="chevron-back" size={24} color="inherit" />
        </Animated.View>

        <Animated.Text style={[styles.headerTitle, titleStyle]}>
          상세 정보
        </Animated.Text>

        <Animated.View style={iconStyle}>
          <Ionicons name="share-outline" size={24} color="inherit" />
        </Animated.View>
      </Animated.View>

      {/* 스크롤 콘텐츠 */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 히어로 이미지 */}
        <View style={styles.heroImage}>
          <Text style={styles.heroText}>Hero Image</Text>
        </View>

        {/* 콘텐츠 */}
        <View style={styles.content}>
          <Text style={styles.title}>상세 정보 페이지</Text>
          <Text style={styles.description}>
            스크롤하면 헤더 배경이 점점 불투명해지고,
            아이콘 색상과 타이틀이 변화합니다.
          </Text>

          {Array.from({ length: 20 }).map((_, index) => (
            <View key={index} style={styles.item}>
              <Text>콘텐츠 항목 {index + 1}</Text>
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 50,
  },
  heroImage: {
    height: 300,
    backgroundColor: '#7A4AE2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    backgroundColor: '#fff',
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
    marginBottom: 20,
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

## 📊 헤더 패턴 비교

| 패턴 | 사용 사례 | 복잡도 |
|-----|----------|-------|
| 축소 헤더 | 프로필, 설정 | 중간 |
| 패럴랙스 | 상세 페이지 | 높음 |
| 검색 헤더 | 검색 화면 | 중간 |
| Sticky 탭 | 프로필 + 탭 | 높음 |
| 투명 → 불투명 | 상세 페이지 | 낮음 |

---

## ⚠️ 흔한 실수와 해결법

### 1. Safe Area 미고려

```tsx
// ❌ Safe Area 무시
const headerStyle = {
  height: 60,
  paddingTop: 0,
};

// ✅ Safe Area 포함
const insets = useSafeAreaInsets();
const headerStyle = {
  height: 60 + insets.top,
  paddingTop: insets.top,
};
```

### 2. 스크롤 콘텐츠 패딩 누락

```tsx
// ❌ 헤더 높이만큼 가려짐
contentContainerStyle={styles.scrollContent}

// ✅ 헤더 높이 + Safe Area 패딩
contentContainerStyle={[
  styles.scrollContent,
  { paddingTop: HEADER_HEIGHT + insets.top }
]}
```

### 3. z-index 충돌

```tsx
// ❌ 헤더가 콘텐츠 아래로 감
<View style={styles.header} />

// ✅ zIndex 명시
<View style={[styles.header, { zIndex: 100 }]} />
```

---

## 💡 성능 최적화 팁

### interpolate 최적화

```tsx
// 여러 interpolate 호출 시 입력 값 캐싱
const animatedStyle = useAnimatedStyle(() => {
  const scroll = scrollY.value; // 한 번만 읽기

  return {
    opacity: interpolate(scroll, [0, 100], [1, 0]),
    transform: [
      { translateY: interpolate(scroll, [0, 100], [0, -50]) },
      { scale: interpolate(scroll, [0, 100], [1, 0.8]) },
    ],
  };
});
```

### 조건부 스타일 사용

```tsx
// 불필요한 계산 방지
const headerStyle = useAnimatedStyle(() => {
  // 스크롤이 특정 범위 밖이면 고정값 반환
  if (scrollY.value <= 0) {
    return { height: HEADER_MAX_HEIGHT };
  }
  if (scrollY.value >= SCROLL_DISTANCE) {
    return { height: HEADER_MIN_HEIGHT };
  }

  // 범위 내에서만 interpolate
  return {
    height: interpolate(/* ... */),
  };
});
```

---

## 🎯 실무 적용: sometimes-app 프로필 헤더

```tsx
// src/features/profile/ui/profile-header.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProfileHeaderProps {
  scrollY: Animated.SharedValue<number>;
  user: {
    name: string;
    avatar: string;
    university: string;
  };
}

const HEADER_MAX = 280;
const HEADER_MIN = 100;
const SCROLL_DISTANCE = HEADER_MAX - HEADER_MIN;

export function ProfileHeader({ scrollY, user }: ProfileHeaderProps) {
  const insets = useSafeAreaInsets();

  const containerStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [HEADER_MAX + insets.top, HEADER_MIN + insets.top],
      Extrapolation.CLAMP
    ),
  }));

  const avatarStyle = useAnimatedStyle(() => {
    const size = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [100, 40],
      Extrapolation.CLAMP
    );

    return {
      width: size,
      height: size,
      borderRadius: size / 2,
    };
  });

  const nameStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [24, 17],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.Image
        source={{ uri: user.avatar }}
        style={[styles.avatar, avatarStyle]}
      />
      <Animated.Text style={[styles.name, nameStyle]}>
        {user.name}
      </Animated.Text>
      <Text style={styles.university}>{user.university}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#7A4AE2',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  avatar: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 12,
  },
  university: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
});
```

---

## 🏋️ 연습 문제

### 문제 1: 스냅 헤더
스크롤 시 헤더가 중간 상태 없이 확장/축소 상태로 스냅되는 기능을 구현하세요.

**힌트**: onEndDrag에서 scrollTo 호출

### 문제 2: 다중 레이어 헤더
큰 타이틀, 서브타이틀, 탭바가 각각 다른 속도로 사라지는 헤더를 구현하세요.

**요구사항**:
- 큰 타이틀: 가장 먼저 사라짐
- 서브타이틀: 중간에 사라짐
- 탭바: Sticky로 상단 고정

### 문제 3: 시간차 요소 등장
스크롤 시 헤더 요소들이 시간차를 두고 등장/사라지는 효과를 구현하세요.

**요구사항**:
- 왼쪽 버튼 → 타이틀 → 오른쪽 버튼 순서로 등장
- 각 요소 간 50px 스크롤 차이

---

## 📚 이 장에서 배운 내용

1. **축소 헤더**: interpolate로 높이 변화
2. **패럴랙스**: 이미지 translateY와 scale 조합
3. **검색 헤더**: 위치와 크기 동시 변화
4. **Sticky 탭**: stickyHeaderIndices 활용
5. **투명도 헤더**: interpolateColor 활용
6. **Safe Area**: 항상 insets 고려

---

## 다음 장 예고

**Chapter 27: 당겨서 새로고침**에서는 Pull-to-Refresh를 구현합니다.

- 커스텀 리프레시 인디케이터
- 로티 애니메이션 연동
- 탄성 효과
- 상태별 메시지 표시

스크롤을 당겨서 콘텐츠를 새로고침하는 UX를 만들어봅니다.
