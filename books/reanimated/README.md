# React Native Reanimated 마스터북

> 기초부터 시니어 레벨까지 - 실무 중심 완벽 가이드

[![Reanimated](https://img.shields.io/badge/Reanimated-3.x/4.x-blue.svg)](https://docs.swmansion.com/react-native-reanimated/)
[![React Native](https://img.shields.io/badge/React%20Native-0.76+-green.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

---

## 📚 이 책에 대하여

**React Native Reanimated 마스터북**은 React Native 개발자가 애니메이션의 기초부터 시니어 레벨의 고급 기법까지 체계적으로 학습할 수 있도록 설계된 실무 중심 가이드입니다.

**총 79개 챕터 + 5개 부록 | 약 550페이지 분량**

### 누구를 위한 책인가?

- ✅ React Native로 기본 앱을 만들 수 있지만 애니메이션은 처음인 개발자
- ✅ Animated API를 사용해봤지만 한계를 느낀 개발자
- ✅ 60fps 부드러운 애니메이션을 구현하고 싶은 개발자
- ✅ 프로덕션 레벨의 인터랙션을 만들고 싶은 개발자

### 이 책의 특징

| 특징 | 설명 |
|------|------|
| 🎯 **실무 중심** | 이론보다 실제 프로덕션에서 쓰이는 패턴 위주 |
| 💻 **풍부한 예제** | 모든 개념에 바로 실행 가능한 코드 스니펫 |
| 📱 **실전 적용** | sometimes-app 프로젝트 적용 사례 포함 |
| ⚠️ **함정 회피** | 흔히 하는 실수와 해결법 상세 설명 |
| 🚀 **성능 최적화** | 60fps 유지를 위한 실전 최적화 기법 |
| 🏗️ **설계 패턴** | 재사용 가능한 애니메이션 아키텍처 |

### 선수 지식

- JavaScript/TypeScript 중급 이상
- React 훅 패턴 이해 (useState, useEffect, useCallback 등)
- React Native 기본 컴포넌트 사용 경험
- 기본적인 앱 개발 경험 (네비게이션, 상태 관리 등)

---

## 📖 목차

### Part 1: 기초 다지기 (Fundamentals)

Reanimated의 핵심 개념과 기본 API를 마스터합니다.

| 챕터 | 제목 |
|------|------|
| 01 | [Reanimated 소개와 아키텍처](./part-01-fundamentals/ch01-introduction.md) |
| 02 | [개발 환경 설정](./part-01-fundamentals/ch02-setup.md) |
| 03 | [SharedValue 완벽 이해](./part-01-fundamentals/ch03-shared-values.md) |
| 04 | [useAnimatedStyle 마스터하기](./part-01-fundamentals/ch04-animated-style.md) |
| 05 | [기본 애니메이션 함수 (withTiming, withSpring)](./part-01-fundamentals/ch05-basic-animations.md) |
| 06 | [애니메이션 조합 (withSequence, withDelay, withRepeat)](./part-01-fundamentals/ch06-modifiers.md) |
| 07 | [useAnimatedProps와 네이티브 속성](./part-01-fundamentals/ch07-animated-props.md) |
| 08 | [useDerivedValue와 반응형 값](./part-01-fundamentals/ch08-derived-values.md) |

### Part 2: 제스처 마스터 (Gesture Handling)

터치 인터랙션의 모든 것을 다룹니다.

| 챕터 | 제목 |
|------|------|
| 09 | [Gesture Handler 2 통합](./part-02-gestures/ch09-gesture-handler-integration.md) |
| 10 | [Tap 제스처와 피드백](./part-02-gestures/ch10-tap-gesture.md) |
| 11 | [Pan 제스처와 드래그](./part-02-gestures/ch11-pan-gesture.md) |
| 12 | [Pinch와 Rotation 제스처](./part-02-gestures/ch12-pinch-rotation.md) |
| 13 | [복합 제스처 (Simultaneous, Exclusive, Race)](./part-02-gestures/ch13-composed-gestures.md) |
| 14 | [제스처 상태 머신](./part-02-gestures/ch14-gesture-state-machine.md) |
| 15 | [실전: Tinder 스와이프 카드](./part-02-gestures/ch15-tinder-swipe.md) |
| 16 | [실전: 드래그 앤 드롭 리스트](./part-02-gestures/ch16-drag-drop-list.md) |

### Part 3: 레이아웃 애니메이션 (Layout Animations)

컴포넌트의 등장과 퇴장을 아름답게 연출합니다.

| 챕터 | 제목 |
|------|------|
| 17 | [Layout Animations 개념과 원리](./part-03-layout-animations/ch17-layout-concepts.md) |
| 18 | [Entering 애니메이션](./part-03-layout-animations/ch18-entering.md) |
| 19 | [Exiting 애니메이션](./part-03-layout-animations/ch19-exiting.md) |
| 20 | [Layout Transitions](./part-03-layout-animations/ch20-layout-transitions.md) |
| 21 | [커스텀 레이아웃 애니메이션](./part-03-layout-animations/ch21-custom-layout.md) |
| 22 | [Keyframe 애니메이션](./part-03-layout-animations/ch22-keyframes.md) |
| 23 | [실전: 동적 리스트 애니메이션](./part-03-layout-animations/ch23-dynamic-list.md) |
| 24 | [실전: 모달과 바텀시트](./part-03-layout-animations/ch24-modal-bottomsheet.md) |

### Part 4: 스크롤 연동 (Scroll-driven Animations)

스크롤에 반응하는 동적 UI를 구현합니다.

| 챕터 | 제목 |
|------|------|
| 25 | [useAnimatedScrollHandler 기초](./part-04-scroll-animations/ch25-scroll-handler-basics.md) |
| 26 | [스크롤 이벤트 활용](./part-04-scroll-animations/ch26-scroll-events.md) |
| 27 | [Interpolate 심화](./part-04-scroll-animations/ch27-interpolation.md) |
| 28 | [Sticky Header 구현](./part-04-scroll-animations/ch28-sticky-header.md) |
| 29 | [Parallax 효과](./part-04-scroll-animations/ch29-parallax.md) |
| 30 | [Pull-to-Refresh 커스터마이징](./part-04-scroll-animations/ch30-pull-to-refresh.md) |
| 31 | [무한 스크롤과 애니메이션](./part-04-scroll-animations/ch31-infinite-scroll.md) |
| 32 | [실전: 복합 스크롤 헤더](./part-04-scroll-animations/ch32-complex-header.md) |

### Part 5: 고급 그래픽스 (Advanced Graphics)

SVG, Canvas, Skia를 활용한 고급 시각 효과를 다룹니다.

| 챕터 | 제목 |
|------|------|
| 33 | [SVG 애니메이션 기초](./part-05-advanced-graphics/ch33-svg-basics.md) |
| 34 | [Path 애니메이션](./part-05-advanced-graphics/ch34-path-animation.md) |
| 35 | [React Native Skia 통합](./part-05-advanced-graphics/ch35-skia-integration.md) |
| 36 | [Canvas 기반 애니메이션](./part-05-advanced-graphics/ch36-canvas-animation.md) |
| 37 | [Shader와 시각 효과](./part-05-advanced-graphics/ch37-shaders.md) |
| 38 | [실전: 차트 애니메이션](./part-05-advanced-graphics/ch38-chart-animation.md) |
| 39 | [실전: 로딩 인디케이터](./part-05-advanced-graphics/ch39-loading-indicators.md) |

### Part 6: 워크릿 심화 (Worklets & Threading)

Reanimated의 내부 동작 원리를 깊이 이해합니다.

| 챕터 | 제목 |
|------|------|
| 40 | [Worklet 아키텍처 이해](./part-06-worklets/ch40-worklet-architecture.md) |
| 41 | [UI 스레드와 JS 스레드](./part-06-worklets/ch41-threading-model.md) |
| 42 | [runOnJS와 runOnUI](./part-06-worklets/ch42-run-on-js-ui.md) |
| 43 | [useAnimatedReaction 심화](./part-06-worklets/ch43-animated-reaction.md) |
| 44 | [커스텀 Worklet 작성](./part-06-worklets/ch44-custom-worklets.md) |
| 45 | [스레드 간 데이터 공유](./part-06-worklets/ch45-thread-communication.md) |
| 46 | [Worklet 기반 상태 머신](./part-06-worklets/ch46-state-machines.md) |
| 47 | [Worklet 디버깅](./part-06-worklets/ch47-debugging-worklets.md) |

### Part 7: 마이크로 인터랙션 (Micro-interactions)

세련된 UX를 위한 작은 디테일을 구현합니다.

| 챕터 | 제목 |
|------|------|
| 48 | [마이크로 인터랙션의 가치](./part-07-micro-interactions/ch48-ux-value.md) |
| 49 | [버튼 피드백 애니메이션](./part-07-micro-interactions/ch49-button-feedback.md) |
| 50 | [입력 필드 인터랙션](./part-07-micro-interactions/ch50-input-interactions.md) |
| 51 | [토글과 스위치](./part-07-micro-interactions/ch51-toggle-switch.md) |
| 52 | [로딩 상태 표현](./part-07-micro-interactions/ch52-loading-states.md) |
| 53 | [성공과 에러 피드백](./part-07-micro-interactions/ch53-success-error-feedback.md) |
| 54 | [화면 전환 효과](./part-07-micro-interactions/ch54-transitions.md) |
| 55 | [실전: 인터랙션 컴포넌트 라이브러리](./part-07-micro-interactions/ch55-interaction-library.md) |

### Part 8: 성능 최적화 (Performance Optimization)

60fps를 유지하는 최적화 기법을 학습합니다.

| 챕터 | 제목 |
|------|------|
| 56 | [애니메이션 성능의 이해](./part-08-performance/ch56-performance-fundamentals.md) |
| 57 | [60fps 달성 전략](./part-08-performance/ch57-60fps-strategies.md) |
| 58 | [불필요한 리렌더 방지](./part-08-performance/ch58-prevent-rerender.md) |
| 59 | [메모리 최적화](./part-08-performance/ch59-memory-management.md) |
| 60 | [프레임 드롭 분석](./part-08-performance/ch60-frame-drop-analysis.md) |
| 61 | [성능 측정 도구 활용](./part-08-performance/ch61-debugging-tools.md) |
| 62 | [플랫폼별 최적화](./part-08-performance/ch62-platform-optimization.md) |
| 63 | [대규모 리스트 최적화](./part-08-performance/ch63-large-list-optimization.md) |

### Part 9: 애니메이션 설계 패턴 (Design Patterns)

재사용 가능한 애니메이션 아키텍처를 설계합니다.

| 챕터 | 제목 |
|------|------|
| 64 | [재사용 가능한 애니메이션 훅](./part-09-design-patterns/ch64-reusable-hooks.md) |
| 65 | [애니메이션 컴포넌트 추상화](./part-09-design-patterns/ch65-component-abstraction.md) |
| 66 | [애니메이션 상태 관리](./part-09-design-patterns/ch66-state-management.md) |
| 67 | [테마 시스템 연동](./part-09-design-patterns/ch67-theming.md) |
| 68 | [접근성 (Reduce Motion)](./part-09-design-patterns/ch68-accessibility.md) |
| 69 | [애니메이션 테스트](./part-09-design-patterns/ch69-testing.md) |
| 70 | [애니메이션 시스템 설계](./part-09-design-patterns/ch70-system-architecture.md) |
| 71 | [디자인 시스템 통합](./part-09-design-patterns/ch71-design-system-integration.md) |

### Part 10: 트러블슈팅 가이드 (Troubleshooting)

실무에서 마주치는 문제들의 해결법을 제시합니다.

| 챕터 | 제목 |
|------|------|
| 72 | [성능 디버깅](./part-10-troubleshooting/ch72-performance-debugging.md) |
| 73 | [제스처 충돌 해결](./part-10-troubleshooting/ch73-gesture-conflicts.md) |
| 74 | [플랫폼 이슈 (iOS/Android)](./part-10-troubleshooting/ch74-platform-issues.md) |
| 75 | [메모리 관리](./part-10-troubleshooting/ch75-memory-management.md) |
| 76 | [레이아웃 디버깅](./part-10-troubleshooting/ch76-layout-debugging.md) |
| 77 | [타이밍 이슈](./part-10-troubleshooting/ch77-timing-issues.md) |
| 78 | [마이그레이션 가이드](./part-10-troubleshooting/ch78-migration-guide.md) |
| 79 | [실전 트러블슈팅 사례](./part-10-troubleshooting/ch79-real-world-troubleshooting.md) |

### 부록 (Appendices)

| 부록 | 제목 |
|------|------|
| A | [API 레퍼런스](./appendices/appendix-a-api-reference.md) |
| B | [성능 체크리스트](./appendices/appendix-b-performance-checklist.md) |
| C | [애니메이션 레시피](./appendices/appendix-c-animation-recipes.md) |
| D | [디버깅 도구](./appendices/appendix-d-debugging-tools.md) |
| E | [용어집](./appendices/appendix-e-glossary.md) |

---

## 🛠️ 개발 환경

이 책의 예제 코드는 다음 환경을 기준으로 작성되었습니다:

```json
{
  "react-native": "0.76+",
  "react-native-reanimated": "^3.x / ^4.x",
  "react-native-gesture-handler": "^2.x",
  "expo": "54+",
  "typescript": "^5.x"
}
```

---

## 📝 표기 규칙

이 책에서 사용하는 아이콘과 표기법:

| 아이콘 | 의미 |
|--------|------|
| 📌 | 학습 목표 |
| 📖 | 개념 설명 |
| 💻 | 코드 예제 |
| 📊 | 비교표 / 다이어그램 |
| ⚠️ | 흔한 실수 / 주의사항 |
| 💡 | 성능 팁 / 꿀팁 |
| 🏋️ | 연습 문제 |
| 📚 | 챕터 요약 |
| 📱 | sometimes-app 적용 사례 |

---

## 📂 디렉터리 구조

```
books/reanimated/
├── README.md
├── part-01-fundamentals/      # Part 1: 기초 다지기
│   ├── ch01-introduction.md
│   ├── ch02-setup.md
│   └── ...
├── part-02-gestures/          # Part 2: 제스처 마스터
├── part-03-layout-animations/ # Part 3: 레이아웃 애니메이션
├── part-04-scroll-animations/ # Part 4: 스크롤 연동
├── part-05-advanced-graphics/ # Part 5: 고급 그래픽스
├── part-06-worklets/          # Part 6: 워크릿 심화
├── part-07-micro-interactions/# Part 7: 마이크로 인터랙션
├── part-08-performance/       # Part 8: 성능 최적화
├── part-09-design-patterns/   # Part 9: 설계 패턴
├── part-10-troubleshooting/   # Part 10: 트러블슈팅
└── appendices/                # 부록
    ├── appendix-a-api-reference.md
    ├── appendix-b-performance-checklist.md
    ├── appendix-c-animation-recipes.md
    ├── appendix-d-debugging-tools.md
    └── appendix-e-glossary.md
```

---

## 🙏 감사의 말

이 책은 React Native와 Reanimated 커뮤니티의 노력 위에 만들어졌습니다.

특히 [Software Mansion](https://swmansion.com/)의 Reanimated 팀과 모든 오픈소스 기여자들에게 감사드립니다.

---

## 📄 라이선스

이 책의 내용은 학습 목적으로 자유롭게 활용할 수 있습니다.

---

**Happy Animating! 🎬**
