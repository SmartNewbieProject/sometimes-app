# Chapter 24: 실전 - 탭 전환 애니메이션

탭 네비게이션은 모바일 앱의 핵심 UI 패턴입니다. 이 장에서는 부드러운 인디케이터 이동, 스와이프 전환, 그리고 콘텐츠 애니메이션을 구현합니다.

---

## 📌 학습 목표

- 슬라이딩 탭 인디케이터 구현
- 스와이프로 탭 전환하기
- 탭 콘텐츠 전환 애니메이션
- 커스텀 탭 바 디자인
- 스크롤 가능한 탭 구현

---

## 📖 탭 전환 애니메이션 패턴

### 탭 UI 구성 요소

```
┌─────────────────────────────────────┐
│  [Tab 1]  [Tab 2]  [Tab 3]  [Tab 4] │ ← 탭 헤더
│  ═══════                             │ ← 인디케이터
├─────────────────────────────────────┤
│                                     │
│         탭 콘텐츠 영역               │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### 애니메이션 요소

| 요소 | 애니메이션 | 기법 |
|------|-----------|------|
| 인디케이터 | 수평 이동 + 너비 변화 | withSpring |
| 탭 라벨 | 색상/크기 변화 | interpolateColor |
| 콘텐츠 | 슬라이드/페이드 | PanGesture |
| 스크롤 탭 | 중앙 정렬 스크롤 | scrollTo |

---

## 💻 기본 슬라이딩 탭

### 탭 인디케이터 애니메이션

```tsx
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Tab {
  key: string;
  title: string;
}

const TABS: Tab[] = [
  { key: 'home', title: '홈' },
  { key: 'explore', title: '탐색' },
  { key: 'profile', title: '프로필' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SlidingTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const animatedIndex = useSharedValue(0);

  const TAB_WIDTH = SCREEN_WIDTH / TABS.length;

  const handleTabPress = (index: number) => {
    setActiveIndex(index);
    animatedIndex.value = withSpring(index, {
      damping: 20,
      stiffness: 150,
    });
  };

  // 인디케이터 스타일
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: animatedIndex.value * TAB_WIDTH },
    ],
    width: TAB_WIDTH,
  }));

  return (
    <View style={styles.container}>
      {/* 탭 헤더 */}
      <View style={styles.tabHeader}>
        {TABS.map((tab, index) => (
          <TabItem
            key={tab.key}
            title={tab.title}
            index={index}
            animatedIndex={animatedIndex}
            tabWidth={TAB_WIDTH}
            onPress={() => handleTabPress(index)}
          />
        ))}

        {/* 슬라이딩 인디케이터 */}
        <Animated.View style={[styles.indicator, indicatorStyle]} />
      </View>

      {/* 탭 콘텐츠 */}
      <View style={styles.content}>
        <Text style={styles.contentText}>
          {TABS[activeIndex].title} 탭 콘텐츠
        </Text>
      </View>
    </View>
  );
}

// 개별 탭 아이템
function TabItem({
  title,
  index,
  animatedIndex,
  tabWidth,
  onPress,
}: {
  title: string;
  index: number;
  animatedIndex: Animated.SharedValue<number>;
  tabWidth: number;
  onPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const isActive = Math.abs(animatedIndex.value - index) < 0.5;

    return {
      opacity: interpolate(
        Math.abs(animatedIndex.value - index),
        [0, 1],
        [1, 0.5]
      ),
      transform: [
        {
          scale: interpolate(
            Math.abs(animatedIndex.value - index),
            [0, 1],
            [1.1, 1]
          ),
        },
      ],
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      Math.abs(animatedIndex.value - index),
      [0, 1],
      ['#7A4AE2', '#666666']
    );

    return { color };
  });

  return (
    <AnimatedPressable
      style={[styles.tabItem, { width: tabWidth }, animatedStyle]}
      onPress={onPress}
    >
      <Animated.Text style={[styles.tabText, textStyle]}>
        {title}
      </Animated.Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  tabItem: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: '#7A4AE2',
    borderRadius: 1.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
```

---

## 💻 스와이프 탭 전환

### 제스처로 탭 전환하기

```tsx
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  clamp,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TABS = ['피드', '인기', '팔로잉', '추천'];
const TAB_WIDTH = SCREEN_WIDTH / TABS.length;

export default function SwipeableTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const translateX = useSharedValue(0);
  const contextX = useSharedValue(0);

  const updateActiveIndex = (index: number) => {
    setActiveIndex(index);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextX.value = translateX.value;
    })
    .onUpdate((event) => {
      const newTranslateX = contextX.value + event.translationX;
      // 범위 제한
      translateX.value = clamp(
        newTranslateX,
        -(TABS.length - 1) * SCREEN_WIDTH,
        0
      );
    })
    .onEnd((event) => {
      // 스와이프 속도와 위치 기반으로 다음 탭 결정
      const velocity = event.velocityX;
      const currentIndex = -translateX.value / SCREEN_WIDTH;

      let targetIndex: number;

      if (Math.abs(velocity) > 500) {
        // 빠른 스와이프: 방향에 따라 다음/이전 탭
        targetIndex = velocity > 0
          ? Math.floor(currentIndex)
          : Math.ceil(currentIndex);
      } else {
        // 느린 스와이프: 가장 가까운 탭
        targetIndex = Math.round(currentIndex);
      }

      // 범위 제한
      targetIndex = clamp(targetIndex, 0, TABS.length - 1);

      translateX.value = withSpring(-targetIndex * SCREEN_WIDTH, {
        damping: 20,
        stiffness: 150,
        velocity: velocity,
      });

      runOnJS(updateActiveIndex)(targetIndex);
    });

  // 콘텐츠 컨테이너 스타일
  const contentContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // 인디케이터 스타일
  const indicatorStyle = useAnimatedStyle(() => {
    const progress = -translateX.value / SCREEN_WIDTH;

    return {
      transform: [{ translateX: progress * TAB_WIDTH }],
    };
  });

  const handleTabPress = (index: number) => {
    translateX.value = withSpring(-index * SCREEN_WIDTH, {
      damping: 20,
      stiffness: 150,
    });
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* 탭 헤더 */}
      <View style={styles.tabHeader}>
        {TABS.map((title, index) => (
          <Pressable
            key={title}
            style={[styles.tabItem, { width: TAB_WIDTH }]}
            onPress={() => handleTabPress(index)}
          >
            <Text
              style={[
                styles.tabText,
                activeIndex === index && styles.activeTabText,
              ]}
            >
              {title}
            </Text>
          </Pressable>
        ))}
        <Animated.View
          style={[styles.indicator, { width: TAB_WIDTH }, indicatorStyle]}
        />
      </View>

      {/* 스와이프 가능한 콘텐츠 */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[styles.contentContainer, contentContainerStyle]}
        >
          {TABS.map((title, index) => (
            <View
              key={title}
              style={[styles.tabContent, { width: SCREEN_WIDTH }]}
            >
              <Text style={styles.contentTitle}>{title}</Text>
              <Text style={styles.contentDesc}>
                스와이프하여 탭을 전환하세요
              </Text>
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  tabItem: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#7A4AE2',
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: '#7A4AE2',
  },
  contentContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contentDesc: {
    fontSize: 16,
    color: '#666',
  },
});
```

---

## 💻 가변 너비 인디케이터

### 탭 너비에 맞춰 인디케이터 크기 변화

```tsx
import React, { useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface TabMeasurement {
  x: number;
  width: number;
}

const TABS = ['홈', '탐색하기', '알림', '마이페이지'];

export default function DynamicWidthTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [tabMeasurements, setTabMeasurements] = useState<TabMeasurement[]>([]);

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  // 탭 위치 측정
  const measureTab = (index: number, x: number, width: number) => {
    setTabMeasurements((prev) => {
      const newMeasurements = [...prev];
      newMeasurements[index] = { x, width };
      return newMeasurements;
    });

    // 첫 번째 탭 초기화
    if (index === 0 && indicatorWidth.value === 0) {
      indicatorX.value = x;
      indicatorWidth.value = width;
    }
  };

  const handleTabPress = (index: number) => {
    const measurement = tabMeasurements[index];
    if (!measurement) return;

    setActiveIndex(index);

    indicatorX.value = withSpring(measurement.x, {
      damping: 20,
      stiffness: 200,
    });

    indicatorWidth.value = withSpring(measurement.width, {
      damping: 20,
      stiffness: 200,
    });
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.tabHeader}>
        {TABS.map((title, index) => (
          <Pressable
            key={title}
            style={styles.tabItem}
            onLayout={(event) => {
              const { x, width } = event.nativeEvent.layout;
              measureTab(index, x, width);
            }}
            onPress={() => handleTabPress(index)}
          >
            <Text
              style={[
                styles.tabText,
                activeIndex === index && styles.activeTabText,
              ]}
            >
              {title}
            </Text>
          </Pressable>
        ))}
        <Animated.View style={[styles.indicator, indicatorStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  tabItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#7A4AE2',
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: '#7A4AE2',
    borderRadius: 1.5,
  },
});
```

---

## 💻 스크롤 가능한 탭

### 많은 탭을 스크롤로 처리

```tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedRef,
  withSpring,
  scrollTo,
  runOnUI,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TABS = [
  '전체', '음악', '게임', '스포츠', '뉴스',
  '영화', '요리', '여행', '패션', '기술',
];

interface TabMeasurement {
  x: number;
  width: number;
}

export default function ScrollableTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [measurements, setMeasurements] = useState<TabMeasurement[]>([]);

  const scrollRef = useAnimatedRef<ScrollView>();
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const measureTab = (index: number, x: number, width: number) => {
    setMeasurements((prev) => {
      const newMeasurements = [...prev];
      newMeasurements[index] = { x, width };
      return newMeasurements;
    });

    if (index === 0 && indicatorWidth.value === 0) {
      indicatorX.value = x;
      indicatorWidth.value = width;
    }
  };

  const handleTabPress = (index: number) => {
    const measurement = measurements[index];
    if (!measurement) return;

    setActiveIndex(index);

    // 인디케이터 애니메이션
    indicatorX.value = withSpring(measurement.x, {
      damping: 20,
      stiffness: 200,
    });

    indicatorWidth.value = withSpring(measurement.width, {
      damping: 20,
      stiffness: 200,
    });

    // 탭을 화면 중앙으로 스크롤
    const scrollToX = measurement.x - (SCREEN_WIDTH / 2) + (measurement.width / 2);

    runOnUI(() => {
      scrollTo(scrollRef, Math.max(0, scrollToX), 0, true);
    })();
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TABS.map((title, index) => (
          <Pressable
            key={title}
            style={styles.tabItem}
            onLayout={(event) => {
              const { x, width } = event.nativeEvent.layout;
              measureTab(index, x, width);
            }}
            onPress={() => handleTabPress(index)}
          >
            <Text
              style={[
                styles.tabText,
                activeIndex === index && styles.activeTabText,
              ]}
            >
              {title}
            </Text>
          </Pressable>
        ))}
        <Animated.View style={[styles.indicator, indicatorStyle]} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    position: 'relative',
  },
  tabItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#999',
    whiteSpace: 'nowrap',
  },
  activeTabText: {
    color: '#7A4AE2',
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: '#7A4AE2',
    borderRadius: 1.5,
  },
});
```

---

## 💻 세그먼트 컨트롤 스타일

### iOS 스타일 세그먼트 탭

```tsx
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';

const SEGMENTS = ['일간', '주간', '월간'];

export default function SegmentedControl() {
  const [activeIndex, setActiveIndex] = useState(0);
  const animatedIndex = useSharedValue(0);

  const SEGMENT_WIDTH = 100;
  const CONTAINER_PADDING = 4;

  const handlePress = (index: number) => {
    setActiveIndex(index);
    animatedIndex.value = withSpring(index, {
      damping: 15,
      stiffness: 150,
    });
  };

  // 활성 배경 슬라이더
  const sliderStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: animatedIndex.value * SEGMENT_WIDTH },
    ],
  }));

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.segmentContainer,
          { padding: CONTAINER_PADDING },
        ]}
      >
        {/* 슬라이딩 배경 */}
        <Animated.View
          style={[
            styles.slider,
            { width: SEGMENT_WIDTH },
            sliderStyle,
          ]}
        />

        {/* 세그먼트 버튼들 */}
        {SEGMENTS.map((title, index) => (
          <SegmentButton
            key={title}
            title={title}
            index={index}
            animatedIndex={animatedIndex}
            width={SEGMENT_WIDTH}
            onPress={() => handlePress(index)}
          />
        ))}
      </View>
    </View>
  );
}

function SegmentButton({
  title,
  index,
  animatedIndex,
  width,
  onPress,
}: {
  title: string;
  index: number;
  animatedIndex: Animated.SharedValue<number>;
  width: number;
  onPress: () => void;
}) {
  const textStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      Math.abs(animatedIndex.value - index),
      [0, 0.5],
      ['#FFFFFF', '#666666']
    );

    return { color };
  });

  return (
    <Pressable
      style={[styles.segment, { width }]}
      onPress={onPress}
    >
      <Animated.Text style={[styles.segmentText, textStyle]}>
        {title}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    position: 'relative',
  },
  slider: {
    position: 'absolute',
    top: 4,
    left: 4,
    height: '100%',
    backgroundColor: '#7A4AE2',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  segment: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
```

---

## 💻 아이콘 탭 바

### 하단 탭 네비게이션 스타일

```tsx
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface TabItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
  label: string;
}

const TABS: TabItem[] = [
  { key: 'home', icon: 'home-outline', iconFilled: 'home', label: '홈' },
  { key: 'search', icon: 'search-outline', iconFilled: 'search', label: '검색' },
  { key: 'add', icon: 'add-circle-outline', iconFilled: 'add-circle', label: '추가' },
  { key: 'heart', icon: 'heart-outline', iconFilled: 'heart', label: '좋아요' },
  { key: 'person', icon: 'person-outline', iconFilled: 'person', label: '프로필' },
];

export default function IconTabBar() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={styles.container}>
      {/* 콘텐츠 영역 */}
      <View style={styles.content}>
        <Text style={styles.contentText}>
          {TABS[activeIndex].label} 탭
        </Text>
      </View>

      {/* 탭 바 */}
      <View style={styles.tabBar}>
        {TABS.map((tab, index) => (
          <TabBarItem
            key={tab.key}
            tab={tab}
            isActive={activeIndex === index}
            onPress={() => setActiveIndex(index)}
          />
        ))}
      </View>
    </View>
  );
}

function TabBarItem({
  tab,
  isActive,
  onPress,
}: {
  tab: TabItem;
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const active = useSharedValue(isActive ? 1 : 0);

  // 활성 상태 변경 시 애니메이션
  React.useEffect(() => {
    active.value = withSpring(isActive ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });

    if (isActive) {
      // 팝 애니메이션
      scale.value = withSpring(1.2, { damping: 10 }, () => {
        scale.value = withSpring(1);
      });
    }
  }, [isActive]);

  const iconContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconColor = useAnimatedStyle(() => {
    const color = interpolateColor(
      active.value,
      [0, 1],
      ['#999999', '#7A4AE2']
    );
    return { color };
  });

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(active.value, [0, 1], [0.5, 1]),
    transform: [
      { translateY: interpolate(active.value, [0, 1], [2, 0]) },
    ],
  }));

  return (
    <Pressable style={styles.tabItem} onPress={onPress}>
      <Animated.View style={iconContainerStyle}>
        <Ionicons
          name={isActive ? tab.iconFilled : tab.icon}
          size={24}
          color={isActive ? '#7A4AE2' : '#999999'}
        />
      </Animated.View>
      <Animated.Text
        style={[
          styles.tabLabel,
          { color: isActive ? '#7A4AE2' : '#999999' },
          labelStyle,
        ]}
      >
        {tab.label}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 20, // Safe area
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
```

---

## 💻 페이지 전환 애니메이션

### 탭별 콘텐츠 전환 효과

```tsx
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TABS = ['프로필', '게시물', '좋아요'];

type TransitionType = 'fade' | 'slide' | 'scale';

export default function PageTransition() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);
  const [transitionType, setTransitionType] = useState<TransitionType>('slide');

  const handleTabChange = (newIndex: number) => {
    setPreviousIndex(activeIndex);
    setActiveIndex(newIndex);
  };

  // 방향에 따른 entering/exiting 애니메이션
  const isMovingRight = activeIndex > previousIndex;

  const getEntering = () => {
    switch (transitionType) {
      case 'fade':
        return FadeIn.duration(300);
      case 'slide':
        return isMovingRight
          ? SlideInRight.duration(300)
          : SlideInLeft.duration(300);
      case 'scale':
        return FadeIn.duration(300).springify();
    }
  };

  const getExiting = () => {
    switch (transitionType) {
      case 'fade':
        return FadeOut.duration(300);
      case 'slide':
        return isMovingRight
          ? SlideOutLeft.duration(300)
          : SlideOutRight.duration(300);
      case 'scale':
        return FadeOut.duration(200);
    }
  };

  return (
    <View style={styles.container}>
      {/* 전환 타입 선택 */}
      <View style={styles.typeSelector}>
        {(['fade', 'slide', 'scale'] as const).map((type) => (
          <Pressable
            key={type}
            style={[
              styles.typeButton,
              transitionType === type && styles.activeTypeButton,
            ]}
            onPress={() => setTransitionType(type)}
          >
            <Text
              style={[
                styles.typeText,
                transitionType === type && styles.activeTypeText,
              ]}
            >
              {type.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 탭 헤더 */}
      <View style={styles.tabHeader}>
        {TABS.map((title, index) => (
          <Pressable
            key={title}
            style={styles.tabItem}
            onPress={() => handleTabChange(index)}
          >
            <Text
              style={[
                styles.tabText,
                activeIndex === index && styles.activeTabText,
              ]}
            >
              {title}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 애니메이션 콘텐츠 */}
      <View style={styles.contentWrapper}>
        <Animated.View
          key={`tab-${activeIndex}`}
          entering={getEntering()}
          exiting={getExiting()}
          style={styles.content}
        >
          <View
            style={[
              styles.card,
              { backgroundColor: ['#E8D5FF', '#D5E8FF', '#FFE8D5'][activeIndex] },
            ]}
          >
            <Text style={styles.contentTitle}>{TABS[activeIndex]}</Text>
            <Text style={styles.contentDesc}>
              {transitionType} 전환 애니메이션
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  typeSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTypeButton: {
    backgroundColor: '#7A4AE2',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeTypeText: {
    color: '#fff',
  },
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#7A4AE2',
    fontWeight: '700',
  },
  contentWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contentDesc: {
    fontSize: 16,
    color: '#666',
  },
});
```

---

## 📊 탭 전환 패턴 비교

| 패턴 | 적합한 상황 | 복잡도 |
|-----|-----------|-------|
| 고정 탭 | 탭 수가 적을 때 (2-4개) | 낮음 |
| 스와이프 탭 | 콘텐츠 탐색이 많을 때 | 중간 |
| 스크롤 탭 | 탭이 많을 때 (5개+) | 중간 |
| 세그먼트 | 필터/뷰 전환 | 낮음 |
| 아이콘 탭 | 하단 네비게이션 | 중간 |

---

## ⚠️ 흔한 실수와 해결법

### 1. 인디케이터 깜빡임

```tsx
// ❌ 레이아웃 측정 전에 표시
<Animated.View style={[styles.indicator, indicatorStyle]} />

// ✅ 측정 완료 후 표시
{measurements.length === TABS.length && (
  <Animated.View style={[styles.indicator, indicatorStyle]} />
)}
```

### 2. 스와이프와 탭 클릭 충돌

```tsx
// ❌ 동시 상태 업데이트
const handleTabPress = (index: number) => {
  setActiveIndex(index);
  translateX.value = withSpring(-index * SCREEN_WIDTH);
};

// ✅ 애니메이션 완료 후 상태 업데이트
const handleTabPress = (index: number) => {
  translateX.value = withSpring(
    -index * SCREEN_WIDTH,
    {},
    (finished) => {
      if (finished) {
        runOnJS(setActiveIndex)(index);
      }
    }
  );
};
```

### 3. 스크롤 탭 중앙 정렬 오류

```tsx
// ❌ 콘텐츠 너비 고려 안함
const scrollToX = measurement.x - SCREEN_WIDTH / 2;

// ✅ 탭 너비의 절반 추가
const scrollToX = measurement.x - SCREEN_WIDTH / 2 + measurement.width / 2;
```

---

## 💡 성능 최적화 팁

### 탭 콘텐츠 지연 로딩

```tsx
function LazyTabContent({
  index,
  activeIndex,
  children,
}: {
  index: number;
  activeIndex: number;
  children: React.ReactNode;
}) {
  const [hasBeenActive, setHasBeenActive] = useState(false);

  useEffect(() => {
    if (index === activeIndex) {
      setHasBeenActive(true);
    }
  }, [index, activeIndex]);

  // 한 번도 활성화되지 않았으면 렌더링 안함
  if (!hasBeenActive) {
    return null;
  }

  // 비활성 탭은 숨기기
  return (
    <View style={{ display: index === activeIndex ? 'flex' : 'none' }}>
      {children}
    </View>
  );
}
```

### 인디케이터 리렌더 방지

```tsx
// 인디케이터를 별도 컴포넌트로 분리
const TabIndicator = React.memo(function TabIndicator({
  animatedIndex,
  measurements,
}: {
  animatedIndex: Animated.SharedValue<number>;
  measurements: TabMeasurement[];
}) {
  const style = useAnimatedStyle(() => {
    if (measurements.length === 0) return {};

    const index = Math.round(animatedIndex.value);
    const measurement = measurements[index];

    return {
      transform: [{ translateX: measurement?.x ?? 0 }],
      width: measurement?.width ?? 0,
    };
  });

  return <Animated.View style={[styles.indicator, style]} />;
});
```

---

## 🎯 실무 적용: sometimes-app 탭 구현

### 매칭 화면 탭 구조

```tsx
// src/features/home/ui/matching-tabs.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TABS = [
  { key: 'today', title: '오늘의 추천' },
  { key: 'new', title: '새로운 인연' },
  { key: 'nearby', title: '근처' },
];

export function MatchingTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const translateX = useSharedValue(0);

  // 스와이프 제스처
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      const newX = -activeIndex * SCREEN_WIDTH + event.translationX;
      translateX.value = Math.max(
        Math.min(newX, 0),
        -(TABS.length - 1) * SCREEN_WIDTH
      );
    })
    .onEnd((event) => {
      const velocity = event.velocityX;
      let newIndex = activeIndex;

      if (Math.abs(velocity) > 500) {
        newIndex = velocity > 0 ? activeIndex - 1 : activeIndex + 1;
      } else {
        const progress = -translateX.value / SCREEN_WIDTH;
        newIndex = Math.round(progress);
      }

      newIndex = Math.max(0, Math.min(newIndex, TABS.length - 1));

      translateX.value = withSpring(-newIndex * SCREEN_WIDTH, {
        damping: 20,
        stiffness: 150,
      });

      setActiveIndex(newIndex);
    });

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const indicatorStyle = useAnimatedStyle(() => {
    const progress = -translateX.value / SCREEN_WIDTH;
    const tabWidth = SCREEN_WIDTH / TABS.length;

    return {
      transform: [{ translateX: progress * tabWidth }],
    };
  });

  return (
    <View style={styles.container}>
      <TabHeader
        tabs={TABS}
        activeIndex={activeIndex}
        indicatorStyle={indicatorStyle}
        onTabPress={(index) => {
          translateX.value = withSpring(-index * SCREEN_WIDTH);
          setActiveIndex(index);
        }}
      />

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.contentContainer, contentStyle]}>
          {TABS.map((tab) => (
            <View
              key={tab.key}
              style={[styles.tabContent, { width: SCREEN_WIDTH }]}
            >
              {/* 각 탭별 콘텐츠 */}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
});
```

---

## 🏋️ 연습 문제

### 문제 1: 애니메이션 인디케이터 개선
탭 전환 시 인디케이터가 늘어났다가 줄어드는 "고무줄" 효과를 구현하세요.

**힌트**: 중간 지점에서 인디케이터 너비가 증가

### 문제 2: 중첩 탭 구현
메인 탭 안에 서브 탭이 있는 구조를 구현하세요.

**요구사항**:
- 메인 탭 3개
- 각 메인 탭마다 서브 탭 2-4개
- 메인 탭 전환 시 서브 탭 상태 유지

### 문제 3: 뱃지가 있는 탭
알림 개수 뱃지가 있는 탭 바를 구현하세요.

**요구사항**:
- 뱃지 등장/사라짐 애니메이션
- 숫자 변경 시 bounce 효과
- 99+ 처리

---

## 📚 이 장에서 배운 내용

1. **슬라이딩 인디케이터**: withSpring으로 부드럽게 이동
2. **스와이프 전환**: Pan 제스처와 탭 터치 동시 처리
3. **가변 너비**: onLayout으로 탭 크기 측정
4. **스크롤 탭**: scrollTo로 중앙 정렬
5. **세그먼트**: 배경 슬라이더 패턴
6. **아이콘 탭**: scale과 색상 전환 조합
7. **페이지 전환**: Entering/Exiting 활용

---

## 다음 장 예고

**Part 4: 스크롤 연동**에서는 스크롤과 애니메이션을 연결합니다.

- 스크롤 이벤트 처리
- 헤더 축소/확대
- 패럴랙스 효과
- 당겨서 새로고침

스크롤 위치에 반응하는 동적 UI를 만들어봅니다.
