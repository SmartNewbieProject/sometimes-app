# Chapter 67: 테스트 전략

애니메이션 코드를 효과적으로 테스트하는 방법을 학습합니다.

## 📌 학습 목표

- 애니메이션 훅 단위 테스트
- 컴포넌트 통합 테스트
- 제스처 인터랙션 테스트
- E2E 애니메이션 검증

## 📖 개념 이해

### 테스트 피라미드

```
┌─────────────────────────────────────────────────────────┐
│                   Animation Testing Pyramid              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    /\                                   │
│                   /  \      E2E Tests                  │
│                  /    \     (느리지만 실제 환경)        │
│                 /      \                               │
│                /────────\                              │
│               /          \   Integration Tests         │
│              /            \  (컴포넌트 + 애니메이션)    │
│             /──────────────\                           │
│            /                \  Unit Tests              │
│           /                  \ (훅, 유틸리티)           │
│          /────────────────────\                        │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 속도:     빠름 ◀───────────────────────▶ 느림    │  │
│  │ 신뢰도:   낮음 ◀───────────────────────▶ 높음    │  │
│  │ 비용:     저렴 ◀───────────────────────▶ 비쌈    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 테스트 대상과 전략

```
┌─────────────────────────────────────────────────────────┐
│                  What to Test                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ 테스트해야 할 것                                     │
│  ┌────────────────────────────────────────────────┐    │
│  │ • 애니메이션 최종 상태                          │    │
│  │ • 상태 전환 로직                               │    │
│  │ • 콜백 호출 여부                               │    │
│  │ • 에러 처리                                    │    │
│  │ • 사용자 인터랙션 결과                         │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  ❌ 테스트하지 않아도 되는 것                           │
│  ┌────────────────────────────────────────────────┐    │
│  │ • 프레임별 중간 값 (Reanimated 내부)           │    │
│  │ • 정확한 타이밍 (네이티브 드라이버)            │    │
│  │ • 시각적 렌더링 (스냅샷으로 대체)              │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 💻 코드 예제

### 예제 1: Jest 설정 및 Reanimated Mock

```typescript
// jest.setup.js
import 'react-native-gesture-handler/jestSetup';

// Reanimated mock
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // 추가 mock 함수
  Reanimated.default.call = () => {};

  // useSharedValue mock 개선
  Reanimated.useSharedValue = (initialValue) => {
    const ref = { value: initialValue };
    return ref;
  };

  // withSpring mock - 즉시 최종값 반환
  Reanimated.withSpring = (toValue, config, callback) => {
    if (callback) {
      callback(true);
    }
    return toValue;
  };

  // withTiming mock
  Reanimated.withTiming = (toValue, config, callback) => {
    if (callback) {
      callback(true);
    }
    return toValue;
  };

  // useAnimatedStyle mock
  Reanimated.useAnimatedStyle = (styleFunc) => {
    return styleFunc();
  };

  // useDerivedValue mock
  Reanimated.useDerivedValue = (deriveFn) => {
    return { value: deriveFn() };
  };

  // runOnJS mock
  Reanimated.runOnJS = (fn) => fn;

  // runOnUI mock
  Reanimated.runOnUI = (fn) => fn;

  return Reanimated;
});

// Gesture Handler mock
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');

  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: (component) => component,
    GestureDetector: ({ children }) => children,
    Gesture: {
      Pan: () => ({
        onStart: () => {},
        onUpdate: () => {},
        onEnd: () => {},
        enabled: () => {},
      }),
      Tap: () => ({
        onStart: () => {},
        onEnd: () => {},
        enabled: () => {},
      }),
      Simultaneous: (...gestures) => gestures[0],
      Race: (...gestures) => gestures[0],
    },
  };
});
```

### 예제 2: 애니메이션 훅 단위 테스트

```typescript
// hooks/__tests__/useSpringValue.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useSpringValue } from '../useSpringValue';

describe('useSpringValue', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useSpringValue());

    expect(result.current.value.value).toBe(0);
  });

  it('should initialize with custom value', () => {
    const { result } = renderHook(() =>
      useSpringValue({ initial: 100 })
    );

    expect(result.current.value.value).toBe(100);
  });

  it('should update value with set()', () => {
    const { result } = renderHook(() => useSpringValue());

    act(() => {
      result.current.set(50);
    });

    expect(result.current.value.value).toBe(50);
  });

  it('should reset to initial value', () => {
    const { result } = renderHook(() =>
      useSpringValue({ initial: 100 })
    );

    act(() => {
      result.current.set(200);
    });

    expect(result.current.value.value).toBe(200);

    act(() => {
      result.current.reset();
    });

    expect(result.current.value.value).toBe(100);
  });

  it('should animate with spring()', () => {
    const { result } = renderHook(() => useSpringValue());

    act(() => {
      result.current.spring(100);
    });

    // Mock에서는 즉시 최종값으로 설정됨
    expect(result.current.value.value).toBe(100);
  });
});

// hooks/__tests__/usePressable.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { usePressable } from '../usePressable';

describe('usePressable', () => {
  const mockOnPress = jest.fn();
  const mockOnLongPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call onPress when pressed', () => {
    const { result } = renderHook(() =>
      usePressable({ onPress: mockOnPress })
    );

    act(() => {
      result.current.handlePress();
    });

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const { result } = renderHook(() =>
      usePressable({ onPress: mockOnPress, disabled: true })
    );

    act(() => {
      result.current.handlePress();
    });

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should call onLongPress for long press', () => {
    const { result } = renderHook(() =>
      usePressable({ onLongPress: mockOnLongPress })
    );

    act(() => {
      result.current.handleLongPress();
    });

    expect(mockOnLongPress).toHaveBeenCalledTimes(1);
  });

  it('should update animation values on press in/out', () => {
    const { result } = renderHook(() =>
      usePressable({
        scale: { pressed: 0.95, default: 1 },
      })
    );

    act(() => {
      result.current.handlePressIn();
    });

    // Scale should be updated (mock sets immediately)
    expect(result.current.scale?.value).toBeLessThan(1);

    act(() => {
      result.current.handlePressOut();
    });

    // Scale should return to default
    expect(result.current.scale?.value).toBe(1);
  });
});
```

### 예제 3: 컴포넌트 통합 테스트

```typescript
// components/__tests__/AnimatedButton.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AnimatedButton } from '../AnimatedButton';

describe('AnimatedButton', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <AnimatedButton title="Click Me" onPress={() => {}} />
    );

    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <AnimatedButton title="Click Me" onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Click Me'));

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <AnimatedButton title="Click Me" onPress={mockOnPress} disabled />
    );

    fireEvent.press(getByText('Click Me'));

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    const { getByTestId, queryByText } = render(
      <AnimatedButton
        title="Click Me"
        onPress={() => {}}
        loading
        testID="animated-button"
      />
    );

    // 로딩 인디케이터가 표시되어야 함
    expect(getByTestId('loading-indicator')).toBeTruthy();
    // 텍스트는 숨겨져야 함 (또는 반투명)
  });

  it('applies custom styles', () => {
    const { getByTestId } = render(
      <AnimatedButton
        title="Click Me"
        onPress={() => {}}
        style={{ backgroundColor: 'red' }}
        testID="animated-button"
      />
    );

    const button = getByTestId('animated-button');
    // 스타일 검증 (flatten된 스타일 확인)
  });
});

// components/__tests__/SwipeableCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SwipeableCard } from '../SwipeableCard';

// Gesture 이벤트 시뮬레이션 헬퍼
const simulateSwipe = (
  element: any,
  direction: 'left' | 'right' | 'up' | 'down',
  distance: number = 150
) => {
  const startX = 0;
  const startY = 0;
  let endX = startX;
  let endY = startY;

  switch (direction) {
    case 'left':
      endX = startX - distance;
      break;
    case 'right':
      endX = startX + distance;
      break;
    case 'up':
      endY = startY - distance;
      break;
    case 'down':
      endY = startY + distance;
      break;
  }

  fireEvent(element, 'responderGrant', {
    nativeEvent: { pageX: startX, pageY: startY },
  });

  fireEvent(element, 'responderMove', {
    nativeEvent: { pageX: endX, pageY: endY },
  });

  fireEvent(element, 'responderRelease', {
    nativeEvent: {
      pageX: endX,
      pageY: endY,
      velocityX: direction === 'left' ? -1 : direction === 'right' ? 1 : 0,
      velocityY: direction === 'up' ? -1 : direction === 'down' ? 1 : 0,
    },
  });
};

describe('SwipeableCard', () => {
  const mockOnSwipeLeft = jest.fn();
  const mockOnSwipeRight = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <SwipeableCard
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
      >
        <Text>Card Content</Text>
      </SwipeableCard>
    );

    expect(getByText('Card Content')).toBeTruthy();
  });

  it('calls onSwipeRight when swiped right', async () => {
    const { getByTestId } = render(
      <SwipeableCard
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        testID="swipeable-card"
      >
        <Text>Card</Text>
      </SwipeableCard>
    );

    const card = getByTestId('swipeable-card');
    simulateSwipe(card, 'right', 200);

    await waitFor(() => {
      expect(mockOnSwipeRight).toHaveBeenCalled();
    });
  });

  it('calls onSwipeLeft when swiped left', async () => {
    const { getByTestId } = render(
      <SwipeableCard
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        testID="swipeable-card"
      >
        <Text>Card</Text>
      </SwipeableCard>
    );

    const card = getByTestId('swipeable-card');
    simulateSwipe(card, 'left', 200);

    await waitFor(() => {
      expect(mockOnSwipeLeft).toHaveBeenCalled();
    });
  });

  it('does not trigger swipe for small movements', async () => {
    const { getByTestId } = render(
      <SwipeableCard
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        threshold={100}
        testID="swipeable-card"
      >
        <Text>Card</Text>
      </SwipeableCard>
    );

    const card = getByTestId('swipeable-card');
    simulateSwipe(card, 'right', 50); // 임계값 미만

    await waitFor(() => {
      expect(mockOnSwipeRight).not.toHaveBeenCalled();
    });
  });
});
```

### 예제 4: 스냅샷 테스트

```typescript
// components/__tests__/AnimatedCard.snapshot.test.tsx
import React from 'react';
import renderer from 'react-test-renderer';
import { AnimatedCard } from '../AnimatedCard';

describe('AnimatedCard Snapshots', () => {
  it('renders default state correctly', () => {
    const tree = renderer
      .create(
        <AnimatedCard title="Test Card">
          <Text>Content</Text>
        </AnimatedCard>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders expanded state correctly', () => {
    const tree = renderer
      .create(
        <AnimatedCard title="Test Card" defaultExpanded>
          <Text>Expanded Content</Text>
        </AnimatedCard>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders disabled state correctly', () => {
    const tree = renderer
      .create(
        <AnimatedCard title="Test Card" disabled>
          <Text>Disabled Content</Text>
        </AnimatedCard>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders with custom styles', () => {
    const tree = renderer
      .create(
        <AnimatedCard
          title="Styled Card"
          style={{ backgroundColor: '#f0f0f0' }}
          headerStyle={{ padding: 20 }}
        >
          <Text>Styled Content</Text>
        </AnimatedCard>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
```

### 예제 5: E2E 테스트 (Detox)

```typescript
// e2e/animations.e2e.ts
describe('Animation E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Swipeable Card', () => {
    it('should swipe right and show like overlay', async () => {
      // 카드 요소 찾기
      const card = element(by.id('matching-card'));

      // 스와이프 제스처 수행
      await card.swipe('right', 'slow', 0.8);

      // Like 오버레이가 표시되는지 확인
      await expect(element(by.id('like-overlay'))).toBeVisible();
    });

    it('should swipe left and show nope overlay', async () => {
      const card = element(by.id('matching-card'));

      await card.swipe('left', 'slow', 0.8);

      await expect(element(by.id('nope-overlay'))).toBeVisible();
    });

    it('should return to center on incomplete swipe', async () => {
      const card = element(by.id('matching-card'));

      // 짧은 스와이프 (임계값 미만)
      await card.swipe('right', 'slow', 0.2);

      // 카드가 중앙에 있는지 확인
      await waitFor(element(by.id('matching-card')))
        .toBeVisible()
        .withTimeout(1000);

      // 오버레이가 숨겨졌는지 확인
      await expect(element(by.id('like-overlay'))).not.toBeVisible();
    });
  });

  describe('Expandable Card', () => {
    it('should expand on tap', async () => {
      const cardHeader = element(by.id('expandable-card-header'));
      const cardContent = element(by.id('expandable-card-content'));

      // 처음에는 콘텐츠가 숨겨져 있음
      await expect(cardContent).not.toBeVisible();

      // 헤더 탭
      await cardHeader.tap();

      // 콘텐츠가 표시되는지 확인
      await waitFor(cardContent).toBeVisible().withTimeout(500);
    });

    it('should collapse on second tap', async () => {
      const cardHeader = element(by.id('expandable-card-header'));
      const cardContent = element(by.id('expandable-card-content'));

      // 확장
      await cardHeader.tap();
      await waitFor(cardContent).toBeVisible().withTimeout(500);

      // 축소
      await cardHeader.tap();
      await waitFor(cardContent).not.toBeVisible().withTimeout(500);
    });
  });

  describe('Tab Animation', () => {
    it('should animate tab indicator on tab change', async () => {
      const tab1 = element(by.id('tab-1'));
      const tab2 = element(by.id('tab-2'));
      const indicator = element(by.id('tab-indicator'));

      // 첫 번째 탭 선택
      await tab1.tap();

      // 인디케이터 위치 확인 (시각적 검증은 스크린샷으로)
      await expect(indicator).toBeVisible();

      // 두 번째 탭 선택
      await tab2.tap();

      // 인디케이터가 여전히 보이는지 확인
      await expect(indicator).toBeVisible();
    });
  });

  describe('Scroll Animations', () => {
    it('should animate header on scroll', async () => {
      const scrollView = element(by.id('main-scroll-view'));
      const header = element(by.id('animated-header'));

      // 스크롤 전 헤더 확인
      await expect(header).toBeVisible();

      // 아래로 스크롤
      await scrollView.scroll(200, 'down');

      // 헤더가 여전히 존재하는지 확인 (축소 상태)
      await expect(header).toExist();

      // 스크린샷으로 시각적 변화 캡처
      await device.takeScreenshot('header-scrolled');
    });
  });
});
```

### 예제 6: 커스텀 테스트 유틸리티

```typescript
// test-utils/animationTestUtils.ts
import {
  SharedValue,
  WithSpringConfig,
  WithTimingConfig,
} from 'react-native-reanimated';

// 애니메이션 완료 대기
export async function waitForAnimation(
  value: SharedValue<number>,
  targetValue: number,
  timeout: number = 1000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      if (Math.abs(value.value - targetValue) < 0.01) {
        resolve();
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(
          new Error(
            `Animation did not complete within ${timeout}ms. ` +
              `Expected ${targetValue}, got ${value.value}`
          )
        );
        return;
      }

      setTimeout(check, 16);
    };

    check();
  });
}

// 제스처 이벤트 시뮬레이션
export function createGestureEvent(
  type: 'pan' | 'tap' | 'longPress',
  params: {
    translationX?: number;
    translationY?: number;
    velocityX?: number;
    velocityY?: number;
    x?: number;
    y?: number;
  } = {}
) {
  const baseEvent = {
    x: params.x ?? 0,
    y: params.y ?? 0,
    absoluteX: params.x ?? 0,
    absoluteY: params.y ?? 0,
    translationX: params.translationX ?? 0,
    translationY: params.translationY ?? 0,
    velocityX: params.velocityX ?? 0,
    velocityY: params.velocityY ?? 0,
    numberOfPointers: 1,
    state: 4, // ACTIVE
  };

  return baseEvent;
}

// 애니메이션 스타일 값 추출
export function extractAnimatedStyleValue(
  animatedStyle: any,
  property: string
): number | string | undefined {
  if (!animatedStyle) return undefined;

  // 직접 속성 접근
  if (property in animatedStyle) {
    return animatedStyle[property];
  }

  // transform 배열에서 추출
  if (property.startsWith('transform.') && animatedStyle.transform) {
    const transformProp = property.replace('transform.', '');
    const transform = animatedStyle.transform.find(
      (t: any) => transformProp in t
    );
    return transform?.[transformProp];
  }

  return undefined;
}

// 테스트용 Animated 컴포넌트 래퍼
import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

interface TestAnimatedWrapperProps {
  children: React.ReactNode;
  onStyleChange?: (style: any) => void;
}

export const TestAnimatedWrapper: React.FC<TestAnimatedWrapperProps> = ({
  children,
  onStyleChange,
}) => {
  // 스타일 변화 추적 (테스트용)
  return <View>{children}</View>;
};

// Mock 생성 헬퍼
export function createMockSharedValue<T>(initialValue: T): SharedValue<T> {
  let currentValue = initialValue;
  const listeners: Array<(value: T) => void> = [];

  return {
    get value() {
      return currentValue;
    },
    set value(newValue: T) {
      currentValue = newValue;
      listeners.forEach((listener) => listener(newValue));
    },
    addListener: (listener: (value: T) => void) => {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
      };
    },
    modify: (modifier: (value: T) => T) => {
      currentValue = modifier(currentValue);
      listeners.forEach((listener) => listener(currentValue));
    },
  } as unknown as SharedValue<T>;
}

// 애니메이션 타임라인 기록
export class AnimationRecorder {
  private frames: Array<{
    timestamp: number;
    values: Record<string, number>;
  }> = [];

  private startTime: number = 0;

  start() {
    this.frames = [];
    this.startTime = Date.now();
  }

  record(values: Record<string, number>) {
    this.frames.push({
      timestamp: Date.now() - this.startTime,
      values,
    });
  }

  stop() {
    return this.frames;
  }

  // 분석 메서드
  getDuration(): number {
    if (this.frames.length < 2) return 0;
    return (
      this.frames[this.frames.length - 1].timestamp - this.frames[0].timestamp
    );
  }

  getFinalValues(): Record<string, number> {
    return this.frames[this.frames.length - 1]?.values ?? {};
  }

  getValueAtTime(key: string, time: number): number | undefined {
    const frame = this.frames.find((f) => f.timestamp >= time);
    return frame?.values[key];
  }
}
```

## 🎨 sometimes-app 적용 사례

### 매칭 카드 테스트

```typescript
// features/matching/__tests__/useMatchingCard.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useMatchingCard } from '../hooks/useMatchingCard';

describe('useMatchingCard', () => {
  const mockCallbacks = {
    onLike: jest.fn(),
    onPass: jest.fn(),
    onSuperLike: jest.fn(),
    onProfileTap: jest.fn(),
  };

  const defaultOptions = {
    profileId: 'test-profile-123',
    ...mockCallbacks,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useMatchingCard(defaultOptions));

      expect(result.current.isDragging.value).toBe(false);
      expect(result.current.translateX?.value).toBe(0);
      expect(result.current.translateY?.value).toBe(0);
    });
  });

  describe('programmatic actions', () => {
    it('should trigger like animation and callback', async () => {
      const { result } = renderHook(() => useMatchingCard(defaultOptions));

      act(() => {
        result.current.like();
      });

      expect(mockCallbacks.onLike).toHaveBeenCalledWith('test-profile-123');
    });

    it('should trigger pass animation and callback', async () => {
      const { result } = renderHook(() => useMatchingCard(defaultOptions));

      act(() => {
        result.current.pass();
      });

      expect(mockCallbacks.onPass).toHaveBeenCalledWith('test-profile-123');
    });

    it('should trigger super like animation and callback', async () => {
      const { result } = renderHook(() => useMatchingCard(defaultOptions));

      act(() => {
        result.current.superLike();
      });

      expect(mockCallbacks.onSuperLike).toHaveBeenCalledWith('test-profile-123');
    });

    it('should reset to initial state', () => {
      const { result } = renderHook(() => useMatchingCard(defaultOptions));

      // 먼저 값 변경
      act(() => {
        result.current.like();
      });

      // 리셋
      act(() => {
        result.current.reset();
      });

      expect(result.current.translateX?.value).toBe(0);
      expect(result.current.translateY?.value).toBe(0);
    });
  });

  describe('overlay visibility', () => {
    it('should show like overlay on right swipe', () => {
      const { result } = renderHook(() => useMatchingCard(defaultOptions));

      // 스와이프 시뮬레이션
      act(() => {
        // translateX 값 변경으로 오버레이 트리거
        if (result.current.translateX) {
          result.current.translateX.value = 100;
        }
      });

      // likeOverlayStyle에서 opacity 확인
      // Mock 환경에서는 직접 값 확인
    });
  });
});

// features/matching/__tests__/MatchingScreen.integration.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MatchingScreen } from '../screens/MatchingScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';

// 테스트 래퍼
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>{children}</NavigationContainer>
    </QueryClientProvider>
  );
};

describe('MatchingScreen Integration', () => {
  it('renders profile cards from API', async () => {
    const { getByTestId, findByText } = render(<MatchingScreen />, {
      wrapper: createWrapper(),
    });

    // 로딩 상태 확인
    expect(getByTestId('loading-indicator')).toBeTruthy();

    // 프로필 카드 로드 대기
    await findByText('김민지', { timeout: 5000 });
  });

  it('shows empty state when no more profiles', async () => {
    // Mock API로 빈 응답 설정
    const { findByText } = render(<MatchingScreen />, {
      wrapper: createWrapper(),
    });

    await findByText('더 이상 프로필이 없습니다', { timeout: 5000 });
  });

  it('handles like button tap', async () => {
    const { getByTestId, findByTestId } = render(<MatchingScreen />, {
      wrapper: createWrapper(),
    });

    // 카드 로드 대기
    const likeButton = await findByTestId('like-button');

    // 버튼 탭
    fireEvent.press(likeButton);

    // 다음 카드가 표시되는지 확인
    await waitFor(() => {
      // 카드 전환 확인
    });
  });
});
```

## ⚠️ 흔한 실수와 해결법

### 실수 1: 비동기 애니메이션 테스트

```typescript
// ❌ 잘못된 방식 - 동기적으로 결과 확인
it('should animate', () => {
  const { result } = renderHook(() => useSpringValue());

  act(() => {
    result.current.spring(100);
  });

  // 애니메이션이 완료되지 않아 실패할 수 있음
  expect(result.current.value.value).toBe(100);
});

// ✅ 올바른 방식 - waitFor 사용
it('should animate', async () => {
  const { result } = renderHook(() => useSpringValue());

  act(() => {
    result.current.spring(100);
  });

  // Mock에서는 즉시 완료되지만, 실제 환경에서는 대기 필요
  await waitFor(() => {
    expect(result.current.value.value).toBe(100);
  });
});
```

### 실수 2: 제스처 테스트 누락

```typescript
// ❌ 잘못된 방식 - 제스처 핸들러 무시
it('should work', () => {
  const { getByText } = render(<SwipeableCard />);
  // 제스처 테스트 없음
});

// ✅ 올바른 방식 - 제스처 핸들러 직접 테스트
it('should handle swipe', () => {
  const { result } = renderHook(() => useSwipeable());

  // 제스처 핸들러의 onUpdate 직접 호출
  act(() => {
    const gestureEvent = createGestureEvent('pan', {
      translationX: 150,
    });
    // onUpdate 시뮬레이션
  });

  expect(result.current.translateX.value).toBe(150);
});
```

### 실수 3: Worklet 함수 테스트

```typescript
// ❌ 잘못된 방식 - worklet 직접 테스트 시도
it('should calculate value', () => {
  const workletFn = () => {
    'worklet';
    return 1 + 1;
  };

  // Jest에서 worklet은 일반 함수처럼 동작
  expect(workletFn()).toBe(2);
});

// ✅ 올바른 방식 - 로직 분리
// 순수 로직 함수
const calculateValue = (a: number, b: number) => a + b;

// Worklet에서 사용
const workletFn = () => {
  'worklet';
  return calculateValue(1, 1);
};

// 순수 함수 테스트
it('should calculate value', () => {
  expect(calculateValue(1, 1)).toBe(2);
});
```

## 💡 테스트 팁

### 1. 테스트 우선순위

```typescript
// 높은 우선순위
// 1. 콜백 호출 검증
expect(onSwipe).toHaveBeenCalledWith('right');

// 2. 최종 상태 검증
expect(result.current.isExpanded).toBe(true);

// 3. 에러 처리 검증
expect(() => result.current.swipe('invalid')).toThrow();

// 낮은 우선순위 (선택적)
// 4. 중간 값 검증 (필요한 경우만)
// 5. 타이밍 검증 (E2E에서)
```

### 2. 테스트 데이터 격리

```typescript
// 각 테스트는 독립적으로
describe('useAnimation', () => {
  let mockCallback: jest.Mock;

  beforeEach(() => {
    mockCallback = jest.fn();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('test 1', () => {
    // 독립적인 테스트
  });

  it('test 2', () => {
    // 이전 테스트에 영향받지 않음
  });
});
```

### 3. CI/CD 통합

```yaml
# .github/workflows/test.yml
name: Animation Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit -- --coverage

  e2e-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: detox build --configuration ios.sim.release
      - run: detox test --configuration ios.sim.release
```

## 🏋️ 연습 문제

### 문제 1: 토글 스위치 테스트

토글 스위치 컴포넌트의 테스트를 작성하세요.

<details>
<summary>정답 보기</summary>

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useToggleSwitch } from '../useToggleSwitch';

describe('useToggleSwitch', () => {
  it('should initialize with false by default', () => {
    const { result } = renderHook(() => useToggleSwitch());
    expect(result.current.isOn).toBe(false);
  });

  it('should initialize with provided value', () => {
    const { result } = renderHook(() =>
      useToggleSwitch({ initialValue: true })
    );
    expect(result.current.isOn).toBe(true);
  });

  it('should toggle value', () => {
    const { result } = renderHook(() => useToggleSwitch());

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isOn).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isOn).toBe(false);
  });

  it('should call onToggle callback', () => {
    const mockOnToggle = jest.fn();
    const { result } = renderHook(() =>
      useToggleSwitch({ onToggle: mockOnToggle })
    );

    act(() => {
      result.current.toggle();
    });

    expect(mockOnToggle).toHaveBeenCalledWith(true);

    act(() => {
      result.current.toggle();
    });

    expect(mockOnToggle).toHaveBeenCalledWith(false);
  });

  it('should update animation value', () => {
    const { result } = renderHook(() =>
      useToggleSwitch({ trackWidth: 50 })
    );

    expect(result.current.thumbPosition.value).toBe(2);

    act(() => {
      result.current.toggle();
    });

    // Mock에서 withSpring은 즉시 최종값 반환
    expect(result.current.thumbPosition.value).toBe(26); // 50 - 24
  });
});
```

</details>

### 문제 2: E2E 테스트 작성

캐러셀 컴포넌트의 E2E 테스트를 작성하세요.

<details>
<summary>정답 보기</summary>

```typescript
// e2e/carousel.e2e.ts
describe('Carousel E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await element(by.id('carousel-screen-button')).tap();
  });

  it('should display first item initially', async () => {
    await expect(element(by.id('carousel-item-0'))).toBeVisible();
    await expect(element(by.id('carousel-indicator-0'))).toHaveId('active');
  });

  it('should swipe to next item', async () => {
    const carousel = element(by.id('carousel-container'));

    await carousel.swipe('left', 'slow', 0.6);

    await waitFor(element(by.id('carousel-item-1')))
      .toBeVisible()
      .withTimeout(500);

    await expect(element(by.id('carousel-indicator-1'))).toHaveId('active');
  });

  it('should swipe to previous item', async () => {
    const carousel = element(by.id('carousel-container'));

    // 먼저 다음으로 이동
    await carousel.swipe('left', 'slow', 0.6);
    await waitFor(element(by.id('carousel-item-1'))).toBeVisible();

    // 이전으로 이동
    await carousel.swipe('right', 'slow', 0.6);
    await waitFor(element(by.id('carousel-item-0'))).toBeVisible();
  });

  it('should navigate using dots', async () => {
    await element(by.id('carousel-dot-2')).tap();

    await waitFor(element(by.id('carousel-item-2')))
      .toBeVisible()
      .withTimeout(500);
  });

  it('should auto-play if enabled', async () => {
    // 자동 재생 모드 활성화
    await element(by.id('autoplay-toggle')).tap();

    // 3초 후 다음 슬라이드로 이동 확인
    await waitFor(element(by.id('carousel-item-1')))
      .toBeVisible()
      .withTimeout(4000);
  });

  it('should loop at the end if loop is enabled', async () => {
    // 마지막 아이템으로 이동
    await element(by.id('carousel-dot-last')).tap();
    await waitFor(element(by.id('carousel-item-last'))).toBeVisible();

    // 스와이프로 처음으로 돌아가기
    const carousel = element(by.id('carousel-container'));
    await carousel.swipe('left', 'slow', 0.6);

    await waitFor(element(by.id('carousel-item-0')))
      .toBeVisible()
      .withTimeout(500);
  });
});
```

</details>

## 📚 이 장에서 배운 내용

1. **Jest 설정**: Reanimated와 Gesture Handler mock 구성
2. **단위 테스트**: 훅과 유틸리티 함수 테스트
3. **통합 테스트**: 컴포넌트 렌더링과 상호작용 테스트
4. **스냅샷 테스트**: UI 회귀 방지
5. **E2E 테스트**: Detox를 활용한 실제 환경 테스트

## 다음 장 예고

**Chapter 68: 접근성**에서는 애니메이션이 접근성에 미치는 영향과 이를 개선하는 방법을 배웁니다. 모션 감소 설정 존중, 스크린 리더 지원 등을 다룹니다.
