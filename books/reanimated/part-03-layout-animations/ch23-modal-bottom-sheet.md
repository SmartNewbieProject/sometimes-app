# Chapter 23: 실전 - 모달과 바텀시트

## 📌 개요

모달과 바텀시트는 모바일 앱의 핵심 UI 패턴입니다. 이 장에서는 지금까지 배운 Entering/Exiting, 제스처, 레이아웃 애니메이션을 모두 활용하여 프로덕션 레벨의 모달과 바텀시트를 구현합니다.

### 학습 목표

- 오버레이 모달 구현
- 드래그 가능한 바텀시트
- 스냅 포인트 로직
- 키보드 대응
- 접근성 고려

---

## 💻 기본 모달

### 페이드인/아웃 모달

```typescript
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { Pressable, View, Text, StyleSheet, Modal as RNModal } from 'react-native';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function AnimatedModal({ visible, onClose, children }: ModalProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      {/* 배경 오버레이 */}
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={StyleSheet.absoluteFill}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
      </Animated.View>

      {/* 모달 콘텐츠 */}
      <Animated.View
        entering={ZoomIn.duration(300).springify().damping(15)}
        exiting={ZoomOut.duration(200)}
        style={styles.modal}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
});
```

### 슬라이드업 모달

```typescript
import { SlideInDown, SlideOutDown } from 'react-native-reanimated';

function SlideUpModal({ visible, onClose, children }: ModalProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={StyleSheet.absoluteFill}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
      </Animated.View>

      <Animated.View
        entering={SlideInDown.duration(300).springify()}
        exiting={SlideOutDown.duration(200)}
        style={styles.bottomModal}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
});
```

---

## 💻 드래그 가능한 바텀시트

### 기본 구조

```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  clamp,
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.7;
const HANDLE_HEIGHT = 24;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const translateY = useSharedValue(SHEET_HEIGHT);
  const context = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    } else {
      translateY.value = withSpring(SHEET_HEIGHT);
    }
  }, [visible]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateY.value;
    })
    .onUpdate((event) => {
      // 위로는 0까지, 아래로는 제한 없음
      translateY.value = Math.max(0, context.value + event.translationY);
    })
    .onEnd((event) => {
      // 절반 이상 내리거나 빠르게 스와이프하면 닫기
      if (translateY.value > SHEET_HEIGHT / 2 || event.velocityY > 500) {
        translateY.value = withSpring(SHEET_HEIGHT, {}, () => {
          runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, SHEET_HEIGHT],
      [0.5, 0]
    ),
  }));

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* 배경 */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* 시트 */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.handle} />
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
```

---

## 💻 스냅 포인트 바텀시트

### 여러 높이로 스냅

```typescript
const SNAP_POINTS = {
  CLOSED: SCREEN_HEIGHT,
  HALF: SCREEN_HEIGHT * 0.5,
  FULL: SCREEN_HEIGHT * 0.15,
};

function SnapPointBottomSheet({ visible, onClose, children }) {
  const translateY = useSharedValue(SNAP_POINTS.CLOSED);
  const context = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(SNAP_POINTS.HALF);
    } else {
      translateY.value = withSpring(SNAP_POINTS.CLOSED);
    }
  }, [visible]);

  const findNearestSnapPoint = (y: number, velocity: number) => {
    'worklet';

    const points = [SNAP_POINTS.FULL, SNAP_POINTS.HALF, SNAP_POINTS.CLOSED];

    // 속도 고려한 예상 위치
    const projectedY = y + velocity * 0.1;

    let nearest = points[0];
    let minDistance = Math.abs(projectedY - points[0]);

    for (const point of points) {
      const distance = Math.abs(projectedY - point);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    }

    return nearest;
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = clamp(
        context.value + event.translationY,
        SNAP_POINTS.FULL,
        SNAP_POINTS.CLOSED
      );
    })
    .onEnd((event) => {
      const nearestPoint = findNearestSnapPoint(
        translateY.value,
        event.velocityY
      );

      translateY.value = withSpring(nearestPoint, {
        velocity: event.velocityY,
        damping: 20,
        stiffness: 200,
      });

      if (nearestPoint === SNAP_POINTS.CLOSED) {
        runOnJS(onClose)();
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [SNAP_POINTS.FULL, SNAP_POINTS.CLOSED],
      [0.5, 0]
    ),
    pointerEvents: translateY.value < SNAP_POINTS.CLOSED ? 'auto' : 'none',
  }));

  return (
    <View style={styles.container} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[styles.backdrop, backdropOpacity]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            translateY.value = withSpring(SNAP_POINTS.CLOSED, {}, () => {
              runOnJS(onClose)();
            });
          }}
        />
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.handle} />
          <ScrollView style={styles.content}>
            {children}
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
```

---

## 💻 동적 높이 바텀시트

### 콘텐츠에 맞는 높이

```typescript
function DynamicHeightSheet({ visible, onClose, children }) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const contentHeight = useSharedValue(0);
  const context = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0);
    } else {
      translateY.value = withSpring(contentHeight.value + 100);
    }
  }, [visible]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = Math.max(0, context.value + event.translationY);
    })
    .onEnd((event) => {
      if (translateY.value > contentHeight.value / 3 || event.velocityY > 500) {
        translateY.value = withSpring(contentHeight.value + 100, {}, () => {
          runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const onContentLayout = (event: LayoutChangeEvent) => {
    contentHeight.value = event.nativeEvent.layout.height;
  };

  return (
    <View style={styles.container} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[styles.backdrop, /* ... */]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[styles.dynamicSheet, sheetStyle]}
          onLayout={onContentLayout}
        >
          <View style={styles.handle} />
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  dynamicSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area
  },
});
```

---

## 💻 키보드 대응

### 키보드가 열리면 시트 올리기

```typescript
import { useKeyboard } from '@react-native-community/hooks';
import {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';

function KeyboardAwareBottomSheet({ visible, onClose, children }) {
  const keyboard = useAnimatedKeyboard();

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      // 키보드 높이만큼 올림
      { translateY: -keyboard.height.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.sheet, sheetStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
```

### 수동 키보드 처리

```typescript
import { Keyboard, Platform } from 'react-native';

function ManualKeyboardSheet({ visible, onClose, children }) {
  const translateY = useSharedValue(SHEET_HEIGHT);
  const keyboardOffset = useSharedValue(0);

  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        keyboardOffset.value = withTiming(e.endCoordinates.height);
      }
    );

    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        keyboardOffset.value = withTiming(0);
      }
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value - keyboardOffset.value },
    ],
  }));

  // ...
}
```

---

## 💻 스크롤과 드래그 조합

### ScrollView 안에서 드래그

```typescript
function ScrollableBottomSheet({ visible, onClose, children }) {
  const translateY = useSharedValue(SHEET_HEIGHT);
  const scrollOffset = useSharedValue(0);
  const context = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateY.value;
    })
    .onUpdate((event) => {
      // 스크롤이 맨 위일 때만 시트 드래그 허용
      if (scrollOffset.value <= 0 && event.translationY > 0) {
        translateY.value = context.value + event.translationY;
      }
    })
    .onEnd((event) => {
      if (translateY.value > SHEET_HEIGHT / 2 || event.velocityY > 500) {
        translateY.value = withSpring(SHEET_HEIGHT, {}, () => {
          runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0);
      }
    });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <View style={styles.handle} />
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          bounces={false}
        >
          {children}
        </Animated.ScrollView>
      </Animated.View>
    </GestureDetector>
  );
}
```

---

## 💻 확인 모달

### 액션 버튼 포함

```typescript
interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

function ConfirmModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
}: ConfirmModalProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={StyleSheet.absoluteFill}
      >
        <Pressable style={styles.backdrop} onPress={onCancel} />
      </Animated.View>

      <Animated.View
        entering={ZoomIn.springify().damping(15)}
        exiting={ZoomOut.duration(200)}
        style={styles.modal}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.buttonContainer}>
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>{cancelText}</Text>
          </Pressable>
          <Pressable
            style={[
              styles.confirmButton,
              destructive && styles.destructiveButton,
            ]}
            onPress={onConfirm}
          >
            <Text style={styles.confirmText}>{confirmText}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  destructiveButton: {
    backgroundColor: '#FF3B30',
  },
  cancelText: {
    color: '#333',
    fontWeight: '600',
  },
  confirmText: {
    color: 'white',
    fontWeight: '600',
  },
});
```

---

## 💻 액션 시트

### iOS 스타일 액션 시트

```typescript
interface ActionOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  title?: string;
  options: ActionOption[];
  onCancel: () => void;
}

function ActionSheet({ visible, title, options, onCancel }: ActionSheetProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={StyleSheet.absoluteFill}
      >
        <Pressable style={styles.backdrop} onPress={onCancel} />
      </Animated.View>

      <Animated.View
        entering={SlideInDown.springify().damping(20)}
        exiting={SlideOutDown.duration(200)}
        style={styles.actionSheet}
      >
        <View style={styles.optionsContainer}>
          {title && <Text style={styles.sheetTitle}>{title}</Text>}

          {options.map((option, index) => (
            <Animated.View
              key={index}
              entering={FadeIn.delay(50 * index)}
            >
              <Pressable
                style={[
                  styles.option,
                  index < options.length - 1 && styles.optionBorder,
                ]}
                onPress={() => {
                  option.onPress();
                  onCancel();
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    option.destructive && styles.destructiveText,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <Pressable style={styles.cancelOption} onPress={onCancel}>
          <Text style={styles.cancelOptionText}>Cancel</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionSheet: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    paddingBottom: 34,
  },
  optionsContainer: {
    backgroundColor: 'white',
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
  },
  sheetTitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  option: {
    padding: 16,
    alignItems: 'center',
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 20,
    color: '#007AFF',
  },
  destructiveText: {
    color: '#FF3B30',
  },
  cancelOption: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  cancelOptionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
  },
});
```

---

## 🎯 실무 적용: Sometimes 앱 사례

### 프로필 액션 시트

```typescript
// src/shared/providers/modal-provider.tsx 참고
function ProfileActionSheet({ profile, visible, onClose }) {
  const options = [
    { label: 'View Profile', onPress: () => navigate('Profile', { id: profile.id }) },
    { label: 'Send Message', onPress: () => navigate('Chat', { userId: profile.id }) },
    { label: 'Block User', onPress: handleBlock, destructive: true },
  ];

  return (
    <ActionSheet
      visible={visible}
      title={profile.name}
      options={options}
      onCancel={onClose}
    />
  );
}
```

---

## 🏋️ 연습 문제

### 연습 1: 기본 모달
줌인/아웃 애니메이션이 있는 확인 모달을 구현하세요.

### 연습 2: 드래그 바텀시트
드래그해서 닫을 수 있는 바텀시트를 구현하세요.

### 연습 3: 스냅 포인트
3개의 스냅 포인트(닫힘, 절반, 전체)가 있는 바텀시트를 구현하세요.

### 연습 4: 액션 시트
iOS 스타일의 액션 시트를 구현하세요.

---

## 📚 요약

### 모달/바텀시트 패턴

| 유형 | 애니메이션 | 닫기 방식 |
|-----|----------|----------|
| 센터 모달 | ZoomIn/Out | 백드롭 탭, 버튼 |
| 바텀시트 | SlideIn/Out | 드래그, 백드롭 탭 |
| 액션시트 | SlideInDown | 취소 버튼, 백드롭 탭 |

### 체크리스트

- [ ] 배경 오버레이 (백드롭)
- [ ] Entering/Exiting 애니메이션
- [ ] 드래그로 닫기 (바텀시트)
- [ ] 키보드 대응
- [ ] 안전 영역 처리

### 다음 장 예고

다음 장에서는 **실전: 탭 전환 애니메이션**을 구현합니다. 탭 간 전환 시 부드러운 인디케이터 이동과 콘텐츠 전환 애니메이션을 만들어봅니다.
