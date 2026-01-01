# Chapter 37: Lottie 통합

After Effects로 제작한 복잡한 애니메이션을 앱에 통합합니다. JSON 기반 벡터 애니메이션의 강력한 기능과 Reanimated와의 시너지를 다룹니다.

## 📌 학습 목표

- Lottie 기본 사용법
- 애니메이션 제어 (재생, 일시정지, 구간)
- Reanimated와 연동
- 동적 속성 변경
- 인터랙티브 Lottie

## 📖 Lottie란?

```
┌────────────────────────────────────────────────────────┐
│                    Lottie 워크플로우                    │
├────────────────────────────────────────────────────────┤
│                                                         │
│   After Effects    →    Bodymovin    →    JSON         │
│   (애니메이션 제작)    (플러그인 내보내기)   (Lottie 파일)    │
│                                                         │
│                           ↓                             │
│                                                         │
│   ┌─────────────────────────────────────────────┐      │
│   │              lottie-react-native             │      │
│   │                                              │      │
│   │  • 벡터 기반 (확대해도 선명)                   │      │
│   │  • 작은 파일 크기 (GIF/MP4 대비 10~20%)       │      │
│   │  • 프로그래밍 방식 제어                       │      │
│   │  • 동적 속성 변경                            │      │
│   └─────────────────────────────────────────────┘      │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### 설치

```bash
# lottie-react-native 설치
npm install lottie-react-native

# iOS pod 설치
cd ios && pod install
```

### 기본 사용법

```typescript
// components/LottieBasic.tsx
import React, { useRef } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import LottieView from 'lottie-react-native';

function LottieBasic() {
  const animationRef = useRef<LottieView>(null);

  const handlePlay = () => {
    animationRef.current?.play();
  };

  const handlePause = () => {
    animationRef.current?.pause();
  };

  const handleReset = () => {
    animationRef.current?.reset();
  };

  return (
    <View style={styles.container}>
      <LottieView
        ref={animationRef}
        source={require('../assets/animations/loading.json')}
        style={styles.animation}
        autoPlay
        loop
      />

      <View style={styles.controls}>
        <Pressable style={styles.button} onPress={handlePlay}>
          <Text style={styles.buttonText}>Play</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handlePause}>
          <Text style={styles.buttonText}>Pause</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleReset}>
          <Text style={styles.buttonText}>Reset</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  animation: {
    width: 200,
    height: 200,
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
  },
  button: {
    backgroundColor: '#7A4AE2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LottieBasic;
```

## 💻 애니메이션 제어

### 구간 재생

```typescript
// components/LottieSegments.tsx
import React, { useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import LottieView from 'lottie-react-native';

interface Segment {
  name: string;
  start: number;
  end: number;
}

const SEGMENTS: Segment[] = [
  { name: 'Intro', start: 0, end: 30 },
  { name: 'Loading', start: 30, end: 90 },
  { name: 'Success', start: 90, end: 120 },
  { name: 'Error', start: 120, end: 150 },
];

function LottieSegments() {
  const animationRef = useRef<LottieView>(null);
  const [currentSegment, setCurrentSegment] = useState<string>('');

  const playSegment = (segment: Segment) => {
    setCurrentSegment(segment.name);
    animationRef.current?.play(segment.start, segment.end);
  };

  return (
    <View style={styles.container}>
      <LottieView
        ref={animationRef}
        source={require('../assets/animations/multi-state.json')}
        style={styles.animation}
        loop={false}
      />

      <Text style={styles.currentSegment}>
        Current: {currentSegment || 'None'}
      </Text>

      <View style={styles.segmentButtons}>
        {SEGMENTS.map((segment) => (
          <Pressable
            key={segment.name}
            style={[
              styles.segmentButton,
              currentSegment === segment.name && styles.activeSegment,
            ]}
            onPress={() => playSegment(segment)}
          >
            <Text style={styles.segmentText}>{segment.name}</Text>
            <Text style={styles.frameText}>
              {segment.start}-{segment.end}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  animation: {
    width: 250,
    height: 250,
  },
  currentSegment: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 20,
  },
  segmentButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  segmentButton: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  activeSegment: {
    backgroundColor: '#7A4AE2',
  },
  segmentText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  frameText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 4,
  },
});

export default LottieSegments;
```

### 속도 제어

```typescript
// components/LottieSpeed.tsx
import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import Slider from '@react-native-community/slider';

function LottieSpeed() {
  const animationRef = useRef<LottieView>(null);
  const [speed, setSpeed] = useState(1);

  const handleSpeedChange = (value: number) => {
    setSpeed(value);
    // LottieView는 speed prop을 통해 속도 조절
  };

  return (
    <View style={styles.container}>
      <LottieView
        ref={animationRef}
        source={require('../assets/animations/running.json')}
        style={styles.animation}
        autoPlay
        loop
        speed={speed}
      />

      <View style={styles.speedControl}>
        <Text style={styles.speedLabel}>Speed: {speed.toFixed(1)}x</Text>
        <Slider
          style={styles.slider}
          minimumValue={0.25}
          maximumValue={3}
          value={speed}
          onValueChange={handleSpeedChange}
          minimumTrackTintColor="#7A4AE2"
          maximumTrackTintColor="#3A3A3A"
          thumbTintColor="#7A4AE2"
        />

        <View style={styles.speedPresets}>
          {[0.5, 1, 1.5, 2].map((preset) => (
            <Pressable
              key={preset}
              style={[
                styles.presetButton,
                Math.abs(speed - preset) < 0.1 && styles.activePreset,
              ]}
              onPress={() => setSpeed(preset)}
            >
              <Text style={styles.presetText}>{preset}x</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  animation: {
    width: 200,
    height: 200,
  },
  speedControl: {
    width: '80%',
    marginTop: 32,
  },
  speedLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  speedPresets: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  presetButton: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  activePreset: {
    backgroundColor: '#7A4AE2',
  },
  presetText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default LottieSpeed;
```

## 💻 Reanimated 연동

### progress prop 활용

```typescript
// components/LottieWithReanimated.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  useDerivedValue,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

function LottieWithReanimated() {
  const progress = useSharedValue(0);

  // 자동 재생
  React.useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    progress: progress.value,
  }));

  return (
    <View style={styles.container}>
      <AnimatedLottieView
        source={require('../assets/animations/heart.json')}
        style={styles.animation}
        animatedProps={animatedProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  animation: {
    width: 200,
    height: 200,
  },
});

export default LottieWithReanimated;
```

### 스크롤 연동 Lottie

```typescript
// components/LottieScrollLinked.tsx
import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

const CONTENT_HEIGHT = SCREEN_HEIGHT * 3;

function LottieScrollLinked() {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // 스크롤에 따라 progress 계산
  const animatedProps = useAnimatedProps(() => {
    const progress = interpolate(
      scrollY.value,
      [0, CONTENT_HEIGHT - SCREEN_HEIGHT],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      progress,
    };
  });

  return (
    <View style={styles.container}>
      {/* 고정된 Lottie 애니메이션 */}
      <View style={styles.lottieContainer}>
        <AnimatedLottieView
          source={require('../assets/animations/scroll-progress.json')}
          style={styles.animation}
          animatedProps={animatedProps}
        />
      </View>

      {/* 스크롤 컨텐츠 */}
      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          <Text style={styles.scrollText}>Scroll Down</Text>
          <Text style={styles.scrollText}>Keep Scrolling</Text>
          <Text style={styles.scrollText}>Almost There</Text>
          <Text style={styles.scrollText}>Complete!</Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  lottieContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  animation: {
    width: 200,
    height: 200,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    height: CONTENT_HEIGHT,
    paddingTop: 350,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  scrollText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
});

export default LottieScrollLinked;
```

### 제스처 연동 Lottie

```typescript
// components/LottieGesture.tsx
import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

function LottieGesture() {
  const progress = useSharedValue(0);

  // 수평 드래그로 progress 제어
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // -150 ~ 150 드래그를 0 ~ 1로 매핑
      const newProgress = Math.max(0, Math.min(1,
        (event.translationX + 150) / 300
      ));
      progress.value = newProgress;
    })
    .onEnd(() => {
      // 끝나면 가장 가까운 값으로 스냅
      if (progress.value < 0.5) {
        progress.value = withSpring(0);
      } else {
        progress.value = withSpring(1);
      }
    });

  const animatedProps = useAnimatedProps(() => ({
    progress: progress.value,
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.gestureArea}>
          <AnimatedLottieView
            source={require('../assets/animations/toggle.json')}
            style={styles.animation}
            animatedProps={animatedProps}
          />

          <Text style={styles.hint}>← Drag to control →</Text>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  gestureArea: {
    alignItems: 'center',
    padding: 40,
  },
  animation: {
    width: 200,
    height: 200,
  },
  hint: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    marginTop: 20,
  },
});

export default LottieGesture;
```

## 💻 동적 속성 변경

### 색상 변경

```typescript
// components/LottieDynamicColors.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import LottieView, { ColorFilter } from 'lottie-react-native';

const COLOR_PRESETS = [
  { name: 'Purple', color: '#7A4AE2' },
  { name: 'Pink', color: '#E24A7A' },
  { name: 'Green', color: '#4AE27A' },
  { name: 'Blue', color: '#4A90D9' },
  { name: 'Yellow', color: '#FFD600' },
];

function LottieDynamicColors() {
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0].color);

  // colorFilters를 사용해 특정 레이어 색상 변경
  const colorFilters: ColorFilter[] = [
    {
      keypath: 'Shape Layer 1',
      color: selectedColor,
    },
    {
      keypath: 'Shape Layer 2',
      color: selectedColor,
    },
    // Lottie 파일의 레이어 이름에 따라 지정
  ];

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/animations/icon.json')}
        style={styles.animation}
        autoPlay
        loop
        colorFilters={colorFilters}
      />

      <View style={styles.colorPicker}>
        {COLOR_PRESETS.map((preset) => (
          <Pressable
            key={preset.name}
            style={[
              styles.colorButton,
              { backgroundColor: preset.color },
              selectedColor === preset.color && styles.selectedColor,
            ]}
            onPress={() => setSelectedColor(preset.color)}
          />
        ))}
      </View>

      <Text style={styles.colorLabel}>
        Selected: {COLOR_PRESETS.find(p => p.color === selectedColor)?.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  animation: {
    width: 200,
    height: 200,
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#FFFFFF',
  },
  colorLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 16,
  },
});

export default LottieDynamicColors;
```

### 텍스트 변경

```typescript
// components/LottieDynamicText.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Text } from 'react-native';
import LottieView from 'lottie-react-native';

function LottieDynamicText() {
  const [customText, setCustomText] = useState('Hello!');

  // textFiltersIOS/textFiltersAndroid를 사용 (플랫폼별)
  // 또는 새로운 API에서는 textFilters 사용

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/animations/text-animation.json')}
        style={styles.animation}
        autoPlay
        loop
        // 텍스트 레이어가 있는 Lottie 파일에서만 작동
        // textFiltersIOS={[
        //   { keypath: 'Text Layer', text: customText }
        // ]}
      />

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Custom Text:</Text>
        <TextInput
          style={styles.input}
          value={customText}
          onChangeText={setCustomText}
          placeholder="Enter text"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  animation: {
    width: 300,
    height: 150,
  },
  inputContainer: {
    width: '80%',
    marginTop: 32,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
  },
});

export default LottieDynamicText;
```

## 💻 실전 컴포넌트

### 로딩 버튼

```typescript
// components/LottieButton.tsx
import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import LottieView from 'lottie-react-native';

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

interface LottieButtonProps {
  title: string;
  onPress: () => Promise<boolean>;
}

function LottieButton({ title, onPress }: LottieButtonProps) {
  const [state, setState] = useState<ButtonState>('idle');
  const animationRef = useRef<LottieView>(null);

  const handlePress = useCallback(async () => {
    if (state !== 'idle') return;

    setState('loading');

    try {
      const success = await onPress();

      if (success) {
        setState('success');
        animationRef.current?.play(0, 60); // 성공 구간
      } else {
        setState('error');
        animationRef.current?.play(60, 90); // 에러 구간
      }

      // 잠시 후 초기화
      setTimeout(() => {
        setState('idle');
        animationRef.current?.reset();
      }, 2000);
    } catch {
      setState('error');
      animationRef.current?.play(60, 90);

      setTimeout(() => {
        setState('idle');
        animationRef.current?.reset();
      }, 2000);
    }
  }, [state, onPress]);

  const getBackgroundColor = () => {
    switch (state) {
      case 'loading':
        return '#5A3AA2';
      case 'success':
        return '#2A8A4A';
      case 'error':
        return '#AA3A3A';
      default:
        return '#7A4AE2';
    }
  };

  return (
    <Pressable
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        state !== 'idle' && styles.disabled,
      ]}
      onPress={handlePress}
      disabled={state !== 'idle'}
    >
      {state === 'idle' && <Text style={styles.buttonText}>{title}</Text>}

      {state === 'loading' && (
        <LottieView
          source={require('../assets/animations/loading-dots.json')}
          style={styles.loadingAnimation}
          autoPlay
          loop
        />
      )}

      {(state === 'success' || state === 'error') && (
        <LottieView
          ref={animationRef}
          source={require('../assets/animations/result.json')}
          style={styles.resultAnimation}
          loop={false}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.9,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingAnimation: {
    width: 80,
    height: 40,
  },
  resultAnimation: {
    width: 60,
    height: 60,
  },
});

export default LottieButton;
```

### Pull-to-Refresh 커스텀

```typescript
// components/LottiePullToRefresh.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, Dimensions, FlatList } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedScrollHandler,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const REFRESH_THRESHOLD = 100;
const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

interface LottiePullToRefreshProps {
  data: any[];
  renderItem: ({ item }: { item: any }) => React.ReactNode;
  onRefresh: () => Promise<void>;
}

function LottiePullToRefresh({
  data,
  renderItem,
  onRefresh,
}: LottiePullToRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);
  const pullDistance = useSharedValue(0);
  const isRefreshing = useSharedValue(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    isRefreshing.value = true;

    await onRefresh();

    setRefreshing(false);
    isRefreshing.value = false;
    pullDistance.value = withSpring(0);
  }, [onRefresh, isRefreshing, pullDistance]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (event.contentOffset.y < 0 && !isRefreshing.value) {
        pullDistance.value = Math.abs(event.contentOffset.y);
      }
    },
    onEndDrag: (event) => {
      if (event.contentOffset.y < -REFRESH_THRESHOLD && !isRefreshing.value) {
        runOnJS(handleRefresh)();
      } else if (!isRefreshing.value) {
        pullDistance.value = withSpring(0);
      }
    },
  });

  const lottieProps = useAnimatedProps(() => {
    const progress = interpolate(
      pullDistance.value,
      [0, REFRESH_THRESHOLD],
      [0, 0.5],
      Extrapolation.CLAMP
    );

    return {
      progress: isRefreshing.value ? undefined : progress,
    };
  });

  const containerStyle = {
    height: interpolate(
      pullDistance.value,
      [0, REFRESH_THRESHOLD, REFRESH_THRESHOLD * 2],
      [0, REFRESH_THRESHOLD, REFRESH_THRESHOLD * 1.2],
      Extrapolation.CLAMP
    ),
    opacity: interpolate(
      pullDistance.value,
      [0, 30, REFRESH_THRESHOLD],
      [0, 1, 1],
      Extrapolation.CLAMP
    ),
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.refreshContainer, containerStyle]}>
        <AnimatedLottieView
          source={require('../assets/animations/pull-refresh.json')}
          style={styles.lottie}
          autoPlay={refreshing}
          loop={refreshing}
          animatedProps={lottieProps}
        />
      </Animated.View>

      <Animated.FlatList
        data={data}
        renderItem={renderItem}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContent}
        bounces
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  refreshContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  lottie: {
    width: 80,
    height: 80,
  },
  listContent: {
    paddingTop: 20,
  },
});

export default LottiePullToRefresh;
```

## 💻 sometimes-app 적용 사례

### 매칭 중 애니메이션

```typescript
// src/features/matching/ui/matching-animation.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import colors from '@/src/shared/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MatchingAnimationProps {
  status: 'searching' | 'found' | 'connecting';
  partnerName?: string;
}

function MatchingAnimation({ status, partnerName }: MatchingAnimationProps) {
  const searchRef = useRef<LottieView>(null);
  const foundRef = useRef<LottieView>(null);
  const connectRef = useRef<LottieView>(null);

  const textOpacity = useSharedValue(1);
  const dotCount = useSharedValue(0);

  useEffect(() => {
    // 텍스트 페이드 애니메이션
    textOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );

    // 점 애니메이션
    dotCount.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(2, { duration: 500 }),
        withTiming(3, { duration: 500 }),
        withTiming(0, { duration: 100 })
      ),
      -1,
      false
    );
  }, [textOpacity, dotCount]);

  useEffect(() => {
    if (status === 'found') {
      searchRef.current?.pause();
      foundRef.current?.play();
    } else if (status === 'connecting') {
      foundRef.current?.pause();
      connectRef.current?.play();
    }
  }, [status]);

  const textStyle = useAnimatedStyle(() => ({
    opacity: status === 'searching' ? textOpacity.value : 1,
  }));

  const getStatusText = () => {
    switch (status) {
      case 'searching':
        return '매칭 상대를 찾고 있어요';
      case 'found':
        return `${partnerName}님을 찾았어요!`;
      case 'connecting':
        return '연결 중...';
    }
  };

  const getAnimation = () => {
    switch (status) {
      case 'searching':
        return (
          <LottieView
            ref={searchRef}
            source={require('@/assets/animations/matching-search.json')}
            style={styles.animation}
            autoPlay
            loop
            colorFilters={[
              { keypath: 'Primary', color: colors.primaryPurple },
              { keypath: 'Secondary', color: '#E24A7A' },
            ]}
          />
        );
      case 'found':
        return (
          <LottieView
            ref={foundRef}
            source={require('@/assets/animations/matching-found.json')}
            style={styles.animation}
            loop={false}
          />
        );
      case 'connecting':
        return (
          <LottieView
            ref={connectRef}
            source={require('@/assets/animations/connecting.json')}
            style={styles.animation}
            autoPlay
            loop
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {getAnimation()}

      <Animated.Text style={[styles.statusText, textStyle]}>
        {getStatusText()}
      </Animated.Text>

      {status === 'searching' && (
        <View style={styles.tips}>
          <Text style={styles.tipTitle}>💡 Tip</Text>
          <Text style={styles.tipText}>
            프로필을 완성하면 매칭 확률이 높아져요!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  animation: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primaryPurple,
    marginTop: 24,
    textAlign: 'center',
  },
  tips: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: colors.cardPurple,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryPurple,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default MatchingAnimation;
```

## ⚠️ 흔한 실수와 해결법

### 1. 애니메이션 로드 실패

```typescript
// ❌ 잘못된 예: 경로 오류
source={require('./animation.json')} // 파일이 없으면 크래시

// ✅ 올바른 예: 에러 처리
const [source, setSource] = useState(null);

useEffect(() => {
  try {
    setSource(require('./animation.json'));
  } catch {
    console.warn('Animation not found');
  }
}, []);

{source && <LottieView source={source} ... />}
```

### 2. progress와 autoPlay 충돌

```typescript
// ❌ 잘못된 예: 둘 다 사용
<LottieView
  autoPlay
  progress={0.5} // autoPlay가 덮어씀
/>

// ✅ 올바른 예: 하나만 선택
// 자동 재생
<LottieView autoPlay loop />

// 또는 수동 제어
<LottieView progress={progress} />
```

### 3. 컴포넌트 언마운트 시 문제

```typescript
// ❌ 잘못된 예: 메모리 누수
<LottieView autoPlay loop /> // 언마운트 후에도 실행

// ✅ 올바른 예: 정리
const animationRef = useRef<LottieView>(null);

useEffect(() => {
  return () => {
    animationRef.current?.pause();
  };
}, []);
```

## 💡 성능 최적화 팁

### 1. 애니메이션 캐싱

```typescript
// 자주 사용하는 애니메이션 캐시
const ANIMATIONS = {
  loading: require('./loading.json'),
  success: require('./success.json'),
  error: require('./error.json'),
};

// 미리 로드
Object.values(ANIMATIONS).forEach(source => {
  // LottieView가 캐시함
});
```

### 2. 해상도 최적화

```typescript
<LottieView
  source={animation}
  // resizeMode로 크기 조정 (실제 애니메이션 리사이즈 아님)
  resizeMode="contain"
  // renderMode 선택 (성능 vs 품질)
  renderMode="HARDWARE" // 또는 "SOFTWARE"
/>
```

### 3. 조건부 렌더링

```typescript
// 보이지 않을 때 렌더링 제외
{isVisible && (
  <LottieView
    source={animation}
    autoPlay
    loop
  />
)}
```

## 🏋️ 연습 문제

### 문제 1: 좋아요 버튼
하트 Lottie로 좋아요 토글:
- 탭하면 0→1 또는 1→0 재생
- 현재 상태에 따른 시작 프레임
- 햅틱 피드백 추가

### 문제 2: 알림 벨
새 알림 있을 때 흔들리는 벨:
- 알림 개수에 따른 속도 변화
- 숫자 뱃지와 동기화
- 탭하면 정지

### 문제 3: 로딩 상태 표시
다단계 로딩 표시기:
- 로딩 → 처리 중 → 완료 단계
- 각 단계별 다른 Lottie
- 에러 상태 처리

## 📚 이 장에서 배운 내용

1. **Lottie 기초**: 설치, 기본 사용법, 제어 메서드
2. **구간 재생**: 프레임 단위 제어, 속도 조절
3. **Reanimated 연동**: progress prop, 스크롤/제스처 연동
4. **동적 속성**: colorFilters, textFilters
5. **실전 컴포넌트**: 로딩 버튼, Pull-to-Refresh

**다음 장 예고**: **Chapter 38: 복잡한 패스 애니메이션**에서는 SVG 경로를 따라 이동하는 애니메이션, 모프 효과, 경로 기반 모션을 다룹니다.
