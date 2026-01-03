# Chapter 27: 당겨서 새로고침 (Pull-to-Refresh)

당겨서 새로고침은 모바일 앱의 핵심 인터랙션입니다. 기본 RefreshControl을 넘어 브랜드 아이덴티티를 담은 커스텀 새로고침 UI를 구현합니다.

---

## 📌 학습 목표

- 커스텀 Pull-to-Refresh 인디케이터 구현
- 당기는 정도에 따른 단계별 애니메이션
- Lottie 애니메이션 연동
- 스프링 탄성 효과
- 상태별 텍스트/아이콘 변화

---

## 📖 Pull-to-Refresh 동작 원리

### 상태 흐름

```
┌─────────────┐
│    idle     │ ← 기본 상태
└──────┬──────┘
       │ (스크롤 위로 당김)
       ▼
┌─────────────┐
│   pulling   │ ← 당기는 중 (임계점 미달)
└──────┬──────┘
       │ (임계점 초과)
       ▼
┌─────────────┐
│   ready     │ ← 새로고침 준비됨
└──────┬──────┘
       │ (손가락 뗌)
       ▼
┌─────────────┐
│ refreshing  │ ← 새로고침 중
└──────┬──────┘
       │ (완료)
       ▼
┌─────────────┐
│    idle     │
└─────────────┘
```

### 주요 값

| 값 | 설명 | 일반적 범위 |
|---|------|-----------|
| translateY | 당긴 거리 | 0 ~ 150px |
| threshold | 새로고침 임계점 | 80px |
| maxPull | 최대 당김 거리 | 120px |
| progress | 당김 진행률 | 0 ~ 1 |

---

## 💻 기본 커스텀 Pull-to-Refresh

### 상태 기반 인디케이터

```tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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

const REFRESH_THRESHOLD = 80;
const MAX_PULL_DISTANCE = 120;

type RefreshState = 'idle' | 'pulling' | 'ready' | 'refreshing';

export default function CustomPullToRefresh() {
  const [refreshState, setRefreshState] = useState<RefreshState>('idle');
  const [data, setData] = useState(
    Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`)
  );

  const translateY = useSharedValue(0);
  const isRefreshing = useSharedValue(false);

  const updateRefreshState = useCallback((state: RefreshState) => {
    setRefreshState(state);
  }, []);

  const refreshData = useCallback(async () => {
    // 실제 API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setData((prev) => [
      `New Item ${Date.now()}`,
      ...prev.slice(0, 19),
    ]);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const offsetY = event.contentOffset.y;

      if (offsetY < 0 && !isRefreshing.value) {
        translateY.value = Math.min(-offsetY, MAX_PULL_DISTANCE);

        if (-offsetY >= REFRESH_THRESHOLD) {
          runOnJS(updateRefreshState)('ready');
        } else if (-offsetY > 0) {
          runOnJS(updateRefreshState)('pulling');
        }
      }
    },
    onEndDrag: (event) => {
      if (event.contentOffset.y < -REFRESH_THRESHOLD && !isRefreshing.value) {
        isRefreshing.value = true;
        translateY.value = withSpring(REFRESH_THRESHOLD);
        runOnJS(updateRefreshState)('refreshing');

        // 데이터 새로고침
        runOnJS(refreshData)().then(() => {
          isRefreshing.value = false;
          translateY.value = withTiming(0, { duration: 300 });
          runOnJS(updateRefreshState)('idle');
        });
      } else if (!isRefreshing.value) {
        translateY.value = withSpring(0);
        runOnJS(updateRefreshState)('idle');
      }
    },
  });

  // 인디케이터 컨테이너 스타일
  const indicatorContainerStyle = useAnimatedStyle(() => ({
    height: translateY.value,
    opacity: interpolate(
      translateY.value,
      [0, 30, REFRESH_THRESHOLD],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    ),
  }));

  // 인디케이터 아이콘 스타일
  const indicatorStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateY.value,
      [0, REFRESH_THRESHOLD],
      [0, 180]
    );

    const scale = interpolate(
      translateY.value,
      [0, REFRESH_THRESHOLD * 0.5, REFRESH_THRESHOLD],
      [0.5, 0.8, 1],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ rotate: `${rotate}deg` }, { scale }],
    };
  });

  // 콘텐츠 컨테이너 스타일
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const getIndicatorText = () => {
    switch (refreshState) {
      case 'pulling':
        return '당겨서 새로고침';
      case 'ready':
        return '놓으면 새로고침';
      case 'refreshing':
        return '새로고침 중...';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* 인디케이터 */}
      <Animated.View style={[styles.indicatorContainer, indicatorContainerStyle]}>
        <Animated.View style={[styles.indicator, indicatorStyle]}>
          {refreshState === 'refreshing' ? (
            <LoadingSpinner />
          ) : (
            <ArrowIcon direction={refreshState === 'ready' ? 'up' : 'down'} />
          )}
        </Animated.View>
        <Text style={styles.indicatorText}>{getIndicatorText()}</Text>
      </Animated.View>

      {/* 스크롤 콘텐츠 */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        bounces={true}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={contentStyle}>
          {data.map((item, index) => (
            <View key={index} style={styles.item}>
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

// 화살표 아이콘
function ArrowIcon({ direction }: { direction: 'up' | 'down' }) {
  return (
    <Text style={styles.arrow}>
      {direction === 'up' ? '↑' : '↓'}
    </Text>
  );
}

// 로딩 스피너
function LoadingSpinner() {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withTiming(360, {
      duration: 1000,
    });

    const interval = setInterval(() => {
      rotation.value = 0;
      rotation.value = withTiming(360, { duration: 1000 });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.spinner, style]}>
      <View style={styles.spinnerDot} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  indicatorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  indicator: {
    marginBottom: 8,
  },
  indicatorText: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    fontSize: 24,
    color: '#7A4AE2',
  },
  spinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderTopColor: '#7A4AE2',
  },
  spinnerDot: {
    position: 'absolute',
    top: 2,
    left: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#7A4AE2',
  },
  scrollView: {
    flex: 1,
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

## 💻 진행률 기반 애니메이션

### 당긴 거리에 따른 단계별 변화

```tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const REFRESH_THRESHOLD = 80;
const MAX_PULL = 120;

export default function ProgressPullToRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullDistance = useSharedValue(0);

  const startRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsRefreshing(false);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (event.contentOffset.y < 0) {
        pullDistance.value = Math.min(-event.contentOffset.y, MAX_PULL);
      }
    },
    onEndDrag: (event) => {
      if (event.contentOffset.y < -REFRESH_THRESHOLD) {
        pullDistance.value = withSpring(REFRESH_THRESHOLD);
        runOnJS(startRefresh)().then(() => {
          pullDistance.value = withTiming(0);
        });
      } else {
        pullDistance.value = withSpring(0);
      }
    },
  });

  // 진행률 원형 인디케이터
  const circleAnimatedProps = useAnimatedProps(() => {
    const progress = interpolate(
      pullDistance.value,
      [0, REFRESH_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );

    const circumference = 2 * Math.PI * 20;
    const strokeDashoffset = circumference * (1 - progress);

    return {
      strokeDashoffset,
    };
  });

  // 체크마크 애니메이션
  const checkmarkStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      pullDistance.value,
      [REFRESH_THRESHOLD * 0.8, REFRESH_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      pullDistance.value,
      [REFRESH_THRESHOLD * 0.8, REFRESH_THRESHOLD],
      [0.5, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // 컨테이너 스타일
  const containerStyle = useAnimatedStyle(() => ({
    height: pullDistance.value,
    opacity: interpolate(pullDistance.value, [0, 20], [0, 1]),
  }));

  return (
    <View style={styles.container}>
      {/* 진행률 인디케이터 */}
      <Animated.View style={[styles.indicator, containerStyle]}>
        <Svg width={50} height={50} viewBox="0 0 50 50">
          {/* 배경 원 */}
          <Circle
            cx={25}
            cy={25}
            r={20}
            stroke="#e0e0e0"
            strokeWidth={3}
            fill="none"
          />
          {/* 진행률 원 */}
          <AnimatedCircle
            cx={25}
            cy={25}
            r={20}
            stroke="#7A4AE2"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 20}
            animatedProps={circleAnimatedProps}
            transform="rotate(-90 25 25)"
          />
        </Svg>

        {/* 완료 체크마크 */}
        <Animated.View style={[styles.checkmark, checkmarkStyle]}>
          <Text style={styles.checkmarkText}>✓</Text>
        </Animated.View>
      </Animated.View>

      {/* 스크롤 콘텐츠 */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        bounces={true}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={i} style={styles.item}>
            <Text>Item {i + 1}</Text>
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
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  checkmark: {
    position: 'absolute',
  },
  checkmarkText: {
    fontSize: 20,
    color: '#7A4AE2',
    fontWeight: 'bold',
  },
  item: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
});
```

---

## 💻 Lottie 애니메이션 연동

### Lottie로 풍부한 새로고침 애니메이션

```tsx
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

const REFRESH_THRESHOLD = 100;
const MAX_PULL = 150;

export default function LottiePullToRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lottieRef = useRef<LottieView>(null);

  const pullDistance = useSharedValue(0);
  const lottieProgress = useSharedValue(0);

  const startRefresh = useCallback(async () => {
    setIsRefreshing(true);
    lottieRef.current?.play();

    await new Promise((r) => setTimeout(r, 2000));

    setIsRefreshing(false);
    lottieRef.current?.reset();
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (event.contentOffset.y < 0) {
        pullDistance.value = Math.min(-event.contentOffset.y, MAX_PULL);

        // Lottie 진행률 (0~0.5: 당기는 동안)
        lottieProgress.value = interpolate(
          pullDistance.value,
          [0, REFRESH_THRESHOLD],
          [0, 0.5],
          Extrapolation.CLAMP
        );
      }
    },
    onEndDrag: (event) => {
      if (event.contentOffset.y < -REFRESH_THRESHOLD) {
        pullDistance.value = withSpring(REFRESH_THRESHOLD);
        runOnJS(startRefresh)().then(() => {
          pullDistance.value = withTiming(0);
        });
      } else {
        pullDistance.value = withSpring(0);
        lottieProgress.value = withTiming(0);
      }
    },
  });

  // Lottie 애니메이션 프롭스
  const lottieAnimatedProps = useAnimatedProps(() => ({
    progress: lottieProgress.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    height: pullDistance.value,
    opacity: interpolate(pullDistance.value, [0, 30], [0, 1]),
  }));

  const lottieStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          pullDistance.value,
          [0, REFRESH_THRESHOLD],
          [0.5, 1],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Lottie 인디케이터 */}
      <Animated.View style={[styles.lottieContainer, containerStyle]}>
        <Animated.View style={lottieStyle}>
          <LottieView
            ref={lottieRef}
            source={require('./refresh-animation.json')}
            style={styles.lottie}
            autoPlay={false}
            loop={isRefreshing}
            // animatedProps가 지원되지 않을 수 있음
            // 대안으로 progress prop 직접 제어
          />
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        bounces={true}
        contentContainerStyle={styles.scrollContent}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={i} style={styles.item}>
            <Text>Item {i + 1}</Text>
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
  lottieContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  lottie: {
    width: 80,
    height: 80,
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
});
```

---

## 💻 탄성 효과 (Elastic Pull)

### 고무줄처럼 늘어나는 효과

```tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const REFRESH_THRESHOLD = 100;
const MAX_PULL = 200;
const ELASTIC_FACTOR = 0.4; // 탄성 계수 (낮을수록 더 늘어남)

export default function ElasticPullToRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullDistance = useSharedValue(0);

  const startRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsRefreshing(false);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (event.contentOffset.y < 0) {
        // 탄성 효과: 더 당길수록 저항 증가
        const rawPull = -event.contentOffset.y;
        const elasticPull =
          rawPull < REFRESH_THRESHOLD
            ? rawPull
            : REFRESH_THRESHOLD +
              (rawPull - REFRESH_THRESHOLD) * ELASTIC_FACTOR;

        pullDistance.value = Math.min(elasticPull, MAX_PULL);
      }
    },
    onEndDrag: (event) => {
      if (event.contentOffset.y < -REFRESH_THRESHOLD) {
        // 스프링으로 임계점 위치로 이동
        pullDistance.value = withSpring(REFRESH_THRESHOLD, {
          damping: 15,
          stiffness: 150,
        });
        runOnJS(startRefresh)().then(() => {
          pullDistance.value = withSpring(0, {
            damping: 15,
            stiffness: 150,
          });
        });
      } else {
        // 탄성 있게 원위치
        pullDistance.value = withSpring(0, {
          damping: 12,
          stiffness: 180,
        });
      }
    },
  });

  // 물방울 모양 인디케이터
  const dropletStyle = useAnimatedStyle(() => {
    const progress = pullDistance.value / REFRESH_THRESHOLD;

    // 물방울 늘어남 효과
    const scaleY = interpolate(
      progress,
      [0, 0.5, 1, 2],
      [0, 1, 1.2, 1.4],
      Extrapolation.CLAMP
    );

    const scaleX = interpolate(
      progress,
      [0, 0.5, 1, 2],
      [0, 0.8, 1, 0.9],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      pullDistance.value,
      [0, REFRESH_THRESHOLD, MAX_PULL],
      [-30, 20, 40],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }, { scaleX }, { scaleY }],
      opacity: interpolate(progress, [0, 0.3], [0, 1]),
    };
  });

  // 물방울 하이라이트
  const highlightStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      pullDistance.value,
      [0, MAX_PULL],
      [0, 360]
    );

    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  // 콘텐츠 영역
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pullDistance.value }],
  }));

  return (
    <View style={styles.container}>
      {/* 물방울 인디케이터 */}
      <Animated.View style={[styles.droplet, dropletStyle]}>
        <View style={styles.dropletInner}>
          {isRefreshing ? (
            <RotatingDots />
          ) : (
            <Animated.View style={[styles.highlight, highlightStyle]}>
              <View style={styles.highlightDot} />
            </Animated.View>
          )}
        </View>
      </Animated.View>

      {/* 스크롤 콘텐츠 */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        bounces={true}
      >
        <Animated.View style={contentStyle}>
          <View style={styles.scrollContent}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={i} style={styles.item}>
                <Text>Item {i + 1}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

// 회전하는 점들
function RotatingDots() {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    const animate = () => {
      rotation.value = withTiming(rotation.value + 360, {
        duration: 1000,
      });
    };

    animate();
    const interval = setInterval(animate, 1000);
    return () => clearInterval(interval);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.dotsContainer, style]}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              transform: [{ rotate: `${i * 120}deg` }, { translateY: -10 }],
            },
          ]}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  droplet: {
    position: 'absolute',
    top: 0,
    left: SCREEN_WIDTH / 2 - 25,
    width: 50,
    height: 50,
    zIndex: 100,
  },
  dropletInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7A4AE2',
    justifyContent: 'center',
    alignItems: 'center',
    // 물방울 꼬리 효과
    shadowColor: '#7A4AE2',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  highlight: {
    width: 30,
    height: 30,
  },
  highlightDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotsContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 80,
  },
  item: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 8,
  },
});
```

---

## 💻 브랜드 로고 애니메이션

### 로고가 변형되는 새로고침

```tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path, Circle, G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const REFRESH_THRESHOLD = 100;
const MAX_PULL = 150;

export default function BrandLogoPullToRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullDistance = useSharedValue(0);
  const refreshRotation = useSharedValue(0);

  const startRefresh = useCallback(async () => {
    setIsRefreshing(true);

    // 로고 회전 애니메이션
    refreshRotation.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1, // 무한 반복
      false
    );

    await new Promise((r) => setTimeout(r, 2000));

    refreshRotation.value = withSpring(0);
    setIsRefreshing(false);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (event.contentOffset.y < 0) {
        pullDistance.value = Math.min(-event.contentOffset.y, MAX_PULL);
      }
    },
    onEndDrag: (event) => {
      if (event.contentOffset.y < -REFRESH_THRESHOLD) {
        pullDistance.value = withSpring(REFRESH_THRESHOLD);
        runOnJS(startRefresh)().then(() => {
          pullDistance.value = withTiming(0);
        });
      } else {
        pullDistance.value = withSpring(0);
      }
    },
  });

  // 로고 컨테이너 스타일
  const logoContainerStyle = useAnimatedStyle(() => ({
    height: pullDistance.value,
    opacity: interpolate(pullDistance.value, [0, 30], [0, 1]),
  }));

  // 로고 스타일
  const logoStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      pullDistance.value,
      [0, REFRESH_THRESHOLD],
      [0.3, 1],
      Extrapolation.CLAMP
    );

    const rotate = isRefreshing
      ? refreshRotation.value
      : interpolate(pullDistance.value, [0, REFRESH_THRESHOLD], [0, 180]);

    return {
      transform: [{ scale }, { rotate: `${rotate}deg` }],
    };
  });

  // 하트 펄스 효과
  const heartPulseStyle = useAnimatedStyle(() => {
    const progress = pullDistance.value / REFRESH_THRESHOLD;

    return {
      transform: [
        {
          scale: interpolate(
            progress,
            [0, 0.5, 1],
            [0, 0.8, 1],
            Extrapolation.CLAMP
          ),
        },
      ],
      opacity: interpolate(progress, [0, 0.3, 1], [0, 0.5, 1]),
    };
  });

  return (
    <View style={styles.container}>
      {/* 브랜드 로고 인디케이터 */}
      <Animated.View style={[styles.logoContainer, logoContainerStyle]}>
        <Animated.View style={logoStyle}>
          <Svg width={60} height={60} viewBox="0 0 100 100">
            {/* 하트 모양 로고 */}
            <Path
              d="M50 88C50 88 10 55 10 35C10 20 22 10 35 10C42 10 48 14 50 20C52 14 58 10 65 10C78 10 90 20 90 35C90 55 50 88 50 88Z"
              fill="#7A4AE2"
            />
            {/* 하이라이트 */}
            <Circle cx={30} cy={30} r={8} fill="rgba(255,255,255,0.3)" />
          </Svg>
        </Animated.View>

        {/* 펄스 효과 */}
        <Animated.View style={[styles.pulse, heartPulseStyle]} />
      </Animated.View>

      {/* 스크롤 콘텐츠 */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        bounces={true}
        contentContainerStyle={styles.scrollContent}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={i} style={styles.item}>
            <Text style={styles.itemText}>매칭 카드 {i + 1}</Text>
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
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(122, 74, 226, 0.2)',
  },
  scrollContent: {
    padding: 16,
  },
  item: {
    padding: 20,
    backgroundColor: '#f8f5ff',
    marginBottom: 12,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#7A4AE2',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
```

---

## 📊 Pull-to-Refresh 패턴 비교

| 패턴 | 적합한 앱 | 복잡도 |
|-----|----------|-------|
| 기본 화살표 | 모든 앱 | 낮음 |
| 진행률 원형 | 정밀한 피드백 필요 시 | 중간 |
| Lottie | 브랜드 아이덴티티 중요 | 중간 |
| 탄성 효과 | 게임/재미 요소 | 높음 |
| 브랜드 로고 | 브랜드 강화 | 중간 |

---

## ⚠️ 흔한 실수와 해결법

### 1. 새로고침 상태 중복

```tsx
// ❌ 새로고침 중 또 호출됨
onEndDrag: (event) => {
  if (event.contentOffset.y < -THRESHOLD) {
    runOnJS(startRefresh)();
  }
};

// ✅ 상태 체크
onEndDrag: (event) => {
  if (event.contentOffset.y < -THRESHOLD && !isRefreshing.value) {
    isRefreshing.value = true;
    runOnJS(startRefresh)();
  }
};
```

### 2. 스프링 설정 부조화

```tsx
// ❌ 너무 강한 스프링 (튕김)
pullDistance.value = withSpring(0, { stiffness: 500 });

// ✅ 부드러운 스프링
pullDistance.value = withSpring(0, {
  damping: 15,
  stiffness: 150,
});
```

### 3. 콘텐츠 위치 어긋남

```tsx
// ❌ 콘텐츠가 따라오지 않음
<Animated.ScrollView>
  {content}
</Animated.ScrollView>

// ✅ 콘텐츠도 이동
<Animated.ScrollView>
  <Animated.View style={contentStyle}>
    {content}
  </Animated.View>
</Animated.ScrollView>
```

---

## 💡 성능 최적화 팁

### 애니메이션 최소화

```tsx
// 필요한 경우만 애니메이션 적용
const indicatorStyle = useAnimatedStyle(() => {
  // 당기지 않을 때는 고정값
  if (pullDistance.value <= 0) {
    return { opacity: 0, height: 0 };
  }

  return {
    opacity: interpolate(pullDistance.value, [0, 50], [0, 1]),
    height: pullDistance.value,
  };
});
```

### 메모이제이션

```tsx
// 콜백 메모이제이션
const startRefresh = useCallback(async () => {
  // ...
}, []);

// 스타일 분리
const ListItem = React.memo(({ item }) => (
  <View style={styles.item}>
    <Text>{item}</Text>
  </View>
));
```

---

## 🎯 실무 적용: sometimes-app 매칭 목록

```tsx
// src/features/matching-history/ui/matching-list-refresh.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { useQueryClient } from '@tanstack/react-query';

const REFRESH_THRESHOLD = 80;

export function MatchingListWithRefresh({ children }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const pullDistance = useSharedValue(0);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);

    await queryClient.invalidateQueries({
      queryKey: ['matching-history'],
    });

    setIsRefreshing(false);
  }, [queryClient]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (event.contentOffset.y < 0 && !isRefreshing) {
        pullDistance.value = Math.min(-event.contentOffset.y, 120);
      }
    },
    onEndDrag: (event) => {
      if (event.contentOffset.y < -REFRESH_THRESHOLD && !isRefreshing) {
        pullDistance.value = withSpring(REFRESH_THRESHOLD);
        runOnJS(refresh)().then(() => {
          pullDistance.value = withTiming(0);
        });
      } else {
        pullDistance.value = withSpring(0);
      }
    },
  });

  const indicatorStyle = useAnimatedStyle(() => ({
    height: pullDistance.value,
    opacity: interpolate(pullDistance.value, [0, 30], [0, 1]),
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.indicator, indicatorStyle]}>
        <HeartLoadingIndicator isRefreshing={isRefreshing} />
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        bounces={true}
      >
        {children}
      </Animated.ScrollView>
    </View>
  );
}
```

---

## 🏋️ 연습 문제

### 문제 1: 날씨 테마 새로고침
날씨 앱 스타일로 구름이 나타나고 비가 내리는 새로고침을 구현하세요.

**요구사항**:
- 구름 아이콘이 점점 커짐
- 임계점 도달 시 빗방울 애니메이션
- 새로고침 완료 시 햇살 효과

### 문제 2: 게임 스타일 새로고침
에너지 바가 차오르는 게임 스타일 새로고침을 구현하세요.

**요구사항**:
- 당기는 동안 에너지 바 충전
- 100% 도달 시 폭발 효과
- 캐릭터 점프 애니메이션

### 문제 3: 실패 상태 처리
네트워크 오류 시 실패 애니메이션과 재시도 버튼을 표시하세요.

**요구사항**:
- 실패 시 빨간색 X 표시
- 흔들림 애니메이션
- "다시 시도" 텍스트 표시

---

## 📚 이 장에서 배운 내용

1. **기본 구조**: idle → pulling → ready → refreshing 상태 관리
2. **진행률 표시**: interpolate로 당긴 거리를 시각화
3. **Lottie 연동**: 프레임 제어로 풍부한 애니메이션
4. **탄성 효과**: ELASTIC_FACTOR로 자연스러운 저항
5. **브랜드 로고**: 앱 아이덴티티 반영
6. **최적화**: 상태 체크, 메모이제이션

---

## 다음 장 예고

**Chapter 28: 패럴랙스 스크롤**에서는 깊이감 있는 스크롤 효과를 구현합니다.

- 다층 패럴랙스 배경
- 카드 스택 효과
- 수평 패럴랙스
- 3D 원근감

스크롤에 깊이를 더하는 시각적 효과를 만들어봅니다.
