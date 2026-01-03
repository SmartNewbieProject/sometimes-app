# Chapter 32: 실전 - 인스타그램 스토리

Part 4의 마지막 장입니다. 지금까지 배운 모든 스크롤 기법을 종합해 인스타그램 스타일의 스토리 뷰어를 완성합니다.

## 📌 학습 목표

- 스토리 캐러셀 구현
- 진행률 바 애니메이션
- 자동 재생과 일시정지
- 탭/스와이프 제스처 제어
- 스토리 전환 효과

## 📖 스토리 뷰어 아키텍처

```
┌─────────────────────────────────────┐
│  ProgressBar Container               │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐    │
│  │███│ │███│ │▓▓░│ │░░░│ │░░░│    │
│  └───┘ └───┘ └───┘ └───┘ └───┘    │
├─────────────────────────────────────┤
│  UserInfo: Avatar + Name + Time     │
├─────────────────────────────────────┤
│                                     │
│                                     │
│         Story Content               │
│         (Image/Video)               │
│                                     │
│    ◄──────────┼──────────►          │
│    Prev       │          Next       │
│               │                     │
│           LongPress                 │
│            = Pause                  │
│                                     │
├─────────────────────────────────────┤
│  Reply Input + Actions              │
└─────────────────────────────────────┘
```

### 상태 머신

```
┌──────┐  tap left  ┌──────┐
│      │◄───────────│      │
│ Prev │            │ Play │
│      │───────────►│      │
└──────┘  complete  └──────┘
              │          │
              │          │ long press
              │          ▼
              │     ┌──────┐
              │     │Pause │
              │     └──────┘
              │          │
              │          │ release
              │          ▼
         tap right  ┌──────┐
              └────►│ Next │
                    └──────┘
```

## 💻 기본 스토리 뷰어

### 타입 정의

```typescript
// types/story.ts
export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration: number; // milliseconds
  createdAt: Date;
}

export interface StoryGroup {
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  stories: Story[];
  hasUnread: boolean;
}

export type StoryState = 'idle' | 'playing' | 'paused' | 'transitioning';
```

### 진행률 바 컴포넌트

```typescript
// components/ProgressBar.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';

interface ProgressBarProps {
  count: number;
  currentIndex: number;
  progress: SharedValue<number>;
  isPaused: SharedValue<boolean>;
}

function ProgressBar({ count, currentIndex, progress, isPaused }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <ProgressSegment
          key={index}
          index={index}
          currentIndex={currentIndex}
          progress={progress}
          isPaused={isPaused}
          isLast={index === count - 1}
        />
      ))}
    </View>
  );
}

interface ProgressSegmentProps {
  index: number;
  currentIndex: number;
  progress: SharedValue<number>;
  isPaused: SharedValue<boolean>;
  isLast: boolean;
}

function ProgressSegment({
  index,
  currentIndex,
  progress,
  isPaused,
  isLast,
}: ProgressSegmentProps) {
  const animatedStyle = useAnimatedStyle(() => {
    let width: number | string;

    if (index < currentIndex) {
      // 이미 본 스토리: 100%
      width = '100%';
    } else if (index > currentIndex) {
      // 아직 안 본 스토리: 0%
      width = '0%';
    } else {
      // 현재 스토리: progress에 따라
      width = `${progress.value * 100}%`;
    }

    return {
      width,
    };
  });

  return (
    <View style={[styles.segment, !isLast && styles.segmentMargin]}>
      <View style={styles.segmentBackground} />
      <Animated.View style={[styles.segmentFill, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  segmentMargin: {
    marginRight: 4,
  },
  segmentBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  segmentFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
});

export default ProgressBar;
```

### 스토리 타이머 훅

```typescript
// hooks/useStoryTimer.ts
import { useEffect, useRef, useCallback } from 'react';
import {
  useSharedValue,
  withTiming,
  cancelAnimation,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

interface UseStoryTimerProps {
  duration: number;
  isPaused: boolean;
  onComplete: () => void;
}

export function useStoryTimer({ duration, isPaused, onComplete }: UseStoryTimerProps) {
  const progress = useSharedValue(0);
  const startTime = useRef<number>(0);
  const pausedProgress = useRef<number>(0);

  const startTimer = useCallback(() => {
    const remainingDuration = duration * (1 - pausedProgress.current);
    progress.value = pausedProgress.current;

    progress.value = withTiming(
      1,
      {
        duration: remainingDuration,
        easing: Easing.linear,
      },
      (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      }
    );

    startTime.current = Date.now() - (duration * pausedProgress.current);
  }, [duration, onComplete, progress]);

  const pauseTimer = useCallback(() => {
    const elapsed = Date.now() - startTime.current;
    pausedProgress.current = Math.min(elapsed / duration, 1);
    cancelAnimation(progress);
    progress.value = pausedProgress.current;
  }, [duration, progress]);

  const resetTimer = useCallback(() => {
    cancelAnimation(progress);
    progress.value = 0;
    pausedProgress.current = 0;
    startTime.current = 0;
  }, [progress]);

  useEffect(() => {
    if (isPaused) {
      pauseTimer();
    } else {
      startTimer();
    }

    return () => {
      cancelAnimation(progress);
    };
  }, [isPaused, startTimer, pauseTimer, progress]);

  return {
    progress,
    resetTimer,
  };
}
```

### 제스처 영역 컴포넌트

```typescript
// components/GestureArea.tsx
import React from 'react';
import { StyleSheet, Dimensions, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAP_ZONE_WIDTH = SCREEN_WIDTH * 0.3;

interface GestureAreaProps {
  onTapLeft: () => void;
  onTapRight: () => void;
  onLongPressStart: () => void;
  onLongPressEnd: () => void;
  children: React.ReactNode;
}

function GestureArea({
  onTapLeft,
  onTapRight,
  onLongPressStart,
  onLongPressEnd,
  children,
}: GestureAreaProps) {
  const scale = useSharedValue(1);
  const isPressed = useSharedValue(false);

  const longPressGesture = Gesture.LongPress()
    .minDuration(200)
    .onStart(() => {
      isPressed.value = true;
      scale.value = withSpring(0.98, { damping: 15 });
      runOnJS(onLongPressStart)();
    })
    .onEnd(() => {
      isPressed.value = false;
      scale.value = withSpring(1, { damping: 15 });
      runOnJS(onLongPressEnd)();
    });

  const tapGesture = Gesture.Tap()
    .maxDuration(200)
    .onEnd((event) => {
      if (event.x < TAP_ZONE_WIDTH) {
        runOnJS(onTapLeft)();
      } else if (event.x > SCREEN_WIDTH - TAP_ZONE_WIDTH) {
        runOnJS(onTapRight)();
      }
    });

  const composedGesture = Gesture.Race(longPressGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GestureArea;
```

## 💻 스토리 캐러셀 구현

### 수평 스와이프 네비게이션

```typescript
// components/StoryCarousel.tsx
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { StoryGroup, Story } from '../types/story';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface StoryCarouselProps {
  storyGroups: StoryGroup[];
  initialGroupIndex: number;
  onClose: () => void;
}

function StoryCarousel({
  storyGroups,
  initialGroupIndex,
  onClose,
}: StoryCarouselProps) {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const translateX = useSharedValue(-initialGroupIndex * SCREEN_WIDTH);
  const contextX = useSharedValue(0);

  const currentGroup = storyGroups[currentGroupIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];

  const goToNextGroup = useCallback(() => {
    if (currentGroupIndex < storyGroups.length - 1) {
      const newIndex = currentGroupIndex + 1;
      setCurrentGroupIndex(newIndex);
      setCurrentStoryIndex(0);
      translateX.value = withSpring(-newIndex * SCREEN_WIDTH, {
        damping: 20,
        stiffness: 200,
      });
    } else {
      onClose();
    }
  }, [currentGroupIndex, storyGroups.length, onClose, translateX]);

  const goToPrevGroup = useCallback(() => {
    if (currentGroupIndex > 0) {
      const newIndex = currentGroupIndex - 1;
      setCurrentGroupIndex(newIndex);
      setCurrentStoryIndex(storyGroups[newIndex].stories.length - 1);
      translateX.value = withSpring(-newIndex * SCREEN_WIDTH, {
        damping: 20,
        stiffness: 200,
      });
    }
  }, [currentGroupIndex, storyGroups, translateX]);

  const goToNextStory = useCallback(() => {
    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      goToNextGroup();
    }
  }, [currentStoryIndex, currentGroup.stories.length, goToNextGroup]);

  const goToPrevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else {
      goToPrevGroup();
    }
  }, [currentStoryIndex, goToPrevGroup]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextX.value = translateX.value;
      runOnJS(setIsPaused)(true);
    })
    .onUpdate((event) => {
      const newTranslateX = contextX.value + event.translationX;

      // 경계 처리: 첫 번째와 마지막에서 저항감
      const minX = -(storyGroups.length - 1) * SCREEN_WIDTH;
      const maxX = 0;

      if (newTranslateX > maxX) {
        translateX.value = maxX + (newTranslateX - maxX) * 0.3;
      } else if (newTranslateX < minX) {
        translateX.value = minX + (newTranslateX - minX) * 0.3;
      } else {
        translateX.value = newTranslateX;
      }
    })
    .onEnd((event) => {
      const velocity = event.velocityX;

      if (
        event.translationX < -SWIPE_THRESHOLD ||
        (velocity < -500 && event.translationX < 0)
      ) {
        // 다음 그룹으로
        runOnJS(goToNextGroup)();
      } else if (
        event.translationX > SWIPE_THRESHOLD ||
        (velocity > 500 && event.translationX > 0)
      ) {
        // 이전 그룹으로
        runOnJS(goToPrevGroup)();
      } else {
        // 원위치
        translateX.value = withSpring(-currentGroupIndex * SCREEN_WIDTH, {
          damping: 20,
          stiffness: 200,
        });
      }

      runOnJS(setIsPaused)(false);
    });

  const carouselStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.carousel, carouselStyle]}>
          {storyGroups.map((group, groupIndex) => (
            <StoryGroupView
              key={group.user.id}
              group={group}
              isActive={groupIndex === currentGroupIndex}
              currentStoryIndex={
                groupIndex === currentGroupIndex ? currentStoryIndex : 0
              }
              isPaused={isPaused}
              onTapLeft={goToPrevStory}
              onTapRight={goToNextStory}
              onLongPressStart={() => setIsPaused(true)}
              onLongPressEnd={() => setIsPaused(false)}
              onStoryComplete={goToNextStory}
              translateX={translateX}
              groupIndex={groupIndex}
            />
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  carousel: {
    flexDirection: 'row',
    height: SCREEN_HEIGHT,
  },
});

export default StoryCarousel;
```

### 큐브 전환 효과

```typescript
// components/StoryGroupView.tsx
import React from 'react';
import { View, StyleSheet, Dimensions, Image, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { StoryGroup } from '../types/story';
import ProgressBar from './ProgressBar';
import GestureArea from './GestureArea';
import { useStoryTimer } from '../hooks/useStoryTimer';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PERSPECTIVE = 1000;

interface StoryGroupViewProps {
  group: StoryGroup;
  isActive: boolean;
  currentStoryIndex: number;
  isPaused: boolean;
  onTapLeft: () => void;
  onTapRight: () => void;
  onLongPressStart: () => void;
  onLongPressEnd: () => void;
  onStoryComplete: () => void;
  translateX: SharedValue<number>;
  groupIndex: number;
}

function StoryGroupView({
  group,
  isActive,
  currentStoryIndex,
  isPaused,
  onTapLeft,
  onTapRight,
  onLongPressStart,
  onLongPressEnd,
  onStoryComplete,
  translateX,
  groupIndex,
}: StoryGroupViewProps) {
  const currentStory = group.stories[currentStoryIndex];

  const { progress } = useStoryTimer({
    duration: currentStory?.duration ?? 5000,
    isPaused: isPaused || !isActive,
    onComplete: onStoryComplete,
  });

  // 큐브 효과 스타일
  const cubeStyle = useAnimatedStyle(() => {
    const inputRange = [
      (groupIndex - 1) * SCREEN_WIDTH,
      groupIndex * SCREEN_WIDTH,
      (groupIndex + 1) * SCREEN_WIDTH,
    ];

    const rotateY = interpolate(
      -translateX.value,
      inputRange,
      [45, 0, -45],
      Extrapolation.CLAMP
    );

    const translateXCube = interpolate(
      -translateX.value,
      inputRange,
      [-SCREEN_WIDTH * 0.5, 0, SCREEN_WIDTH * 0.5],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      -translateX.value,
      inputRange,
      [0.85, 1, 0.85],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      -translateX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { perspective: PERSPECTIVE },
        { translateX: translateXCube },
        { rotateY: `${rotateY}deg` },
        { scale },
      ],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.container, cubeStyle]}>
      <GestureArea
        onTapLeft={onTapLeft}
        onTapRight={onTapRight}
        onLongPressStart={onLongPressStart}
        onLongPressEnd={onLongPressEnd}
      >
        {/* 스토리 이미지 */}
        <Image
          source={{ uri: currentStory?.mediaUrl }}
          style={styles.storyImage}
          resizeMode="cover"
        />

        {/* 오버레이 그라데이션 */}
        <View style={styles.overlay} />

        {/* 프로그레스 바 */}
        <View style={styles.progressContainer}>
          <ProgressBar
            count={group.stories.length}
            currentIndex={currentStoryIndex}
            progress={progress}
            isPaused={useSharedValue(isPaused)}
          />
        </View>

        {/* 유저 정보 */}
        <View style={styles.userInfo}>
          <Image
            source={{ uri: group.user.avatar }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{group.user.name}</Text>
          <Text style={styles.timeAgo}>2시간 전</Text>
        </View>
      </GestureArea>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
    overflow: 'hidden',
    borderRadius: 12,
  },
  storyImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.4) 100%)',
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50, // Safe area
  },
  userInfo: {
    position: 'absolute',
    top: 70, // Safe area + progress bar
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  timeAgo: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginLeft: 8,
  },
});

export default StoryGroupView;
```

## 💻 고급 효과 구현

### 이미지 로딩 애니메이션

```typescript
// components/StoryImage.tsx
import React, { useState } from 'react';
import { StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StoryImageProps {
  uri: string;
  onLoadStart: () => void;
  onLoadEnd: () => void;
}

function StoryImage({ uri, onLoadStart, onLoadEnd }: StoryImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1.1);

  const handleLoadStart = () => {
    setIsLoading(true);
    onLoadStart();
  };

  const handleLoadEnd = () => {
    setIsLoading(false);

    // 페이드 인 + 줌 아웃 효과
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });

    onLoadEnd();
  };

  const imageStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <>
      <Animated.View style={[styles.imageContainer, imageStyle]}>
        <FastImage
          source={{
            uri,
            priority: FastImage.priority.high,
          }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
        />
      </Animated.View>

      {isLoading && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default StoryImage;
```

### 스토리 간 전환 애니메이션

```typescript
// components/StoryTransition.tsx
import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StoryTransitionProps {
  direction: 'next' | 'prev' | null;
  onTransitionEnd: () => void;
  children: React.ReactNode;
}

function StoryTransition({
  direction,
  onTransitionEnd,
  children,
}: StoryTransitionProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (direction) {
      progress.value = 0;
      progress.value = withTiming(
        1,
        {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        },
        () => {
          // 전환 완료 콜백
        }
      );
    }
  }, [direction, progress]);

  const currentStyle = useAnimatedStyle(() => {
    if (!direction) {
      return {};
    }

    const translateX = interpolate(
      progress.value,
      [0, 1],
      [0, direction === 'next' ? -SCREEN_WIDTH : SCREEN_WIDTH]
    );

    const scale = interpolate(
      progress.value,
      [0, 0.5, 1],
      [1, 0.95, 0.9]
    );

    const opacity = interpolate(
      progress.value,
      [0, 1],
      [1, 0]
    );

    return {
      transform: [
        { translateX },
        { scale },
      ],
      opacity,
    };
  });

  const nextStyle = useAnimatedStyle(() => {
    if (!direction) {
      return { opacity: 0 };
    }

    const translateX = interpolate(
      progress.value,
      [0, 1],
      [direction === 'next' ? SCREEN_WIDTH : -SCREEN_WIDTH, 0]
    );

    const scale = interpolate(
      progress.value,
      [0, 0.5, 1],
      [0.9, 0.95, 1]
    );

    const opacity = interpolate(
      progress.value,
      [0, 1],
      [0, 1]
    );

    return {
      transform: [
        { translateX },
        { scale },
      ],
      opacity,
    };
  });

  return (
    <>
      <Animated.View style={[styles.container, currentStyle]}>
        {children}
      </Animated.View>
      <Animated.View style={[styles.container, styles.overlay, nextStyle]} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    backgroundColor: '#000',
  },
});

export default StoryTransition;
```

### 닫기 제스처 (위로 드래그)

```typescript
// hooks/useCloseGesture.ts
import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const CLOSE_THRESHOLD = 150;

interface UseCloseGestureProps {
  onClose: () => void;
  onPauseChange: (isPaused: boolean) => void;
}

export function useCloseGesture({ onClose, onPauseChange }: UseCloseGestureProps) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const contextY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onStart(() => {
      contextY.value = translateY.value;
      runOnJS(onPauseChange)(true);
    })
    .onUpdate((event) => {
      // 아래로만 드래그 가능
      const newY = contextY.value + event.translationY;
      translateY.value = Math.max(0, newY);

      // 드래그 거리에 따라 스케일 조정
      scale.value = interpolate(
        translateY.value,
        [0, 300],
        [1, 0.8],
        Extrapolation.CLAMP
      );
    })
    .onEnd((event) => {
      if (translateY.value > CLOSE_THRESHOLD || event.velocityY > 500) {
        // 닫기
        translateY.value = withSpring(1000, { damping: 20 });
        scale.value = withSpring(0.5);
        runOnJS(onClose)();
      } else {
        // 원위치
        translateY.value = withSpring(0, { damping: 20 });
        scale.value = withSpring(1);
        runOnJS(onPauseChange)(false);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(
      translateY.value,
      [0, 100],
      [0, 24],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      borderRadius,
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [0, 200],
      [1, 0],
      Extrapolation.CLAMP
    );

    return {
      backgroundColor: `rgba(0, 0, 0, ${opacity})`,
    };
  });

  return {
    gesture,
    animatedStyle,
    backdropStyle,
  };
}
```

## 💻 완성된 스토리 뷰어

```typescript
// screens/StoryViewerScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StoryGroup, Story } from '../types/story';
import ProgressBar from '../components/ProgressBar';
import StoryImage from '../components/StoryImage';
import UserInfo from '../components/UserInfo';
import ReplyInput from '../components/ReplyInput';
import { useStoryTimer } from '../hooks/useStoryTimer';
import { useCloseGesture } from '../hooks/useCloseGesture';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StoryViewerScreenProps {
  storyGroups: StoryGroup[];
  initialGroupIndex: number;
}

function StoryViewerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const { storyGroups, initialGroupIndex } = route.params as StoryViewerScreenProps;

  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const translateX = useSharedValue(-initialGroupIndex * SCREEN_WIDTH);
  const progress = useSharedValue(0);

  const currentGroup = storyGroups[currentGroupIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const { gesture: closeGesture, animatedStyle, backdropStyle } = useCloseGesture({
    onClose: handleClose,
    onPauseChange: setIsPaused,
  });

  const goToNextStory = useCallback(() => {
    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      progress.value = 0;
    } else if (currentGroupIndex < storyGroups.length - 1) {
      setCurrentGroupIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
      progress.value = 0;
      translateX.value = withSpring(-(currentGroupIndex + 1) * SCREEN_WIDTH);
    } else {
      handleClose();
    }
  }, [
    currentStoryIndex,
    currentGroupIndex,
    currentGroup?.stories.length,
    storyGroups.length,
    handleClose,
    progress,
    translateX,
  ]);

  const goToPrevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      progress.value = 0;
    } else if (currentGroupIndex > 0) {
      setCurrentGroupIndex(prev => prev - 1);
      const prevGroup = storyGroups[currentGroupIndex - 1];
      setCurrentStoryIndex(prevGroup.stories.length - 1);
      progress.value = 0;
      translateX.value = withSpring(-(currentGroupIndex - 1) * SCREEN_WIDTH);
    }
  }, [currentStoryIndex, currentGroupIndex, storyGroups, progress, translateX]);

  // 타이머 훅
  const { resetTimer } = useStoryTimer({
    duration: currentStory?.duration ?? 5000,
    isPaused: isPaused || isImageLoading,
    onComplete: goToNextStory,
  });

  // 탭 제스처
  const tapGesture = Gesture.Tap()
    .maxDuration(200)
    .onEnd((event) => {
      const TAP_ZONE = SCREEN_WIDTH * 0.3;

      if (event.x < TAP_ZONE) {
        runOnJS(goToPrevStory)();
      } else if (event.x > SCREEN_WIDTH - TAP_ZONE) {
        runOnJS(goToNextStory)();
      }
    });

  // 롱프레스 제스처
  const longPressGesture = Gesture.LongPress()
    .minDuration(200)
    .onStart(() => {
      runOnJS(setIsPaused)(true);
    })
    .onEnd(() => {
      runOnJS(setIsPaused)(false);
    });

  // 스와이프 제스처
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onStart(() => {
      runOnJS(setIsPaused)(true);
    })
    .onUpdate((event) => {
      const baseX = -currentGroupIndex * SCREEN_WIDTH;
      translateX.value = baseX + event.translationX * 0.5;
    })
    .onEnd((event) => {
      const SWIPE_THRESHOLD = 80;

      if (event.translationX < -SWIPE_THRESHOLD &&
          currentGroupIndex < storyGroups.length - 1) {
        runOnJS(setCurrentGroupIndex)(currentGroupIndex + 1);
        runOnJS(setCurrentStoryIndex)(0);
        translateX.value = withSpring(-(currentGroupIndex + 1) * SCREEN_WIDTH);
      } else if (event.translationX > SWIPE_THRESHOLD && currentGroupIndex > 0) {
        runOnJS(setCurrentGroupIndex)(currentGroupIndex - 1);
        runOnJS(setCurrentStoryIndex)(0);
        translateX.value = withSpring(-(currentGroupIndex - 1) * SCREEN_WIDTH);
      } else {
        translateX.value = withSpring(-currentGroupIndex * SCREEN_WIDTH);
      }

      runOnJS(setIsPaused)(false);
    });

  const composedGesture = Gesture.Race(
    closeGesture,
    Gesture.Simultaneous(
      tapGesture,
      longPressGesture,
      panGesture
    )
  );

  const carouselStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* 배경 오버레이 */}
      <Animated.View style={[styles.backdrop, backdropStyle]} />

      {/* 메인 스토리 뷰 */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.storyContainer, animatedStyle]}>
          <Animated.View style={[styles.carousel, carouselStyle]}>
            {storyGroups.map((group, groupIndex) => (
              <View key={group.user.id} style={styles.groupContainer}>
                {groupIndex === currentGroupIndex && (
                  <StoryImage
                    uri={currentStory?.mediaUrl ?? ''}
                    onLoadStart={() => setIsImageLoading(true)}
                    onLoadEnd={() => setIsImageLoading(false)}
                  />
                )}
              </View>
            ))}
          </Animated.View>

          {/* UI 오버레이 */}
          <View style={[styles.uiOverlay, { paddingTop: insets.top }]}>
            {/* 프로그레스 바 */}
            <ProgressBar
              count={currentGroup?.stories.length ?? 0}
              currentIndex={currentStoryIndex}
              progress={progress}
              isPaused={useSharedValue(isPaused)}
            />

            {/* 유저 정보 */}
            <UserInfo
              user={currentGroup?.user}
              onClose={handleClose}
            />
          </View>

          {/* 하단 입력 */}
          <View style={[styles.bottomContainer, { paddingBottom: insets.bottom }]}>
            <ReplyInput
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  storyContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  carousel: {
    flexDirection: 'row',
    flex: 1,
  },
  groupContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  uiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
});

export default StoryViewerScreen;
```

## 💻 sometimes-app 적용 사례

### 매칭 스토리 구현

```typescript
// src/features/matching/ui/matching-story-viewer.tsx
import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeOut,
  SlideInDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Heart, X, MessageCircle } from 'lucide-react-native';
import colors from '@/src/shared/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MatchingProfile {
  id: string;
  name: string;
  age: number;
  university: string;
  photos: string[];
  bio: string;
  interests: string[];
}

interface MatchingStoryViewerProps {
  profiles: MatchingProfile[];
  onLike: (profileId: string) => void;
  onPass: (profileId: string) => void;
  onMessage: (profileId: string) => void;
  onClose: () => void;
}

function MatchingStoryViewer({
  profiles,
  onLike,
  onPass,
  onMessage,
  onClose,
}: MatchingStoryViewerProps) {
  const insets = useSafeAreaInsets();

  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const translateX = useSharedValue(0);
  const likeScale = useSharedValue(1);
  const passScale = useSharedValue(1);
  const progress = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const overlayType = useSharedValue<'like' | 'pass' | null>(null);

  const currentProfile = profiles[currentProfileIndex];
  const currentPhoto = currentProfile?.photos[currentPhotoIndex];

  // 자동 진행 타이머
  useEffect(() => {
    if (isPaused) return;

    progress.value = 0;
    progress.value = withTiming(1, { duration: 5000 }, (finished) => {
      if (finished) {
        runOnJS(goToNextPhoto)();
      }
    });

    return () => {
      progress.value = 0;
    };
  }, [currentProfileIndex, currentPhotoIndex, isPaused]);

  const goToNextPhoto = useCallback(() => {
    if (currentPhotoIndex < currentProfile.photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    } else if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(prev => prev + 1);
      setCurrentPhotoIndex(0);
    }
  }, [currentPhotoIndex, currentProfileIndex, currentProfile?.photos.length, profiles.length]);

  const goToPrevPhoto = useCallback(() => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    } else if (currentProfileIndex > 0) {
      setCurrentProfileIndex(prev => prev - 1);
      const prevProfile = profiles[currentProfileIndex - 1];
      setCurrentPhotoIndex(prevProfile.photos.length - 1);
    }
  }, [currentPhotoIndex, currentProfileIndex, profiles]);

  const handleLike = useCallback(() => {
    likeScale.value = withSpring(1.3, { damping: 10 }, () => {
      likeScale.value = withSpring(1);
    });
    overlayType.value = 'like';
    overlayOpacity.value = withTiming(1, { duration: 200 }, () => {
      overlayOpacity.value = withTiming(0, { duration: 200 });
    });

    onLike(currentProfile.id);

    // 다음 프로필로 이동
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(prev => prev + 1);
      setCurrentPhotoIndex(0);
    } else {
      onClose();
    }
  }, [currentProfile?.id, currentProfileIndex, profiles.length, onLike, onClose]);

  const handlePass = useCallback(() => {
    passScale.value = withSpring(1.3, { damping: 10 }, () => {
      passScale.value = withSpring(1);
    });
    overlayType.value = 'pass';
    overlayOpacity.value = withTiming(1, { duration: 200 }, () => {
      overlayOpacity.value = withTiming(0, { duration: 200 });
    });

    onPass(currentProfile.id);

    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(prev => prev + 1);
      setCurrentPhotoIndex(0);
    } else {
      onClose();
    }
  }, [currentProfile?.id, currentProfileIndex, profiles.length, onPass, onClose]);

  // 제스처
  const tapGesture = Gesture.Tap()
    .maxDuration(200)
    .onEnd((event) => {
      const TAP_ZONE = SCREEN_WIDTH * 0.3;
      if (event.x < TAP_ZONE) {
        runOnJS(goToPrevPhoto)();
      } else if (event.x > SCREEN_WIDTH - TAP_ZONE) {
        runOnJS(goToNextPhoto)();
      }
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(200)
    .onStart(() => runOnJS(setIsPaused)(true))
    .onEnd(() => runOnJS(setIsPaused)(false));

  const swipeGesture = Gesture.Pan()
    .activeOffsetY([-20, 20])
    .onUpdate((event) => {
      translateX.value = event.translationX * 0.5;
    })
    .onEnd((event) => {
      if (event.translationX > 100 || event.velocityX > 500) {
        translateX.value = withSpring(SCREEN_WIDTH);
        runOnJS(handleLike)();
      } else if (event.translationX < -100 || event.velocityX < -500) {
        translateX.value = withSpring(-SCREEN_WIDTH);
        runOnJS(handlePass)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const composedGesture = Gesture.Race(
    Gesture.Simultaneous(tapGesture, longPressGesture),
    swipeGesture
  );

  // 애니메이션 스타일
  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-15, 0, 15],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayType.value === 'like' ? overlayOpacity.value : 0,
  }));

  const passOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayType.value === 'pass' ? overlayOpacity.value : 0,
  }));

  const likeButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const passButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: passScale.value }],
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.card, cardStyle]}>
          {/* 프로필 이미지 */}
          <Image
            source={{ uri: currentPhoto }}
            style={styles.profileImage}
            resizeMode="cover"
          />

          {/* 좋아요/패스 오버레이 */}
          <Animated.View style={[styles.likeOverlay, likeOverlayStyle]}>
            <BlurView intensity={50} style={styles.overlayBlur}>
              <Heart size={100} color={colors.primaryPurple} fill={colors.primaryPurple} />
              <Text style={styles.overlayText}>LIKE</Text>
            </BlurView>
          </Animated.View>

          <Animated.View style={[styles.passOverlay, passOverlayStyle]}>
            <BlurView intensity={50} style={styles.overlayBlur}>
              <X size={100} color="#FF6B6B" />
              <Text style={[styles.overlayText, { color: '#FF6B6B' }]}>PASS</Text>
            </BlurView>
          </Animated.View>

          {/* 프로그레스 바 */}
          <View style={[styles.progressContainer, { paddingTop: insets.top + 8 }]}>
            {currentProfile?.photos.map((_, index) => (
              <View key={index} style={styles.progressSegment}>
                <View style={styles.progressBackground} />
                {index === currentPhotoIndex && (
                  <Animated.View
                    style={[
                      styles.progressFill,
                      useAnimatedStyle(() => ({
                        width: `${progress.value * 100}%`,
                      }))
                    ]}
                  />
                )}
                {index < currentPhotoIndex && (
                  <View style={[styles.progressFill, { width: '100%' }]} />
                )}
              </View>
            ))}
          </View>

          {/* 프로필 정보 */}
          <Animated.View
            entering={SlideInDown.duration(300)}
            style={styles.profileInfo}
          >
            <BlurView intensity={80} style={styles.profileBlur}>
              <Text style={styles.profileName}>
                {currentProfile?.name}, {currentProfile?.age}
              </Text>
              <Text style={styles.profileUniversity}>
                {currentProfile?.university}
              </Text>
              <Text style={styles.profileBio} numberOfLines={2}>
                {currentProfile?.bio}
              </Text>

              {/* 관심사 태그 */}
              <View style={styles.interestsContainer}>
                {currentProfile?.interests.slice(0, 3).map((interest, index) => (
                  <View key={index} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </BlurView>
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      {/* 액션 버튼 */}
      <View style={[styles.actionsContainer, { paddingBottom: insets.bottom + 20 }]}>
        <Animated.View style={passButtonStyle}>
          <ActionButton
            icon={<X size={28} color="#FF6B6B" />}
            onPress={handlePass}
            style={styles.passButton}
          />
        </Animated.View>

        <ActionButton
          icon={<MessageCircle size={24} color={colors.primaryPurple} />}
          onPress={() => onMessage(currentProfile?.id)}
          style={styles.messageButton}
        />

        <Animated.View style={likeButtonStyle}>
          <ActionButton
            icon={<Heart size={28} color={colors.primaryPurple} fill={colors.primaryPurple} />}
            onPress={handleLike}
            style={styles.likeButton}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    ...StyleSheet.absoluteFillObject,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  profileInfo: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileBlur: {
    padding: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileUniversity: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  profileBio: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    lineHeight: 20,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  interestTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  likeOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBlur: {
    padding: 40,
    borderRadius: 100,
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primaryPurple,
    marginTop: 8,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  passButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  messageButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.primaryPurple,
  },
});

export default MatchingStoryViewer;
```

## ⚠️ 흔한 실수와 해결법

### 1. 타이머 누수

```typescript
// ❌ 잘못된 예: cleanup 없음
useEffect(() => {
  const timer = setInterval(() => {
    progress.value += 0.01;
  }, 50);
}, []);

// ✅ 올바른 예: Reanimated 애니메이션 + cleanup
useEffect(() => {
  progress.value = withTiming(1, { duration: 5000 });

  return () => {
    cancelAnimation(progress);
  };
}, [storyIndex]);
```

### 2. 제스처 충돌

```typescript
// ❌ 잘못된 예: 제스처 간섭
const panGesture = Gesture.Pan();
const tapGesture = Gesture.Tap();

// ✅ 올바른 예: 우선순위 설정
const panGesture = Gesture.Pan()
  .activeOffsetX([-10, 10]) // 최소 이동 거리 설정
  .failOffsetY([-5, 5]);    // Y축 움직임에서 실패

const composedGesture = Gesture.Race(
  longPressGesture, // 먼저 체크
  Gesture.Simultaneous(tapGesture, panGesture)
);
```

### 3. 메모리 누수

```typescript
// ❌ 잘못된 예: 이미지 캐시 무한 증가
storyGroups.forEach(group => {
  group.stories.forEach(story => {
    Image.prefetch(story.mediaUrl);
  });
});

// ✅ 올바른 예: 현재/다음만 프리페치
useEffect(() => {
  const currentStory = storyGroups[currentGroupIndex]?.stories[currentStoryIndex];
  const nextStory = storyGroups[currentGroupIndex]?.stories[currentStoryIndex + 1];

  if (nextStory) {
    FastImage.preload([{ uri: nextStory.mediaUrl }]);
  }
}, [currentGroupIndex, currentStoryIndex]);
```

## 💡 성능 최적화 팁

### 1. 이미지 프리로딩 전략

```typescript
// hooks/useStoryPreload.ts
import FastImage from 'react-native-fast-image';

export function useStoryPreload(stories: Story[], currentIndex: number) {
  useEffect(() => {
    // 다음 2개 스토리 프리로드
    const preloadUrls = stories
      .slice(currentIndex + 1, currentIndex + 3)
      .map(story => ({ uri: story.mediaUrl }));

    FastImage.preload(preloadUrls);

    // 이전 스토리 캐시에서 제거 (메모리 관리)
    if (currentIndex > 2) {
      const oldUrl = stories[currentIndex - 3]?.mediaUrl;
      if (oldUrl) {
        // FastImage는 자동 캐시 관리, 명시적 제거 필요 없음
      }
    }
  }, [currentIndex, stories]);
}
```

### 2. 비디오 스토리 최적화

```typescript
// components/StoryVideo.tsx
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

function StoryVideo({
  uri,
  isActive,
  isPaused,
  onProgress,
  onComplete,
}: StoryVideoProps) {
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      videoRef.current?.playAsync();
    } else {
      videoRef.current?.pauseAsync();
    }
  }, [isActive, isPaused]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    const progress = status.positionMillis / status.durationMillis;
    onProgress(progress);

    if (status.didJustFinish) {
      onComplete();
    }
  };

  return (
    <Video
      ref={videoRef}
      source={{ uri }}
      style={StyleSheet.absoluteFill}
      resizeMode={ResizeMode.COVER}
      shouldPlay={isActive && !isPaused}
      isLooping={false}
      onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      // 성능 최적화
      usePoster
      posterSource={{ uri: `${uri}?frame=0` }}
      progressUpdateIntervalMillis={100}
    />
  );
}
```

### 3. 메모이제이션

```typescript
// 스토리 그룹 컴포넌트 메모이제이션
const MemoizedStoryGroup = React.memo(
  StoryGroupView,
  (prevProps, nextProps) => {
    // isActive가 변경될 때만 리렌더링
    return (
      prevProps.isActive === nextProps.isActive &&
      prevProps.currentStoryIndex === nextProps.currentStoryIndex
    );
  }
);
```

## 🏋️ 연습 문제

### 문제 1: 스토리 답장 기능
스토리 하단의 답장 입력창을 구현하세요:
- 입력 시 키보드와 함께 올라오는 애니메이션
- 전송 버튼 활성화/비활성화 애니메이션
- 전송 성공 시 체크 아이콘 효과

### 문제 2: 스토리 반응 기능
이모지 반응 기능을 추가하세요:
- 더블 탭으로 하트 이모지 폭발 효과
- 롱프레스로 이모지 선택 패널 표시
- 선택한 이모지가 날아가는 애니메이션

### 문제 3: 스토리 뮤트 기능
비디오 스토리의 음소거 토글을 구현하세요:
- 볼륨 아이콘 애니메이션
- 뮤트 상태 지속 (다음 스토리까지)
- 사운드 웨이브 시각화

## 📚 이 장에서 배운 내용

1. **스토리 뷰어 아키텍처**: 상태 머신과 컴포넌트 구조
2. **진행률 바**: 다중 세그먼트 프로그레스 애니메이션
3. **제스처 조합**: 탭, 롱프레스, 스와이프 동시 처리
4. **캐러셀 구현**: 큐브 효과와 스와이프 전환
5. **닫기 제스처**: 드래그로 닫기와 배경 페이드
6. **성능 최적화**: 프리로딩, 메모이제이션, 비디오 처리

## 🎉 Part 4 완료!

축하합니다! Part 4: 스크롤 연동을 완료했습니다.

### Part 4에서 배운 내용 요약

| 장 | 주제 | 핵심 기술 |
|----|------|----------|
| Ch.25 | 스크롤 이벤트 | useAnimatedScrollHandler |
| Ch.26 | 스크롤 헤더 | 접히는/패럴랙스 헤더 |
| Ch.27 | 당겨서 새로고침 | 커스텀 Pull-to-Refresh |
| Ch.28 | 패럴랙스 스크롤 | 다층 배경, 카드 효과 |
| Ch.29 | 고정 요소 | Sticky 헤더/FAB |
| Ch.30 | 무한 스크롤 | FlatList/FlashList 최적화 |
| Ch.31 | 스크롤 스냅 | 캐러셀, 피커, 루프 |
| Ch.32 | 인스타그램 스토리 | 종합 실전 프로젝트 |

**다음 Part 5: 고급 그래픽스**에서는 SVG 애니메이션, Skia, 3D 효과, 파티클 시스템을 다룹니다.
