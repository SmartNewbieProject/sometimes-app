# Chapter 49: 로딩 상태 애니메이션

사용자가 기다리는 시간을 즐겁게 만드는 것이 로딩 애니메이션의 목적입니다. 단순한 스피너부터 Skeleton, Shimmer, 진행률 표시까지 다양한 로딩 UI를 구현합니다.

## 📌 학습 목표

- 로딩 UX 심리학 이해
- Skeleton UI와 Shimmer 효과 구현
- 커스텀 스피너와 로딩 인디케이터
- 진행률 표시 애니메이션
- 풀투리프레시 애니메이션
- 컨텐츠 로딩 전환 효과

## 📖 로딩 UX 심리학

```
로딩 시간과 사용자 인지
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

시간      0s     1s     3s     5s     10s+
         ┃      ┃      ┃      ┃      ┃
         ▼      ▼      ▼      ▼      ▼
인지     즉각   자연   인지   짜증   이탈

대응 전략:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

0-300ms  → 피드백 불필요 (눈에 안 보임)
          ╭─────────────────────────────╮
          │ 즉시 컨텐츠 표시           │
          ╰─────────────────────────────╯

300ms-1s → 미니멀 피드백
          ╭─────────────────────────────╮
          │ 심플 스피너, 버튼 로딩 상태 │
          ╰─────────────────────────────╯

1-3s     → 시각적 피드백 필수
          ╭─────────────────────────────╮
          │ Skeleton UI, 프로그레스 바  │
          ╰─────────────────────────────╯

3-5s     → 진행 상황 표시
          ╭─────────────────────────────╮
          │ 퍼센트, 단계별 진행, 메시지 │
          ╰─────────────────────────────╯

5s+      → 인터랙티브 요소 추가
          ╭─────────────────────────────╮
          │ 취소 버튼, 백그라운드 옵션  │
          ╰─────────────────────────────╯

핵심 원칙:
1. 진행감 (뭔가 일어나고 있다)
2. 예측성 (얼마나 걸릴지 알려줌)
3. 시각적 흥미 (지루함 방지)
```

## 💻 Skeleton UI

### 기본 Skeleton 컴포넌트

```typescript
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width,
  height,
  borderRadius = 4,
  style,
}: SkeletonProps) {
  const shimmerProgress = useSharedValue(0);

  React.useEffect(() => {
    shimmerProgress.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerProgress.value,
      [0, 1],
      [-200, 200]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E5E5E5',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.5)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

// 텍스트 스켈레톤
export function SkeletonText({
  lines = 3,
  lineHeight = 16,
  spacing = 8,
}: {
  lines?: number;
  lineHeight?: number;
  spacing?: number;
}) {
  return (
    <View style={{ gap: spacing }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '60%' : '100%'}
          height={lineHeight}
        />
      ))}
    </View>
  );
}

// 아바타 스켈레톤
export function SkeletonAvatar({
  size = 48,
}: {
  size?: number;
}) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius={size / 2}
    />
  );
}
```

### Skeleton 카드 컴포넌트

```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';

interface SkeletonCardProps {
  showImage?: boolean;
  imageHeight?: number;
}

export function SkeletonCard({
  showImage = true,
  imageHeight = 200,
}: SkeletonCardProps) {
  return (
    <View style={styles.card}>
      {showImage && (
        <Skeleton
          width="100%"
          height={imageHeight}
          borderRadius={0}
        />
      )}
      <View style={styles.cardContent}>
        <Skeleton width="70%" height={20} />
        <View style={{ height: 12 }} />
        <SkeletonText lines={2} lineHeight={14} />
        <View style={{ height: 16 }} />
        <View style={styles.cardFooter}>
          <SkeletonAvatar size={32} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Skeleton width={80} height={12} />
          </View>
          <Skeleton width={60} height={24} borderRadius={12} />
        </View>
      </View>
    </View>
  );
}

// 리스트 아이템 스켈레톤
export function SkeletonListItem() {
  return (
    <View style={styles.listItem}>
      <SkeletonAvatar size={56} />
      <View style={styles.listItemContent}>
        <Skeleton width="60%" height={16} />
        <View style={{ height: 8 }} />
        <Skeleton width="90%" height={14} />
      </View>
    </View>
  );
}

// 순차 로딩 스켈레톤 (stagger 효과)
export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <View style={{ gap: 16 }}>
      {Array.from({ length: count }).map((_, index) => (
        <StaggeredSkeleton key={index} delay={index * 100}>
          <SkeletonListItem />
        </StaggeredSkeleton>
      ))}
    </View>
  );
}

function StaggeredSkeleton({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 300 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    padding: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
});
```

### 펄스 Skeleton

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export function PulsingSkeleton({
  width,
  height,
  borderRadius = 4,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
}) {
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, {
          duration: 800,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 800,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E5E5E5',
        },
        animatedStyle,
      ]}
    />
  );
}
```

## 💻 커스텀 스피너

### 점 스피너

```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withDelay,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface DotsSpinnerProps {
  size?: number;
  color?: string;
  dotCount?: number;
}

export function DotsSpinner({
  size = 10,
  color = '#7A4AE2',
  dotCount = 3,
}: DotsSpinnerProps) {
  return (
    <View style={styles.dotsContainer}>
      {Array.from({ length: dotCount }).map((_, index) => (
        <BouncingDot
          key={index}
          size={size}
          color={color}
          delay={index * 150}
        />
      ))}
    </View>
  );
}

function BouncingDot({
  size,
  color,
  delay,
}: {
  size: number;
  color: string;
  delay: number;
}) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 300, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          marginHorizontal: size / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

### 회전 스피너

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

interface CircleSpinnerProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function CircleSpinner({
  size = 48,
  color = '#7A4AE2',
  strokeWidth = 4,
}: CircleSpinnerProps) {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashLength = circumference * 0.75;

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 배경 원 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.2}
        />
        {/* 회전하는 호 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${dashLength} ${circumference}`}
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

// 물결 스피너
export function WaveSpinner({
  size = 48,
  color = '#7A4AE2',
}: {
  size?: number;
  color?: string;
}) {
  const bars = 5;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: size }}>
      {Array.from({ length: bars }).map((_, index) => (
        <WaveBar
          key={index}
          height={size}
          color={color}
          delay={index * 100}
        />
      ))}
    </View>
  );
}

function WaveBar({
  height,
  color,
  delay,
}: {
  height: number;
  color: string;
  delay: number;
}) {
  const scaleY = useSharedValue(0.4);

  React.useEffect(() => {
    scaleY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300, easing: Easing.ease }),
          withTiming(0.4, { duration: 300, easing: Easing.ease })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scaleY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 4,
          height,
          backgroundColor: color,
          marginHorizontal: 2,
          borderRadius: 2,
        },
        animatedStyle,
      ]}
    />
  );
}
```

### 브랜드 스피너

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

// 하트 스피너 (매칭 앱 테마)
export function HeartSpinner({ size = 48 }: { size?: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    // 심장 박동 효과
    scale.value = withRepeat(
      withSequence(
        withSpring(1.2, { damping: 2, stiffness: 300 }),
        withSpring(1, { damping: 5, stiffness: 200 }),
        withTiming(1, { duration: 300 }) // 잠깐 쉼
      ),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0.6, { duration: 150 }),
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={{ fontSize: size }}>❤️</Text>
    </Animated.View>
  );
}

// 로고 스피너
export function LogoSpinner({ size = 64 }: { size?: number }) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#7A4AE2',
          justifyContent: 'center',
          alignItems: 'center',
        },
        animatedStyle,
      ]}
    >
      <Text style={{ color: 'white', fontSize: size * 0.4, fontWeight: 'bold' }}>
        S
      </Text>
    </Animated.View>
  );
}
```

## 💻 프로그레스 바

### 선형 프로그레스 바

```typescript
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

interface LinearProgressProps {
  progress: number; // 0 to 1
  height?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export function LinearProgress({
  progress,
  height = 8,
  color = '#7A4AE2',
  backgroundColor = '#E5E5E5',
  showLabel = false,
  animated = true,
}: LinearProgressProps) {
  const progressValue = useSharedValue(0);

  React.useEffect(() => {
    progressValue.value = animated
      ? withSpring(Math.min(Math.max(progress, 0), 1), {
          damping: 15,
          stiffness: 100,
        })
      : progress;
  }, [progress, animated]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  return (
    <View style={{ gap: 4 }}>
      {showLabel && (
        <Text style={styles.progressLabel}>
          {Math.round(progress * 100)}%
        </Text>
      )}
      <View
        style={[
          styles.progressTrack,
          { height, backgroundColor, borderRadius: height / 2 },
        ]}
      >
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: color, borderRadius: height / 2 },
            progressStyle,
          ]}
        />
      </View>
    </View>
  );
}

// 세그먼트 프로그레스
export function SegmentedProgress({
  current,
  total,
  color = '#7A4AE2',
}: {
  current: number;
  total: number;
  color?: string;
}) {
  return (
    <View style={styles.segmentContainer}>
      {Array.from({ length: total }).map((_, index) => (
        <SegmentItem
          key={index}
          isActive={index < current}
          isCurrent={index === current - 1}
          color={color}
        />
      ))}
    </View>
  );
}

function SegmentItem({
  isActive,
  isCurrent,
  color,
}: {
  isActive: boolean;
  isCurrent: boolean;
  color: string;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(isActive ? 1 : 0.3);

  React.useEffect(() => {
    if (isCurrent) {
      scale.value = withSpring(1.1, { damping: 10 });
    } else {
      scale.value = withSpring(1);
    }
    opacity.value = withTiming(isActive ? 1 : 0.3, { duration: 300 });
  }, [isActive, isCurrent]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    backgroundColor: isActive ? color : '#E5E5E5',
  }));

  return <Animated.View style={[styles.segment, animatedStyle]} />;
}

const styles = StyleSheet.create({
  progressTrack: {
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  segmentContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
});
```

### 원형 프로그레스

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  children?: React.ReactNode;
}

export function CircularProgress({
  progress,
  size = 100,
  strokeWidth = 8,
  color = '#7A4AE2',
  backgroundColor = '#E5E5E5',
  showLabel = true,
  children,
}: CircularProgressProps) {
  const progressValue = useSharedValue(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  React.useEffect(() => {
    progressValue.value = withSpring(Math.min(Math.max(progress, 0), 1), {
      damping: 15,
      stiffness: 100,
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progressValue.value),
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* 배경 원 */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* 프로그레스 원 */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* 중앙 컨텐츠 */}
      <View style={[StyleSheet.absoluteFill, styles.centerContent]}>
        {children || (showLabel && (
          <Text style={styles.circularLabel}>
            {Math.round(progress * 100)}%
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
```

### 불확정 프로그레스

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';

export function IndeterminateProgress({
  height = 4,
  color = '#7A4AE2',
  backgroundColor = '#E5E5E5',
}: {
  height?: number;
  color?: string;
  backgroundColor?: string;
}) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    );
  }, []);

  const barStyle = useAnimatedStyle(() => {
    const left = interpolate(progress.value, [0, 0.5, 1], [0, 30, 100]);
    const width = interpolate(progress.value, [0, 0.25, 0.5, 0.75, 1], [10, 40, 40, 40, 10]);

    return {
      left: `${left}%`,
      width: `${width}%`,
      marginLeft: `-${width / 2}%`,
    };
  });

  return (
    <View
      style={{
        height,
        backgroundColor,
        borderRadius: height / 2,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            height: '100%',
            backgroundColor: color,
            borderRadius: height / 2,
          },
          barStyle,
        ]}
      />
    </View>
  );
}
```

## 💻 풀투리프레시 애니메이션

### 커스텀 리프레시 컨트롤

```typescript
import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Extrapolation,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

const REFRESH_THRESHOLD = 80;
const REFRESH_INDICATOR_HEIGHT = 60;

interface CustomRefreshControlProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
}

export function CustomRefreshControl({
  children,
  onRefresh,
}: CustomRefreshControlProps) {
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useSharedValue(0);
  const isReadyToRefresh = useSharedValue(false);

  const triggerRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
    onEndDrag: () => {
      if (scrollY.value < -REFRESH_THRESHOLD && !refreshing) {
        isReadyToRefresh.value = true;
        runOnJS(triggerRefresh)();
      }
    },
  });

  const indicatorStyle = useAnimatedStyle(() => {
    const pullDistance = -scrollY.value;

    const translateY = interpolate(
      pullDistance,
      [0, REFRESH_THRESHOLD],
      [-REFRESH_INDICATOR_HEIGHT, 0],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      pullDistance,
      [0, REFRESH_THRESHOLD / 2, REFRESH_THRESHOLD],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      {/* 리프레시 인디케이터 */}
      <Animated.View style={[styles.refreshIndicator, indicatorStyle]}>
        <RefreshIndicatorContent
          scrollY={scrollY}
          refreshing={refreshing}
        />
      </Animated.View>

      {/* 컨텐츠 */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: refreshing ? REFRESH_INDICATOR_HEIGHT : 0,
        }}
      >
        {children}
      </Animated.ScrollView>
    </View>
  );
}

function RefreshIndicatorContent({
  scrollY,
  refreshing,
}: {
  scrollY: Animated.SharedValue<number>;
  refreshing: boolean;
}) {
  const rotation = useSharedValue(0);
  const arrowRotation = useSharedValue(0);

  React.useEffect(() => {
    if (refreshing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      rotation.value = 0;
    }
  }, [refreshing]);

  const arrowStyle = useAnimatedStyle(() => {
    if (refreshing) {
      return {
        transform: [{ rotate: `${rotation.value}deg` }],
      };
    }

    const pullDistance = -scrollY.value;
    const rotate = interpolate(
      pullDistance,
      [0, REFRESH_THRESHOLD],
      [0, 180],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  return (
    <View style={styles.indicatorContent}>
      <Animated.View style={arrowStyle}>
        <Text style={styles.arrow}>
          {refreshing ? '⟳' : '↓'}
        </Text>
      </Animated.View>
      <Text style={styles.refreshText}>
        {refreshing ? '새로고침 중...' : '당겨서 새로고침'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  refreshIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: REFRESH_INDICATOR_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  indicatorContent: {
    alignItems: 'center',
    gap: 8,
  },
  arrow: {
    fontSize: 24,
    color: '#7A4AE2',
  },
  refreshText: {
    fontSize: 12,
    color: '#666',
  },
});
```

### Lottie 리프레시 인디케이터

```typescript
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const AnimatedLottie = Animated.createAnimatedComponent(LottieView);

function LottieRefreshIndicator({
  scrollY,
  refreshing,
}: {
  scrollY: Animated.SharedValue<number>;
  refreshing: boolean;
}) {
  const lottieRef = React.useRef<LottieView>(null);

  React.useEffect(() => {
    if (refreshing) {
      lottieRef.current?.play();
    } else {
      lottieRef.current?.reset();
    }
  }, [refreshing]);

  const animatedProps = useAnimatedProps(() => {
    if (refreshing) {
      return {};
    }

    const pullDistance = -scrollY.value;
    const progress = interpolate(
      pullDistance,
      [0, REFRESH_THRESHOLD],
      [0, 0.5],
      Extrapolation.CLAMP
    );

    return {
      progress,
    };
  });

  return (
    <AnimatedLottie
      ref={lottieRef}
      source={require('./refresh-animation.json')}
      style={{ width: 60, height: 60 }}
      autoPlay={refreshing}
      loop={refreshing}
      animatedProps={animatedProps}
    />
  );
}
```

## 💻 컨텐츠 전환 효과

### Skeleton에서 컨텐츠로 전환

```typescript
import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

interface ContentLoaderProps<T> {
  loading: boolean;
  data: T | null;
  skeleton: React.ReactNode;
  children: (data: T) => React.ReactNode;
}

export function ContentLoader<T>({
  loading,
  data,
  skeleton,
  children,
}: ContentLoaderProps<T>) {
  if (loading || !data) {
    return (
      <Animated.View exiting={FadeOut.duration(200)}>
        {skeleton}
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(300).delay(100)}>
      {children(data)}
    </Animated.View>
  );
}

// 사용 예시
function UserCard() {
  const { data, isLoading } = useUser();

  return (
    <ContentLoader
      loading={isLoading}
      data={data}
      skeleton={
        <View style={styles.cardContainer}>
          <SkeletonAvatar size={64} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Skeleton width={120} height={18} />
            <View style={{ height: 8 }} />
            <Skeleton width={180} height={14} />
          </View>
        </View>
      }
    >
      {(user) => (
        <View style={styles.cardContainer}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.bio}>{user.bio}</Text>
          </View>
        </View>
      )}
    </ContentLoader>
  );
}
```

### 블러 전환 효과

```typescript
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useAnimatedProps,
} from 'react-native-reanimated';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export function BlurLoader({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  const intensity = useSharedValue(loading ? 50 : 0);

  React.useEffect(() => {
    intensity.value = withTiming(loading ? 50 : 0, { duration: 300 });
  }, [loading]);

  const animatedProps = useAnimatedProps(() => ({
    intensity: intensity.value,
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: intensity.value / 50,
  }));

  return (
    <View style={{ flex: 1 }}>
      {children}

      {loading && (
        <Animated.View style={[StyleSheet.absoluteFill, overlayStyle]}>
          <AnimatedBlurView
            tint="light"
            animatedProps={animatedProps}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.loaderCenter}>
            <CircleSpinner />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loaderCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

## 📱 sometimes-app 적용 사례

### 매칭 대기 애니메이션

```typescript
// src/features/matching/ui/MatchingLoader.tsx
import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface MatchingLoaderProps {
  message?: string;
  estimatedTime?: number; // seconds
}

export function MatchingLoader({
  message = '매칭 상대를 찾고 있어요',
  estimatedTime,
}: MatchingLoaderProps) {
  return (
    <View style={styles.container}>
      <HeartPulseAnimation />
      <Text style={styles.message}>{message}</Text>
      {estimatedTime && (
        <EstimatedTimeCounter initialTime={estimatedTime} />
      )}
      <WaveBackground />
    </View>
  );
}

function HeartPulseAnimation() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(0);

  React.useEffect(() => {
    // 심장 박동
    scale.value = withRepeat(
      withSequence(
        withSpring(1.15, { damping: 3, stiffness: 300 }),
        withSpring(1, { damping: 5, stiffness: 200 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      false
    );

    // 파동 효과
    ringScale.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(2, { duration: 1500, easing: Easing.out(Easing.ease) })
      ),
      -1,
      false
    );

    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 0 }),
        withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <View style={styles.heartContainer}>
      {/* 파동 링 */}
      <Animated.View style={[styles.ring, ringStyle]} />
      <Animated.View style={[styles.ring, { ...ringStyle }]} />

      {/* 하트 */}
      <Animated.View style={heartStyle}>
        <View style={styles.heart}>
          <Text style={styles.heartEmoji}>💜</Text>
        </View>
      </Animated.View>
    </View>
  );
}

function EstimatedTimeCounter({ initialTime }: { initialTime: number }) {
  const [remaining, setRemaining] = React.useState(initialTime);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.timeContainer}>
      <Text style={styles.timeLabel}>예상 대기 시간</Text>
      <Text style={styles.timeValue}>{formatTime(remaining)}</Text>
    </View>
  );
}

function WaveBackground() {
  const wave1 = useSharedValue(0);
  const wave2 = useSharedValue(0);

  React.useEffect(() => {
    wave1.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );

    wave2.value = withDelay(
      1500,
      withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, []);

  const wave1Style = useAnimatedStyle(() => {
    const translateX = interpolate(wave1.value, [0, 1], [-width, width]);

    return {
      transform: [{ translateX }],
    };
  });

  const wave2Style = useAnimatedStyle(() => {
    const translateX = interpolate(wave2.value, [0, 1], [-width, width]);

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={styles.waveContainer}>
      <Animated.View style={[styles.wave, styles.wave1, wave1Style]} />
      <Animated.View style={[styles.wave, styles.wave2, wave2Style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F4FF',
  },
  heartContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heart: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartEmoji: {
    fontSize: 60,
  },
  ring: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#7A4AE2',
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
  },
  timeContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  timeLabel: {
    fontSize: 12,
    color: '#888',
  },
  timeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7A4AE2',
    marginTop: 4,
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    width: width * 2,
    height: 100,
    bottom: 0,
  },
  wave1: {
    backgroundColor: 'rgba(122, 74, 226, 0.1)',
    borderTopLeftRadius: 1000,
    borderTopRightRadius: 1000,
  },
  wave2: {
    backgroundColor: 'rgba(122, 74, 226, 0.05)',
    borderTopLeftRadius: 800,
    borderTopRightRadius: 800,
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 1. 로딩 깜빡임

```typescript
// ❌ 잘못된 예: 빠른 로딩 시 깜빡임
function DataList() {
  const { data, isLoading } = useData();

  return isLoading ? <Skeleton /> : <List data={data} />;
}

// ✅ 올바른 예: 최소 표시 시간 보장
function DataList() {
  const { data, isLoading } = useData();
  const [showSkeleton, setShowSkeleton] = useState(false);

  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowSkeleton(true), 200);
      return () => clearTimeout(timer);
    } else {
      // 최소 300ms 표시
      const timer = setTimeout(() => setShowSkeleton(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (showSkeleton) return <Skeleton />;
  if (!data) return null;
  return <List data={data} />;
}
```

### 2. 불필요한 애니메이션 반복

```typescript
// ❌ 잘못된 예: 매 렌더링마다 애니메이션 시작
function Loader() {
  const rotation = useSharedValue(0);

  // 매 렌더링마다 실행됨
  rotation.value = withRepeat(withTiming(360), -1);

  // ...
}

// ✅ 올바른 예: useEffect로 한 번만 시작
function Loader() {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1,
      false
    );

    return () => {
      cancelAnimation(rotation);
    };
  }, []);

  // ...
}
```

### 3. Skeleton 레이아웃 불일치

```typescript
// ❌ 잘못된 예: 실제 컨텐츠와 크기가 다름
<Skeleton width={100} height={20} />
// 실제 컨텐츠
<Text style={{ fontSize: 16 }}>{title}</Text>

// ✅ 올바른 예: 공통 상수 사용
const TITLE_HEIGHT = 20;
const TITLE_FONT_SIZE = 16;
const TITLE_LINE_HEIGHT = TITLE_HEIGHT;

// Skeleton
<Skeleton width="70%" height={TITLE_HEIGHT} />

// 실제 컨텐츠
<Text style={{
  fontSize: TITLE_FONT_SIZE,
  lineHeight: TITLE_LINE_HEIGHT
}}>
  {title}
</Text>
```

## 💡 성능 최적화 팁

### 1. Shimmer 성능 최적화

```typescript
// 전체 화면에 하나의 shimmer 그라디언트 공유
const ShimmerContext = React.createContext<Animated.SharedValue<number> | null>(null);

export function ShimmerProvider({ children }: { children: React.ReactNode }) {
  const shimmerProgress = useSharedValue(0);

  React.useEffect(() => {
    shimmerProgress.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  return (
    <ShimmerContext.Provider value={shimmerProgress}>
      {children}
    </ShimmerContext.Provider>
  );
}

export function useShimmer() {
  return React.useContext(ShimmerContext);
}
```

### 2. 조건부 애니메이션

```typescript
// 화면에 보일 때만 애니메이션 실행
import { useIsFocused } from '@react-navigation/native';

function ScreenWithLoader() {
  const isFocused = useIsFocused();

  return (
    <View>
      {isFocused && <AnimatedLoader />}
    </View>
  );
}
```

## 🏋️ 연습 문제

### 문제 1: 타이핑 로더
세 개의 점이 순서대로 나타났다가 사라지는 타이핑 인디케이터를 구현하세요.

### 문제 2: 단계별 프로그레스
"연결 중 → 데이터 로딩 → 처리 중 → 완료" 4단계를 표시하는 프로그레스 UI를 구현하세요.

### 문제 3: 이미지 플레이스홀더
이미지가 로드되기 전 블러 플레이스홀더를 보여주고, 로드 완료 시 부드럽게 전환하세요.

## 📚 이 장에서 배운 내용

1. **로딩 UX**: 시간대별 적절한 피드백 전략
2. **Skeleton UI**: Shimmer, Pulse 효과
3. **스피너**: Dots, Circle, Wave, 브랜드 스피너
4. **프로그레스**: 선형, 원형, 세그먼트, 불확정
5. **풀투리프레시**: 커스텀 리프레시 컨트롤
6. **전환 효과**: Skeleton → 컨텐츠 페이드

## 다음 장 예고

**Chapter 50: 성공/실패 피드백**에서는 작업 완료 후 사용자에게 결과를 알려주는 애니메이션을 만듭니다. 체크마크 애니메이션, 에러 흔들기, 성공/실패 토스트를 구현합니다.
