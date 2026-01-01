# Chapter 53: 알림 배지와 인디케이터

새로운 알림, 읽지 않은 메시지, 온라인 상태 등을 시각적으로 표현하는 배지와 인디케이터는 사용자의 관심을 끄는 중요한 요소입니다. 이 장에서는 다양한 상태 표시 애니메이션을 구현합니다.

## 📌 학습 목표

- 숫자 카운터 배지 애니메이션
- 점 형태 알림 인디케이터
- 온라인/오프라인 상태 표시
- 진행 상태 인디케이터
- 펄스 및 주의 끌기 효과
- 배지 등장/사라짐 전환

## 📖 배지 디자인 원칙

```
알림 배지의 시각적 계층
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

우선순위별 표현:

높음 (긴급)
╭─────────╮
│  🔴 99+ │ ← 빨간색, 큰 숫자, 펄스 효과
╰─────────╯

중간 (알림)
╭─────────╮
│  🟣 3   │ ← 브랜드 컬러, 숫자 표시
╰─────────╯

낮음 (상태)
╭─────────╮
│  🟢     │ ← 작은 점, 은은한 색상
╰─────────╯

배지 위치 가이드:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╭───────────────────────╮
│                 ●     │ ← 우상단 (기본)
│                       │
│    📧                 │ ← 아이콘
│                       │
│           ●           │ ← 우하단 (상태)
╰───────────────────────╯

배지 크기:
• 숫자 없음 (점): 8-12px
• 1자리 숫자: 18-22px
• 2자리 숫자: 22-26px
• 99+: 28-32px
```

## 💻 숫자 카운터 배지

### 기본 배지

```typescript
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';

interface BadgeProps {
  count: number;
  maxCount?: number;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  showZero?: boolean;
}

const SIZES = {
  small: { minWidth: 16, height: 16, fontSize: 10, padding: 4 },
  medium: { minWidth: 20, height: 20, fontSize: 12, padding: 6 },
  large: { minWidth: 24, height: 24, fontSize: 14, padding: 8 },
};

export function Badge({
  count,
  maxCount = 99,
  color = '#FF3B30',
  size = 'medium',
  showZero = false,
}: BadgeProps) {
  const scale = useSharedValue(1);
  const prevCount = React.useRef(count);
  const sizeConfig = SIZES[size];

  React.useEffect(() => {
    // 카운트 변경 시 바운스 효과
    if (count !== prevCount.current) {
      scale.value = withSequence(
        withTiming(1.3, { duration: 100 }),
        withSpring(1, { damping: 10, stiffness: 300 })
      );
      prevCount.current = count;
    }
  }, [count]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <Animated.View
      entering={ZoomIn.springify().damping(12)}
      exiting={ZoomOut.duration(200)}
      style={[
        styles.badge,
        {
          backgroundColor: color,
          minWidth: sizeConfig.minWidth,
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.padding,
          borderRadius: sizeConfig.height / 2,
        },
        animatedStyle,
      ]}
    >
      <Text
        style={[styles.badgeText, { fontSize: sizeConfig.fontSize }]}
      >
        {displayCount}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
```

### 애니메이션 카운터

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

interface AnimatedCounterBadgeProps {
  count: number;
  maxCount?: number;
  color?: string;
}

export function AnimatedCounterBadge({
  count,
  maxCount = 99,
  color = '#FF3B30',
}: AnimatedCounterBadgeProps) {
  const [displayCount, setDisplayCount] = React.useState(count);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    if (count !== displayCount) {
      const direction = count > displayCount ? 1 : -1;

      // 현재 숫자 위로/아래로 사라짐
      translateY.value = withTiming(-20 * direction, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });

      // 새 숫자 등장
      setTimeout(() => {
        translateY.value = 20 * direction;
        setDisplayCount(count);

        translateY.value = withTiming(0, {
          duration: 200,
          easing: Easing.out(Easing.back(2)),
        });
        opacity.value = withTiming(1, { duration: 200 });
      }, 150);
    }
  }, [count]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const text = displayCount > maxCount ? `${maxCount}+` : displayCount.toString();

  return (
    <View style={counterStyles.container}>
      <Animated.Text style={[counterStyles.text, animatedStyle]}>
        {text}
      </Animated.Text>
    </View>
  );
}

const counterStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FF3B30',
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
```

### 아이콘 위 배지

```typescript
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

interface IconWithBadgeProps {
  icon: React.ReactNode;
  count: number;
  showPulse?: boolean;
  badgePosition?: 'topRight' | 'bottomRight';
}

export function IconWithBadge({
  icon,
  count,
  showPulse = false,
  badgePosition = 'topRight',
}: IconWithBadgeProps) {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (showPulse && count > 0) {
      // 펄스 애니메이션
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(2, { duration: 1000, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      );

      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 0 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        false
      );
    } else {
      pulseScale.value = 1;
      pulseOpacity.value = 0;
    }
  }, [showPulse, count]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const positionStyle = badgePosition === 'topRight'
    ? { top: -6, right: -6 }
    : { bottom: -6, right: -6 };

  return (
    <View style={iconBadgeStyles.container}>
      {icon}

      {count > 0 && (
        <View style={[iconBadgeStyles.badgeContainer, positionStyle]}>
          {/* 펄스 효과 */}
          {showPulse && (
            <Animated.View
              style={[iconBadgeStyles.pulse, pulseStyle]}
            />
          )}

          {/* 배지 */}
          <Badge count={count} size="small" />
        </View>
      )}
    </View>
  );
}

const iconBadgeStyles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    zIndex: 1,
  },
  pulse: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
  },
});
```

## 💻 점 형태 인디케이터

### 기본 점 인디케이터

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

interface DotIndicatorProps {
  visible: boolean;
  color?: string;
  size?: number;
  pulse?: boolean;
}

export function DotIndicator({
  visible,
  color = '#FF3B30',
  size = 10,
  pulse = false,
}: DotIndicatorProps) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (pulse && visible) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withSpring(1);
    }
  }, [pulse, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200).springify()}
      exiting={FadeOut.duration(200)}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}
```

### 온라인 상태 인디케이터

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';

type OnlineStatus = 'online' | 'away' | 'busy' | 'offline';

interface OnlineIndicatorProps {
  status: OnlineStatus;
  size?: number;
  showRing?: boolean;
}

const STATUS_COLORS: Record<OnlineStatus, string> = {
  online: '#34C759',
  away: '#FFCC00',
  busy: '#FF3B30',
  offline: '#8E8E93',
};

export function OnlineIndicator({
  status,
  size = 12,
  showRing = true,
}: OnlineIndicatorProps) {
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (status === 'online' && showRing) {
      ringScale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(1.8, { duration: 1500, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      );

      ringOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 0 }),
          withTiming(0, { duration: 1500 })
        ),
        -1,
        false
      );
    } else {
      ringScale.value = 1;
      ringOpacity.value = 0;
    }
  }, [status, showRing]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const color = STATUS_COLORS[status];

  return (
    <View style={[onlineStyles.container, { width: size, height: size }]}>
      {/* 링 효과 */}
      {showRing && status === 'online' && (
        <Animated.View
          style={[
            onlineStyles.ring,
            { backgroundColor: color, width: size, height: size, borderRadius: size / 2 },
            ringStyle,
          ]}
        />
      )}

      {/* 메인 점 */}
      <View
        style={[
          onlineStyles.dot,
          {
            backgroundColor: color,
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    </View>
  );
}

const onlineStyles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
  },
  dot: {
    borderWidth: 2,
    borderColor: 'white',
  },
});
```

### 아바타 상태 인디케이터

```typescript
import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';

interface AvatarWithStatusProps {
  imageUrl: string;
  size?: number;
  status?: OnlineStatus;
  showBadge?: boolean;
  badgeCount?: number;
}

export function AvatarWithStatus({
  imageUrl,
  size = 48,
  status = 'offline',
  showBadge = false,
  badgeCount = 0,
}: AvatarWithStatusProps) {
  const indicatorSize = Math.max(12, size * 0.25);

  return (
    <View style={[avatarStyles.container, { width: size, height: size }]}>
      <Image
        source={{ uri: imageUrl }}
        style={[
          avatarStyles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />

      {/* 온라인 상태 */}
      <View
        style={[
          avatarStyles.statusContainer,
          {
            width: indicatorSize + 4,
            height: indicatorSize + 4,
            borderRadius: (indicatorSize + 4) / 2,
            bottom: 0,
            right: 0,
          },
        ]}
      >
        <OnlineIndicator status={status} size={indicatorSize} showRing={false} />
      </View>

      {/* 배지 */}
      {showBadge && badgeCount > 0 && (
        <View style={avatarStyles.badgePosition}>
          <Badge count={badgeCount} size="small" />
        </View>
      )}
    </View>
  );
}

const avatarStyles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: '#E0E0E0',
  },
  statusContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgePosition: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
});
```

## 💻 진행 상태 인디케이터

### 단계 인디케이터

```typescript
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  color?: string;
}

export function StepIndicator({
  steps,
  currentStep,
  color = '#7A4AE2',
}: StepIndicatorProps) {
  return (
    <View style={stepStyles.container}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <StepItem
            step={step}
            index={index}
            isActive={index === currentStep}
            isCompleted={index < currentStep}
            color={color}
          />

          {index < steps.length - 1 && (
            <StepConnector
              isCompleted={index < currentStep}
              color={color}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

function StepItem({
  step,
  index,
  isActive,
  isCompleted,
  color,
}: {
  step: string;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  color: string;
}) {
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (isCompleted) {
      progress.value = withSpring(1, { damping: 12 });
    } else if (isActive) {
      progress.value = withSpring(0.5, { damping: 12 });
      scale.value = withSpring(1.1, { damping: 10 });
    } else {
      progress.value = withSpring(0, { damping: 12 });
      scale.value = withSpring(1, { damping: 10 });
    }
  }, [isActive, isCompleted]);

  const circleStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 0.5, 1],
      ['#E0E0E0', color, color]
    );
    const borderColor = interpolateColor(
      progress.value,
      [0, 0.5, 1],
      ['#CCCCCC', color, color]
    );

    return {
      backgroundColor,
      borderColor,
      transform: [{ scale: scale.value }],
    };
  });

  const checkStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.8, 1], [0, 1]),
    transform: [{ scale: interpolate(progress.value, [0.8, 1], [0.5, 1]) }],
  }));

  const numberStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.8], [1, 0]),
  }));

  return (
    <View style={stepStyles.stepItem}>
      <Animated.View style={[stepStyles.circle, circleStyle]}>
        <Animated.Text style={[stepStyles.number, numberStyle]}>
          {index + 1}
        </Animated.Text>
        <Animated.Text style={[stepStyles.check, checkStyle]}>
          ✓
        </Animated.Text>
      </Animated.View>
      <Text
        style={[
          stepStyles.label,
          (isActive || isCompleted) && { color: color, fontWeight: '600' },
        ]}
      >
        {step}
      </Text>
    </View>
  );
}

function StepConnector({
  isCompleted,
  color,
}: {
  isCompleted: boolean;
  color: string;
}) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withDelay(
      200,
      withSpring(isCompleted ? 1 : 0, { damping: 15 })
    );
  }, [isCompleted]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    backgroundColor: color,
  }));

  return (
    <View style={stepStyles.connector}>
      <Animated.View style={[stepStyles.connectorFill, fillStyle]} />
    </View>
  );
}

const stepStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  stepItem: {
    alignItems: 'center',
    gap: 8,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    position: 'absolute',
  },
  check: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    position: 'absolute',
  },
  label: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    maxWidth: 60,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginTop: 15,
    marginHorizontal: 8,
    borderRadius: 1,
    overflow: 'hidden',
  },
  connectorFill: {
    height: '100%',
    borderRadius: 1,
  },
});
```

### 타이핑 인디케이터

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

export function TypingIndicator() {
  return (
    <View style={typingStyles.container}>
      <TypingDot delay={0} />
      <TypingDot delay={150} />
      <TypingDot delay={300} />
    </View>
  );
}

function TypingDot({ delay }: { delay: number }) {
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 300 }),
          withTiming(0, { duration: 300 }),
          withTiming(0, { duration: 300 }) // 대기
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[typingStyles.dot, animatedStyle]} />
  );
}

const typingStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#888888',
  },
});
```

## 📱 sometimes-app 적용 사례

### 채팅 목록 배지

```typescript
// src/features/chat/ui/ChatListItem.tsx
import React from 'react';
import { StyleSheet, View, Text, Image, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  FadeIn,
  Layout,
} from 'react-native-reanimated';

interface ChatListItemProps {
  chat: {
    id: string;
    partnerName: string;
    partnerImage: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    isOnline: boolean;
    isTyping: boolean;
  };
  onPress: () => void;
}

export function ChatListItem({ chat, onPress }: ChatListItemProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[chatItemStyles.container, containerStyle]}
        layout={Layout.springify()}
      >
        {/* 아바타 + 온라인 상태 */}
        <View style={chatItemStyles.avatarContainer}>
          <Image
            source={{ uri: chat.partnerImage }}
            style={chatItemStyles.avatar}
          />
          <View style={chatItemStyles.statusDot}>
            <OnlineIndicator
              status={chat.isOnline ? 'online' : 'offline'}
              size={12}
              showRing={chat.isOnline}
            />
          </View>
        </View>

        {/* 메시지 내용 */}
        <View style={chatItemStyles.content}>
          <View style={chatItemStyles.header}>
            <Text style={chatItemStyles.name}>{chat.partnerName}</Text>
            <Text style={chatItemStyles.time}>{chat.timestamp}</Text>
          </View>

          <View style={chatItemStyles.messageRow}>
            {chat.isTyping ? (
              <TypingIndicator />
            ) : (
              <Text
                style={[
                  chatItemStyles.message,
                  chat.unreadCount > 0 && chatItemStyles.unreadMessage,
                ]}
                numberOfLines={1}
              >
                {chat.lastMessage}
              </Text>
            )}

            {/* 읽지 않은 메시지 배지 */}
            {chat.unreadCount > 0 && (
              <UnreadBadge count={chat.unreadCount} />
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

function UnreadBadge({ count }: { count: number }) {
  const scale = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );
  }, [count]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const displayCount = count > 99 ? '99+' : count.toString();
  const width = count > 99 ? 32 : count > 9 ? 24 : 20;

  return (
    <Animated.View
      style={[
        chatItemStyles.badge,
        { minWidth: width },
        animatedStyle,
      ]}
    >
      <Text style={chatItemStyles.badgeText}>{displayCount}</Text>
    </Animated.View>
  );
}

const chatItemStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0E0E0',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  time: {
    fontSize: 12,
    color: '#888888',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: '#888888',
  },
  unreadMessage: {
    color: '#333333',
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#7A4AE2',
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
```

### 탭 바 배지

```typescript
// src/shared/ui/TabBarBadge.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

interface TabBarBadgeProps {
  count: number;
  showDot?: boolean;
  pulseOnNew?: boolean;
}

export function TabBarBadge({
  count,
  showDot = false,
  pulseOnNew = true,
}: TabBarBadgeProps) {
  const scale = useSharedValue(1);
  const prevCount = React.useRef(count);

  React.useEffect(() => {
    if (pulseOnNew && count > prevCount.current) {
      // 새 알림 시 펄스 효과
      scale.value = withSequence(
        withSpring(1.3, { damping: 6 }),
        withSpring(1, { damping: 8 })
      );
    }
    prevCount.current = count;
  }, [count, pulseOnNew]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (count === 0 && !showDot) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.springify().damping(12)}
      exiting={FadeOut.duration(150)}
      style={[
        tabBadgeStyles.container,
        showDot ? tabBadgeStyles.dot : tabBadgeStyles.badge,
        animatedStyle,
      ]}
    >
      {!showDot && (
        <Animated.Text style={tabBadgeStyles.text}>
          {count > 99 ? '99+' : count}
        </Animated.Text>
      )}
    </Animated.View>
  );
}

const tabBadgeStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -4,
    right: -8,
    zIndex: 10,
  },
  badge: {
    backgroundColor: '#FF3B30',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: 'white',
  },
  text: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 1. 배지 위치 오프셋

```typescript
// ❌ 잘못된 예: 컨테이너 크기에 따라 위치 변함
<View>
  <Icon />
  <Badge style={{ position: 'absolute', top: 0, right: 0 }} />
</View>

// ✅ 올바른 예: 고정 오프셋 사용
<View style={{ position: 'relative' }}>
  <Icon size={24} />
  <Badge
    style={{
      position: 'absolute',
      top: -iconSize * 0.2,  // 상대적 위치
      right: -iconSize * 0.2,
    }}
  />
</View>
```

### 2. 카운트 변경 시 레이아웃 점프

```typescript
// ❌ 잘못된 예: 숫자 변경 시 너비가 변함
<View style={{ minWidth: undefined }}>
  <Text>{count}</Text>
</View>

// ✅ 올바른 예: 최대 너비 고정
<View style={{
  minWidth: count > 99 ? 32 : count > 9 ? 24 : 20,
  height: 20,
}}>
  <Text>{count > 99 ? '99+' : count}</Text>
</View>
```

### 3. 펄스 애니메이션 메모리 누수

```typescript
// ❌ 잘못된 예: 정리 없는 반복 애니메이션
React.useEffect(() => {
  scale.value = withRepeat(/*...*/, -1);
}, []);

// ✅ 올바른 예: 조건부 및 정리
React.useEffect(() => {
  if (shouldPulse) {
    scale.value = withRepeat(/*...*/, -1);
  }

  return () => {
    cancelAnimation(scale);
    scale.value = 1;
  };
}, [shouldPulse]);
```

## 💡 성능 최적화 팁

### 1. 배지 메모이제이션

```typescript
export const MemoizedBadge = React.memo(Badge, (prev, next) => {
  return prev.count === next.count;
});
```

### 2. 조건부 렌더링 최적화

```typescript
// 배지가 없을 때 전체 컴포넌트 스킵
{unreadCount > 0 && <Badge count={unreadCount} />}

// 또는 entering/exiting으로 자연스러운 전환
<AnimatePresence>
  {unreadCount > 0 && (
    <Badge entering={ZoomIn} exiting={ZoomOut} />
  )}
</AnimatePresence>
```

## 🏋️ 연습 문제

### 문제 1: 알림 스택
여러 알림이 쌓일 때 배지가 "1 → 2 → 3..." 순차적으로 애니메이션되는 효과를 구현하세요.

### 문제 2: 상태 전환 인디케이터
"대기 중 → 진행 중 → 완료" 상태가 원형으로 전환되는 인디케이터를 구현하세요.

### 문제 3: 배터리 스타일 인디케이터
배터리 잔량처럼 채워지는 인디케이터를 구현하세요 (0-25% 빨강, 25-50% 주황, 50-100% 초록).

## 📚 이 장에서 배운 내용

1. **숫자 배지**: 카운터, 바운스 효과, 최대값 표시
2. **점 인디케이터**: 온라인 상태, 펄스 효과
3. **아바타 상태**: 복합 상태 표시
4. **단계 인디케이터**: 진행 상황 시각화
5. **타이핑 인디케이터**: 실시간 상태 표시
6. **위치 및 크기**: 일관된 배지 디자인

## 다음 장 예고

**Chapter 54: 스켈레톤과 플레이스홀더**에서는 컨텐츠 로딩 전 표시하는 플레이스홀더 UI를 더 깊이 다룹니다. 복잡한 레이아웃의 스켈레톤, 이미지 플레이스홀더, 부드러운 전환 효과를 구현합니다.
