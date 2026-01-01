# Chapter 43: 스레드 간 통신 마스터

runOnUI와 runOnJS를 활용한 효율적인 스레드 간 데이터 교환 패턴을 마스터합니다. JavaScript 스레드와 UI 스레드 사이의 안전한 통신 방법과 복잡한 비동기 흐름 처리를 배웁니다.

## 📌 학습 목표

- runOnUI와 runOnJS의 동작 원리
- 스레드 안전한 데이터 전달 패턴
- 비동기 작업과 워크릿 연동
- 콜백 체인과 에러 처리
- 성능 최적화 기법

## 📖 스레드 통신의 기초

### 두 스레드의 역할

```
┌─────────────────────────────────────────────────────────────────┐
│                    Thread Communication                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐       ┌─────────────────────┐          │
│  │   JavaScript Thread │       │      UI Thread      │          │
│  │                     │       │                     │          │
│  │  • React 렌더링     │       │  • 네이티브 뷰 조작 │          │
│  │  • 상태 관리        │       │  • 터치 이벤트 처리 │          │
│  │  • 비즈니스 로직    │       │  • 애니메이션 실행  │          │
│  │  • API 호출         │       │  • 제스처 처리      │          │
│  │  • 네비게이션       │       │  • 레이아웃 계산    │          │
│  │                     │       │                     │          │
│  │     runOnUI() ──────┼──────►│                     │          │
│  │                     │       │                     │          │
│  │     ◄───────────────┼───────┼───── runOnJS()     │          │
│  │                     │       │                     │          │
│  └─────────────────────┘       └─────────────────────┘          │
│                                                                  │
│  통신 특성:                                                       │
│  • 비동기 (즉시 반환, 나중에 실행)                                │
│  • 단방향 메시지 전달                                             │
│  • 직렬화 가능한 데이터만 전달                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### runOnUI 기본 사용법

```typescript
import { runOnUI, useSharedValue } from 'react-native-reanimated';

function Component() {
  const progress = useSharedValue(0);

  // JS 스레드에서 호출, UI 스레드에서 실행
  const startAnimation = () => {
    runOnUI(() => {
      'worklet';
      // 이 코드는 UI 스레드에서 실행됨
      progress.value = withTiming(1, { duration: 1000 });
    })();
  };

  // 파라미터 전달
  const animateTo = (target: number) => {
    runOnUI((value: number) => {
      'worklet';
      progress.value = withTiming(value);
    })(target);
  };

  return (
    <Button onPress={() => animateTo(100)} title="Animate" />
  );
}
```

### runOnJS 기본 사용법

```typescript
import { runOnJS, useAnimatedGestureHandler } from 'react-native-reanimated';

function Component() {
  const [status, setStatus] = useState('idle');

  // JS에서 정의한 함수
  const updateStatus = (newStatus: string) => {
    setStatus(newStatus);
    console.log('Status updated:', newStatus);
  };

  // 워크릿에서 JS 함수 호출
  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      // runOnJS로 JS 스레드 함수 호출
      runOnJS(updateStatus)('dragging');
    },
    onEnd: () => {
      runOnJS(updateStatus)('idle');
    },
  });

  return (
    <GestureDetector gesture={Gesture.Pan().onUpdate(gestureHandler)}>
      <View>
        <Text>{status}</Text>
      </View>
    </GestureDetector>
  );
}
```

## 💻 데이터 전달 패턴

### 기본 타입 전달

```typescript
// 숫자
runOnUI((value: number) => {
  'worklet';
  sharedValue.value = value;
})(42);

// 문자열
runOnUI((message: string) => {
  'worklet';
  console.log(message);
})('Hello from JS');

// 불리언
runOnUI((isEnabled: boolean) => {
  'worklet';
  enabled.value = isEnabled;
})(true);
```

### 객체와 배열 전달

```typescript
interface Config {
  duration: number;
  easing: string;
  delay: number;
}

// 객체 전달
const applyConfig = (config: Config) => {
  runOnUI((cfg: Config) => {
    'worklet';
    // 객체가 직렬화되어 전달됨
    animationConfig.value = cfg;
  })(config);
};

// 배열 전달
const updatePoints = (points: { x: number; y: number }[]) => {
  runOnUI((pts: { x: number; y: number }[]) => {
    'worklet';
    pathPoints.value = pts;
  })(points);
};

// ⚠️ 함수는 전달 불가
const badExample = () => {
  runOnUI((callback: () => void) => {
    'worklet';
    // callback(); // ❌ 에러! 함수는 직렬화 불가
  })(() => console.log('Hi'));
};
```

### 워크릿에서 JS로 결과 반환

```typescript
function useAsyncComputation() {
  const result = useSharedValue<number | null>(null);
  const [jsResult, setJsResult] = useState<number | null>(null);

  // 결과를 JS로 전달
  const handleResult = (value: number) => {
    setJsResult(value);
  };

  const compute = () => {
    runOnUI(() => {
      'worklet';
      // UI 스레드에서 복잡한 계산
      let sum = 0;
      for (let i = 0; i < 1000; i++) {
        sum += Math.sin(i) * Math.cos(i);
      }

      result.value = sum;

      // 결과를 JS 스레드로 전달
      runOnJS(handleResult)(sum);
    })();
  };

  return { compute, result, jsResult };
}
```

## 💻 콜백 체인 패턴

### 순차 실행

```typescript
function SequentialOperations() {
  const position = useSharedValue({ x: 0, y: 0 });

  const logPosition = (phase: string, x: number, y: number) => {
    console.log(`[${phase}] Position: (${x}, ${y})`);
  };

  const moveSequence = () => {
    runOnUI(() => {
      'worklet';
      // 1단계: 오른쪽으로 이동
      position.value = { x: 100, y: 0 };
      runOnJS(logPosition)('Step 1', 100, 0);

      // 2단계: 아래로 이동 (타이밍 적용)
      position.value = withDelay(500, withTiming({ x: 100, y: 100 }));

      // withTiming 완료 후 콜백
      position.value = withTiming(
        { x: 0, y: 100 },
        { duration: 300 },
        (finished) => {
          if (finished) {
            runOnJS(logPosition)('Step 3', 0, 100);

            // 3단계 완료 후 원위치
            position.value = withTiming({ x: 0, y: 0 }, {}, (done) => {
              if (done) {
                runOnJS(logPosition)('Complete', 0, 0);
              }
            });
          }
        }
      );
    })();
  };

  return <Button onPress={moveSequence} title="Start Sequence" />;
}
```

### Promise 연동

```typescript
function useAnimatedPromise() {
  // 애니메이션을 Promise로 래핑
  const animateValue = (
    sharedValue: SharedValue<number>,
    toValue: number,
    duration: number = 300
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      runOnUI(() => {
        'worklet';
        sharedValue.value = withTiming(toValue, { duration }, (finished) => {
          runOnJS(resolve)(finished ?? false);
        });
      })();
    });
  };

  return { animateValue };
}

// 사용
async function SequenceWithPromises() {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const { animateValue } = useAnimatedPromise();

  const runSequence = async () => {
    // 순차 실행
    await animateValue(opacity, 1, 300);
    console.log('Fade in complete');

    await animateValue(scale, 1.2, 200);
    console.log('Scale up complete');

    await animateValue(scale, 1, 200);
    console.log('Scale down complete');

    // 병렬 실행
    await Promise.all([
      animateValue(opacity, 0, 500),
      animateValue(scale, 0.5, 500),
    ]);
    console.log('All animations complete');
  };

  return { opacity, scale, runSequence };
}
```

### 에러 처리

```typescript
function SafeThreadCommunication() {
  const handleError = (error: Error) => {
    console.error('Worklet error:', error);
    // 에러 리포팅
  };

  const safeRunOnUI = <T extends any[]>(
    worklet: (...args: T) => void
  ) => {
    return (...args: T) => {
      try {
        runOnUI((...innerArgs: T) => {
          'worklet';
          try {
            worklet(...innerArgs);
          } catch (error) {
            runOnJS(handleError)(error as Error);
          }
        })(...args);
      } catch (error) {
        handleError(error as Error);
      }
    };
  };

  const safeOperation = safeRunOnUI((value: number) => {
    'worklet';
    if (value < 0) {
      throw new Error('Value must be positive');
    }
    // 정상 로직
  });

  return { safeOperation };
}
```

## 💻 비동기 작업 연동

### API 호출과 애니메이션

```typescript
function useFetchWithAnimation() {
  const opacity = useSharedValue(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    // 페이드 아웃 시작
    setLoading(true);

    runOnUI(() => {
      'worklet';
      opacity.value = withTiming(0.3, { duration: 200 });
    })();

    try {
      const response = await fetch('/api/data');
      const json = await response.json();
      setData(json);

      // 성공: 페이드 인
      runOnUI(() => {
        'worklet';
        opacity.value = withSpring(1);
      })();
    } catch (error) {
      // 실패: 빨간색 플래시
      runOnUI(() => {
        'worklet';
        opacity.value = withSequence(
          withTiming(0, { duration: 100 }),
          withTiming(1, { duration: 100 }),
          withTiming(0, { duration: 100 }),
          withTiming(1, { duration: 100 })
        );
      })();
    } finally {
      setLoading(false);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return { data, loading, fetchData, animatedStyle };
}
```

### 제스처와 네트워크 요청

```typescript
function SwipeToRefresh() {
  const translateY = useSharedValue(0);
  const isRefreshing = useSharedValue(false);
  const [data, setData] = useState([]);

  const THRESHOLD = 100;

  const performRefresh = async () => {
    const response = await fetch('/api/refresh');
    const newData = await response.json();
    setData(newData);

    // 리프레시 완료 후 UI 스레드 업데이트
    runOnUI(() => {
      'worklet';
      isRefreshing.value = false;
      translateY.value = withSpring(0);
    })();
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!isRefreshing.value && event.translationY > 0) {
        // 저항 적용
        translateY.value = event.translationY * 0.5;
      }
    })
    .onEnd((event) => {
      if (event.translationY > THRESHOLD && !isRefreshing.value) {
        // 리프레시 트리거
        isRefreshing.value = true;
        translateY.value = withSpring(THRESHOLD);

        // JS 스레드에서 네트워크 요청
        runOnJS(performRefresh)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: translateY.value / THRESHOLD,
    transform: [
      { rotate: `${translateY.value * 3.6}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={contentStyle}>
        <Animated.View style={[styles.indicator, indicatorStyle]}>
          <RefreshIcon />
        </Animated.View>
        <FlatList data={data} {...listProps} />
      </Animated.View>
    </GestureDetector>
  );
}
```

## 💻 고급 통신 패턴

### 이벤트 버스 패턴

```typescript
// 워크릿 이벤트 시스템
type EventCallback = (data: any) => void;

function createWorkletEventBus() {
  const listeners = useSharedValue<{ [key: string]: number }>({});
  const jsCallbacks = useRef<Map<number, EventCallback>>(new Map());
  const nextId = useRef(0);

  // JS에서 이벤트 수신
  const subscribe = (event: string, callback: EventCallback) => {
    const id = nextId.current++;
    jsCallbacks.current.set(id, callback);

    runOnUI((eventName: string, callbackId: number) => {
      'worklet';
      listeners.value = {
        ...listeners.value,
        [eventName]: callbackId,
      };
    })(event, id);

    return () => {
      jsCallbacks.current.delete(id);
      runOnUI((eventName: string) => {
        'worklet';
        const { [eventName]: removed, ...rest } = listeners.value;
        listeners.value = rest;
      })(event);
    };
  };

  // 워크릿에서 이벤트 발생
  const emit = (event: string, data: any) => {
    'worklet';
    const callbackId = listeners.value[event];
    if (callbackId !== undefined) {
      runOnJS((id: number, eventData: any) => {
        const callback = jsCallbacks.current.get(id);
        callback?.(eventData);
      })(callbackId, data);
    }
  };

  return { subscribe, emit };
}

// 사용
function GestureWithEvents() {
  const eventBus = createWorkletEventBus();

  useEffect(() => {
    const unsubscribe = eventBus.subscribe('swipeComplete', (direction) => {
      console.log('Swiped:', direction);
      // React 상태 업데이트, 네비게이션 등
    });

    return unsubscribe;
  }, []);

  const gestureHandler = useAnimatedGestureHandler({
    onEnd: (event) => {
      const direction = event.velocityX > 0 ? 'right' : 'left';
      eventBus.emit('swipeComplete', direction);
    },
  });
}
```

### 상태 동기화 패턴

```typescript
function useSyncedState<T>(initialValue: T) {
  const sharedValue = useSharedValue(initialValue);
  const [jsValue, setJsValue] = useState(initialValue);

  // UI → JS 동기화
  useAnimatedReaction(
    () => sharedValue.value,
    (current, previous) => {
      if (current !== previous) {
        runOnJS(setJsValue)(current);
      }
    }
  );

  // JS → UI 동기화
  const setValue = (value: T) => {
    setJsValue(value);
    runOnUI((v: T) => {
      'worklet';
      sharedValue.value = v;
    })(value);
  };

  // UI에서 직접 설정
  const setValueFromUI = (value: T) => {
    'worklet';
    sharedValue.value = value;
  };

  return {
    value: jsValue,
    sharedValue,
    setValue,
    setValueFromUI,
  };
}

// 사용
function SyncedComponent() {
  const { value, sharedValue, setValue, setValueFromUI } = useSyncedState(0);

  // React UI에서 표시
  return (
    <View>
      <Text>JS Value: {value}</Text>

      {/* JS에서 업데이트 */}
      <Button onPress={() => setValue(value + 1)} title="JS +1" />

      {/* 워크릿에서 업데이트 */}
      <GestureDetector
        gesture={Gesture.Tap().onEnd(() => {
          setValueFromUI(sharedValue.value + 10);
        })}
      >
        <Animated.View style={styles.tapArea}>
          <Text>Tap for UI +10</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
```

### 배치 업데이트 패턴

```typescript
function useBatchedUpdates() {
  const pendingUpdates = useRef<(() => void)[]>([]);
  const isScheduled = useRef(false);

  // 배치로 모아서 실행
  const scheduleUpdate = (callback: () => void) => {
    pendingUpdates.current.push(callback);

    if (!isScheduled.current) {
      isScheduled.current = true;

      // 다음 프레임에 모든 업데이트 실행
      requestAnimationFrame(() => {
        const updates = pendingUpdates.current;
        pendingUpdates.current = [];
        isScheduled.current = false;

        // 모든 업데이트를 한 번의 runOnUI로 실행
        runOnUI(() => {
          'worklet';
          // 배치 시작 표시
        })();

        updates.forEach(update => update());
      });
    }
  };

  return scheduleUpdate;
}

// 사용
function BatchedComponent() {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const scale = useSharedValue(1);
  const scheduleUpdate = useBatchedUpdates();

  const updateMultiple = () => {
    // 개별 호출이지만 배치로 실행됨
    scheduleUpdate(() => {
      runOnUI(() => {
        'worklet';
        x.value = withTiming(100);
      })();
    });

    scheduleUpdate(() => {
      runOnUI(() => {
        'worklet';
        y.value = withTiming(100);
      })();
    });

    scheduleUpdate(() => {
      runOnUI(() => {
        'worklet';
        scale.value = withTiming(1.5);
      })();
    });
  };
}
```

## 📱 sometimes-app 적용 사례

### 채팅 메시지 전송 플로우

```typescript
// src/features/chat/hooks/use-message-send.ts
import { runOnUI, runOnJS, useSharedValue } from 'react-native-reanimated';

interface SendingState {
  progress: number;
  status: 'idle' | 'sending' | 'success' | 'error';
}

export function useMessageSend(onMessageSent: (id: string) => void) {
  const sendingState = useSharedValue<SendingState>({
    progress: 0,
    status: 'idle',
  });

  const inputHeight = useSharedValue(48);

  // 메시지 전송 (JS에서 호출)
  const sendMessage = async (content: string) => {
    // 1. UI 즉시 업데이트 (낙관적 업데이트)
    runOnUI(() => {
      'worklet';
      sendingState.value = { progress: 0, status: 'sending' };

      // 입력창 축소 애니메이션
      inputHeight.value = withTiming(48, { duration: 200 });

      // 프로그레스 애니메이션
      sendingState.value = {
        ...sendingState.value,
        progress: withTiming(0.9, { duration: 1000 }),
      };
    })();

    try {
      // 2. 실제 API 호출
      const response = await api.sendMessage(content);

      // 3. 성공 시 UI 업데이트
      runOnUI(() => {
        'worklet';
        sendingState.value = {
          progress: withTiming(1, { duration: 200 }),
          status: 'success',
        };

        // 상태 리셋
        sendingState.value = withDelay(
          500,
          withTiming({ progress: 0, status: 'idle' })
        );
      })();

      // 4. JS 콜백 실행
      onMessageSent(response.id);
    } catch (error) {
      // 5. 에러 시 UI 업데이트
      runOnUI(() => {
        'worklet';
        sendingState.value = { progress: 0, status: 'error' };

        // 진동 효과
        sendingState.value = {
          ...sendingState.value,
          progress: withSequence(
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(-10, { duration: 50 }),
            withTiming(0, { duration: 50 })
          ),
        };
      })();
    }
  };

  // 애니메이션 스타일들
  const sendButtonStyle = useAnimatedStyle(() => {
    const state = sendingState.value;

    return {
      opacity: state.status === 'sending' ? 0.6 : 1,
      transform: [
        { scale: state.status === 'sending' ? 0.9 : 1 },
        { translateX: state.status === 'error' ? state.progress : 0 },
      ],
    };
  });

  const progressStyle = useAnimatedStyle(() => ({
    width: `${sendingState.value.progress * 100}%`,
    backgroundColor: sendingState.value.status === 'error' ? '#EF4444' : '#7A4AE2',
  }));

  const inputContainerStyle = useAnimatedStyle(() => ({
    height: inputHeight.value,
  }));

  return {
    sendMessage,
    sendButtonStyle,
    progressStyle,
    inputContainerStyle,
    sendingState,
  };
}
```

### 좋아요 버튼 인터랙션

```typescript
// src/features/like/hooks/use-like-button.ts
export function useLikeButton(
  initialLiked: boolean,
  onLikeChange: (liked: boolean) => Promise<void>
) {
  const isLiked = useSharedValue(initialLiked);
  const scale = useSharedValue(1);
  const particles = useSharedValue<Particle[]>([]);

  const [optimisticLiked, setOptimisticLiked] = useState(initialLiked);

  // 파티클 생성 (워크릿)
  const createParticles = () => {
    'worklet';
    const newParticles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      newParticles.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * 100,
        vy: Math.sin(angle) * 100,
        life: 1,
      });
    }
    particles.value = newParticles;
  };

  // 좋아요 토글
  const toggleLike = () => {
    const newLiked = !isLiked.value;

    // 1. UI 즉시 업데이트
    runOnUI((liked: boolean) => {
      'worklet';
      isLiked.value = liked;

      // 스케일 애니메이션
      scale.value = withSequence(
        withTiming(0.8, { duration: 100 }),
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );

      // 좋아요일 때만 파티클
      if (liked) {
        createParticles();
      }
    })(newLiked);

    // 2. 낙관적 React 상태 업데이트
    setOptimisticLiked(newLiked);

    // 3. 서버 요청
    onLikeChange(newLiked).catch(() => {
      // 4. 실패 시 롤백
      runOnUI((originalLiked: boolean) => {
        'worklet';
        isLiked.value = originalLiked;
        scale.value = withSequence(
          withTiming(0.5, { duration: 100 }),
          withSpring(1, { damping: 10 })
        );
      })(!newLiked);

      setOptimisticLiked(!newLiked);
    });
  };

  // 버튼 스타일
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // 하트 스타일
  const heartStyle = useAnimatedStyle(() => ({
    color: isLiked.value ? '#EF4444' : '#9CA3AF',
  }));

  return {
    isLiked: optimisticLiked,
    toggleLike,
    buttonStyle,
    heartStyle,
    particles,
  };
}
```

## ⚠️ 흔한 실수와 해결법

### 1. 직접 함수 참조

```typescript
// ❌ 함수를 직접 전달하려고 함
const callback = () => console.log('Done');

runOnUI(() => {
  'worklet';
  callback(); // ❌ 에러!
})();

// ✅ runOnJS 사용
const callback = () => console.log('Done');

runOnUI(() => {
  'worklet';
  runOnJS(callback)();
})();
```

### 2. 컴포넌트 상태 직접 접근

```typescript
// ❌ 워크릿에서 React 상태 접근
const [count, setCount] = useState(0);

runOnUI(() => {
  'worklet';
  // count는 클로저에 캡처되지만 업데이트되지 않음
  console.log(count); // 항상 초기값
})();

// ✅ SharedValue 사용
const count = useSharedValue(0);

runOnUI(() => {
  'worklet';
  console.log(count.value); // 항상 최신값
})();
```

### 3. 동기적 결과 기대

```typescript
// ❌ runOnUI는 비동기
let result = 0;

runOnUI(() => {
  'worklet';
  result = 42; // UI 스레드의 로컬 변수에 쓰기
})();

console.log(result); // 0 - 아직 실행 안됨!

// ✅ 콜백으로 결과 받기
const handleResult = (value: number) => {
  console.log(value); // 42
};

runOnUI(() => {
  'worklet';
  const result = 42;
  runOnJS(handleResult)(result);
})();
```

## 💡 성능 최적화 팁

### 1. 불필요한 스레드 전환 최소화

```typescript
// ❌ 매 프레임마다 JS 호출
useFrameCallback(() => {
  runOnJS(updateState)(position.value); // 비용이 큼
});

// ✅ 필요할 때만 JS 호출
const lastReported = useSharedValue(0);

useFrameCallback(() => {
  // 10ms마다만 보고
  if (Date.now() - lastReported.value > 10) {
    runOnJS(updateState)(position.value);
    lastReported.value = Date.now();
  }
});
```

### 2. 데이터 크기 최소화

```typescript
// ❌ 큰 객체 전체 전달
runOnUI((fullState: LargeState) => {
  'worklet';
  // fullState의 일부만 사용
  position.value = fullState.position;
})(largeState);

// ✅ 필요한 것만 전달
runOnUI((pos: Position) => {
  'worklet';
  position.value = pos;
})(largeState.position);
```

### 3. 배치 처리

```typescript
// ❌ 여러 번 호출
items.forEach(item => {
  runOnUI((i: Item) => {
    'worklet';
    // 처리
  })(item);
});

// ✅ 한 번에 처리
runOnUI((items: Item[]) => {
  'worklet';
  items.forEach(item => {
    // 처리
  });
})(items);
```

## 🏋️ 연습 문제

### 과제 1: 양방향 동기화
SharedValue와 React 상태를 실시간으로 양방향 동기화하는 훅을 구현하세요.

### 과제 2: 요청 큐
네트워크 요청을 큐에 쌓고 순차적으로 처리하면서 애니메이션 피드백을 제공하세요.

### 과제 3: 에러 복구
워크릿에서 발생한 에러를 감지하고 자동으로 복구하는 시스템을 만드세요.

## 📚 이 장에서 배운 내용

1. **runOnUI**: JS에서 UI 스레드로 코드 실행
2. **runOnJS**: 워크릿에서 JS 함수 호출
3. **데이터 전달**: 직렬화 가능한 타입만 전달 가능
4. **콜백 체인**: 복잡한 비동기 흐름 처리
5. **최적화**: 스레드 전환 최소화와 배치 처리

## 다음 장 예고

**Chapter 44: 커스텀 애니메이션 엔진**에서는 withTiming, withSpring을 넘어 완전히 새로운 애니메이션 패턴을 만드는 방법을 배웁니다. 나만의 이징 함수와 애니메이션 드라이버를 구현합니다.
