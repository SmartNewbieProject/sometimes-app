# Chapter 50: 성공/실패 피드백 애니메이션

작업이 완료되면 사용자에게 명확한 결과를 알려주는 것이 중요합니다. 성공의 기쁨을 배가시키고 실패의 좌절감을 줄이는 피드백 애니메이션을 구현합니다.

## 📌 학습 목표

- 성공/실패 피드백의 심리학 이해
- 체크마크 드로잉 애니메이션
- X 마크 및 에러 흔들기 효과
- 토스트 및 스낵바 애니메이션
- Confetti 및 축하 효과
- 상태 전환 애니메이션

## 📖 피드백 디자인 원칙

```
성공과 실패 피드백의 심리학
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

성공 피드백:
╭────────────────────────────────────────────╮
│ ✓ 명확하고 긍정적인 시각 신호              │
│ ✓ 적절한 축하 (과하지 않게)                │
│ ✓ 다음 행동으로 자연스러운 유도            │
│ ✓ 햅틱 피드백 동반 (Success)               │
╰────────────────────────────────────────────╯

실패 피드백:
╭────────────────────────────────────────────╮
│ ✕ 비난하지 않는 톤                         │
│ ✕ 문제와 해결책 함께 제시                  │
│ ✕ 빨간색만 사용하지 말 것 (색맹 고려)      │
│ ✕ 흔들림으로 주의 끌기                     │
│ ✕ 재시도 옵션 제공                         │
╰────────────────────────────────────────────╯

피드백 타이밍:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  액션 완료        피드백 시작       자동 닫기
       ●──────────────●───────────────●
       0ms          100ms    2-3초 후 (선택)

       │             │               │
       ▼             ▼               ▼
    즉각적        애니메이션      사라짐
    응답         재생 시작      (필요시)
```

## 💻 체크마크 애니메이션

### SVG 패스 드로잉 체크마크

```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CheckmarkAnimationProps {
  size?: number;
  color?: string;
  backgroundColor?: string;
  onComplete?: () => void;
}

export function CheckmarkAnimation({
  size = 80,
  color = 'white',
  backgroundColor = '#4CAF50',
  onComplete,
}: CheckmarkAnimationProps) {
  const circleScale = useSharedValue(0);
  const checkProgress = useSharedValue(0);

  const checkPath = 'M 25 50 L 40 65 L 70 35';
  const checkPathLength = 70; // 대략적인 경로 길이

  React.useEffect(() => {
    // 1. 원 확대
    circleScale.value = withSpring(1, {
      damping: 12,
      stiffness: 200,
    });

    // 2. 체크마크 그리기 (딜레이 후)
    checkProgress.value = withDelay(
      200,
      withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      })
    );

    // 햅틱 피드백
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete?.();
    }, 600);
  }, []);

  const circleStyle = useAnimatedProps(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  const checkProps = useAnimatedProps(() => ({
    strokeDashoffset: checkPathLength * (1 - checkProgress.value),
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* 배경 원 */}
        <AnimatedCircle
          cx="50"
          cy="50"
          r="45"
          fill={backgroundColor}
          animatedProps={circleStyle}
        />

        {/* 체크마크 */}
        <AnimatedPath
          d={checkPath}
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={checkPathLength}
          animatedProps={checkProps}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

### 바운스 체크마크

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

export function BounceCheckmark({
  size = 80,
}: {
  size?: number;
}) {
  const scale = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const rotation = useSharedValue(-45);

  React.useEffect(() => {
    // 원 등장 (바운스)
    scale.value = withSequence(
      withSpring(1.2, { damping: 6, stiffness: 300 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );

    // 체크마크 등장 (딜레이)
    checkScale.value = withDelay(
      150,
      withSequence(
        withSpring(1.3, { damping: 4, stiffness: 400 }),
        withSpring(1, { damping: 6, stiffness: 300 })
      )
    );

    // 살짝 회전
    rotation.value = withDelay(
      150,
      withSequence(
        withTiming(-15, { duration: 150 }),
        withSpring(0, { damping: 10 })
      )
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: checkScale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.bounceContainer, { width: size, height: size }, containerStyle]}>
      <View style={[styles.circle, { backgroundColor: '#4CAF50' }]}>
        <Animated.Text style={[styles.checkText, { fontSize: size * 0.5 }, checkStyle]}>
          ✓
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bounceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
```

## 💻 실패/에러 애니메이션

### X 마크 애니메이션

```typescript
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function XMarkAnimation({
  size = 80,
  color = 'white',
  backgroundColor = '#F44336',
}: {
  size?: number;
  color?: string;
  backgroundColor?: string;
}) {
  const circleScale = useSharedValue(0);
  const line1Progress = useSharedValue(0);
  const line2Progress = useSharedValue(0);
  const shake = useSharedValue(0);

  const line1Path = 'M 30 30 L 70 70';
  const line2Path = 'M 70 30 L 30 70';
  const lineLength = 57; // √((70-30)² + (70-30)²)

  React.useEffect(() => {
    // 원 등장
    circleScale.value = withSpring(1, { damping: 12, stiffness: 200 });

    // X 첫 번째 선
    line1Progress.value = withDelay(
      200,
      withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) })
    );

    // X 두 번째 선
    line2Progress.value = withDelay(
      350,
      withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) })
    );

    // 흔들기 효과
    shake.value = withDelay(
      500,
      withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 100 }),
        withTiming(-6, { duration: 100 }),
        withTiming(6, { duration: 100 }),
        withTiming(0, { duration: 50 })
      )
    );

    // 햅틱
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }, 500);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const circleProps = useAnimatedProps(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  const line1Props = useAnimatedProps(() => ({
    strokeDashoffset: lineLength * (1 - line1Progress.value),
  }));

  const line2Props = useAnimatedProps(() => ({
    strokeDashoffset: lineLength * (1 - line2Progress.value),
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, containerStyle]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <AnimatedCircle
          cx="50"
          cy="50"
          r="45"
          fill={backgroundColor}
          animatedProps={circleProps}
        />
        <AnimatedPath
          d={line1Path}
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={lineLength}
          animatedProps={line1Props}
        />
        <AnimatedPath
          d={line2Path}
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={lineLength}
          animatedProps={line2Props}
        />
      </Svg>
    </Animated.View>
  );
}
```

### 입력 필드 에러 흔들기

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

interface ShakeInputProps {
  children: React.ReactNode;
  error?: boolean;
}

export function ShakeInput({ children, error }: ShakeInputProps) {
  const shake = useSharedValue(0);
  const borderColor = useSharedValue(0);

  React.useEffect(() => {
    if (error) {
      // 흔들기
      shake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 100 }),
        withTiming(-8, { duration: 100 }),
        withTiming(8, { duration: 100 }),
        withTiming(-4, { duration: 100 }),
        withTiming(0, { duration: 50 })
      );

      // 테두리 색상
      borderColor.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(1, { duration: 2000 }), // 유지
        withTiming(0, { duration: 300 })
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [error]);

  const animatedStyle = useAnimatedStyle(() => {
    const borderColorValue = interpolateColor(
      borderColor.value,
      [0, 1],
      ['#E0E0E0', '#F44336']
    );

    return {
      transform: [{ translateX: shake.value }],
      borderColor: borderColorValue,
    };
  });

  return (
    <Animated.View style={[styles.inputContainer, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    borderWidth: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
```

### 폼 필드 에러 상태

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolateColor,
  Layout,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  const errorOpacity = useSharedValue(0);
  const shake = useSharedValue(0);
  const borderProgress = useSharedValue(0);

  React.useEffect(() => {
    if (error) {
      errorOpacity.value = withTiming(1, { duration: 200 });
      borderProgress.value = withTiming(1, { duration: 200 });
      shake.value = withSequence(
        withTiming(-6, { duration: 40 }),
        withTiming(6, { duration: 80 }),
        withTiming(-4, { duration: 80 }),
        withTiming(4, { duration: 80 }),
        withTiming(0, { duration: 40 })
      );
    } else {
      errorOpacity.value = withTiming(0, { duration: 200 });
      borderProgress.value = withTiming(0, { duration: 200 });
    }
  }, [error]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const borderStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      borderProgress.value,
      [0, 1],
      ['#E0E0E0', '#F44336']
    );

    return { borderColor };
  });

  const labelStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      borderProgress.value,
      [0, 1],
      ['#666666', '#F44336']
    );

    return { color };
  });

  return (
    <Animated.View style={[styles.fieldContainer, containerStyle]}>
      <Animated.Text style={[styles.label, labelStyle]}>
        {label}
      </Animated.Text>

      <Animated.View style={[styles.inputWrapper, borderStyle]}>
        {children}
      </Animated.View>

      {error && (
        <Animated.Text
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.errorText}
        >
          {error}
        </Animated.Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  inputWrapper: {
    borderWidth: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
});
```

## 💻 토스트 애니메이션

### 기본 토스트

```typescript
import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
  SlideInUp,
  SlideOutUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const insets = useSafeAreaInsets();

  const showToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    // 자동 제거
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* 토스트 컨테이너 */}
      <View style={[styles.toastContainer, { top: insets.top + 10 }]}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const config = getToastConfig(toast.type);

  return (
    <Animated.View
      entering={SlideInUp.springify().damping(15)}
      exiting={SlideOutUp.duration(200)}
      style={[styles.toast, { backgroundColor: config.backgroundColor }]}
    >
      <Text style={styles.toastIcon}>{config.icon}</Text>
      <Text style={[styles.toastMessage, { color: config.textColor }]}>
        {toast.message}
      </Text>
    </Animated.View>
  );
}

function getToastConfig(type: ToastType) {
  switch (type) {
    case 'success':
      return {
        backgroundColor: '#E8F5E9',
        textColor: '#2E7D32',
        icon: '✓',
      };
    case 'error':
      return {
        backgroundColor: '#FFEBEE',
        textColor: '#C62828',
        icon: '✕',
      };
    case 'warning':
      return {
        backgroundColor: '#FFF8E1',
        textColor: '#F57F17',
        icon: '⚠',
      };
    case 'info':
    default:
      return {
        backgroundColor: '#E3F2FD',
        textColor: '#1565C0',
        icon: 'ℹ',
      };
  }
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    gap: 8,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toastIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  toastMessage: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});
```

### 스와이프 가능한 토스트

```typescript
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

interface SwipeableToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function SwipeableToast({ toast, onDismiss }: SwipeableToastProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(1);
  const config = getToastConfig(toast.type);

  React.useEffect(() => {
    // 등장 애니메이션
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
  }, []);

  const dismiss = () => {
    onDismiss(toast.id);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = Math.min(event.translationY, 0);
    })
    .onEnd((event) => {
      const shouldDismissX = Math.abs(event.translationX) > 100;
      const shouldDismissY = event.translationY < -50;

      if (shouldDismissX || shouldDismissY) {
        // 스와이프 방향으로 사라짐
        if (shouldDismissX) {
          translateX.value = withTiming(
            event.translationX > 0 ? 400 : -400,
            { duration: 200 }
          );
        }
        if (shouldDismissY) {
          translateY.value = withTiming(-100, { duration: 200 });
        }
        opacity.value = withTiming(0, { duration: 200 });

        setTimeout(() => runOnJS(dismiss)(), 200);
      } else {
        // 원위치 복귀
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, 100],
      [1, 0.9],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.toast,
          { backgroundColor: config.backgroundColor },
          animatedStyle,
        ]}
      >
        <Text style={styles.toastIcon}>{config.icon}</Text>
        <Text style={[styles.toastMessage, { color: config.textColor }]}>
          {toast.message}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}
```

## 💻 축하 효과

### Confetti 애니메이션

```typescript
import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const CONFETTI_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
];

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  color: string;
  size: number;
  rotationSpeed: number;
}

interface ConfettiProps {
  count?: number;
  duration?: number;
  onComplete?: () => void;
}

export function Confetti({
  count = 50,
  duration = 3000,
  onComplete,
}: ConfettiProps) {
  const pieces = React.useMemo(() => {
    return Array.from({ length: count }).map((_, index) => ({
      id: index,
      x: Math.random() * width,
      delay: Math.random() * 500,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 8 + Math.random() * 8,
      rotationSpeed: 2 + Math.random() * 4,
    }));
  }, [count]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, duration + 500);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((piece) => (
        <ConfettiPieceComponent key={piece.id} piece={piece} duration={duration} />
      ))}
    </View>
  );
}

function ConfettiPieceComponent({
  piece,
  duration,
}: {
  piece: ConfettiPiece;
  duration: number;
}) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  React.useEffect(() => {
    // 스케일 등장
    scale.value = withDelay(
      piece.delay,
      withSequence(
        withTiming(1.2, { duration: 100 }),
        withTiming(1, { duration: 100 })
      )
    );

    // 낙하
    translateY.value = withDelay(
      piece.delay,
      withTiming(height + 100, {
        duration: duration,
        easing: Easing.in(Easing.quad),
      })
    );

    // 좌우 흔들림
    translateX.value = withDelay(
      piece.delay,
      withRepeat(
        withSequence(
          withTiming(30, { duration: 300 }),
          withTiming(-30, { duration: 300 })
        ),
        -1,
        true
      )
    );

    // 회전
    rotation.value = withDelay(
      piece.delay,
      withRepeat(
        withTiming(360 * piece.rotationSpeed, {
          duration: duration,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );

    // 페이드 아웃
    opacity.value = withDelay(
      piece.delay + duration * 0.7,
      withTiming(0, { duration: duration * 0.3 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: piece.x,
    width: piece.size,
    height: piece.size * 0.6,
    backgroundColor: piece.color,
    borderRadius: 2,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle} />;
}
```

### 별 폭발 효과

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

interface StarBurstProps {
  size?: number;
  color?: string;
  onComplete?: () => void;
}

export function StarBurst({
  size = 200,
  color = '#FFD700',
  onComplete,
}: StarBurstProps) {
  const starCount = 12;
  const stars = Array.from({ length: starCount });

  return (
    <View style={[styles.burstContainer, { width: size, height: size }]}>
      {stars.map((_, index) => (
        <BurstStar
          key={index}
          index={index}
          total={starCount}
          size={size}
          color={color}
        />
      ))}
      <CenterStar size={size * 0.3} color={color} />
    </View>
  );
}

function BurstStar({
  index,
  total,
  size,
  color,
}: {
  index: number;
  total: number;
  size: number;
  color: string;
}) {
  const angle = (index / total) * 360;
  const distance = size * 0.4;

  const scale = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    const radians = (angle * Math.PI) / 180;
    const targetX = Math.cos(radians) * distance;
    const targetY = Math.sin(radians) * distance;

    scale.value = withDelay(
      index * 30,
      withSequence(
        withSpring(1.5, { damping: 8 }),
        withTiming(0, { duration: 500 })
      )
    );

    translateX.value = withDelay(
      index * 30,
      withSpring(targetX, { damping: 12, stiffness: 150 })
    );

    translateY.value = withDelay(
      index * 30,
      withSpring(targetY, { damping: 12, stiffness: 150 })
    );

    opacity.value = withDelay(
      index * 30,
      withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(400, withTiming(0, { duration: 300 }))
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.star, { color }, animatedStyle]}>
      ★
    </Animated.Text>
  );
}

function CenterStar({ size, color }: { size: number; color: string }) {
  const scale = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 4, stiffness: 300 }),
      withSpring(1, { damping: 6, stiffness: 200 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text style={[styles.centerStar, { fontSize: size, color }, animatedStyle]}>
      ★
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  burstContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    fontSize: 24,
  },
  centerStar: {
    position: 'absolute',
  },
});
```

## 📱 sometimes-app 적용 사례

### 매칭 성공 화면

```typescript
// src/features/matching/ui/MatchSuccessScreen.tsx
import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface MatchSuccessScreenProps {
  myPhoto: string;
  partnerPhoto: string;
  partnerName: string;
  onContinue: () => void;
}

export function MatchSuccessScreen({
  myPhoto,
  partnerPhoto,
  partnerName,
  onContinue,
}: MatchSuccessScreenProps) {
  const [showConfetti, setShowConfetti] = React.useState(false);

  React.useEffect(() => {
    // 햅틱 피드백
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Confetti 딜레이
    setTimeout(() => setShowConfetti(true), 500);
  }, []);

  return (
    <View style={styles.container}>
      {/* 배경 글로우 */}
      <BackgroundGlow />

      {/* 프로필 카드들 */}
      <ProfileCards myPhoto={myPhoto} partnerPhoto={partnerPhoto} />

      {/* 매칭 텍스트 */}
      <MatchText partnerName={partnerName} />

      {/* 하트 애니메이션 */}
      <HeartAnimation />

      {/* Confetti */}
      {showConfetti && <Confetti count={60} duration={4000} />}

      {/* 계속하기 버튼 */}
      <ContinueButton onPress={onContinue} />
    </View>
  );
}

function BackgroundGlow() {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 50 });
    opacity.value = withTiming(0.6, { duration: 1000 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.glow, animatedStyle]}>
      <View style={styles.glowInner} />
    </Animated.View>
  );
}

function ProfileCards({
  myPhoto,
  partnerPhoto,
}: {
  myPhoto: string;
  partnerPhoto: string;
}) {
  const leftCard = useSharedValue(-width);
  const rightCard = useSharedValue(width);
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    // 카드 슬라이드 인
    leftCard.value = withSpring(-60, {
      damping: 15,
      stiffness: 100,
    });

    rightCard.value = withSpring(60, {
      damping: 15,
      stiffness: 100,
    });

    // 살짝 회전
    rotation.value = withDelay(
      300,
      withSpring(0, { damping: 10, stiffness: 80 })
    );
  }, []);

  const leftStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: leftCard.value },
      { rotate: '-8deg' },
    ],
  }));

  const rightStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: rightCard.value },
      { rotate: '8deg' },
    ],
  }));

  return (
    <View style={styles.cardsContainer}>
      <Animated.View style={[styles.profileCard, leftStyle]}>
        <Image source={{ uri: myPhoto }} style={styles.profileImage} />
      </Animated.View>

      <Animated.View style={[styles.profileCard, rightStyle]}>
        <Image source={{ uri: partnerPhoto }} style={styles.profileImage} />
      </Animated.View>
    </View>
  );
}

function MatchText({ partnerName }: { partnerName: string }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.8);

  React.useEffect(() => {
    opacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(
      500,
      withSpring(0, { damping: 15, stiffness: 100 })
    );
    scale.value = withDelay(
      500,
      withSequence(
        withSpring(1.1, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.textContainer, animatedStyle]}>
      <Text style={styles.matchLabel}>It's a Match! 💜</Text>
      <Text style={styles.matchMessage}>
        {partnerName}님과 매칭되었어요!
      </Text>
    </Animated.View>
  );
}

function HeartAnimation() {
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withDelay(
      300,
      withSequence(
        withSpring(1.5, { damping: 4, stiffness: 400 }),
        withSpring(1, { damping: 6, stiffness: 200 })
      )
    );

    rotate.value = withDelay(
      300,
      withSequence(
        withTiming(-15, { duration: 100 }),
        withTiming(15, { duration: 200 }),
        withSpring(0, { damping: 8 })
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.heartContainer, animatedStyle]}>
      <Text style={styles.heartEmoji}>💜</Text>
    </Animated.View>
  );
}

function ContinueButton({ onPress }: { onPress: () => void }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  React.useEffect(() => {
    opacity.value = withDelay(1500, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(
      1500,
      withSpring(0, { damping: 15, stiffness: 100 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.buttonContainer, animatedStyle]}>
      <Pressable style={styles.continueButton} onPress={onPress}>
        <Text style={styles.buttonText}>대화 시작하기</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowInner: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    backgroundColor: '#7A4AE2',
    opacity: 0.3,
  },
  cardsContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  profileCard: {
    width: 140,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  heartContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  heartEmoji: {
    fontSize: 80,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  matchLabel: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  matchMessage: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 60,
    left: 24,
    right: 24,
  },
  continueButton: {
    backgroundColor: '#7A4AE2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 1. 애니메이션 타이밍 충돌

```typescript
// ❌ 잘못된 예: 동시에 시작되어 어색함
scale.value = withSpring(1);
opacity.value = withTiming(1);
translateY.value = withSpring(0);

// ✅ 올바른 예: 순차적 딜레이로 자연스럽게
scale.value = withSpring(1);
opacity.value = withDelay(100, withTiming(1, { duration: 300 }));
translateY.value = withDelay(200, withSpring(0));
```

### 2. 에러 피드백이 너무 공격적

```typescript
// ❌ 잘못된 예: 과한 흔들림
shake.value = withRepeat(
  withTiming(20, { duration: 50 }),
  10, // 너무 많은 반복
  true
);

// ✅ 올바른 예: 적당한 흔들림
shake.value = withSequence(
  withTiming(-8, { duration: 50 }),
  withTiming(8, { duration: 100 }),
  withTiming(-4, { duration: 100 }),
  withTiming(0, { duration: 50 })
);
```

### 3. 햅틱 피드백 누락

```typescript
// ❌ 잘못된 예: 시각적 피드백만
const handleSuccess = () => {
  showSuccessAnimation();
};

// ✅ 올바른 예: 햅틱 포함
const handleSuccess = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  showSuccessAnimation();
};
```

## 💡 성능 최적화 팁

### 1. Confetti 파티클 수 제한

```typescript
// 기기 성능에 따른 파티클 수 조절
const getConfettiCount = () => {
  // 저사양 기기 체크
  if (Platform.OS === 'android') {
    const deviceYear = parseInt(Platform.Version.toString());
    if (deviceYear < 28) return 20; // Android 9 미만
  }
  return 50;
};
```

### 2. 애니메이션 정리

```typescript
React.useEffect(() => {
  // 애니메이션 시작
  scale.value = withRepeat(/*...*/);

  return () => {
    // 언마운트 시 정리
    cancelAnimation(scale);
  };
}, []);
```

## 🏋️ 연습 문제

### 문제 1: 성공 뱃지
작업 완료 시 화면 중앙에서 뱃지가 회전하며 나타났다가 위로 날아가는 애니메이션을 구현하세요.

### 문제 2: 에러 복구 UI
에러 발생 시 흔들림 + 빨간 테두리 + "다시 시도" 버튼이 펄스하는 UI를 구현하세요.

### 문제 3: 레벨업 효과
레벨업 시 숫자가 카운트업되며 별이 폭발하는 효과를 구현하세요.

## 📚 이 장에서 배운 내용

1. **피드백 심리학**: 성공은 축하, 실패는 부드럽게
2. **체크마크**: SVG 패스 드로잉, 바운스 효과
3. **에러 표시**: X 마크, 흔들기, 폼 필드 에러
4. **토스트**: 슬라이드, 스와이프 가능
5. **축하 효과**: Confetti, 별 폭발
6. **햅틱 연동**: 시각 + 촉각 피드백

## 다음 장 예고

**Chapter 51: 입력 필드 인터랙션**에서는 텍스트 입력 시 플레이스홀더 애니메이션, 포커스 효과, 문자 수 카운터 등 폼 요소의 마이크로 인터랙션을 구현합니다.
