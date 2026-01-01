# Chapter 2: 개발 환경 설정

## 📌 개요

이 챕터에서 배울 내용:
- Expo 프로젝트에서 Reanimated 설정
- Bare React Native 프로젝트에서 Reanimated 설정
- Babel 플러그인 구성
- 개발 도구 설정 및 디버깅 환경

**선수 지식**: React Native 프로젝트 생성 및 기본 구조 이해
**예상 학습 시간**: 20분

---

## 📖 개념 이해

### Reanimated 설치의 특수성

Reanimated는 일반적인 JavaScript 라이브러리와 다릅니다. **네이티브 코드를 포함**하고 있어서 추가 설정이 필요합니다:

```
┌─────────────────────────────────────────────────────────────┐
│                   Reanimated 패키지 구성                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   JavaScript Layer                                           │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  • useSharedValue, useAnimatedStyle 등              │   │
│   │  • 훅과 유틸리티 함수                                │   │
│   └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│   Babel Plugin                                               │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  • 워크릿 코드 변환                                  │   │
│   │  • 'worklet' 지시어 처리                             │   │
│   └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│   Native Modules (iOS / Android)                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  • UI 스레드 워크릿 런타임                           │   │
│   │  • Shared Value 동기화                               │   │
│   │  • 네이티브 애니메이션 드라이버                      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Babel 플러그인의 역할

Reanimated의 Babel 플러그인은 **빌드 타임에 코드를 변환**합니다:

```typescript
// 작성한 코드
const animatedStyle = useAnimatedStyle(() => {
  return {
    opacity: opacity.value,
  };
});

// ↓ Babel 플러그인이 변환한 코드 (개념적)
const animatedStyle = useAnimatedStyle(__worklet_factory({
  code: 'return { opacity: opacity.value }',
  location: 'MyComponent.tsx:15',
  // ... 워크릿 메타데이터
}));
```

이 변환 덕분에 일반 JavaScript처럼 작성해도 **UI 스레드에서 실행 가능한 코드**가 됩니다.

---

## 💻 코드 예제

### Expo 프로젝트 설정 (권장)

Expo SDK 49 이상을 사용한다면 설정이 매우 간단합니다:

```bash
# 1. 패키지 설치
npx expo install react-native-reanimated

# 2. Babel 설정 (자동으로 추가되지만, 확인 필요)
```

`babel.config.js` 확인:

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ⚠️ 반드시 마지막에 위치해야 함!
      'react-native-reanimated/plugin',
    ],
  };
};
```

> ⚠️ **중요**: `react-native-reanimated/plugin`은 반드시 plugins 배열의 **마지막**에 위치해야 합니다.

```bash
# 3. 캐시 클리어 후 재시작
npx expo start -c
```

### Bare React Native 프로젝트 설정

Expo 없이 순수 React Native를 사용하는 경우:

```bash
# 1. 패키지 설치
npm install react-native-reanimated
# 또는
yarn add react-native-reanimated
```

#### iOS 추가 설정

```bash
# Podfile 업데이트 후 설치
cd ios && pod install && cd ..
```

`ios/Podfile`에서 Hermes 사용 확인:

```ruby
# Podfile
:hermes_enabled => true,
```

#### Android 추가 설정

`android/app/build.gradle`:

```gradle
// build.gradle (app level)
project.ext.react = [
    enableHermes: true  // Hermes 엔진 활성화
]
```

`android/app/src/main/java/.../MainApplication.java` (또는 `.kt`):

```java
// Java
import com.facebook.react.bridge.JSIModulePackage;
import com.swmansion.reanimated.ReanimatedJSIModulePackage;

@Override
protected JSIModulePackage getJSIModulePackage() {
  return new ReanimatedJSIModulePackage();
}
```

```kotlin
// Kotlin
import com.facebook.react.bridge.JSIModulePackage
import com.swmansion.reanimated.ReanimatedJSIModulePackage

override fun getJSIModulePackage(): JSIModulePackage {
  return ReanimatedJSIModulePackage()
}
```

#### Babel 설정 (공통)

```javascript
// babel.config.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // 다른 플러그인들...
    'react-native-reanimated/plugin', // 반드시 마지막!
  ],
};
```

### 설치 확인 테스트

설치가 올바르게 되었는지 확인하는 간단한 테스트 컴포넌트:

```typescript
// ReanimatedTest.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const ReanimatedTest = () => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(scale.value === 1 ? 1.2 : 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reanimated 설치 테스트</Text>
      <Pressable onPress={handlePress}>
        <Animated.View style={[styles.box, animatedStyle]}>
          <Text style={styles.boxText}>눌러보세요!</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
  box: {
    width: 150,
    height: 150,
    backgroundColor: '#7A4AE2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReanimatedTest;
```

박스를 누르면 **스프링 애니메이션으로 커졌다 작아지면** 설치 성공입니다! 🎉

---

## 📊 비교

### 환경별 설치 복잡도

| 환경 | 복잡도 | 추가 설정 | 권장도 |
|------|--------|----------|--------|
| Expo Managed | ⭐ 매우 쉬움 | Babel 설정만 | ⭐⭐⭐ 강력 권장 |
| Expo Bare | ⭐⭐ 쉬움 | + Pod 설치 | ⭐⭐ 권장 |
| Bare RN (Hermes) | ⭐⭐⭐ 보통 | + 네이티브 설정 | ⭐ 필요시 |
| Bare RN (JSC) | ⭐⭐⭐⭐ 복잡 | + 추가 폴리필 | 비권장 |

### Hermes vs JSC (JavaScript Core)

| 항목 | Hermes | JSC |
|------|--------|-----|
| Reanimated 호환성 | 완벽 | 제한적 |
| 성능 | 더 빠름 | 보통 |
| 번들 크기 | 더 작음 | 더 큼 |
| 디버깅 | Flipper 통합 | 제한적 |
| **권장** | ✅ 권장 | ❌ 비권장 |

> 💡 **Tip**: React Native 0.70 이상에서는 Hermes가 기본값입니다. 가능하면 Hermes를 사용하세요.

---

## ⚠️ 흔한 실수

### ❌ 실수 1: Babel 플러그인 순서 오류

```javascript
// ❌ 잘못된 순서 - reanimated가 먼저 옴
module.exports = {
  plugins: [
    'react-native-reanimated/plugin', // 먼저 있으면 안 됨!
    '@babel/plugin-transform-flow-strip-types',
    // ...
  ],
};
```

### ✅ 올바른 순서

```javascript
// ✅ reanimated는 항상 마지막
module.exports = {
  plugins: [
    '@babel/plugin-transform-flow-strip-types',
    // 다른 플러그인들...
    'react-native-reanimated/plugin', // 반드시 마지막!
  ],
};
```

**왜 마지막이어야 할까?**

Reanimated 플러그인은 다른 플러그인들이 코드를 변환한 **최종 결과물**을 받아서 워크릿으로 변환합니다. 순서가 바뀌면 변환이 제대로 되지 않습니다.

### ❌ 실수 2: 캐시 클리어 누락

```bash
# ❌ 설정 변경 후 그냥 시작
npm start
# 또는
npx expo start

# 이전 캐시된 번들이 사용되어 변경사항 미반영!
```

### ✅ 올바른 방법

```bash
# ✅ 캐시 클리어 후 시작
npm start -- --reset-cache
# 또는
npx expo start -c

# Expo의 경우
npx expo start --clear
```

### ❌ 실수 3: 버전 불일치

```json
// ❌ 호환되지 않는 버전 조합
{
  "react-native": "0.71.0",
  "react-native-reanimated": "2.x.x"  // RN 0.71은 Reanimated 3.x 필요
}
```

### ✅ 올바른 버전 조합

```json
// ✅ 호환 버전 사용
{
  "react-native": "0.72.x",
  "react-native-reanimated": "^3.5.0"
}
```

**버전 호환성 표**:

| React Native | Reanimated |
|--------------|------------|
| 0.72+ | 3.5+ |
| 0.71 | 3.0 - 3.4 |
| 0.70 | 2.14+ |
| 0.69 | 2.10+ |

---

## 💡 성능 팁

### Tip 1: Hermes 엔진 필수

```javascript
// metro.config.js
// Hermes 최적화 옵션
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true, // 성능 향상
      },
    }),
  },
};
```

### Tip 2: 개발 시 유용한 로깅 설정

```typescript
// App.tsx 최상단에 추가 (개발용)
import { LogBox } from 'react-native';

// Reanimated 관련 노이즈 로그 숨기기 (선택)
LogBox.ignoreLogs([
  '[Reanimated] Reduced motion setting is enabled',
]);
```

### Tip 3: TypeScript 타입 지원

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["react-native-reanimated"],
    // Reanimated 타입 자동 완성을 위해
  }
}
```

---

## 🎯 실무 적용

### 프로젝트 템플릿 권장 구성

실제 프로젝트에서 권장하는 Reanimated 관련 설정:

```javascript
// babel.config.js (Expo 프로젝트 기준)
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 필요한 다른 플러그인들
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
          },
        },
      ],
      // Reanimated는 항상 마지막!
      'react-native-reanimated/plugin',
    ],
  };
};
```

```json
// package.json 권장 버전
{
  "dependencies": {
    "expo": "~49.0.0",
    "react-native": "0.72.x",
    "react-native-reanimated": "~3.5.0",
    "react-native-gesture-handler": "~2.12.0"
  }
}
```

### 트러블슈팅 체크리스트

설치 후 문제가 발생하면:

```
□ Babel 플러그인이 마지막에 있는가?
□ Metro 캐시를 클리어했는가?
□ (iOS) pod install을 실행했는가?
□ (Android) 앱을 완전히 재빌드했는가?
□ Hermes 엔진이 활성화되어 있는가?
□ 버전 호환성을 확인했는가?
```

---

## 🏋️ 연습 문제

### 문제 1: 설정 확인

다음 `babel.config.js`에서 문제점을 찾으세요:

```javascript
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    'react-native-reanimated/plugin',
    'module:react-native-dotenv',
    '@babel/plugin-proposal-decorators',
  ],
};
```

<details>
<summary>💡 힌트</summary>

플러그인의 순서를 확인하세요. Reanimated 플러그인의 위치가 중요합니다.

</details>

<details>
<summary>✅ 해답</summary>

`react-native-reanimated/plugin`이 **첫 번째**에 있습니다. **마지막**에 있어야 합니다.

```javascript
// ✅ 수정된 버전
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    'module:react-native-dotenv',
    '@babel/plugin-proposal-decorators',
    'react-native-reanimated/plugin', // 마지막으로 이동!
  ],
};
```

</details>

### 문제 2: 환경 선택

다음 상황에서 어떤 환경을 선택하는 것이 좋을까요?

> "새로운 소셜 앱을 만들려고 합니다. 빠른 개발이 중요하고, 복잡한 애니메이션(카드 스와이프, 바텀시트)이 필요합니다. 네이티브 모듈 커스터마이징은 필요 없을 것 같습니다."

<details>
<summary>💡 힌트</summary>

빠른 개발, Reanimated 통합, 네이티브 커스터마이징 불필요 → 어떤 환경이 좋을까요?

</details>

<details>
<summary>✅ 해답</summary>

**Expo Managed Workflow**가 최적입니다.

이유:
1. ✅ 빠른 개발: Expo는 설정이 간단하고 개발 속도가 빠릅니다
2. ✅ Reanimated 통합: `npx expo install react-native-reanimated` 한 줄로 설치
3. ✅ 복잡한 애니메이션: Reanimated 3.x + Gesture Handler 완벽 지원
4. ✅ 네이티브 커스터마이징 불필요: Bare로 eject할 필요 없음

추가로 `react-native-gesture-handler`도 함께 설치하면 카드 스와이프와 바텀시트 구현이 쉬워집니다.

</details>

---

## 📚 요약

이 챕터에서 배운 핵심 내용:

- **Expo 프로젝트**에서는 `npx expo install react-native-reanimated`로 간단히 설치
- **Babel 플러그인**은 반드시 plugins 배열의 **마지막**에 위치
- 설정 변경 후에는 **캐시 클리어** 필수 (`--reset-cache` 또는 `-c`)
- **Hermes 엔진** 사용 권장 (React Native 0.70+ 기본값)
- **버전 호환성** 확인이 중요 (RN 버전에 맞는 Reanimated 버전 사용)

**다음 챕터**: Shared Values 완벽 이해 - Reanimated의 핵심 개념인 Shared Value를 깊이 있게 다룹니다.
