# Chapter 15: 실전 - Tinder 스와이프 카드

## 📌 개요

이 장에서는 지금까지 배운 모든 제스처 개념을 종합하여 완전한 Tinder 스타일 스와이프 카드 UI를 구현합니다. 카드 스택, 스와이프 제스처, 상태 관리, 애니메이션을 모두 포함한 프로덕션 레벨의 구현을 다룹니다.

### 학습 목표

- 카드 스택 레이아웃 구현
- 스와이프 제스처와 물리 기반 애니메이션
- LIKE/NOPE/SUPER LIKE 오버레이
- 버튼 액션과 제스처 연동
- 카드 되돌리기 (Undo) 기능

---

## 💻 프로젝트 구조

```
src/features/swipe-card/
├── types.ts              # 타입 정의
├── constants.ts          # 상수 (임계값, 크기)
├── hooks/
│   ├── useSwipeGesture.ts    # 스와이프 제스처 훅
│   └── useCardAnimation.ts   # 카드 애니메이션 훅
└── ui/
    ├── SwipeCard.tsx         # 단일 카드 컴포넌트
    ├── CardStack.tsx         # 카드 스택 컨테이너
    ├── ActionOverlay.tsx     # LIKE/NOPE 오버레이
    └── ActionButtons.tsx     # 하단 버튼들
```

---

## 💻 Step 1: 타입과 상수 정의

### types.ts

```typescript
export interface Profile {
  id: string;
  name: string;
  age: number;
  photos: string[];
  bio?: string;
  distance?: number;
}

export type SwipeDirection = 'left' | 'right' | 'up' | 'none';

export interface SwipeResult {
  profile: Profile;
  direction: SwipeDirection;
}

export const CardState = {
  IDLE: 'IDLE',
  DRAGGING: 'DRAGGING',
  LIKING: 'LIKING',
  NOPING: 'NOPING',
  SUPER_LIKING: 'SUPER_LIKING',
  SWIPED: 'SWIPED',
  RETURNING: 'RETURNING',
} as const;

export type CardStateType = typeof CardState[keyof typeof CardState];
```

### constants.ts

```typescript
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const CARD_WIDTH = SCREEN_WIDTH * 0.9;
export const CARD_HEIGHT = SCREEN_HEIGHT * 0.7;

// 스와이프 임계값
export const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
export const SWIPE_UP_THRESHOLD = SCREEN_HEIGHT * 0.15;
export const VELOCITY_THRESHOLD = 800;

// 애니메이션 목적지
export const SWIPE_OUT_X = SCREEN_WIDTH * 1.5;
export const SWIPE_OUT_Y = -SCREEN_HEIGHT;

// 회전 각도 (deg)
export const MAX_ROTATION = 15;

// 스케일
export const NEXT_CARD_SCALE = 0.95;
export const NEXT_CARD_OPACITY = 0.8;
```

---

## 💻 Step 2: 스와이프 제스처 훅

### useSwipeGesture.ts

```typescript
import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {
  SWIPE_THRESHOLD,
  SWIPE_UP_THRESHOLD,
  VELOCITY_THRESHOLD,
  SWIPE_OUT_X,
  SWIPE_OUT_Y,
  MAX_ROTATION,
} from '../constants';
import { CardState, CardStateType, SwipeDirection, Profile } from '../types';

interface UseSwipeGestureProps {
  profile: Profile;
  onSwipe: (direction: SwipeDirection) => void;
  enabled?: boolean;
}

export function useSwipeGesture({
  profile,
  onSwipe,
  enabled = true,
}: UseSwipeGestureProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const state = useSharedValue<CardStateType>(CardState.IDLE);

  // 스와이프 방향 판단
  const getSwipeDirection = (
    x: number,
    y: number,
    vx: number,
    vy: number
  ): SwipeDirection => {
    'worklet';

    const isVelocitySwipe =
      Math.abs(vx) > VELOCITY_THRESHOLD ||
      Math.abs(vy) > VELOCITY_THRESHOLD;

    // Super Like (위로)
    if (y < -SWIPE_UP_THRESHOLD || (vy < -VELOCITY_THRESHOLD && isVelocitySwipe)) {
      return 'up';
    }
    // Like (오른쪽)
    if (x > SWIPE_THRESHOLD || (vx > VELOCITY_THRESHOLD && isVelocitySwipe)) {
      return 'right';
    }
    // Nope (왼쪽)
    if (x < -SWIPE_THRESHOLD || (vx < -VELOCITY_THRESHOLD && isVelocitySwipe)) {
      return 'left';
    }

    return 'none';
  };

  // 스와이프 완료 처리
  const handleSwipe = (direction: SwipeDirection) => {
    'worklet';

    state.value = CardState.SWIPED;

    const duration = 300;

    switch (direction) {
      case 'right':
        translateX.value = withTiming(SWIPE_OUT_X, { duration }, () => {
          runOnJS(onSwipe)(direction);
        });
        rotation.value = withTiming(MAX_ROTATION, { duration });
        break;

      case 'left':
        translateX.value = withTiming(-SWIPE_OUT_X, { duration }, () => {
          runOnJS(onSwipe)(direction);
        });
        rotation.value = withTiming(-MAX_ROTATION, { duration });
        break;

      case 'up':
        translateY.value = withTiming(SWIPE_OUT_Y, { duration }, () => {
          runOnJS(onSwipe)(direction);
        });
        break;
    }
  };

  // 되돌아가기 애니메이션
  const returnToCenter = () => {
    'worklet';

    state.value = CardState.RETURNING;

    translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    rotation.value = withSpring(0, { damping: 15, stiffness: 150 }, () => {
      state.value = CardState.IDLE;
    });
  };

  // Pan 제스처
  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .onStart(() => {
      state.value = CardState.DRAGGING;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      // 회전 (수평 이동에 비례)
      rotation.value = interpolate(
        event.translationX,
        [-SWIPE_OUT_X / 2, 0, SWIPE_OUT_X / 2],
        [-MAX_ROTATION, 0, MAX_ROTATION],
        Extrapolation.CLAMP
      );

      // 방향에 따른 상태 업데이트
      const direction = getSwipeDirection(
        event.translationX,
        event.translationY,
        event.velocityX,
        event.velocityY
      );

      switch (direction) {
        case 'right':
          state.value = CardState.LIKING;
          break;
        case 'left':
          state.value = CardState.NOPING;
          break;
        case 'up':
          state.value = CardState.SUPER_LIKING;
          break;
        default:
          state.value = CardState.DRAGGING;
      }
    })
    .onEnd((event) => {
      const direction = getSwipeDirection(
        event.translationX,
        event.translationY,
        event.velocityX,
        event.velocityY
      );

      if (direction !== 'none') {
        handleSwipe(direction);
      } else {
        returnToCenter();
      }
    });

  // 프로그래매틱 스와이프 (버튼용)
  const swipe = (direction: SwipeDirection) => {
    'worklet';

    if (state.value !== CardState.IDLE) return;

    handleSwipe(direction);
  };

  return {
    translateX,
    translateY,
    rotation,
    state,
    panGesture,
    swipe,
    returnToCenter,
  };
}
```

---

## 💻 Step 3: 카드 애니메이션 스타일

### useCardAnimation.ts

```typescript
import { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { SWIPE_THRESHOLD, MAX_ROTATION } from '../constants';
import { CardStateType, CardState } from '../types';

interface UseCardAnimationProps {
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  rotation: SharedValue<number>;
  state: SharedValue<CardStateType>;
}

export function useCardAnimation({
  translateX,
  translateY,
  rotation,
  state,
}: UseCardAnimationProps) {
  // 카드 스타일
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  // LIKE 오버레이 스타일
  const likeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );

    return { opacity };
  });

  // NOPE 오버레이 스타일
  const nopeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    );

    return { opacity };
  });

  // SUPER LIKE 오버레이 스타일
  const superLikeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [-100, 0],
      [1, 0],
      Extrapolation.CLAMP
    );

    return { opacity };
  });

  return {
    cardStyle,
    likeStyle,
    nopeStyle,
    superLikeStyle,
  };
}
```

---

## 💻 Step 4: 오버레이 컴포넌트

### ActionOverlay.tsx

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

interface ActionOverlayProps {
  type: 'like' | 'nope' | 'super';
  style: ReturnType<typeof useAnimatedStyle>;
}

export function ActionOverlay({ type, style }: ActionOverlayProps) {
  const config = {
    like: {
      text: 'LIKE',
      color: '#4CAF50',
      borderColor: '#4CAF50',
      rotation: '-15deg',
    },
    nope: {
      text: 'NOPE',
      color: '#F44336',
      borderColor: '#F44336',
      rotation: '15deg',
    },
    super: {
      text: 'SUPER\nLIKE',
      color: '#2196F3',
      borderColor: '#2196F3',
      rotation: '0deg',
    },
  };

  const { text, color, borderColor, rotation } = config[type];

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          borderColor,
          transform: [{ rotate: rotation }],
        },
        type === 'like' && styles.likePosition,
        type === 'nope' && styles.nopePosition,
        type === 'super' && styles.superPosition,
        style,
      ]}
    >
      <Text style={[styles.text, { color }]}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  likePosition: {
    top: 50,
    left: 20,
  },
  nopePosition: {
    top: 50,
    right: 20,
  },
  superPosition: {
    bottom: 100,
    alignSelf: 'center',
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
```

---

## 💻 Step 5: 스와이프 카드 컴포넌트

### SwipeCard.tsx

```typescript
import React, { useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { CARD_WIDTH, CARD_HEIGHT } from '../constants';
import { Profile, SwipeDirection } from '../types';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { useCardAnimation } from '../hooks/useCardAnimation';
import { ActionOverlay } from './ActionOverlay';

export interface SwipeCardRef {
  swipe: (direction: SwipeDirection) => void;
}

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: SwipeDirection) => void;
  enabled?: boolean;
}

export const SwipeCard = forwardRef<SwipeCardRef, SwipeCardProps>(
  ({ profile, onSwipe, enabled = true }, ref) => {
    const {
      translateX,
      translateY,
      rotation,
      state,
      panGesture,
      swipe,
    } = useSwipeGesture({ profile, onSwipe, enabled });

    const { cardStyle, likeStyle, nopeStyle, superLikeStyle } = useCardAnimation({
      translateX,
      translateY,
      rotation,
      state,
    });

    // 부모 컴포넌트에서 호출 가능하도록 ref 노출
    useImperativeHandle(ref, () => ({
      swipe: (direction: SwipeDirection) => {
        swipe(direction);
      },
    }));

    return (
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardStyle]}>
          {/* 프로필 이미지 */}
          <Image
            source={{ uri: profile.photos[0] }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* 프로필 정보 */}
          <View style={styles.infoContainer}>
            <Text style={styles.name}>
              {profile.name}, {profile.age}
            </Text>
            {profile.distance && (
              <Text style={styles.distance}>
                {profile.distance}km away
              </Text>
            )}
            {profile.bio && (
              <Text style={styles.bio} numberOfLines={2}>
                {profile.bio}
              </Text>
            )}
          </View>

          {/* 오버레이 */}
          <ActionOverlay type="like" style={likeStyle} />
          <ActionOverlay type="nope" style={nopeStyle} />
          <ActionOverlay type="super" style={superLikeStyle} />
        </Animated.View>
      </GestureDetector>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    backgroundColor: 'white',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '75%',
  },
  infoContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  distance: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});
```

---

## 💻 Step 6: 카드 스택 컴포넌트

### CardStack.tsx

```typescript
import React, { useRef, useCallback, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Profile, SwipeDirection, SwipeResult } from '../types';
import { NEXT_CARD_SCALE, NEXT_CARD_OPACITY } from '../constants';
import { SwipeCard, SwipeCardRef } from './SwipeCard';
import { ActionButtons } from './ActionButtons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CardStackProps {
  profiles: Profile[];
  onSwipe: (result: SwipeResult) => void;
  onEmpty?: () => void;
}

export function CardStack({ profiles, onSwipe, onEmpty }: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardRef = useRef<SwipeCardRef>(null);
  const swipedProfiles = useRef<SwipeResult[]>([]);

  // 뒤 카드 애니메이션용
  const backCardScale = useSharedValue(NEXT_CARD_SCALE);

  // 스와이프 핸들러
  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      const profile = profiles[currentIndex];

      // 결과 저장 (Undo용)
      swipedProfiles.current.push({ profile, direction });

      // 콜백 호출
      onSwipe({ profile, direction });

      // 다음 카드로
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= profiles.length) {
          onEmpty?.();
        }
        return next;
      });

      // 뒤 카드 크기 리셋
      backCardScale.value = NEXT_CARD_SCALE;
    },
    [profiles, currentIndex, onSwipe, onEmpty]
  );

  // 버튼 액션
  const handleNope = () => cardRef.current?.swipe('left');
  const handleLike = () => cardRef.current?.swipe('right');
  const handleSuperLike = () => cardRef.current?.swipe('up');

  // Undo 액션
  const handleUndo = useCallback(() => {
    if (swipedProfiles.current.length === 0) return;

    swipedProfiles.current.pop();
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  // 뒤 카드 스타일
  const backCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backCardScale.value }],
    opacity: NEXT_CARD_OPACITY,
  }));

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  if (currentIndex >= profiles.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No more profiles!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 카드 영역 */}
      <View style={styles.cardContainer}>
        {/* 뒤 카드 (다음 프로필) */}
        {nextProfile && (
          <Animated.View style={[styles.cardWrapper, styles.backCard, backCardStyle]}>
            <SwipeCard
              profile={nextProfile}
              onSwipe={() => {}}
              enabled={false}
            />
          </Animated.View>
        )}

        {/* 앞 카드 (현재 프로필) */}
        <View style={styles.cardWrapper}>
          <SwipeCard
            ref={cardRef}
            profile={currentProfile}
            onSwipe={handleSwipe}
            enabled={true}
          />
        </View>
      </View>

      {/* 액션 버튼 */}
      <ActionButtons
        onNope={handleNope}
        onLike={handleLike}
        onSuperLike={handleSuperLike}
        onUndo={handleUndo}
        canUndo={swipedProfiles.current.length > 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    position: 'absolute',
  },
  backCard: {
    zIndex: -1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
});
```

---

## 💻 Step 7: 액션 버튼

### ActionButtons.tsx

```typescript
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface ActionButtonsProps {
  onNope: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function ActionButtons({
  onNope,
  onLike,
  onSuperLike,
  onUndo,
  canUndo,
}: ActionButtonsProps) {
  return (
    <View style={styles.container}>
      {/* Undo */}
      <ActionButton
        onPress={onUndo}
        size={50}
        backgroundColor="#FFC107"
        disabled={!canUndo}
      >
        <Ionicons name="refresh" size={24} color="white" />
      </ActionButton>

      {/* Nope */}
      <ActionButton
        onPress={onNope}
        size={60}
        backgroundColor="#F44336"
      >
        <Ionicons name="close" size={32} color="white" />
      </ActionButton>

      {/* Super Like */}
      <ActionButton
        onPress={onSuperLike}
        size={50}
        backgroundColor="#2196F3"
      >
        <Ionicons name="star" size={24} color="white" />
      </ActionButton>

      {/* Like */}
      <ActionButton
        onPress={onLike}
        size={60}
        backgroundColor="#4CAF50"
      >
        <Ionicons name="heart" size={32} color="white" />
      </ActionButton>
    </View>
  );
}

interface ActionButtonProps {
  onPress: () => void;
  size: number;
  backgroundColor: string;
  disabled?: boolean;
  children: React.ReactNode;
}

function ActionButton({
  onPress,
  size,
  backgroundColor,
  disabled,
  children,
}: ActionButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: disabled ? '#ccc' : backgroundColor,
        },
        animatedStyle,
      ]}
    >
      {children}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 16,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
```

---

## 💻 Step 8: 최종 통합

### SwipeScreen.tsx

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CardStack } from './ui/CardStack';
import { Profile, SwipeResult } from './types';

// 더미 데이터
const MOCK_PROFILES: Profile[] = [
  {
    id: '1',
    name: 'Emma',
    age: 25,
    photos: ['https://example.com/photo1.jpg'],
    bio: 'Love hiking and coffee ☕',
    distance: 3,
  },
  {
    id: '2',
    name: 'Sophie',
    age: 23,
    photos: ['https://example.com/photo2.jpg'],
    bio: 'Photography enthusiast 📷',
    distance: 5,
  },
  // ...more profiles
];

export function SwipeScreen() {
  const handleSwipe = (result: SwipeResult) => {
    console.log(`Swiped ${result.direction} on ${result.profile.name}`);

    // API 호출
    // if (result.direction === 'right') {
    //   likeProfile(result.profile.id);
    // } else if (result.direction === 'left') {
    //   passProfile(result.profile.id);
    // } else if (result.direction === 'up') {
    //   superLikeProfile(result.profile.id);
    // }
  };

  const handleEmpty = () => {
    console.log('No more profiles');
    // 새 프로필 로드 또는 안내 메시지
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <CardStack
        profiles={MOCK_PROFILES}
        onSwipe={handleSwipe}
        onEmpty={handleEmpty}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
```

---

## 💻 고급 기능: 햅틱 피드백

```typescript
import * as Haptics from 'expo-haptics';

// 스와이프 훅에 햅틱 추가
.onUpdate((event) => {
  const direction = getSwipeDirection(/*...*/);

  // 임계값 넘을 때 햅틱
  if (direction !== 'none' && state.value === CardState.DRAGGING) {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
  }
})
.onEnd((event) => {
  const direction = getSwipeDirection(/*...*/);

  if (direction !== 'none') {
    runOnJS(Haptics.notificationAsync)(
      direction === 'right'
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );
  }
});
```

---

## 💻 고급 기능: 카드 되감기 애니메이션

```typescript
// useSwipeGesture.ts에 추가
const rewind = () => {
  'worklet';

  // 화면 밖에서 시작
  translateX.value = -SWIPE_OUT_X;

  // 중앙으로 스프링 애니메이션
  translateX.value = withSpring(0, {
    damping: 15,
    stiffness: 100,
  });
  translateY.value = withSpring(0);
  rotation.value = withSpring(0, {}, () => {
    state.value = CardState.IDLE;
  });
};
```

---

## ⚠️ 최적화 포인트

### 1. 이미지 프리로딩

```typescript
import { Image } from 'expo-image';

// 다음 프로필 이미지 미리 로드
useEffect(() => {
  const nextProfile = profiles[currentIndex + 1];
  if (nextProfile) {
    Image.prefetch(nextProfile.photos[0]);
  }
}, [currentIndex]);
```

### 2. 카드 풀링

```typescript
// 화면에 최대 3장만 렌더링
const visibleProfiles = profiles.slice(currentIndex, currentIndex + 3);
```

### 3. 제스처 메모이제이션

```typescript
const panGesture = useMemo(() =>
  Gesture.Pan()
    .enabled(enabled)
    .onStart(/*...*/)
    .onUpdate(/*...*/)
    .onEnd(/*...*/),
  [enabled]
);
```

---

## 🎯 실무 적용: Sometimes 앱 사례

```typescript
// src/features/matching/ui/matching-card.tsx 참고
// 실제 앱에서는 추가로:
// - 여러 사진 슬라이드
// - 프로필 상세 보기 모달
// - 매칭 애니메이션
// - 네트워크 상태 처리
// - 에러 핸들링
```

---

## 📚 요약

이 장에서 구현한 Tinder 스와이프 카드 기능:

| 기능 | 구현 방법 |
|-----|----------|
| 스와이프 제스처 | Pan gesture + 임계값 판단 |
| 회전 효과 | translateX → rotation 보간 |
| LIKE/NOPE 오버레이 | 투명도 보간 |
| 버튼 액션 | ref로 swipe 함수 호출 |
| Undo | 히스토리 저장 + 인덱스 롤백 |
| 뒤 카드 효과 | scale, opacity 조절 |

### 다음 장 예고

다음 장에서는 **실전: 드래그 앤 드롭 리스트**를 구현합니다. Long Press로 선택하고, 드래그로 순서를 변경하며, 항목 간 자연스러운 재정렬 애니메이션을 만들어봅니다.
