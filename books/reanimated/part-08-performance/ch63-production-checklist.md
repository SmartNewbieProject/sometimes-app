# Chapter 63: 프로덕션 최적화 체크리스트

앱을 프로덕션에 배포하기 전 확인해야 할 애니메이션 최적화 항목들을 정리합니다.

## 📌 학습 목표

- 프로덕션 배포 전 최종 점검 항목 이해
- 디버그 코드 제거 및 번들 최적화
- 성능 검증 프로세스 수립
- 모니터링 및 에러 추적 설정

## 📖 체크리스트 개요

### 최적화 영역

```
┌─────────────────────────────────────────────────────────────┐
│              Production Optimization Areas                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 코드 품질 (Code Quality)                                 │
│  ├── 디버그 코드 제거                                        │
│  ├── console.log 정리                                        │
│  ├── 미사용 import 제거                                      │
│  └── 타입 오류 해결                                          │
│                                                              │
│  2. 성능 (Performance)                                       │
│  ├── 애니메이션 FPS 검증                                     │
│  ├── 메모리 누수 확인                                        │
│  ├── 번들 크기 최적화                                        │
│  └── 시작 시간 측정                                          │
│                                                              │
│  3. 호환성 (Compatibility)                                   │
│  ├── iOS/Android 테스트                                      │
│  ├── 다양한 화면 크기                                        │
│  ├── 저사양 기기 테스트                                      │
│  └── OS 버전별 테스트                                        │
│                                                              │
│  4. 안정성 (Stability)                                       │
│  ├── 에러 바운더리 설정                                      │
│  ├── 크래시 리포팅                                           │
│  ├── 폴백 메커니즘                                           │
│  └── 네트워크 오류 처리                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 체크리스트 구현

### 1. 디버그 코드 제거 스크립트

```typescript
// scripts/production-check.ts
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface CheckResult {
  file: string;
  line: number;
  issue: string;
  severity: 'error' | 'warning';
}

// 체크할 패턴들
const patterns = {
  debugCode: [
    { pattern: /console\.(log|debug|info)\(/g, message: 'console.log found' },
    { pattern: /__DEV__\s*&&/g, message: 'DEV-only code found' },
    { pattern: /debugger;/g, message: 'debugger statement found' },
  ],
  reanimatedDebug: [
    { pattern: /useFrameCallback\([^)]+,\s*true\)/g, message: 'FrameCallback always enabled' },
    { pattern: /AnimationDebugger/g, message: 'Debug tool imported' },
    { pattern: /useBugDetector/g, message: 'Bug detector used' },
  ],
  performance: [
    { pattern: /withSpring\([^)]+damping:\s*[0-5]\b/g, message: 'Very low damping (may cause long animation)' },
    { pattern: /withRepeat\([^)]*-1\s*\)/g, message: 'Infinite repeat animation' },
    { pattern: /setInterval|setTimeout/g, message: 'Timer usage (check cleanup)' },
  ],
};

function checkFile(filePath: string): CheckResult[] {
  const results: CheckResult[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // 디버그 코드 체크
    patterns.debugCode.forEach(({ pattern, message }) => {
      if (pattern.test(line)) {
        results.push({
          file: filePath,
          line: index + 1,
          issue: message,
          severity: 'error',
        });
      }
    });

    // Reanimated 디버그 체크
    patterns.reanimatedDebug.forEach(({ pattern, message }) => {
      if (pattern.test(line)) {
        results.push({
          file: filePath,
          line: index + 1,
          issue: message,
          severity: 'warning',
        });
      }
    });

    // 성능 체크
    patterns.performance.forEach(({ pattern, message }) => {
      if (pattern.test(line)) {
        results.push({
          file: filePath,
          line: index + 1,
          issue: message,
          severity: 'warning',
        });
      }
    });
  });

  return results;
}

function runProductionCheck(srcPath: string): void {
  const files = glob.sync(`${srcPath}/**/*.{ts,tsx}`, {
    ignore: ['**/node_modules/**', '**/*.test.ts', '**/*.spec.ts'],
  });

  let errorCount = 0;
  let warningCount = 0;

  files.forEach(file => {
    const results = checkFile(file);
    results.forEach(result => {
      const icon = result.severity === 'error' ? '❌' : '⚠️';
      console.log(`${icon} ${result.file}:${result.line}`);
      console.log(`   ${result.issue}`);

      if (result.severity === 'error') {
        errorCount++;
      } else {
        warningCount++;
      }
    });
  });

  console.log('\n');
  console.log(`Production Check Complete:`);
  console.log(`  Errors: ${errorCount}`);
  console.log(`  Warnings: ${warningCount}`);

  if (errorCount > 0) {
    process.exit(1);
  }
}

// 실행
runProductionCheck('./src');
```

### 2. 애니메이션 성능 검증 컴포넌트

```typescript
// components/ProductionAnimationTest.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  useFrameCallback,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';

interface TestResult {
  name: string;
  passed: boolean;
  fps: number;
  jankPercent: number;
  message: string;
}

// 프로덕션 애니메이션 테스트 스위트
function useProductionAnimationTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testValues = {
    single: useSharedValue(0),
    multi1: useSharedValue(0),
    multi2: useSharedValue(0),
    multi3: useSharedValue(0),
    complex: useSharedValue(0),
  };

  // 프레임 측정
  const frameData = {
    count: useSharedValue(0),
    jankCount: useSharedValue(0),
    lastTime: useSharedValue(0),
    totalTime: useSharedValue(0),
  };

  const runTest = useCallback(async (
    name: string,
    animation: () => void,
    duration: number
  ): Promise<TestResult> => {
    return new Promise((resolve) => {
      // 초기화
      frameData.count.value = 0;
      frameData.jankCount.value = 0;
      frameData.totalTime.value = 0;
      frameData.lastTime.value = 0;

      // 애니메이션 실행
      animation();

      // 측정 시작
      const measureInterval = setInterval(() => {
        // 프레임 측정은 useFrameCallback에서 처리
      }, 16);

      // 테스트 완료
      setTimeout(() => {
        clearInterval(measureInterval);

        const totalFrames = frameData.count.value;
        const janks = frameData.jankCount.value;
        const avgTime = totalFrames > 0
          ? frameData.totalTime.value / totalFrames
          : 0;
        const fps = avgTime > 0 ? Math.round(1000 / avgTime) : 0;
        const jankPercent = totalFrames > 0
          ? (janks / totalFrames) * 100
          : 0;

        resolve({
          name,
          passed: fps >= 55 && jankPercent < 5,
          fps,
          jankPercent,
          message: fps >= 55 ? 'Good performance' : 'Needs optimization',
        });
      }, duration);
    });
  }, [frameData]);

  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    const newResults: TestResult[] = [];

    // 테스트 1: 단일 Spring
    newResults.push(await runTest(
      'Single Spring Animation',
      () => {
        testValues.single.value = 0;
        testValues.single.value = withSpring(100);
      },
      1000
    ));

    // 테스트 2: 다중 동시 애니메이션
    newResults.push(await runTest(
      'Multiple Concurrent Animations (3)',
      () => {
        testValues.multi1.value = 0;
        testValues.multi2.value = 0;
        testValues.multi3.value = 0;
        testValues.multi1.value = withSpring(100);
        testValues.multi2.value = withSpring(100, { delay: 100 });
        testValues.multi3.value = withSpring(100, { delay: 200 });
      },
      1500
    ));

    // 테스트 3: 복잡한 시퀀스
    newResults.push(await runTest(
      'Complex Sequence Animation',
      () => {
        testValues.complex.value = 0;
        testValues.complex.value = withRepeat(
          withSequence(
            withSpring(50),
            withTiming(100, { duration: 200 }),
            withSpring(0)
          ),
          2,
          false
        );
      },
      2000
    ));

    setResults(newResults);
    setIsRunning(false);

    // 모든 애니메이션 정리
    Object.values(testValues).forEach(v => cancelAnimation(v));
  }, [runTest, testValues]);

  // 프레임 측정
  useFrameCallback((info) => {
    if (!isRunning) return;

    if (frameData.lastTime.value > 0) {
      const delta = (info.timestamp - frameData.lastTime.value) / 1000000;
      frameData.totalTime.value += delta;

      if (delta > 20) {
        frameData.jankCount.value++;
      }
    }

    frameData.count.value++;
    frameData.lastTime.value = info.timestamp;
  }, isRunning);

  return {
    results,
    isRunning,
    runAllTests,
    allPassed: results.length > 0 && results.every(r => r.passed),
  };
}

// UI 컴포넌트
function ProductionAnimationTest() {
  const { results, isRunning, runAllTests, allPassed } = useProductionAnimationTest();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Animation Performance Test</Text>

      <Pressable
        style={[styles.runButton, isRunning && styles.runButtonDisabled]}
        onPress={runAllTests}
        disabled={isRunning}
      >
        <Text style={styles.runButtonText}>
          {isRunning ? 'Testing...' : 'Run Tests'}
        </Text>
      </Pressable>

      {results.length > 0 && (
        <View style={[
          styles.summaryBadge,
          { backgroundColor: allPassed ? '#4CAF50' : '#F44336' }
        ]}>
          <Text style={styles.summaryText}>
            {allPassed ? '✓ All Tests Passed' : '✗ Some Tests Failed'}
          </Text>
        </View>
      )}

      <ScrollView style={styles.results}>
        {results.map((result, index) => (
          <View
            key={index}
            style={[
              styles.resultCard,
              { borderLeftColor: result.passed ? '#4CAF50' : '#F44336' }
            ]}
          >
            <View style={styles.resultHeader}>
              <Text style={styles.resultName}>{result.name}</Text>
              <Text style={[
                styles.resultStatus,
                { color: result.passed ? '#4CAF50' : '#F44336' }
              ]}>
                {result.passed ? 'PASS' : 'FAIL'}
              </Text>
            </View>
            <View style={styles.resultStats}>
              <Text style={styles.resultStat}>FPS: {result.fps}</Text>
              <Text style={styles.resultStat}>
                Jank: {result.jankPercent.toFixed(1)}%
              </Text>
            </View>
            <Text style={styles.resultMessage}>{result.message}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  runButton: {
    backgroundColor: '#7A4AE2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  runButtonDisabled: {
    backgroundColor: '#999',
  },
  runButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryBadge: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  results: {
    flex: 1,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  resultStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 4,
  },
  resultStat: {
    fontSize: 14,
    color: '#7A4AE2',
    fontFamily: 'monospace',
  },
  resultMessage: {
    fontSize: 12,
    color: '#666',
  },
});

export { ProductionAnimationTest, useProductionAnimationTest };
```

### 3. 체크리스트 컴포넌트

```typescript
// components/ProductionChecklist.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';

interface CheckItem {
  id: string;
  category: string;
  title: string;
  description: string;
  status: 'pending' | 'pass' | 'fail' | 'warning';
  autoCheck?: () => Promise<boolean>;
}

const checklistItems: CheckItem[] = [
  // 코드 품질
  {
    id: 'debug-logs',
    category: 'Code Quality',
    title: 'Debug Logs Removed',
    description: 'All console.log statements are removed or wrapped in __DEV__',
    status: 'pending',
  },
  {
    id: 'debug-tools',
    category: 'Code Quality',
    title: 'Debug Tools Disabled',
    description: 'AnimationDebugger, ValueTracker disabled in production',
    status: 'pending',
  },
  {
    id: 'unused-imports',
    category: 'Code Quality',
    title: 'Unused Imports Removed',
    description: 'No unused imports in animation files',
    status: 'pending',
  },

  // 성능
  {
    id: 'fps-test',
    category: 'Performance',
    title: 'FPS Test Passed',
    description: 'All animations maintain 55+ FPS',
    status: 'pending',
  },
  {
    id: 'memory-test',
    category: 'Performance',
    title: 'No Memory Leaks',
    description: 'Animations properly cleanup on unmount',
    status: 'pending',
  },
  {
    id: 'bundle-size',
    category: 'Performance',
    title: 'Bundle Size Optimized',
    description: 'Reanimated tree-shaking applied',
    status: 'pending',
  },

  // 호환성
  {
    id: 'ios-test',
    category: 'Compatibility',
    title: 'iOS Tested',
    description: 'Animations work on iOS 13+',
    status: 'pending',
  },
  {
    id: 'android-test',
    category: 'Compatibility',
    title: 'Android Tested',
    description: 'Animations work on Android 8+',
    status: 'pending',
  },
  {
    id: 'low-end-test',
    category: 'Compatibility',
    title: 'Low-End Devices',
    description: 'Graceful degradation on low-end devices',
    status: 'pending',
  },

  // 안정성
  {
    id: 'error-boundary',
    category: 'Stability',
    title: 'Error Boundaries',
    description: 'Animation errors caught by error boundaries',
    status: 'pending',
  },
  {
    id: 'crash-reporting',
    category: 'Stability',
    title: 'Crash Reporting',
    description: 'Sentry/Crashlytics configured',
    status: 'pending',
  },
  {
    id: 'fallbacks',
    category: 'Stability',
    title: 'Fallback Animations',
    description: 'Fallbacks for failed animations',
    status: 'pending',
  },
];

function ProductionChecklist() {
  const [items, setItems] = useState<CheckItem[]>(checklistItems);
  const [expanded, setExpanded] = useState<string | null>('Code Quality');

  const updateStatus = useCallback((
    id: string,
    status: CheckItem['status']
  ) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, status } : item
    ));
  }, []);

  const categories = [...new Set(items.map(item => item.category))];

  const getCategoryProgress = (category: string) => {
    const categoryItems = items.filter(i => i.category === category);
    const passed = categoryItems.filter(i => i.status === 'pass').length;
    return {
      total: categoryItems.length,
      passed,
      percentage: Math.round((passed / categoryItems.length) * 100),
    };
  };

  const overallProgress = {
    total: items.length,
    passed: items.filter(i => i.status === 'pass').length,
    failed: items.filter(i => i.status === 'fail').length,
    warnings: items.filter(i => i.status === 'warning').length,
  };

  const getStatusIcon = (status: CheckItem['status']) => {
    switch (status) {
      case 'pass': return '✓';
      case 'fail': return '✗';
      case 'warning': return '⚠';
      default: return '○';
    }
  };

  const getStatusColor = (status: CheckItem['status']) => {
    switch (status) {
      case 'pass': return '#4CAF50';
      case 'fail': return '#F44336';
      case 'warning': return '#FFC107';
      default: return '#999';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Production Checklist</Text>

      {/* 전체 진행률 */}
      <View style={styles.overallProgress}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(overallProgress.passed / overallProgress.total) * 100}%`,
                backgroundColor: overallProgress.failed > 0 ? '#FFC107' : '#4CAF50',
              }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {overallProgress.passed}/{overallProgress.total} completed
        </Text>
        {overallProgress.failed > 0 && (
          <Text style={styles.failedText}>
            {overallProgress.failed} failed
          </Text>
        )}
      </View>

      {/* 카테고리별 체크리스트 */}
      {categories.map(category => {
        const progress = getCategoryProgress(category);
        const isExpanded = expanded === category;
        const categoryItems = items.filter(i => i.category === category);

        return (
          <View key={category} style={styles.category}>
            <Pressable
              style={styles.categoryHeader}
              onPress={() => setExpanded(isExpanded ? null : category)}
            >
              <View style={styles.categoryTitleRow}>
                <Text style={styles.categoryTitle}>{category}</Text>
                <Text style={styles.categoryProgress}>
                  {progress.passed}/{progress.total}
                </Text>
              </View>
              <View style={styles.categoryProgressBar}>
                <View
                  style={[
                    styles.categoryProgressFill,
                    { width: `${progress.percentage}%` }
                  ]}
                />
              </View>
            </Pressable>

            {isExpanded && (
              <View style={styles.categoryItems}>
                {categoryItems.map(item => (
                  <View key={item.id} style={styles.checkItem}>
                    <Pressable
                      style={styles.checkItemHeader}
                      onPress={() => {
                        // 토글 상태
                        const newStatus = item.status === 'pass' ? 'pending' :
                                         item.status === 'pending' ? 'pass' : 'pending';
                        updateStatus(item.id, newStatus);
                      }}
                    >
                      <Text style={[
                        styles.statusIcon,
                        { color: getStatusColor(item.status) }
                      ]}>
                        {getStatusIcon(item.status)}
                      </Text>
                      <View style={styles.checkItemContent}>
                        <Text style={styles.checkItemTitle}>{item.title}</Text>
                        <Text style={styles.checkItemDescription}>
                          {item.description}
                        </Text>
                      </View>
                    </Pressable>

                    {/* 수동 상태 변경 버튼 */}
                    <View style={styles.statusButtons}>
                      {(['pass', 'warning', 'fail'] as const).map(status => (
                        <Pressable
                          key={status}
                          style={[
                            styles.statusButton,
                            item.status === status && {
                              backgroundColor: getStatusColor(status),
                            }
                          ]}
                          onPress={() => updateStatus(item.id, status)}
                        >
                          <Text style={[
                            styles.statusButtonText,
                            item.status === status && { color: '#FFFFFF' }
                          ]}>
                            {status}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}

      {/* 배포 준비 상태 */}
      <View style={[
        styles.deployStatus,
        {
          backgroundColor: overallProgress.failed === 0 &&
                          overallProgress.passed === overallProgress.total
            ? '#E8F5E9'
            : '#FFF3E0'
        }
      ]}>
        <Text style={styles.deployStatusTitle}>
          {overallProgress.failed === 0 &&
           overallProgress.passed === overallProgress.total
            ? '✓ Ready for Production'
            : '⚠ Complete Checklist Before Deploy'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    color: '#333',
  },
  overallProgress: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  failedText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  category: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryHeader: {
    padding: 16,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryProgress: {
    fontSize: 14,
    color: '#7A4AE2',
    fontWeight: '600',
  },
  categoryProgressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    backgroundColor: '#7A4AE2',
    borderRadius: 2,
  },
  categoryItems: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  checkItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusIcon: {
    fontSize: 20,
    marginRight: 12,
    fontWeight: 'bold',
  },
  checkItemContent: {
    flex: 1,
  },
  checkItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  checkItemDescription: {
    fontSize: 12,
    color: '#666',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginLeft: 32,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  statusButtonText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  deployStatus: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  deployStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export { ProductionChecklist };
```

### 4. 번들 최적화 설정

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);

  const plugins = [
    'react-native-reanimated/plugin',
  ];

  // Production 최적화
  if (process.env.NODE_ENV === 'production') {
    plugins.push([
      'transform-remove-console',
      {
        exclude: ['error', 'warn'],
      },
    ]);
  }

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
```

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Production 번들 최적화
if (process.env.NODE_ENV === 'production') {
  config.transformer = {
    ...config.transformer,
    minifierConfig: {
      keep_classnames: false,
      keep_fnames: false,
      mangle: true,
      reserved: [],
      toplevel: true,
    },
  };
}

module.exports = config;
```

### 5. 에러 바운더리 및 폴백

```typescript
// components/AnimationErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Sentry from '@sentry/react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class AnimationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Sentry에 에러 전송
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        isAnimationError: true,
      },
    });

    this.props.onError?.(error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {__DEV__ ? this.state.error?.message : 'An animation error occurred'}
          </Text>
          <Pressable style={styles.retryButton} onPress={this.handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF3F3',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#7A4AE2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export { AnimationErrorBoundary };
```

## 📋 최종 체크리스트 요약

### 배포 전 필수 체크

```markdown
## 코드 품질
- [ ] console.log 제거 (또는 __DEV__ 래핑)
- [ ] 디버그 도구 비활성화
- [ ] 미사용 import 정리
- [ ] TypeScript 오류 해결

## 성능
- [ ] 모든 애니메이션 55+ FPS 유지
- [ ] 메모리 누수 테스트 통과
- [ ] 무한 애니메이션 정리 확인
- [ ] 번들 크기 최적화 적용

## 호환성
- [ ] iOS 실기기 테스트
- [ ] Android 실기기 테스트
- [ ] 저사양 기기 테스트
- [ ] 다양한 화면 크기 확인

## 안정성
- [ ] Error Boundary 설정
- [ ] Sentry/Crashlytics 설정
- [ ] 폴백 애니메이션 구현
- [ ] 네트워크 오류 처리

## 최종 확인
- [ ] Release 빌드 테스트
- [ ] 실사용자 베타 테스트
- [ ] 성능 메트릭 수집 설정
```

## 📚 이 장에서 배운 내용

1. **프로덕션 체크 스크립트**: 자동화된 코드 품질 검사
2. **성능 테스트 스위트**: 애니메이션 FPS 검증
3. **체크리스트 UI**: 배포 전 확인 항목 관리
4. **번들 최적화**: Babel, Metro 설정
5. **에러 바운더리**: 애니메이션 오류 복구
6. **모니터링 설정**: Sentry 연동

## Part 8 완료!

Part 8: 성능 최적화에서는 다음 내용을 다뤘습니다:

- **Ch 56**: 성능 최적화 기초 - 스레드 아키텍처, 16.6ms 규칙
- **Ch 57**: 메모리 관리 - SharedValue 생명주기, 메모리 누수 방지
- **Ch 58**: 렌더링 최적화 - 리렌더 방지, 메모이제이션
- **Ch 59**: 프로파일링 기법 - FPS 측정, 디버깅 도구
- **Ch 60**: 배터리 효율 - 백그라운드 처리, 적응형 품질
- **Ch 61**: 저사양 기기 대응 - 점진적 기능 저하
- **Ch 62**: 애니메이션 디버깅 - 버그 감지, 로깅
- **Ch 63**: 프로덕션 체크리스트 - 배포 전 최종 점검

## 다음 Part 예고

**Part 9: 애니메이션 설계 패턴**에서는 재사용 가능하고 유지보수하기 쉬운 애니메이션 아키텍처를 배웁니다. 컴포넌트 설계, 상태 관리, 테스트 전략 등을 다룹니다.
