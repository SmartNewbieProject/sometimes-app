# Chapter 51: 입력 필드 인터랙션

폼은 앱의 핵심 상호작용 영역입니다. 플로팅 레이블, 포커스 효과, 문자 수 카운터 등 입력 경험을 풍부하게 만드는 마이크로 인터랙션을 구현합니다.

## 📌 학습 목표

- 플로팅 레이블 애니메이션 구현
- 포커스/블러 테두리 효과
- 문자 수 카운터와 진행률 표시
- 검색 입력 필드 애니메이션
- 비밀번호 강도 표시기
- 자동완성 및 태그 입력

## 📖 입력 필드 UX 원칙

```
입력 필드 상태 전환
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

기본 상태 (Idle)
╭─────────────────────────────────╮
│  플레이스홀더 텍스트            │
╰─────────────────────────────────╯

포커스 상태 (Focus)
╭─────────────────────────────────╮
│ 레이블 ←── 플로팅 레이블        │
│ ▌                               │ ←── 커서
╰─────────────────────────────────╯
      ↑
  테두리 강조

입력 중 (Typing)
╭─────────────────────────────────╮
│ 레이블                          │
│ 입력된 텍스트▌     (12/100)     │
╰─────────────────────────────────╯
                     ↑
              문자 수 카운터

완료 상태 (Filled)
╭─────────────────────────────────╮
│ 레이블                    ✓     │
│ 입력된 텍스트                   │
╰─────────────────────────────────╯
                            ↑
                      유효성 표시

에러 상태 (Error)
╭─────────────────────────────────╮
│ 레이블                    ✕     │
│ 잘못된 입력                     │
╰─────────────────────────────────╯
  에러 메시지 표시
```

## 💻 플로팅 레이블 입력 필드

### 기본 플로팅 레이블

```typescript
import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export function FloatingLabelInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const focusProgress = useSharedValue(0);
  const hasValue = value.length > 0;

  React.useEffect(() => {
    const shouldFloat = isFocused || hasValue;
    focusProgress.value = withTiming(shouldFloat ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });
  }, [isFocused, hasValue]);

  const labelStyle = useAnimatedStyle(() => {
    const translateY = interpolate(focusProgress.value, [0, 1], [16, -8]);
    const scale = interpolate(focusProgress.value, [0, 1], [1, 0.8]);
    const color = interpolateColor(
      focusProgress.value,
      [0, 1],
      ['#888888', error ? '#F44336' : '#7A4AE2']
    );

    return {
      transform: [
        { translateY },
        { scale },
      ],
      color,
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusProgress.value,
      [0, 1],
      ['#E0E0E0', error ? '#F44336' : '#7A4AE2']
    );
    const borderWidth = interpolate(focusProgress.value, [0, 1], [1, 2]);

    return {
      borderColor,
      borderWidth,
    };
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, containerStyle]}>
        {/* 플로팅 레이블 */}
        <Animated.Text style={[styles.label, labelStyle]}>
          {label}
        </Animated.Text>

        {/* 입력 필드 */}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ''}
          placeholderTextColor="#BBBBBB"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
      </Animated.View>

      {/* 에러 메시지 */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  container: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  label: {
    position: 'absolute',
    left: 16,
    top: 0,
    fontSize: 16,
    backgroundColor: 'white',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  input: {
    fontSize: 16,
    color: '#333333',
    paddingVertical: 8,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
});
```

### 밑줄 스타일 입력 필드

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';

export function UnderlineInput({
  label,
  value,
  onChangeText,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const focusProgress = useSharedValue(0);
  const lineScale = useSharedValue(0);

  React.useEffect(() => {
    const shouldFloat = isFocused || value.length > 0;
    focusProgress.value = withTiming(shouldFloat ? 1 : 0, { duration: 200 });
    lineScale.value = withSpring(isFocused ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isFocused, value]);

  const labelStyle = useAnimatedStyle(() => {
    const translateY = interpolate(focusProgress.value, [0, 1], [0, -24]);
    const scale = interpolate(focusProgress.value, [0, 1], [1, 0.8]);

    return {
      transform: [
        { translateY },
        { scale },
        { translateX: interpolate(focusProgress.value, [0, 1], [0, -8]) },
      ],
      color: isFocused ? '#7A4AE2' : '#888888',
    };
  });

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: lineScale.value }],
    backgroundColor: error ? '#F44336' : '#7A4AE2',
  }));

  return (
    <View style={underlineStyles.container}>
      <Animated.Text style={[underlineStyles.label, labelStyle]}>
        {label}
      </Animated.Text>

      <TextInput
        style={underlineStyles.input}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {/* 베이스 라인 */}
      <View style={underlineStyles.baseLine} />

      {/* 포커스 라인 (중앙에서 확장) */}
      <Animated.View style={[underlineStyles.focusLine, lineStyle]} />

      {error && <Text style={underlineStyles.error}>{error}</Text>}
    </View>
  );
}

const underlineStyles = StyleSheet.create({
  container: {
    marginBottom: 24,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: 0,
    top: 16,
    fontSize: 16,
    transformOrigin: 'left',
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
    paddingTop: 24,
    color: '#333333',
  },
  baseLine: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  focusLine: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    right: '50%',
    height: 2,
    marginLeft: '-50%',
    width: '100%',
  },
  error: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
});
```

## 💻 문자 수 카운터

### 원형 진행률 카운터

```typescript
import React from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CharacterCountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  maxLength: number;
  label?: string;
  multiline?: boolean;
}

export function CharacterCountInput({
  value,
  onChangeText,
  maxLength,
  label,
  multiline = false,
}: CharacterCountInputProps) {
  const progress = useSharedValue(0);
  const charCount = value.length;
  const remaining = maxLength - charCount;

  React.useEffect(() => {
    progress.value = withTiming(charCount / maxLength, { duration: 200 });
  }, [charCount, maxLength]);

  const isNearLimit = remaining <= maxLength * 0.1;
  const isOverLimit = remaining < 0;

  return (
    <View style={counterStyles.container}>
      {label && <Text style={counterStyles.label}>{label}</Text>}

      <View style={counterStyles.inputWrapper}>
        <TextInput
          style={[
            counterStyles.input,
            multiline && counterStyles.multilineInput,
          ]}
          value={value}
          onChangeText={(text) => {
            if (text.length <= maxLength) {
              onChangeText(text);
            }
          }}
          multiline={multiline}
          maxLength={maxLength}
        />

        <CircularCounter
          current={charCount}
          max={maxLength}
          progress={progress}
          isNearLimit={isNearLimit}
          isOverLimit={isOverLimit}
        />
      </View>
    </View>
  );
}

function CircularCounter({
  current,
  max,
  progress,
  isNearLimit,
  isOverLimit,
}: {
  current: number;
  max: number;
  progress: Animated.SharedValue<number>;
  isNearLimit: boolean;
  isOverLimit: boolean;
}) {
  const size = 32;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress.value);
    const strokeColor = interpolateColor(
      progress.value,
      [0, 0.7, 0.9, 1],
      ['#7A4AE2', '#7A4AE2', '#FFA726', '#F44336']
    );

    return {
      strokeDashoffset,
      stroke: strokeColor,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      progress.value,
      [0, 0.7, 0.9, 1],
      ['#666666', '#666666', '#FFA726', '#F44336']
    );

    return { color };
  });

  return (
    <View style={counterStyles.counterContainer}>
      <Svg width={size} height={size}>
        {/* 배경 원 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E0E0E0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* 프로그레스 원 */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <Animated.Text style={[counterStyles.counterText, textStyle]}>
        {max - current}
      </Animated.Text>
    </View>
  );
}

const counterStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  counterContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '600',
  },
});
```

### 선형 진행률 바 카운터

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';

export function LinearCounterInput({
  value,
  onChangeText,
  maxLength,
  label,
}: CharacterCountInputProps) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withSpring(value.length / maxLength, {
      damping: 15,
      stiffness: 150,
    });
  }, [value.length, maxLength]);

  const progressStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 0.7, 0.9, 1],
      ['#7A4AE2', '#7A4AE2', '#FFA726', '#F44336']
    );

    return {
      width: `${progress.value * 100}%`,
      backgroundColor,
    };
  });

  return (
    <View style={linearStyles.container}>
      {label && <Text style={linearStyles.label}>{label}</Text>}

      <TextInput
        style={linearStyles.input}
        value={value}
        onChangeText={(text) => {
          if (text.length <= maxLength) {
            onChangeText(text);
          }
        }}
        maxLength={maxLength}
      />

      {/* 프로그레스 바 */}
      <View style={linearStyles.progressTrack}>
        <Animated.View style={[linearStyles.progressFill, progressStyle]} />
      </View>

      {/* 카운터 텍스트 */}
      <Text style={linearStyles.counterText}>
        {value.length} / {maxLength}
      </Text>
    </View>
  );
}

const linearStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  counterText: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'right',
    marginTop: 4,
  },
});
```

## 💻 비밀번호 강도 표시

```typescript
import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  showStrength?: boolean;
}

type StrengthLevel = 0 | 1 | 2 | 3 | 4;

interface PasswordStrength {
  level: StrengthLevel;
  label: string;
  color: string;
}

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  const levels: PasswordStrength[] = [
    { level: 0, label: '', color: '#E0E0E0' },
    { level: 1, label: '약함', color: '#F44336' },
    { level: 2, label: '보통', color: '#FFA726' },
    { level: 3, label: '강함', color: '#66BB6A' },
    { level: 4, label: '매우 강함', color: '#43A047' },
  ];

  const level = Math.min(score, 4) as StrengthLevel;
  return levels[level];
}

export function PasswordInput({
  value,
  onChangeText,
  showStrength = true,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const strength = useMemo(() => getPasswordStrength(value), [value]);

  return (
    <View style={passwordStyles.container}>
      <View style={passwordStyles.inputWrapper}>
        <TextInput
          style={passwordStyles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={!showPassword}
          placeholder="비밀번호"
          placeholderTextColor="#BBBBBB"
        />

        <Pressable
          style={passwordStyles.toggleButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={passwordStyles.toggleIcon}>
            {showPassword ? '🙈' : '👁️'}
          </Text>
        </Pressable>
      </View>

      {showStrength && value.length > 0 && (
        <PasswordStrengthIndicator strength={strength} />
      )}
    </View>
  );
}

function PasswordStrengthIndicator({ strength }: { strength: PasswordStrength }) {
  const barCount = 4;

  return (
    <View style={passwordStyles.strengthContainer}>
      <View style={passwordStyles.strengthBars}>
        {Array.from({ length: barCount }).map((_, index) => (
          <StrengthBar
            key={index}
            isActive={index < strength.level}
            color={strength.color}
            delay={index * 50}
          />
        ))}
      </View>

      <AnimatedStrengthLabel label={strength.label} color={strength.color} />
    </View>
  );
}

function StrengthBar({
  isActive,
  color,
  delay,
}: {
  isActive: boolean;
  color: string;
  delay: number;
}) {
  const scale = useSharedValue(0);
  const backgroundColor = useSharedValue('#E0E0E0');

  React.useEffect(() => {
    if (isActive) {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    } else {
      scale.value = withTiming(0, { duration: 150 });
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: isActive ? scale.value : 1 }],
    backgroundColor: isActive ? color : '#E0E0E0',
  }));

  return <Animated.View style={[passwordStyles.strengthBar, animatedStyle]} />;
}

function AnimatedStrengthLabel({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(10);

  React.useEffect(() => {
    if (label) {
      opacity.value = withTiming(1, { duration: 200 });
      translateX.value = withSpring(0, { damping: 15 });
    }
  }, [label]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.Text style={[passwordStyles.strengthLabel, { color }, animatedStyle]}>
      {label}
    </Animated.Text>
  );
}

const passwordStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  toggleButton: {
    padding: 8,
  },
  toggleIcon: {
    fontSize: 20,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'right',
  },
});
```

## 💻 검색 입력 필드

### 확장형 검색 바

```typescript
import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';

interface ExpandableSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function ExpandableSearchBar({
  value,
  onChangeText,
  onSearch,
  placeholder = '검색어를 입력하세요',
}: ExpandableSearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandProgress = useSharedValue(0);
  const inputRef = React.useRef<TextInput>(null);

  const expand = () => {
    setIsExpanded(true);
    expandProgress.value = withSpring(1, { damping: 15, stiffness: 150 });
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const collapse = () => {
    if (value.length === 0) {
      setIsExpanded(false);
      expandProgress.value = withTiming(0, { duration: 200 });
      inputRef.current?.blur();
    }
  };

  const handleSubmit = () => {
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  const containerStyle = useAnimatedStyle(() => {
    const width = interpolate(expandProgress.value, [0, 1], [48, 300]);

    return {
      width,
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    const rotate = interpolate(expandProgress.value, [0, 1], [0, 90]);
    const opacity = interpolate(expandProgress.value, [0, 0.5], [1, 0.5]);

    return {
      transform: [{ rotate: `${rotate}deg` }],
      opacity,
    };
  });

  const inputStyle = useAnimatedStyle(() => ({
    opacity: expandProgress.value,
    transform: [
      { translateX: interpolate(expandProgress.value, [0, 1], [20, 0]) },
    ],
  }));

  return (
    <Animated.View style={[searchStyles.container, containerStyle]}>
      <Pressable onPress={expand} style={searchStyles.iconButton}>
        <Animated.Text style={[searchStyles.searchIcon, iconStyle]}>
          🔍
        </Animated.Text>
      </Pressable>

      <Animated.View style={[searchStyles.inputWrapper, inputStyle]}>
        <TextInput
          ref={inputRef}
          style={searchStyles.input}
          value={value}
          onChangeText={onChangeText}
          onBlur={collapse}
          onSubmitEditing={handleSubmit}
          placeholder={placeholder}
          placeholderTextColor="#AAAAAA"
          returnKeyType="search"
        />

        {value.length > 0 && (
          <Pressable
            onPress={() => onChangeText('')}
            style={searchStyles.clearButton}
          >
            <Text style={searchStyles.clearIcon}>✕</Text>
          </Pressable>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const searchStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    height: 48,
    overflow: 'hidden',
  },
  iconButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 20,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DDDDDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIcon: {
    fontSize: 12,
    color: '#666666',
  },
});
```

### 실시간 검색 결과

```typescript
import Animated, {
  useAnimatedStyle,
  withTiming,
  withDelay,
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated';

interface SearchResultsProps {
  results: string[];
  isLoading: boolean;
  onSelect: (result: string) => void;
}

export function SearchResults({
  results,
  isLoading,
  onSelect,
}: SearchResultsProps) {
  return (
    <Animated.View
      layout={Layout.springify()}
      style={resultsStyles.container}
    >
      {isLoading ? (
        <SearchResultSkeleton />
      ) : results.length > 0 ? (
        results.map((result, index) => (
          <SearchResultItem
            key={result}
            result={result}
            index={index}
            onPress={() => onSelect(result)}
          />
        ))
      ) : (
        <Animated.Text
          entering={FadeIn.delay(200)}
          style={resultsStyles.emptyText}
        >
          검색 결과가 없습니다
        </Animated.Text>
      )}
    </Animated.View>
  );
}

function SearchResultItem({
  result,
  index,
  onPress,
}: {
  result: string;
  index: number;
  onPress: () => void;
}) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(20);

  React.useEffect(() => {
    opacity.value = withDelay(index * 50, withTiming(1, { duration: 200 }));
    translateX.value = withDelay(
      index * 50,
      withTiming(0, { duration: 200 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[resultsStyles.resultItem, animatedStyle]}>
        <Text style={resultsStyles.resultIcon}>🔍</Text>
        <Text style={resultsStyles.resultText}>{result}</Text>
      </Animated.View>
    </Pressable>
  );
}

function SearchResultSkeleton() {
  return (
    <View style={resultsStyles.skeletonContainer}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={resultsStyles.skeletonItem}>
          <View style={resultsStyles.skeletonIcon} />
          <View style={resultsStyles.skeletonText} />
        </View>
      ))}
    </View>
  );
}

const resultsStyles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  resultText: {
    fontSize: 14,
    color: '#333333',
  },
  emptyText: {
    padding: 24,
    textAlign: 'center',
    color: '#888888',
  },
  skeletonContainer: {
    padding: 8,
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  skeletonText: {
    flex: 1,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
});
```

## 📱 sometimes-app 적용 사례

### 프로필 소개 입력

```typescript
// src/features/profile-edit/ui/BioInput.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const MAX_BIO_LENGTH = 150;

interface BioInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function BioInput({ value, onChangeText }: BioInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const focusProgress = useSharedValue(0);
  const charProgress = useSharedValue(0);

  React.useEffect(() => {
    focusProgress.value = withSpring(isFocused ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isFocused]);

  React.useEffect(() => {
    charProgress.value = withSpring(value.length / MAX_BIO_LENGTH, {
      damping: 20,
      stiffness: 200,
    });
  }, [value.length]);

  const containerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusProgress.value,
      [0, 1],
      ['#E0E0E0', '#7A4AE2']
    );

    return {
      borderColor,
      borderWidth: interpolate(focusProgress.value, [0, 1], [1, 2]),
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      focusProgress.value,
      [0, 1],
      ['#888888', '#7A4AE2']
    );

    return { color };
  });

  // 원형 프로그레스
  const size = 40;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const circleProps = useAnimatedProps(() => {
    const strokeColor = interpolateColor(
      charProgress.value,
      [0, 0.7, 0.9, 1],
      ['#7A4AE2', '#7A4AE2', '#FFA726', '#F44336']
    );

    return {
      strokeDashoffset: circumference * (1 - charProgress.value),
      stroke: strokeColor,
    };
  });

  const counterStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      charProgress.value,
      [0, 0.7, 0.9, 1],
      ['#666666', '#666666', '#FFA726', '#F44336']
    );

    return { color };
  });

  return (
    <View style={bioStyles.container}>
      <View style={bioStyles.header}>
        <Animated.Text style={[bioStyles.label, labelStyle]}>
          자기소개
        </Animated.Text>

        {/* 원형 카운터 */}
        <View style={bioStyles.counterContainer}>
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#E8E8E8"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              animatedProps={circleProps}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>
          <Animated.Text style={[bioStyles.counterText, counterStyle]}>
            {MAX_BIO_LENGTH - value.length}
          </Animated.Text>
        </View>
      </View>

      <Animated.View style={[bioStyles.inputContainer, containerStyle]}>
        <TextInput
          style={bioStyles.input}
          value={value}
          onChangeText={(text) => {
            if (text.length <= MAX_BIO_LENGTH) {
              onChangeText(text);
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline
          placeholder="나를 소개해보세요!"
          placeholderTextColor="#BBBBBB"
          maxLength={MAX_BIO_LENGTH}
        />
      </Animated.View>

      {/* 힌트 텍스트 */}
      <Text style={bioStyles.hint}>
        매력적인 소개글은 매칭 확률을 높여요 ✨
      </Text>
    </View>
  );
}

const bioStyles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  counterContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '600',
  },
  inputContainer: {
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  input: {
    padding: 16,
    fontSize: 15,
    color: '#333333',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#888888',
    marginTop: 8,
    marginLeft: 4,
  },
});
```

## ⚠️ 흔한 실수와 해결법

### 1. 레이블이 입력값과 겹침

```typescript
// ❌ 잘못된 예: 값이 있을 때도 레이블이 안 올라감
React.useEffect(() => {
  focusProgress.value = withTiming(isFocused ? 1 : 0);
}, [isFocused]);

// ✅ 올바른 예: 포커스 OR 값이 있을 때 레이블 올림
React.useEffect(() => {
  const shouldFloat = isFocused || value.length > 0;
  focusProgress.value = withTiming(shouldFloat ? 1 : 0);
}, [isFocused, value]);
```

### 2. 키보드가 입력필드를 가림

```typescript
// ❌ 잘못된 예: 키보드 무시
<View>
  <FloatingLabelInput />
</View>

// ✅ 올바른 예: KeyboardAvoidingView 사용
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  <FloatingLabelInput />
</KeyboardAvoidingView>
```

### 3. 성능 문제 (매 타이핑마다 리렌더)

```typescript
// ❌ 잘못된 예: 상위 컴포넌트에서 상태 관리
function Form() {
  const [bio, setBio] = useState('');
  return <BioInput value={bio} onChangeText={setBio} />; // 매 타이핑마다 Form 리렌더
}

// ✅ 올바른 예: 입력 컴포넌트 내부에서 debounce
function BioInput({ initialValue, onSave }) {
  const [localValue, setLocalValue] = useState(initialValue);

  // debounce로 저장
  const debouncedSave = useDebounce(onSave, 500);

  const handleChange = (text) => {
    setLocalValue(text);
    debouncedSave(text);
  };

  return <TextInput value={localValue} onChangeText={handleChange} />;
}
```

## 💡 성능 최적화 팁

### 1. 입력 필드 메모이제이션

```typescript
export const MemoizedFloatingInput = React.memo(
  FloatingLabelInput,
  (prev, next) => {
    return prev.value === next.value && prev.error === next.error;
  }
);
```

### 2. 애니메이션 값 공유

```typescript
// 여러 입력 필드가 같은 포커스 스타일을 공유
const FocusContext = React.createContext<{
  registerFocus: () => void;
  unregisterFocus: () => void;
} | null>(null);

function FormGroup({ children }) {
  const focusCount = useSharedValue(0);

  // 그룹 전체의 포커스 상태 관리
  // ...

  return (
    <FocusContext.Provider value={{ registerFocus, unregisterFocus }}>
      {children}
    </FocusContext.Provider>
  );
}
```

## 🏋️ 연습 문제

### 문제 1: OTP 입력 필드
6자리 OTP를 입력받는 필드를 구현하세요. 각 칸이 개별적으로 포커스되고, 입력 시 자동으로 다음 칸으로 이동합니다.

### 문제 2: 태그 입력 필드
여러 태그를 입력받는 필드를 구현하세요. 입력 후 엔터를 누르면 태그로 변환되고, 태그를 클릭하면 삭제됩니다.

### 문제 3: 자동완성 입력
타이핑 시 추천 텍스트가 반투명하게 표시되고, Tab 키로 완성하는 입력 필드를 구현하세요.

## 📚 이 장에서 배운 내용

1. **플로팅 레이블**: 포커스 시 위로 이동하는 레이블
2. **밑줄 스타일**: Material Design 스타일 입력 필드
3. **문자 수 카운터**: 원형/선형 진행률 표시
4. **비밀번호 강도**: 조건별 강도 평가와 시각화
5. **검색 바**: 확장형 검색 UI와 결과 표시
6. **성능 최적화**: 메모이제이션, debounce

## 다음 장 예고

**Chapter 52: 토글과 스위치 애니메이션**에서는 온/오프 상태를 전환하는 다양한 UI 컴포넌트를 만듭니다. iOS 스타일 스위치, 체크박스, 라디오 버튼 등의 인터랙션을 구현합니다.
