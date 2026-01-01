# Chapter 54: 스켈레톤과 플레이스홀더

컨텐츠가 로딩되는 동안 빈 화면 대신 스켈레톤 UI를 보여주면 사용자는 무엇이 로딩되고 있는지 예측할 수 있습니다. 이 장에서는 다양한 레이아웃의 스켈레톤과 이미지 플레이스홀더를 구현합니다.

## 📌 학습 목표

- 복잡한 레이아웃 스켈레톤 구현
- 이미지 플레이스홀더와 블러 전환
- Shimmer 효과 최적화
- 스켈레톤 → 컨텐츠 전환 애니메이션
- 점진적 로딩 패턴
- 스켈레톤 컴포넌트 시스템

## 📖 스켈레톤 디자인 시스템

```
스켈레톤 컴포넌트 계층
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

기본 단위 (Primitives)
╭────────────────────────────────────────────╮
│ SkeletonBox     ▓▓▓▓▓▓▓▓                   │
│ SkeletonCircle  (●)                         │
│ SkeletonText    ▓▓▓▓▓▓▓▓▓▓▓▓               │
╰────────────────────────────────────────────╯
              ▼
복합 단위 (Compounds)
╭────────────────────────────────────────────╮
│ SkeletonCard                               │
│ ╭────────────────────────────────────────╮ │
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │
│ │ (●) ▓▓▓▓▓▓▓▓▓▓▓▓                       │ │
│ │     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                 │ │
│ ╰────────────────────────────────────────╯ │
╰────────────────────────────────────────────╯
              ▼
페이지 단위 (Pages)
╭────────────────────────────────────────────╮
│ SkeletonFeed, SkeletonProfile, etc.        │
╰────────────────────────────────────────────╯

Shimmer 효과:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
      ╲
       ╲ 빛 반사 효과 ──────────▶
        ╲
▓▓▓▓▓▓▓▓░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

왼쪽 → 오른쪽으로 이동하는 그라디언트
```

## 💻 스켈레톤 기본 컴포넌트

### 통합 Shimmer 프로바이더

```typescript
import React, { createContext, useContext } from 'react';
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
import MaskedView from '@react-native-masked-view/masked-view';

// Shimmer 진행도를 공유하는 컨텍스트
const ShimmerContext = createContext<Animated.SharedValue<number> | null>(null);

export function ShimmerProvider({ children }: { children: React.ReactNode }) {
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

  return (
    <ShimmerContext.Provider value={shimmerProgress}>
      {children}
    </ShimmerContext.Provider>
  );
}

export function useShimmerProgress() {
  const context = useContext(ShimmerContext);
  if (!context) {
    throw new Error('useShimmerProgress must be used within ShimmerProvider');
  }
  return context;
}
```

### 기본 스켈레톤 컴포넌트

```typescript
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
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
  const shimmerProgress = useShimmerProgress();

  const shimmerStyle = useAnimatedStyle(() => {
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
          backgroundColor: '#E8E8E8',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, shimmerStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.6)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

// 원형 스켈레톤
export function SkeletonCircle({
  size,
  style,
}: {
  size: number;
  style?: ViewStyle;
}) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  );
}

// 텍스트 스켈레톤
export function SkeletonText({
  lines = 1,
  lineHeight = 16,
  spacing = 8,
  lastLineWidth = '60%',
}: {
  lines?: number;
  lineHeight?: number;
  spacing?: number;
  lastLineWidth?: string | number;
}) {
  return (
    <View style={{ gap: spacing }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height={lineHeight}
        />
      ))}
    </View>
  );
}
```

### 복합 스켈레톤 컴포넌트

```typescript
// 카드 스켈레톤
export function SkeletonCard({
  showImage = true,
  imageHeight = 180,
}: {
  showImage?: boolean;
  imageHeight?: number;
}) {
  return (
    <View style={cardStyles.container}>
      {showImage && (
        <Skeleton
          width="100%"
          height={imageHeight}
          borderRadius={0}
        />
      )}
      <View style={cardStyles.content}>
        <Skeleton width="70%" height={20} />
        <View style={{ height: 12 }} />
        <SkeletonText lines={2} lineHeight={14} />
        <View style={{ height: 16 }} />
        <View style={cardStyles.footer}>
          <SkeletonCircle size={32} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Skeleton width={100} height={12} />
          </View>
          <Skeleton width={60} height={28} borderRadius={14} />
        </View>
      </View>
    </View>
  );
}

// 리스트 아이템 스켈레톤
export function SkeletonListItem({
  avatarSize = 48,
  showDescription = true,
}: {
  avatarSize?: number;
  showDescription?: boolean;
}) {
  return (
    <View style={listStyles.container}>
      <SkeletonCircle size={avatarSize} />
      <View style={listStyles.content}>
        <Skeleton width="50%" height={16} />
        {showDescription && (
          <>
            <View style={{ height: 8 }} />
            <Skeleton width="80%" height={14} />
          </>
        )}
      </View>
      <Skeleton width={60} height={12} />
    </View>
  );
}

// 프로필 헤더 스켈레톤
export function SkeletonProfileHeader() {
  return (
    <View style={profileStyles.container}>
      <SkeletonCircle size={100} />
      <View style={{ height: 16 }} />
      <Skeleton width={150} height={24} />
      <View style={{ height: 8 }} />
      <Skeleton width={200} height={16} />
      <View style={{ height: 20 }} />
      <View style={profileStyles.stats}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={profileStyles.stat}>
            <Skeleton width={40} height={20} />
            <View style={{ height: 4 }} />
            <Skeleton width={60} height={12} />
          </View>
        ))}
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    padding: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

const listStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
});

const profileStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
  },
  stats: {
    flexDirection: 'row',
    gap: 32,
  },
  stat: {
    alignItems: 'center',
  },
});
```

## 💻 이미지 플레이스홀더

### 블러 해시 플레이스홀더

```typescript
import React, { useState } from 'react';
import { StyleSheet, View, Image, ImageStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Blurhash } from 'react-native-blurhash';

interface BlurImageProps {
  source: { uri: string };
  blurhash?: string;
  style?: ImageStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch';
}

export function BlurImage({
  source,
  blurhash = 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
  style,
  resizeMode = 'cover',
}: BlurImageProps) {
  const [loaded, setLoaded] = useState(false);
  const opacity = useSharedValue(0);

  const handleLoad = () => {
    setLoaded(true);
    opacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
  };

  const imageStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const placeholderStyle = useAnimatedStyle(() => ({
    opacity: 1 - opacity.value,
  }));

  return (
    <View style={[blurStyles.container, style]}>
      {/* Blurhash 플레이스홀더 */}
      <Animated.View style={[StyleSheet.absoluteFill, placeholderStyle]}>
        <Blurhash
          blurhash={blurhash}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      </Animated.View>

      {/* 실제 이미지 */}
      <Animated.Image
        source={source}
        style={[StyleSheet.absoluteFill, imageStyle]}
        resizeMode={resizeMode}
        onLoad={handleLoad}
      />
    </View>
  );
}

const blurStyles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#E8E8E8',
  },
});
```

### 점진적 이미지 로딩

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';

interface ProgressiveImageProps {
  source: { uri: string };
  thumbnailSource?: { uri: string };
  style?: ImageStyle;
}

export function ProgressiveImage({
  source,
  thumbnailSource,
  style,
}: ProgressiveImageProps) {
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [fullLoaded, setFullLoaded] = useState(false);

  const progress = useSharedValue(0);
  const blur = useSharedValue(20);

  React.useEffect(() => {
    if (thumbnailLoaded) {
      progress.value = withTiming(0.5, { duration: 200 });
    }
  }, [thumbnailLoaded]);

  React.useEffect(() => {
    if (fullLoaded) {
      progress.value = withTiming(1, { duration: 300 });
      blur.value = withTiming(0, { duration: 300 });
    }
  }, [fullLoaded]);

  const thumbnailStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1], [0, 1, 0]),
  }));

  const fullStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.5, 1], [0, 1]),
  }));

  return (
    <View style={[progressiveStyles.container, style]}>
      {/* 스켈레톤 */}
      {!thumbnailLoaded && (
        <Skeleton
          width="100%"
          height="100%"
          borderRadius={0}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* 썸네일 (블러) */}
      {thumbnailSource && (
        <Animated.Image
          source={thumbnailSource}
          style={[StyleSheet.absoluteFill, thumbnailStyle]}
          resizeMode="cover"
          onLoad={() => setThumbnailLoaded(true)}
          blurRadius={10}
        />
      )}

      {/* 풀 이미지 */}
      <Animated.Image
        source={source}
        style={[StyleSheet.absoluteFill, fullStyle]}
        resizeMode="cover"
        onLoad={() => setFullLoaded(true)}
      />
    </View>
  );
}

const progressiveStyles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#E8E8E8',
  },
});
```

## 💻 스켈레톤 → 컨텐츠 전환

### 페이드 전환

```typescript
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated';

interface ContentLoaderProps<T> {
  loading: boolean;
  data: T | null;
  skeleton: React.ReactNode;
  children: (data: T) => React.ReactNode;
  fadeDuration?: number;
}

export function ContentLoader<T>({
  loading,
  data,
  skeleton,
  children,
  fadeDuration = 300,
}: ContentLoaderProps<T>) {
  if (loading || !data) {
    return (
      <Animated.View
        key="skeleton"
        exiting={FadeOut.duration(fadeDuration)}
      >
        {skeleton}
      </Animated.View>
    );
  }

  return (
    <Animated.View
      key="content"
      entering={FadeIn.duration(fadeDuration).delay(100)}
      layout={Layout.springify()}
    >
      {children(data)}
    </Animated.View>
  );
}

// 사용 예시
function UserProfile() {
  const { data, isLoading } = useUser();

  return (
    <ContentLoader
      loading={isLoading}
      data={data}
      skeleton={<SkeletonProfileHeader />}
    >
      {(user) => (
        <ProfileHeader user={user} />
      )}
    </ContentLoader>
  );
}
```

### 순차적 전환 (Stagger)

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

interface StaggeredLoaderProps<T> {
  loading: boolean;
  items: T[];
  skeleton: React.ReactNode;
  renderItem: (item: T, index: number) => React.ReactNode;
  staggerDelay?: number;
}

export function StaggeredLoader<T>({
  loading,
  items,
  skeleton,
  renderItem,
  staggerDelay = 50,
}: StaggeredLoaderProps<T>) {
  if (loading) {
    return <>{skeleton}</>;
  }

  return (
    <>
      {items.map((item, index) => (
        <StaggeredItem key={index} index={index} delay={staggerDelay}>
          {renderItem(item, index)}
        </StaggeredItem>
      ))}
    </>
  );
}

function StaggeredItem({
  children,
  index,
  delay,
}: {
  children: React.ReactNode;
  index: number;
  delay: number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  React.useEffect(() => {
    opacity.value = withDelay(
      index * delay,
      withTiming(1, { duration: 300 })
    );
    translateY.value = withDelay(
      index * delay,
      withSpring(0, { damping: 15 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}
```

### 스케일 전환

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface ScaleLoaderProps {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
}

export function ScaleLoader({
  loading,
  skeleton,
  children,
}: ScaleLoaderProps) {
  const scale = useSharedValue(loading ? 1 : 0.95);
  const opacity = useSharedValue(loading ? 0 : 1);
  const skeletonOpacity = useSharedValue(loading ? 1 : 0);

  React.useEffect(() => {
    if (!loading) {
      skeletonOpacity.value = withTiming(0, { duration: 200 });

      setTimeout(() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 150 });
        opacity.value = withTiming(1, { duration: 300 });
      }, 200);
    }
  }, [loading]);

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const skeletonStyle = useAnimatedStyle(() => ({
    opacity: skeletonOpacity.value,
    position: skeletonOpacity.value === 0 ? 'absolute' : 'relative',
  }));

  return (
    <View>
      {loading && (
        <Animated.View style={skeletonStyle}>
          {skeleton}
        </Animated.View>
      )}

      <Animated.View style={[contentStyle, !loading && { display: 'flex' }]}>
        {!loading && children}
      </Animated.View>
    </View>
  );
}
```

## 💻 페이지 레벨 스켈레톤

### 피드 스켈레톤

```typescript
export function SkeletonFeed({
  itemCount = 3,
}: {
  itemCount?: number;
}) {
  return (
    <ShimmerProvider>
      <View style={feedStyles.container}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </View>
    </ShimmerProvider>
  );
}

const feedStyles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
});
```

### 프로필 페이지 스켈레톤

```typescript
export function SkeletonProfilePage() {
  return (
    <ShimmerProvider>
      <View style={profilePageStyles.container}>
        {/* 헤더 */}
        <SkeletonProfileHeader />

        {/* 탭 바 */}
        <View style={profilePageStyles.tabs}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width={80} height={32} borderRadius={16} />
          ))}
        </View>

        {/* 그리드 */}
        <View style={profilePageStyles.grid}>
          {Array.from({ length: 9 }).map((_, index) => (
            <Skeleton
              key={index}
              width="31%"
              height={120}
              borderRadius={8}
            />
          ))}
        </View>
      </View>
    </ShimmerProvider>
  );
}

const profilePageStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
    justifyContent: 'space-between',
  },
});
```

### 채팅 목록 스켈레톤

```typescript
export function SkeletonChatList({
  itemCount = 8,
}: {
  itemCount?: number;
}) {
  return (
    <ShimmerProvider>
      <View style={chatListStyles.container}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <View key={index} style={chatListStyles.item}>
            <SkeletonCircle size={56} />
            <View style={chatListStyles.content}>
              <View style={chatListStyles.header}>
                <Skeleton width={100} height={16} />
                <Skeleton width={40} height={12} />
              </View>
              <View style={{ height: 8 }} />
              <Skeleton width="80%" height={14} />
            </View>
          </View>
        ))}
      </View>
    </ShimmerProvider>
  );
}

const chatListStyles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
```

## 📱 sometimes-app 적용 사례

### 매칭 카드 스켈레톤

```typescript
// src/features/matching/ui/MatchingCardSkeleton.tsx
import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

export function MatchingCardSkeleton() {
  return (
    <ShimmerProvider>
      <View style={matchCardStyles.container}>
        {/* 메인 이미지 영역 */}
        <Skeleton
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          borderRadius={24}
          style={matchCardStyles.mainImage}
        />

        {/* 정보 오버레이 */}
        <View style={matchCardStyles.overlay}>
          {/* 이름, 나이 */}
          <Skeleton width={150} height={28} borderRadius={4} />
          <View style={{ height: 8 }} />

          {/* 학교 정보 */}
          <View style={matchCardStyles.infoRow}>
            <Skeleton width={24} height={24} borderRadius={12} />
            <View style={{ width: 8 }} />
            <Skeleton width={100} height={16} />
          </View>

          {/* 거리 정보 */}
          <View style={matchCardStyles.infoRow}>
            <Skeleton width={24} height={24} borderRadius={12} />
            <View style={{ width: 8 }} />
            <Skeleton width={60} height={16} />
          </View>
        </View>

        {/* 액션 버튼 */}
        <View style={matchCardStyles.actions}>
          <SkeletonCircle size={60} />
          <SkeletonCircle size={72} />
          <SkeletonCircle size={60} />
        </View>
      </View>
    </ShimmerProvider>
  );
}

// 펄스 효과 추가된 로딩 카드
export function MatchingLoadingCard() {
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.95, { duration: 1000, easing: Easing.ease }),
        withTiming(1, { duration: 1000, easing: Easing.ease })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View style={pulseStyle}>
      <MatchingCardSkeleton />
    </Animated.View>
  );
}

const matchCardStyles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    alignSelf: 'center',
  },
  mainImage: {
    backgroundColor: '#E8E8E8',
  },
  overlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginTop: -36,
  },
});
```

### 컨텐츠 로더 훅

```typescript
// src/shared/hooks/useContentLoader.ts
import { useState, useEffect } from 'react';
import Animated, {
  useSharedValue,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

interface UseContentLoaderOptions {
  minLoadingTime?: number;
  transitionDelay?: number;
}

export function useContentLoader<T>(
  data: T | null | undefined,
  isLoading: boolean,
  options: UseContentLoaderOptions = {}
) {
  const { minLoadingTime = 300, transitionDelay = 100 } = options;

  const [showSkeleton, setShowSkeleton] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const contentOpacity = useSharedValue(0);

  // 최소 로딩 시간 보장
  useEffect(() => {
    if (isLoading) {
      setMinTimeElapsed(false);
      const timer = setTimeout(() => {
        setMinTimeElapsed(true);
      }, minLoadingTime);
      return () => clearTimeout(timer);
    }
  }, [isLoading, minLoadingTime]);

  // 스켈레톤 표시 상태 관리
  useEffect(() => {
    if (!isLoading && data && minTimeElapsed) {
      // 스켈레톤 숨기기 (딜레이 후)
      const timer = setTimeout(() => {
        setShowSkeleton(false);
        contentOpacity.value = withDelay(
          transitionDelay,
          withTiming(1, { duration: 300 })
        );
      }, transitionDelay);

      return () => clearTimeout(timer);
    }
  }, [isLoading, data, minTimeElapsed, transitionDelay]);

  return {
    showSkeleton,
    contentOpacity,
    isReady: !showSkeleton && !!data,
  };
}

// 사용 예시
function MatchingScreen() {
  const { data, isLoading } = useMatchingPartner();
  const { showSkeleton, contentOpacity, isReady } = useContentLoader(data, isLoading);

  return (
    <View style={styles.container}>
      {showSkeleton && <MatchingCardSkeleton />}

      {isReady && (
        <Animated.View style={{ opacity: contentOpacity }}>
          <MatchingCard partner={data} />
        </Animated.View>
      )}
    </View>
  );
}
```

## ⚠️ 흔한 실수와 해결법

### 1. Shimmer 성능 문제

```typescript
// ❌ 잘못된 예: 각 스켈레톤이 독립적으로 애니메이션
function BadSkeleton() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(/*...*/);
  }, []);

  // 각 인스턴스마다 별도 애니메이션
}

// ✅ 올바른 예: ShimmerProvider로 공유
function GoodSkeleton() {
  const progress = useShimmerProgress(); // 공유된 값 사용
  // ...
}
```

### 2. 레이아웃 점프

```typescript
// ❌ 잘못된 예: 스켈레톤과 실제 컨텐츠 크기 불일치
<SkeletonCard height={200} />
// vs
<RealCard height={250} /> // 전환 시 레이아웃 점프

// ✅ 올바른 예: 동일한 크기 상수 사용
const CARD_HEIGHT = 220;

<SkeletonCard height={CARD_HEIGHT} />
<RealCard height={CARD_HEIGHT} />
```

### 3. 이미지 깜빡임

```typescript
// ❌ 잘못된 예: 이미지 로드 즉시 표시
function Image({ source }) {
  return <Image source={source} />; // 로드 중 깜빡임
}

// ✅ 올바른 예: 로드 완료 후 페이드인
function Image({ source }) {
  const [loaded, setLoaded] = useState(false);
  const opacity = useSharedValue(0);

  return (
    <>
      {!loaded && <Skeleton />}
      <Animated.Image
        source={source}
        style={{ opacity }}
        onLoad={() => {
          setLoaded(true);
          opacity.value = withTiming(1);
        }}
      />
    </>
  );
}
```

## 💡 성능 최적화 팁

### 1. 스켈레톤 캐싱

```typescript
// 스켈레톤 컴포넌트 메모이제이션
export const MemoizedSkeleton = React.memo(Skeleton);

// 복합 스켈레톤도 메모이제이션
export const MemoizedSkeletonCard = React.memo(SkeletonCard);
```

### 2. 조건부 Shimmer

```typescript
// 화면에 보일 때만 Shimmer 활성화
import { useIsFocused } from '@react-navigation/native';

function ScreenWithSkeleton() {
  const isFocused = useIsFocused();

  return (
    <ShimmerProvider enabled={isFocused}>
      <SkeletonContent />
    </ShimmerProvider>
  );
}
```

## 🏋️ 연습 문제

### 문제 1: 이미지 그리드 스켈레톤
3열 이미지 그리드의 스켈레톤을 구현하세요. 각 셀이 순차적으로 나타나는 효과를 추가하세요.

### 문제 2: 카드 스와이프 스켈레톤
Tinder 스타일 카드의 스켈레톤을 구현하세요. 카드가 살짝 흔들리는 효과를 추가하세요.

### 문제 3: 적응형 스켈레톤
실제 컨텐츠의 높이에 맞게 자동으로 조절되는 스켈레톤을 구현하세요.

## 📚 이 장에서 배운 내용

1. **기본 컴포넌트**: Skeleton, SkeletonCircle, SkeletonText
2. **Shimmer 최적화**: ShimmerProvider로 애니메이션 공유
3. **이미지 플레이스홀더**: Blurhash, 점진적 로딩
4. **전환 효과**: 페이드, 스태거, 스케일 전환
5. **페이지 스켈레톤**: 피드, 프로필, 채팅 목록
6. **성능 최적화**: 메모이제이션, 조건부 렌더링

## 다음 장 예고

**Chapter 55: 슬라이더와 선택기**에서는 값을 선택하는 다양한 UI 컴포넌트를 구현합니다. 범위 슬라이더, 별점 선택기, 시간/날짜 선택기 등의 인터랙티브 요소를 만듭니다.
