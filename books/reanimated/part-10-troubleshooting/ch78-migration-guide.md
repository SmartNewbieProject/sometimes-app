# Chapter 78: 마이그레이션 가이드

Reanimated는 지속적으로 발전하는 라이브러리입니다. 이 장에서는 버전 업그레이드 시 발생하는 변경사항에 대응하고, 기존 코드를 안전하게 마이그레이션하는 방법을 배웁니다.

## 📌 학습 목표

- Reanimated 버전별 주요 변경사항 이해
- 안전한 마이그레이션 전략 수립
- 호환성 레이어 구현
- 자동화된 코드 변환 도구 활용

## 📖 버전 히스토리 개요

```
┌─────────────────────────────────────────────────────────────┐
│                  Reanimated 버전 타임라인                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  v1.x    ────────────────────────────────────────────       │
│  │ Animated.Value 기반                                      │
│  │ 선언적 API                                               │
│  └── 2019-2020                                              │
│                                                             │
│  v2.x    ────────────────────────────────────────────       │
│  │ SharedValue 도입                                          │
│  │ Worklet 시스템                                            │
│  │ useAnimatedStyle                                         │
│  └── 2020-2023                                              │
│                                                             │
│  v3.x    ────────────────────────────────────────────       │
│  │ 새로운 아키텍처 지원                                       │
│  │ Gesture Handler 2 통합                                   │
│  │ Layout Animations 개선                                   │
│  └── 2023-2024                                              │
│                                                             │
│  v4.x    ────────────────────────────────────────────       │
│  │ React Native 0.76+ 필수                                  │
│  │ 신규 아키텍처 기본값                                       │
│  │ CSS Animations 지원                                      │
│  └── 2024-현재                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 💻 코드 예제 1: v2에서 v3로 마이그레이션

```typescript
// ============================================
// 1. useAnimatedGestureHandler 제거
// ============================================

// ❌ v2 방식 (deprecated)
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useAnimatedGestureHandler } from 'react-native-reanimated';

function OldGestureComponent() {
  const translateX = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
    },
    onEnd: () => {
      translateX.value = withSpring(0);
    },
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
      }))} />
    </PanGestureHandler>
  );
}

// ✅ v3 방식 (Gesture Handler 2)
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

function NewGestureComponent() {
  const translateX = useSharedValue(0);
  const context = useSharedValue({ startX: 0 });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value.startX = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = context.value.startX + event.translationX;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
    });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
      }))} />
    </GestureDetector>
  );
}

// ============================================
// 2. withRepeat 시그니처 변경
// ============================================

// ❌ v2 방식
rotation.value = withRepeat(
  withTiming(360, { duration: 1000 }),
  -1,  // 무한 반복
  false // 역방향 없음
);

// ✅ v3 방식 (동일하지만 타입 개선)
rotation.value = withRepeat(
  withTiming(360, { duration: 1000 }),
  -1,
  false,
  (finished, current) => {
    // 새로운 콜백 시그니처
    if (finished) {
      console.log('Repeat completed at:', current);
    }
  }
);

// ============================================
// 3. Entering/Exiting 애니메이션 개선
// ============================================

// ❌ v2 방식
import { FadeIn, FadeOut } from 'react-native-reanimated';

<Animated.View entering={FadeIn} exiting={FadeOut}>
  {content}
</Animated.View>

// ✅ v3 방식 (더 세밀한 제어)
import {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';

<Animated.View
  entering={FadeIn.duration(300).springify().damping(15)}
  exiting={FadeOut.duration(200)}
  layout={LinearTransition.springify()}
>
  {content}
</Animated.View>
```

## 💻 코드 예제 2: v3에서 v4로 마이그레이션

```typescript
// ============================================
// 1. 신규 아키텍처 필수화
// ============================================

// babel.config.js 변경 불필요 (자동 적용)
// 단, React Native 0.76+ 필수

// package.json
{
  "dependencies": {
    "react-native": "^0.76.0",
    "react-native-reanimated": "^4.0.0"
  }
}

// ============================================
// 2. useSharedValue 초기화 개선
// ============================================

// ❌ v3 이전 - 초기값 제한
const value = useSharedValue<ComplexType | null>(null);

// ✅ v4 - 함수 초기화 지원
const value = useSharedValue(() => {
  // 복잡한 초기화 로직
  return computeInitialValue();
});

// ============================================
// 3. CSS Animations 지원
// ============================================

// v4 신규 기능
import { useAnimatedStyle, Easing } from 'react-native-reanimated';

function CSSAnimationExample() {
  const animatedStyle = useAnimatedStyle(() => ({
    // CSS keyframe 스타일 애니메이션
    animation: 'pulse 2s ease-in-out infinite',
  }));

  return <Animated.View style={animatedStyle} />;
}

// 커스텀 keyframes 정의
import { createAnimatedKeyframes } from 'react-native-reanimated';

const pulseKeyframes = createAnimatedKeyframes({
  '0%': { transform: [{ scale: 1 }], opacity: 1 },
  '50%': { transform: [{ scale: 1.1 }], opacity: 0.8 },
  '100%': { transform: [{ scale: 1 }], opacity: 1 },
});

// ============================================
// 4. 향상된 제스처 통합
// ============================================

// v4에서 Gesture Handler와 더 긴밀한 통합
import { Gesture } from 'react-native-gesture-handler';
import { useAnimatedStyle, withSpring } from 'react-native-reanimated';

function EnhancedGesture() {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // 복합 제스처가 더 자연스럽게 동작
  const composed = Gesture.Simultaneous(
    Gesture.Pinch()
      .onUpdate((e) => {
        scale.value = e.scale;
      })
      .onEnd(() => {
        scale.value = withSpring(1);
      }),
    Gesture.Rotation()
      .onUpdate((e) => {
        rotation.value = e.rotation;
      })
      .onEnd(() => {
        rotation.value = withSpring(0);
      })
  );

  // useAnimatedStyle이 자동으로 최적화됨
  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={style} />
    </GestureDetector>
  );
}
```

## 💻 코드 예제 3: 호환성 레이어 구현

```typescript
// src/shared/libs/reanimated-compat.ts

import { Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { version as rnVersion } from 'react-native/package.json';

// 버전 감지
const REANIMATED_VERSION = require('react-native-reanimated/package.json').version;
const isV3OrAbove = parseInt(REANIMATED_VERSION.split('.')[0]) >= 3;
const isV4OrAbove = parseInt(REANIMATED_VERSION.split('.')[0]) >= 4;

// ============================================
// 제스처 핸들러 호환성 래퍼
// ============================================

interface GestureContext {
  [key: string]: any;
}

interface LegacyGestureHandlers<T extends GestureContext = GestureContext> {
  onStart?: (event: any, context: T) => void;
  onActive?: (event: any, context: T) => void;
  onEnd?: (event: any, context: T) => void;
  onFail?: (event: any, context: T) => void;
  onCancel?: (event: any, context: T) => void;
}

export function createPanGesture<T extends GestureContext>(
  handlers: LegacyGestureHandlers<T>,
  initialContext?: T
) {
  const context = useSharedValue<T>(initialContext || ({} as T));

  const gesture = Gesture.Pan()
    .onStart((event) => {
      if (handlers.onStart) {
        handlers.onStart(event, context.value);
      }
    })
    .onUpdate((event) => {
      if (handlers.onActive) {
        handlers.onActive(event, context.value);
      }
    })
    .onEnd((event) => {
      if (handlers.onEnd) {
        handlers.onEnd(event, context.value);
      }
    })
    .onFinalize((event, success) => {
      if (!success && handlers.onCancel) {
        handlers.onCancel(event, context.value);
      }
    });

  return { gesture, context };
}

// 레거시 스타일 API 래퍼
export function useAnimatedGestureHandlerCompat<T extends GestureContext>(
  handlers: LegacyGestureHandlers<T>,
  dependencies: any[] = []
) {
  console.warn(
    'useAnimatedGestureHandlerCompat is deprecated. ' +
    'Please migrate to Gesture.Pan() API.'
  );

  return createPanGesture(handlers);
}

// ============================================
// withRepeat 호환성
// ============================================

type RepeatCallback = (finished?: boolean, current?: number) => void;

export function withRepeatCompat(
  animation: any,
  numberOfReps: number = 1,
  reverse: boolean = false,
  callback?: RepeatCallback
) {
  if (isV4OrAbove) {
    // v4 시그니처
    return withRepeat(animation, numberOfReps, reverse, callback);
  }

  // v3 이하 호환성
  return withRepeat(
    animation,
    numberOfReps,
    reverse,
    callback ? (finished) => callback(finished, undefined) : undefined
  );
}

// ============================================
// Layout Animation 호환성
// ============================================

import {
  FadeIn,
  FadeOut,
  LinearTransition,
  LayoutAnimationConfig,
} from 'react-native-reanimated';

interface LayoutAnimationOptions {
  duration?: number;
  damping?: number;
  stiffness?: number;
  mass?: number;
}

export function createEnteringAnimation(
  type: 'fade' | 'slide' | 'zoom',
  options: LayoutAnimationOptions = {}
) {
  const { duration = 300, damping = 15, stiffness = 100 } = options;

  switch (type) {
    case 'fade':
      return FadeIn.duration(duration);

    case 'slide':
      if (isV3OrAbove) {
        return FadeIn.duration(duration)
          .springify()
          .damping(damping)
          .stiffness(stiffness);
      }
      return FadeIn.duration(duration);

    case 'zoom':
      if (isV3OrAbove) {
        return FadeIn.duration(duration)
          .springify()
          .damping(damping);
      }
      return FadeIn.duration(duration);

    default:
      return FadeIn.duration(duration);
  }
}

export function createExitingAnimation(
  type: 'fade' | 'slide' | 'zoom',
  options: LayoutAnimationOptions = {}
) {
  const { duration = 200 } = options;

  switch (type) {
    case 'fade':
    case 'slide':
    case 'zoom':
    default:
      return FadeOut.duration(duration);
  }
}

// ============================================
// useSharedValue 호환성
// ============================================

type SharedValueInitializer<T> = T | (() => T);

export function useSharedValueCompat<T>(
  initialValue: SharedValueInitializer<T>
) {
  // v4에서는 함수 초기화 지원
  if (isV4OrAbove && typeof initialValue === 'function') {
    return useSharedValue(initialValue);
  }

  // v3 이하에서는 즉시 평가
  const value = typeof initialValue === 'function'
    ? (initialValue as () => T)()
    : initialValue;

  return useSharedValue(value);
}

// ============================================
// Worklet 함수 호환성
// ============================================

// v4에서 변경된 runOnJS 동작 래핑
export function runOnJSCompat<T extends (...args: any[]) => any>(fn: T) {
  return (...args: Parameters<T>) => {
    'worklet';
    return runOnJS(fn)(...args);
  };
}

// ============================================
// 플랫폼별 호환성
// ============================================

export const AnimationConfig = {
  // 플랫폼별 기본값
  defaultSpringConfig: Platform.select({
    ios: { damping: 15, stiffness: 100, mass: 1 },
    android: { damping: 20, stiffness: 150, mass: 1 },
    default: { damping: 15, stiffness: 100, mass: 1 },
  }),

  // 버전별 기능 플래그
  features: {
    cssAnimations: isV4OrAbove,
    enhancedGestures: isV3OrAbove,
    layoutAnimations: isV3OrAbove,
    workletContext: isV4OrAbove,
  },
};

// ============================================
// 내보내기
// ============================================

export {
  isV3OrAbove,
  isV4OrAbove,
  REANIMATED_VERSION,
};
```

## 💻 코드 예제 4: 자동 마이그레이션 스크립트

```typescript
// scripts/migrate-reanimated.ts

import * as fs from 'fs';
import * as path from 'path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

interface MigrationResult {
  file: string;
  changes: string[];
  warnings: string[];
}

const migrations = {
  // useAnimatedGestureHandler → Gesture API
  migrateGestureHandler: (code: string): { code: string; changes: string[] } => {
    const changes: string[] = [];
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    traverse(ast, {
      CallExpression(path) {
        if (
          t.isIdentifier(path.node.callee) &&
          path.node.callee.name === 'useAnimatedGestureHandler'
        ) {
          changes.push('Found useAnimatedGestureHandler - manual migration required');

          // 주석 추가
          path.addComment(
            'leading',
            ' TODO: Migrate to Gesture.Pan() API\n' +
            ' See: https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/gesture',
            true
          );
        }
      },

      ImportDeclaration(path) {
        if (
          path.node.source.value === 'react-native-reanimated' &&
          path.node.specifiers.some(
            (spec) =>
              t.isImportSpecifier(spec) &&
              t.isIdentifier(spec.imported) &&
              spec.imported.name === 'useAnimatedGestureHandler'
          )
        ) {
          changes.push('Removing deprecated useAnimatedGestureHandler import');

          // import 제거
          path.node.specifiers = path.node.specifiers.filter(
            (spec) =>
              !(
                t.isImportSpecifier(spec) &&
                t.isIdentifier(spec.imported) &&
                spec.imported.name === 'useAnimatedGestureHandler'
              )
          );

          // Gesture Handler 2 import 추가
          const gestureImport = t.importDeclaration(
            [
              t.importSpecifier(
                t.identifier('Gesture'),
                t.identifier('Gesture')
              ),
              t.importSpecifier(
                t.identifier('GestureDetector'),
                t.identifier('GestureDetector')
              ),
            ],
            t.stringLiteral('react-native-gesture-handler')
          );

          path.insertAfter(gestureImport);
        }
      },
    });

    return { code: generate(ast).code, changes };
  },

  // PanGestureHandler → GestureDetector
  migratePanGestureHandler: (code: string): { code: string; changes: string[] } => {
    const changes: string[] = [];

    // 간단한 문자열 치환 (실제로는 AST 사용 권장)
    if (code.includes('PanGestureHandler')) {
      changes.push('Found PanGestureHandler - replacing with GestureDetector');

      code = code.replace(
        /<PanGestureHandler\s+onGestureEvent=\{([^}]+)\}/g,
        (match, handler) => {
          return `<GestureDetector gesture={/* TODO: Create Gesture.Pan() for ${handler} */}`;
        }
      );

      code = code.replace(
        /<\/PanGestureHandler>/g,
        '</GestureDetector>'
      );
    }

    return { code, changes };
  },

  // withRepeat 콜백 시그니처 업데이트
  migrateWithRepeat: (code: string): { code: string; changes: string[] } => {
    const changes: string[] = [];
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    traverse(ast, {
      CallExpression(path) {
        if (
          t.isIdentifier(path.node.callee) &&
          path.node.callee.name === 'withRepeat' &&
          path.node.arguments.length === 4
        ) {
          const callback = path.node.arguments[3];

          if (t.isArrowFunctionExpression(callback)) {
            // 콜백 파라미터가 1개인 경우 2개로 확장
            if (callback.params.length === 1) {
              changes.push('Updating withRepeat callback signature');

              callback.params.push(t.identifier('current'));

              // 콜백 본문에 주석 추가
              path.addComment(
                'trailing',
                ' Updated callback signature for v3+',
                true
              );
            }
          }
        }
      },
    });

    return { code: generate(ast).code, changes };
  },

  // Layout Animation 개선
  migrateLayoutAnimations: (code: string): { code: string; changes: string[] } => {
    const changes: string[] = [];

    // entering/exiting에 duration 추가 권장
    const enteringRegex = /entering=\{(\w+)\}/g;
    let match;

    while ((match = enteringRegex.exec(code)) !== null) {
      if (!match[1].includes('.duration')) {
        changes.push(
          `Consider adding .duration() to ${match[1]} for explicit timing control`
        );
      }
    }

    return { code, changes };
  },
};

async function migrateFile(filePath: string): Promise<MigrationResult> {
  const result: MigrationResult = {
    file: filePath,
    changes: [],
    warnings: [],
  };

  try {
    let code = fs.readFileSync(filePath, 'utf-8');

    // 각 마이그레이션 적용
    for (const [name, migrate] of Object.entries(migrations)) {
      const { code: newCode, changes } = migrate(code);
      code = newCode;
      result.changes.push(...changes.map((c) => `[${name}] ${c}`));
    }

    // 변경사항이 있으면 파일 저장
    if (result.changes.length > 0) {
      fs.writeFileSync(filePath, code);
    }
  } catch (error) {
    result.warnings.push(`Failed to process: ${error}`);
  }

  return result;
}

async function migrateProject(srcDir: string): Promise<void> {
  console.log('Starting Reanimated migration...\n');

  const files = findTsxFiles(srcDir);
  const results: MigrationResult[] = [];

  for (const file of files) {
    const result = await migrateFile(file);
    if (result.changes.length > 0 || result.warnings.length > 0) {
      results.push(result);
    }
  }

  // 결과 출력
  console.log('\n=== Migration Summary ===\n');

  for (const result of results) {
    console.log(`📁 ${result.file}`);

    for (const change of result.changes) {
      console.log(`  ✅ ${change}`);
    }

    for (const warning of result.warnings) {
      console.log(`  ⚠️ ${warning}`);
    }

    console.log('');
  }

  console.log(`Total files processed: ${files.length}`);
  console.log(`Files with changes: ${results.length}`);
}

function findTsxFiles(dir: string): string[] {
  const files: string[] = [];

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findTsxFiles(fullPath));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

// 실행
const srcPath = process.argv[2] || './src';
migrateProject(srcPath);
```

## 💻 코드 예제 5: 점진적 마이그레이션 전략

```typescript
// src/shared/providers/reanimated-migration-provider.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MigrationState {
  completedMigrations: string[];
  currentVersion: string;
  targetVersion: string;
}

interface MigrationContextType {
  state: MigrationState;
  isMigrating: boolean;
  markMigrationComplete: (migrationId: string) => Promise<void>;
  checkMigration: (migrationId: string) => boolean;
  useNewApi: (featureId: string) => boolean;
}

const MigrationContext = createContext<MigrationContextType | null>(null);

// 기능별 마이그레이션 플래그
const FEATURE_FLAGS: Record<string, { minVersion: string; migrationId: string }> = {
  gestureHandler2: { minVersion: '3.0.0', migrationId: 'gh2-migration' },
  layoutAnimationsV2: { minVersion: '3.0.0', migrationId: 'layout-v2-migration' },
  cssAnimations: { minVersion: '4.0.0', migrationId: 'css-anim-migration' },
  enhancedWorklets: { minVersion: '4.0.0', migrationId: 'worklet-v2-migration' },
};

export function ReanimatedMigrationProvider({
  children,
  currentVersion,
  targetVersion,
}: {
  children: React.ReactNode;
  currentVersion: string;
  targetVersion: string;
}) {
  const [state, setState] = useState<MigrationState>({
    completedMigrations: [],
    currentVersion,
    targetVersion,
  });
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    loadMigrationState();
  }, []);

  const loadMigrationState = async () => {
    try {
      const saved = await AsyncStorage.getItem('reanimated-migrations');
      if (saved) {
        const parsed = JSON.parse(saved);
        setState((prev) => ({
          ...prev,
          completedMigrations: parsed.completedMigrations || [],
        }));
      }
    } catch (error) {
      console.warn('Failed to load migration state:', error);
    }
  };

  const markMigrationComplete = async (migrationId: string) => {
    const newCompleted = [...state.completedMigrations, migrationId];

    setState((prev) => ({
      ...prev,
      completedMigrations: newCompleted,
    }));

    try {
      await AsyncStorage.setItem(
        'reanimated-migrations',
        JSON.stringify({ completedMigrations: newCompleted })
      );
    } catch (error) {
      console.warn('Failed to save migration state:', error);
    }
  };

  const checkMigration = (migrationId: string): boolean => {
    return state.completedMigrations.includes(migrationId);
  };

  const useNewApi = (featureId: string): boolean => {
    const feature = FEATURE_FLAGS[featureId];
    if (!feature) return false;

    // 마이그레이션 완료 여부 확인
    if (!checkMigration(feature.migrationId)) {
      return false;
    }

    // 버전 확인
    return compareVersions(state.currentVersion, feature.minVersion) >= 0;
  };

  return (
    <MigrationContext.Provider
      value={{
        state,
        isMigrating,
        markMigrationComplete,
        checkMigration,
        useNewApi,
      }}
    >
      {children}
    </MigrationContext.Provider>
  );
}

export function useMigration() {
  const context = useContext(MigrationContext);
  if (!context) {
    throw new Error('useMigration must be used within ReanimatedMigrationProvider');
  }
  return context;
}

// 버전 비교 유틸리티
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;

    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }

  return 0;
}

// ============================================
// 마이그레이션 래퍼 컴포넌트
// ============================================

interface MigrationWrapperProps {
  featureId: string;
  legacyComponent: React.ReactNode;
  newComponent: React.ReactNode;
  fallbackOnError?: boolean;
}

export function MigrationWrapper({
  featureId,
  legacyComponent,
  newComponent,
  fallbackOnError = true,
}: MigrationWrapperProps) {
  const { useNewApi } = useMigration();
  const [hasError, setHasError] = useState(false);

  if (hasError && fallbackOnError) {
    return <>{legacyComponent}</>;
  }

  if (useNewApi(featureId)) {
    return (
      <ErrorBoundary onError={() => setHasError(true)}>
        {newComponent}
      </ErrorBoundary>
    );
  }

  return <>{legacyComponent}</>;
}

// 간단한 에러 바운더리
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  onError?: () => void;
}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('Migration component error:', error);
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

// ============================================
// 사용 예시
// ============================================

// 레거시 제스처 컴포넌트
function LegacySwipeCard({ onSwipe }: { onSwipe: (direction: string) => void }) {
  // v2 스타일 구현
  return <View />;
}

// 새로운 제스처 컴포넌트
function NewSwipeCard({ onSwipe }: { onSwipe: (direction: string) => void }) {
  // v3+ Gesture Handler 2 구현
  return <View />;
}

// 마이그레이션 적용
function SwipeCardWithMigration(props: { onSwipe: (direction: string) => void }) {
  return (
    <MigrationWrapper
      featureId="gestureHandler2"
      legacyComponent={<LegacySwipeCard {...props} />}
      newComponent={<NewSwipeCard {...props} />}
      fallbackOnError={true}
    />
  );
}
```

## 📱 sometimes-app 적용 사례

### 점진적 마이그레이션 적용

```typescript
// src/features/matching/ui/swipe-card.tsx

import { useMigration, MigrationWrapper } from '@/src/shared/providers/reanimated-migration-provider';
import { LegacySwipeCard } from './legacy-swipe-card';
import { ModernSwipeCard } from './modern-swipe-card';

interface SwipeCardProps {
  profile: MatchProfile;
  onSwipe: (direction: 'left' | 'right') => void;
  onSuperLike: () => void;
}

export function SwipeCard(props: SwipeCardProps) {
  const { useNewApi, markMigrationComplete } = useMigration();

  // 새 API 사용 가능 여부에 따라 분기
  if (useNewApi('gestureHandler2')) {
    return <ModernSwipeCard {...props} />;
  }

  // 레거시 지원 (점진적 마이그레이션)
  return <LegacySwipeCard {...props} />;
}

// 레거시 버전 (deprecated)
// src/features/matching/ui/legacy-swipe-card.tsx
function LegacySwipeCard({ profile, onSwipe, onSuperLike }: SwipeCardProps) {
  console.warn(
    'LegacySwipeCard is deprecated. ' +
    'Complete gestureHandler2 migration to use ModernSwipeCard.'
  );

  // v2 스타일 useAnimatedGestureHandler 사용
  // ...

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <ProfileContent profile={profile} />
      </Animated.View>
    </PanGestureHandler>
  );
}

// 모던 버전
// src/features/matching/ui/modern-swipe-card.tsx
function ModernSwipeCard({ profile, onSwipe, onSuperLike }: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const context = useSharedValue({ startX: 0, startY: 0 });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = {
        startX: translateX.value,
        startY: translateY.value,
      };
    })
    .onUpdate((event) => {
      translateX.value = context.value.startX + event.translationX;
      translateY.value = context.value.startY + event.translationY * 0.5;
    })
    .onEnd((event) => {
      const shouldSwipe = Math.abs(event.translationX) > SWIPE_THRESHOLD;

      if (shouldSwipe) {
        const direction = event.translationX > 0 ? 'right' : 'left';

        translateX.value = withSpring(
          event.translationX > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH,
          { velocity: event.velocityX },
          () => {
            runOnJS(onSwipe)(direction);
          }
        );
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  // 수직 스와이프로 Super Like
  const verticalGesture = Gesture.Pan()
    .activeOffsetY([-20, 20])
    .failOffsetX([-10, 10])
    .onEnd((event) => {
      if (event.translationY < -100) {
        runOnJS(onSuperLike)();
      }
    });

  const composedGesture = Gesture.Race(panGesture, verticalGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${(translateX.value / SCREEN_WIDTH) * 20}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <ProfileContent profile={profile} />
      </Animated.View>
    </GestureDetector>
  );
}

// 마이그레이션 트래커
// src/features/matching/hooks/use-migration-tracker.ts
export function useMigrationTracker() {
  const { markMigrationComplete, checkMigration } = useMigration();

  const completeMigration = async (featureId: string) => {
    await markMigrationComplete(`${featureId}-migration`);

    // 분석 이벤트 전송
    analytics.track('migration_completed', {
      feature: featureId,
      version: REANIMATED_VERSION,
    });
  };

  const getMigrationStatus = () => {
    return {
      gestureHandler2: checkMigration('gh2-migration'),
      layoutAnimationsV2: checkMigration('layout-v2-migration'),
      cssAnimations: checkMigration('css-anim-migration'),
    };
  };

  return {
    completeMigration,
    getMigrationStatus,
  };
}
```

## ⚠️ 흔한 실수와 해결법

### 1. 제스처 컨텍스트 마이그레이션 오류

```typescript
// ❌ 잘못된 방식: ctx를 직접 사용
const gestureHandler = useAnimatedGestureHandler({
  onStart: (_, ctx) => {
    ctx.startX = translateX.value; // ctx 객체 직접 수정
  },
});

// ✅ 올바른 방식: SharedValue로 컨텍스트 관리
const context = useSharedValue({ startX: 0 });

const gesture = Gesture.Pan()
  .onStart(() => {
    context.value = { startX: translateX.value };
  });
```

### 2. import 문 업데이트 누락

```typescript
// ❌ 잘못된 방식: 레거시 import 유지
import { PanGestureHandler } from 'react-native-gesture-handler';

// ✅ 올바른 방식: 새 API import
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
```

### 3. 콜백 시그니처 불일치

```typescript
// ❌ 잘못된 방식: 이전 콜백 시그니처
withRepeat(anim, -1, false, (finished) => {
  // v3+에서는 current 파라미터도 받음
});

// ✅ 올바른 방식: 새 콜백 시그니처
withRepeat(anim, -1, false, (finished, current) => {
  console.log('Finished:', finished, 'Current value:', current);
});
```

## 💡 팁

1. **점진적 마이그레이션**: 한 번에 모든 코드를 변경하지 말고 기능 단위로 진행
2. **테스트 우선**: 마이그레이션 전 기존 동작을 테스트로 문서화
3. **피처 플래그 활용**: 새 API와 레거시 API를 동시에 유지하며 점진적 전환
4. **버전 호환성 레이어**: 호환성 유틸리티로 코드 변경 최소화
5. **CI에서 마이그레이션 검증**: 자동화된 마이그레이션 스크립트 실행

## 🏋️ 연습 문제

### 문제: 레거시 제스처 코드 마이그레이션

다음 v2 스타일 코드를 v3+ Gesture Handler 2 API로 마이그레이션하세요.

```typescript
// 레거시 코드
function DraggableBox() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </PanGestureHandler>
  );
}
```

<details>
<summary>정답 보기</summary>

```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

function DraggableBox() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const context = useSharedValue({ startX: 0, startY: 0 });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = {
        startX: translateX.value,
        startY: translateY.value,
      };
    })
    .onUpdate((event) => {
      translateX.value = context.value.startX + event.translationX;
      translateY.value = context.value.startY + event.translationY;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
}
```

**주요 변경 사항:**
1. `useAnimatedGestureHandler` → `Gesture.Pan()` 체이닝 API
2. `ctx` 객체 → `useSharedValue`로 컨텍스트 관리
3. `PanGestureHandler` → `GestureDetector`
4. `onActive` → `onUpdate` (이름 변경)
</details>

## 📚 이 장에서 배운 내용

1. **버전별 주요 변경사항**: v2 → v3 → v4 마이그레이션 포인트
2. **호환성 레이어 구현**: 버전 간 차이를 추상화하는 유틸리티
3. **자동화 마이그레이션**: AST 기반 코드 변환 스크립트
4. **점진적 마이그레이션 전략**: 피처 플래그와 래퍼 컴포넌트 활용
5. **실전 마이그레이션 패턴**: sometimes-app 적용 사례

> **다음 장 예고**: **Chapter 79: 실전 트러블슈팅**에서는 실제 프로덕션 환경에서 발생한 문제들과 해결 과정을 케이스 스터디로 다룹니다.
