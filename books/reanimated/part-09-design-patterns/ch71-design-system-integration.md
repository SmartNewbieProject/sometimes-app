# Chapter 71: 디자인 시스템 통합

애니메이션을 포함한 완전한 디자인 시스템을 구축하고 팀 전체가 일관되게 사용할 수 있도록 통합하는 방법을 학습합니다.

## 📌 학습 목표

- 애니메이션 토큰 시스템 설계
- Storybook을 활용한 애니메이션 문서화
- 디자인-개발 협업 워크플로우 구축
- 버전 관리와 마이그레이션 전략

## 📖 개념 이해

### 디자인 시스템에서 애니메이션의 역할

```
┌─────────────────────────────────────────────────────────────┐
│                    Design System                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Colors    │  │ Typography  │  │      Spacing        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Icons     │  │   Shadows   │  │   Border Radius     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Animation Tokens                    │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │ Duration │ │  Easing  │ │  Spring  │ │ Gestures │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  Animated Components                   │  │
│  │  Button, Card, Modal, Toast, Drawer, List Items ...   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 애니메이션 토큰 계층 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    Token Hierarchy                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Level 1: Primitive Tokens (원시 값)                         │
│  ├── duration.100 = 100ms                                   │
│  ├── duration.200 = 200ms                                   │
│  ├── spring.damping.low = 8                                 │
│  └── spring.stiffness.medium = 100                          │
│                                                              │
│  Level 2: Semantic Tokens (의미적 값)                        │
│  ├── animation.fast = duration.100                          │
│  ├── animation.normal = duration.200                        │
│  ├── animation.spring.bouncy = {damping.low, stiffness...}  │
│  └── animation.spring.smooth = {damping.high, ...}          │
│                                                              │
│  Level 3: Component Tokens (컴포넌트별)                      │
│  ├── button.press.duration = animation.fast                 │
│  ├── modal.enter.spring = animation.spring.smooth           │
│  └── card.swipe.threshold = 100                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💻 코드 예제

### 예제 1: 애니메이션 토큰 시스템

```typescript
// src/design-system/tokens/animation.tokens.ts
import { Easing } from 'react-native-reanimated';

// ============================================
// Level 1: Primitive Tokens
// ============================================
export const primitiveTokens = {
  // Duration (ms)
  duration: {
    instant: 0,
    fastest: 50,
    faster: 100,
    fast: 150,
    normal: 200,
    slow: 300,
    slower: 400,
    slowest: 500,
  },

  // Spring Damping
  damping: {
    none: 0,
    low: 8,
    medium: 12,
    high: 18,
    critical: 20,
    over: 25,
  },

  // Spring Stiffness
  stiffness: {
    soft: 50,
    light: 80,
    medium: 100,
    firm: 150,
    stiff: 200,
    rigid: 300,
  },

  // Spring Mass
  mass: {
    light: 0.5,
    normal: 1,
    heavy: 1.5,
    massive: 2,
  },

  // Velocity Thresholds
  velocity: {
    slow: 100,
    normal: 300,
    fast: 500,
    rapid: 800,
  },

  // Distance (px)
  distance: {
    tiny: 4,
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 48,
    xxlarge: 100,
  },

  // Scale
  scale: {
    pressed: 0.95,
    subtle: 0.98,
    normal: 1,
    emphasis: 1.05,
    large: 1.1,
  },

  // Opacity
  opacity: {
    hidden: 0,
    faded: 0.3,
    muted: 0.5,
    subtle: 0.7,
    visible: 1,
  },
} as const;

// ============================================
// Level 2: Semantic Tokens
// ============================================
export const semanticTokens = {
  // Timing presets
  timing: {
    instant: {
      duration: primitiveTokens.duration.instant,
    },
    micro: {
      duration: primitiveTokens.duration.fastest,
      easing: Easing.out(Easing.ease),
    },
    fast: {
      duration: primitiveTokens.duration.fast,
      easing: Easing.out(Easing.cubic),
    },
    normal: {
      duration: primitiveTokens.duration.normal,
      easing: Easing.inOut(Easing.ease),
    },
    slow: {
      duration: primitiveTokens.duration.slow,
      easing: Easing.inOut(Easing.cubic),
    },
    deliberate: {
      duration: primitiveTokens.duration.slower,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    },
  },

  // Spring presets
  spring: {
    // 빠르고 정밀한 반응
    snappy: {
      damping: primitiveTokens.damping.high,
      stiffness: primitiveTokens.stiffness.stiff,
      mass: primitiveTokens.mass.light,
    },
    // 자연스러운 바운스
    bouncy: {
      damping: primitiveTokens.damping.low,
      stiffness: primitiveTokens.stiffness.medium,
      mass: primitiveTokens.mass.normal,
    },
    // 부드러운 전환
    smooth: {
      damping: primitiveTokens.damping.medium,
      stiffness: primitiveTokens.stiffness.light,
      mass: primitiveTokens.mass.normal,
    },
    // 느리고 우아한
    gentle: {
      damping: primitiveTokens.damping.over,
      stiffness: primitiveTokens.stiffness.soft,
      mass: primitiveTokens.mass.heavy,
    },
    // 과잉 감쇠 (바운스 없음)
    overdamped: {
      damping: primitiveTokens.damping.critical,
      stiffness: primitiveTokens.stiffness.medium,
      mass: primitiveTokens.mass.normal,
    },
  },

  // Gesture thresholds
  gesture: {
    tap: {
      maxDuration: 200,
      maxDistance: primitiveTokens.distance.small,
    },
    longPress: {
      minDuration: 500,
      maxDistance: primitiveTokens.distance.tiny,
    },
    swipe: {
      threshold: primitiveTokens.distance.xlarge,
      velocityThreshold: primitiveTokens.velocity.normal,
    },
    drag: {
      activationThreshold: primitiveTokens.distance.small,
      velocityDecay: 0.998,
    },
  },

  // Enter/Exit patterns
  transition: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      ...semanticTokens?.timing?.normal,
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 },
      ...semanticTokens?.timing?.fast,
    },
    slideUp: {
      from: { translateY: primitiveTokens.distance.xlarge },
      to: { translateY: 0 },
    },
    slideDown: {
      from: { translateY: -primitiveTokens.distance.xlarge },
      to: { translateY: 0 },
    },
    scaleIn: {
      from: { scale: primitiveTokens.scale.pressed },
      to: { scale: primitiveTokens.scale.normal },
    },
    scaleOut: {
      from: { scale: primitiveTokens.scale.normal },
      to: { scale: primitiveTokens.scale.pressed },
    },
  },
} as const;

// Semantic tokens self-reference fix
semanticTokens.transition.fadeIn = {
  ...semanticTokens.transition.fadeIn,
  duration: primitiveTokens.duration.normal,
  easing: Easing.inOut(Easing.ease),
};

// ============================================
// Level 3: Component Tokens
// ============================================
export const componentTokens = {
  button: {
    press: {
      scale: primitiveTokens.scale.pressed,
      spring: semanticTokens.spring.snappy,
    },
    hover: {
      scale: primitiveTokens.scale.subtle,
      duration: primitiveTokens.duration.faster,
    },
    disabled: {
      opacity: primitiveTokens.opacity.muted,
    },
  },

  card: {
    press: {
      scale: primitiveTokens.scale.subtle,
      spring: semanticTokens.spring.snappy,
    },
    swipe: {
      threshold: primitiveTokens.distance.xxlarge,
      velocityThreshold: primitiveTokens.velocity.fast,
      rotation: 15, // degrees
      spring: semanticTokens.spring.bouncy,
    },
    flip: {
      duration: primitiveTokens.duration.slow,
      easing: Easing.inOut(Easing.ease),
    },
  },

  modal: {
    backdrop: {
      opacity: primitiveTokens.opacity.muted,
      duration: primitiveTokens.duration.normal,
    },
    enter: {
      spring: semanticTokens.spring.smooth,
      initialScale: 0.9,
      initialOpacity: 0,
    },
    exit: {
      duration: primitiveTokens.duration.fast,
      scale: 0.95,
    },
  },

  toast: {
    enter: {
      spring: semanticTokens.spring.bouncy,
      translateY: -100,
    },
    exit: {
      duration: primitiveTokens.duration.fast,
      translateY: -50,
      opacity: 0,
    },
    stayDuration: 3000,
  },

  list: {
    itemPress: {
      scale: primitiveTokens.scale.subtle,
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      spring: semanticTokens.spring.snappy,
    },
    swipeAction: {
      threshold: primitiveTokens.distance.xlarge,
      spring: semanticTokens.spring.smooth,
    },
    stagger: {
      delay: 50,
      spring: semanticTokens.spring.smooth,
    },
  },

  drawer: {
    spring: semanticTokens.spring.smooth,
    velocityThreshold: primitiveTokens.velocity.normal,
    backdropOpacity: primitiveTokens.opacity.muted,
  },

  tab: {
    indicator: {
      spring: semanticTokens.spring.snappy,
    },
    press: {
      scale: primitiveTokens.scale.pressed,
      duration: primitiveTokens.duration.faster,
    },
  },

  skeleton: {
    shimmer: {
      duration: 1200,
      delay: 200,
    },
    pulse: {
      duration: 1500,
      minOpacity: 0.3,
      maxOpacity: 0.7,
    },
  },

  progress: {
    bar: {
      spring: semanticTokens.spring.smooth,
    },
    circular: {
      duration: primitiveTokens.duration.slow,
      easing: Easing.inOut(Easing.ease),
    },
  },

  switch: {
    toggle: {
      spring: semanticTokens.spring.snappy,
    },
    track: {
      duration: primitiveTokens.duration.fast,
    },
  },

  slider: {
    thumb: {
      spring: semanticTokens.spring.snappy,
    },
    track: {
      duration: primitiveTokens.duration.fastest,
    },
  },

  accordion: {
    expand: {
      spring: semanticTokens.spring.smooth,
    },
    collapse: {
      duration: primitiveTokens.duration.fast,
    },
    icon: {
      spring: semanticTokens.spring.snappy,
    },
  },
} as const;

// ============================================
// Token Accessor Functions
// ============================================
export const getSpringConfig = (
  preset: keyof typeof semanticTokens.spring
) => {
  return semanticTokens.spring[preset];
};

export const getTimingConfig = (
  preset: keyof typeof semanticTokens.timing
) => {
  return semanticTokens.timing[preset];
};

export const getComponentAnimation = <
  C extends keyof typeof componentTokens,
  A extends keyof typeof componentTokens[C]
>(
  component: C,
  animation: A
): typeof componentTokens[C][A] => {
  return componentTokens[component][animation];
};

// Type exports
export type PrimitiveTokens = typeof primitiveTokens;
export type SemanticTokens = typeof semanticTokens;
export type ComponentTokens = typeof componentTokens;
export type SpringPreset = keyof typeof semanticTokens.spring;
export type TimingPreset = keyof typeof semanticTokens.timing;
```

### 예제 2: 토큰 기반 애니메이션 훅

```typescript
// src/design-system/hooks/useDesignSystemAnimation.ts
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  WithSpringConfig,
  WithTimingConfig,
} from 'react-native-reanimated';
import {
  semanticTokens,
  componentTokens,
  SpringPreset,
  TimingPreset,
} from '../tokens/animation.tokens';

interface UseTokenAnimationOptions {
  type: 'spring' | 'timing';
  preset?: SpringPreset | TimingPreset;
  customConfig?: Partial<WithSpringConfig | WithTimingConfig>;
}

export function useTokenAnimation(
  initialValue: number,
  options: UseTokenAnimationOptions
) {
  const value = useSharedValue(initialValue);

  const animate = (toValue: number) => {
    'worklet';

    if (options.type === 'spring') {
      const springPreset = options.preset as SpringPreset || 'smooth';
      const baseConfig = semanticTokens.spring[springPreset];
      value.value = withSpring(toValue, {
        ...baseConfig,
        ...options.customConfig,
      });
    } else {
      const timingPreset = options.preset as TimingPreset || 'normal';
      const baseConfig = semanticTokens.timing[timingPreset];
      value.value = withTiming(toValue, {
        ...baseConfig,
        ...options.customConfig,
      });
    }
  };

  return { value, animate };
}

// Component-specific hooks
export function useButtonAnimation() {
  const scale = useSharedValue(1);
  const tokens = componentTokens.button;

  const onPressIn = () => {
    'worklet';
    scale.value = withSpring(tokens.press.scale, tokens.press.spring);
  };

  const onPressOut = () => {
    'worklet';
    scale.value = withSpring(1, tokens.press.spring);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { animatedStyle, onPressIn, onPressOut };
}

export function useCardSwipeAnimation() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const tokens = componentTokens.card;

  const updatePosition = (x: number, y: number) => {
    'worklet';
    translateX.value = x;
    translateY.value = y;
    rotate.value = (x / tokens.swipe.threshold) * tokens.swipe.rotation;
  };

  const resetPosition = () => {
    'worklet';
    translateX.value = withSpring(0, tokens.swipe.spring);
    translateY.value = withSpring(0, tokens.swipe.spring);
    rotate.value = withSpring(0, tokens.swipe.spring);
  };

  const swipeAway = (direction: 'left' | 'right') => {
    'worklet';
    const targetX = direction === 'right' ? 500 : -500;
    translateX.value = withSpring(targetX, tokens.swipe.spring);
    rotate.value = withSpring(
      direction === 'right' ? tokens.swipe.rotation : -tokens.swipe.rotation,
      tokens.swipe.spring
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return {
    translateX,
    translateY,
    animatedStyle,
    updatePosition,
    resetPosition,
    swipeAway,
    threshold: tokens.swipe.threshold,
    velocityThreshold: tokens.swipe.velocityThreshold,
  };
}

export function useModalAnimation() {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(componentTokens.modal.enter.initialScale);
  const backdropOpacity = useSharedValue(0);
  const tokens = componentTokens.modal;

  const open = () => {
    'worklet';
    backdropOpacity.value = withTiming(tokens.backdrop.opacity, {
      duration: tokens.backdrop.duration,
    });
    opacity.value = withSpring(1, tokens.enter.spring);
    scale.value = withSpring(1, tokens.enter.spring);
  };

  const close = () => {
    'worklet';
    backdropOpacity.value = withTiming(0, {
      duration: tokens.exit.duration,
    });
    opacity.value = withTiming(0, { duration: tokens.exit.duration });
    scale.value = withTiming(tokens.exit.scale, {
      duration: tokens.exit.duration,
    });
  };

  const modalStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return { modalStyle, backdropStyle, open, close };
}

export function useListStaggerAnimation(itemCount: number) {
  const tokens = componentTokens.list;
  const animations = Array.from({ length: itemCount }, () => useSharedValue(0));

  const staggerIn = () => {
    animations.forEach((anim, index) => {
      setTimeout(() => {
        anim.value = withSpring(1, tokens.stagger.spring);
      }, index * tokens.stagger.delay);
    });
  };

  const getItemStyle = (index: number) =>
    useAnimatedStyle(() => ({
      opacity: animations[index].value,
      transform: [
        { translateY: (1 - animations[index].value) * 20 },
        { scale: 0.95 + animations[index].value * 0.05 },
      ],
    }));

  return { staggerIn, getItemStyle };
}
```

### 예제 3: Storybook 통합

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-native';

const config: StorybookConfig = {
  stories: [
    '../src/design-system/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../src/components/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-controls',
    '@storybook/addon-actions',
    '@storybook/addon-docs',
    './addons/animation-panel', // Custom addon
  ],
};

export default config;
```

```typescript
// .storybook/addons/animation-panel/register.tsx
import React, { useState } from 'react';
import { addons, types } from '@storybook/addons';
import { AddonPanel } from '@storybook/components';
import { semanticTokens, componentTokens } from '../../../src/design-system/tokens/animation.tokens';

const ADDON_ID = 'animation-panel';
const PANEL_ID = `${ADDON_ID}/panel`;

const AnimationPanel = () => {
  const [selectedCategory, setSelectedCategory] = useState<'spring' | 'timing'>('spring');

  return (
    <div style={{ padding: 16 }}>
      <h3>Animation Tokens</h3>

      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setSelectedCategory('spring')}
          style={{ marginRight: 8, fontWeight: selectedCategory === 'spring' ? 'bold' : 'normal' }}
        >
          Spring Presets
        </button>
        <button
          onClick={() => setSelectedCategory('timing')}
          style={{ fontWeight: selectedCategory === 'timing' ? 'bold' : 'normal' }}
        >
          Timing Presets
        </button>
      </div>

      {selectedCategory === 'spring' && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={cellStyle}>Preset</th>
              <th style={cellStyle}>Damping</th>
              <th style={cellStyle}>Stiffness</th>
              <th style={cellStyle}>Mass</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(semanticTokens.spring).map(([name, config]) => (
              <tr key={name}>
                <td style={cellStyle}><code>{name}</code></td>
                <td style={cellStyle}>{config.damping}</td>
                <td style={cellStyle}>{config.stiffness}</td>
                <td style={cellStyle}>{config.mass}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedCategory === 'timing' && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={cellStyle}>Preset</th>
              <th style={cellStyle}>Duration (ms)</th>
              <th style={cellStyle}>Easing</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(semanticTokens.timing).map(([name, config]) => (
              <tr key={name}>
                <td style={cellStyle}><code>{name}</code></td>
                <td style={cellStyle}>{config.duration}</td>
                <td style={cellStyle}>{config.easing ? 'Custom' : 'None'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const cellStyle = {
  border: '1px solid #ddd',
  padding: 8,
  textAlign: 'left' as const,
};

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Animation Tokens',
    render: ({ active }) => (
      <AddonPanel active={active || false}>
        <AnimationPanel />
      </AddonPanel>
    ),
  });
});
```

```typescript
// src/design-system/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { AnimatedButton } from './AnimatedButton';
import { semanticTokens } from '../../tokens/animation.tokens';

const meta: Meta<typeof AnimatedButton> = {
  title: 'Design System/Animated Components/Button',
  component: AnimatedButton,
  decorators: [
    (Story) => (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    springPreset: {
      control: 'select',
      options: Object.keys(semanticTokens.spring),
      description: 'Spring animation preset',
      table: {
        type: { summary: 'SpringPreset' },
        defaultValue: { summary: 'snappy' },
      },
    },
    pressScale: {
      control: { type: 'range', min: 0.8, max: 1, step: 0.01 },
      description: 'Scale when pressed',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button interactions',
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
# AnimatedButton

Press animation이 적용된 버튼 컴포넌트입니다.

## Animation Tokens Used
- \`componentTokens.button.press.scale\`: Press 시 축소 비율
- \`componentTokens.button.press.spring\`: Spring 설정
- \`componentTokens.button.hover.scale\`: Hover 시 비율

## Usage
\`\`\`tsx
import { AnimatedButton } from '@/design-system';

<AnimatedButton
  onPress={() => console.log('Pressed!')}
  springPreset="snappy"
>
  Click Me
</AnimatedButton>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnimatedButton>;

export const Default: Story = {
  args: {
    children: 'Press Me',
    springPreset: 'snappy',
    pressScale: 0.95,
  },
};

export const Bouncy: Story = {
  args: {
    children: 'Bouncy Button',
    springPreset: 'bouncy',
    pressScale: 0.9,
  },
  parameters: {
    docs: {
      description: {
        story: 'Bouncy spring preset을 사용한 버튼. 누를 때 더 탄력있는 느낌을 줍니다.',
      },
    },
  },
};

export const Smooth: Story = {
  args: {
    children: 'Smooth Button',
    springPreset: 'smooth',
    pressScale: 0.98,
  },
};

export const Interactive: Story = {
  render: () => {
    const [count, setCount] = useState(0);
    return (
      <View style={{ alignItems: 'center', gap: 16 }}>
        <AnimatedButton
          onPress={() => setCount(c => c + 1)}
          springPreset="snappy"
        >
          Count: {count}
        </AnimatedButton>
        <AnimatedButton
          onPress={() => setCount(0)}
          springPreset="smooth"
          variant="secondary"
        >
          Reset
        </AnimatedButton>
      </View>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '인터랙티브 예제. 버튼을 눌러 카운트를 증가시킬 수 있습니다.',
      },
    },
  },
};

// Animation comparison story
export const CompareAnimations: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      {Object.keys(semanticTokens.spring).map((preset) => (
        <AnimatedButton
          key={preset}
          springPreset={preset as keyof typeof semanticTokens.spring}
        >
          {preset}
        </AnimatedButton>
      ))}
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: '모든 spring preset을 비교할 수 있는 스토리입니다. 각 버튼을 눌러보세요.',
      },
    },
  },
};
```

### 예제 4: 애니메이션 문서 자동 생성

```typescript
// scripts/generate-animation-docs.ts
import * as fs from 'fs';
import * as path from 'path';
import {
  primitiveTokens,
  semanticTokens,
  componentTokens,
} from '../src/design-system/tokens/animation.tokens';

interface DocSection {
  title: string;
  content: string;
}

function generateMarkdown(): string {
  const sections: DocSection[] = [];

  // Title and Introduction
  sections.push({
    title: 'Animation Design System',
    content: `
# Animation Design System Documentation

This document provides a comprehensive guide to the animation tokens and patterns used in our design system.

> **Last Generated:** ${new Date().toISOString()}
`,
  });

  // Primitive Tokens
  sections.push({
    title: 'Primitive Tokens',
    content: `
## Primitive Tokens

Base values that form the foundation of our animation system.

### Duration

| Token | Value | Use Case |
|-------|-------|----------|
${Object.entries(primitiveTokens.duration)
  .map(([name, value]) => `| \`duration.${name}\` | ${value}ms | ${getDurationDescription(name)} |`)
  .join('\n')}

### Spring Damping

| Token | Value | Effect |
|-------|-------|--------|
${Object.entries(primitiveTokens.damping)
  .map(([name, value]) => `| \`damping.${name}\` | ${value} | ${getDampingDescription(name)} |`)
  .join('\n')}

### Spring Stiffness

| Token | Value | Effect |
|-------|-------|--------|
${Object.entries(primitiveTokens.stiffness)
  .map(([name, value]) => `| \`stiffness.${name}\` | ${value} | ${getStiffnessDescription(name)} |`)
  .join('\n')}

### Scale Values

| Token | Value | Use Case |
|-------|-------|----------|
${Object.entries(primitiveTokens.scale)
  .map(([name, value]) => `| \`scale.${name}\` | ${value} | ${getScaleDescription(name)} |`)
  .join('\n')}
`,
  });

  // Semantic Tokens
  sections.push({
    title: 'Semantic Tokens',
    content: `
## Semantic Tokens

Meaningful combinations of primitive tokens for common use cases.

### Spring Presets

| Preset | Damping | Stiffness | Mass | Character |
|--------|---------|-----------|------|-----------|
${Object.entries(semanticTokens.spring)
  .map(
    ([name, config]) =>
      `| \`${name}\` | ${config.damping} | ${config.stiffness} | ${config.mass} | ${getSpringCharacter(name)} |`
  )
  .join('\n')}

#### Usage Example

\`\`\`typescript
import { withSpring } from 'react-native-reanimated';
import { semanticTokens } from '@/design-system/tokens';

// Use a spring preset
const config = semanticTokens.spring.snappy;
scale.value = withSpring(1, config);
\`\`\`

### Timing Presets

| Preset | Duration | Easing | Use Case |
|--------|----------|--------|----------|
${Object.entries(semanticTokens.timing)
  .map(
    ([name, config]) =>
      `| \`${name}\` | ${config.duration}ms | ${config.easing ? 'Custom' : 'Linear'} | ${getTimingUseCase(name)} |`
  )
  .join('\n')}

### Gesture Thresholds

| Type | Threshold | Velocity | Description |
|------|-----------|----------|-------------|
| Tap | ${semanticTokens.gesture.tap.maxDistance}px / ${semanticTokens.gesture.tap.maxDuration}ms | - | Quick touch |
| Long Press | ${semanticTokens.gesture.longPress.maxDistance}px | ${semanticTokens.gesture.longPress.minDuration}ms min | Hold gesture |
| Swipe | ${semanticTokens.gesture.swipe.threshold}px | ${semanticTokens.gesture.swipe.velocityThreshold}px/s | Directional swipe |
| Drag | ${semanticTokens.gesture.drag.activationThreshold}px | - | Free movement |
`,
  });

  // Component Tokens
  sections.push({
    title: 'Component Tokens',
    content: `
## Component Tokens

Pre-configured animation values for specific components.

${Object.entries(componentTokens)
  .map(
    ([component, animations]) => `
### ${capitalizeFirst(component)}

${Object.entries(animations)
  .map(
    ([animation, config]) => `
#### ${component}.${animation}

\`\`\`typescript
${JSON.stringify(config, null, 2)}
\`\`\`
`
  )
  .join('\n')}
`
  )
  .join('\n')}
`,
  });

  // Best Practices
  sections.push({
    title: 'Best Practices',
    content: `
## Best Practices

### 1. Always Use Tokens

❌ **Don't:**
\`\`\`typescript
scale.value = withSpring(1, { damping: 12, stiffness: 100 });
\`\`\`

✅ **Do:**
\`\`\`typescript
import { semanticTokens } from '@/design-system/tokens';
scale.value = withSpring(1, semanticTokens.spring.smooth);
\`\`\`

### 2. Use Component Tokens for Component-Specific Animations

\`\`\`typescript
import { componentTokens } from '@/design-system/tokens';

// Button animations
const { scale, spring } = componentTokens.button.press;

// Modal animations
const modalConfig = componentTokens.modal.enter;
\`\`\`

### 3. Create Custom Tokens When Needed

If you need a custom animation that doesn't fit existing tokens, add it to the appropriate level:

\`\`\`typescript
// For a new primitive
primitiveTokens.duration.custom = 175;

// For a new semantic preset
semanticTokens.spring.custom = {
  damping: 14,
  stiffness: 120,
  mass: 1,
};

// For a new component animation
componentTokens.customComponent = {
  enter: { ... },
  exit: { ... },
};
\`\`\`

### 4. Respect Reduced Motion

Always wrap animations with reduced motion checks:

\`\`\`typescript
import { useReducedMotion } from '@/design-system/hooks';

const reduceMotion = useReducedMotion();
const duration = reduceMotion ? 0 : semanticTokens.timing.normal.duration;
\`\`\`
`,
  });

  return sections.map((s) => s.content).join('\n\n---\n\n');
}

// Helper functions
function getDurationDescription(name: string): string {
  const descriptions: Record<string, string> = {
    instant: 'Immediate state changes',
    fastest: 'Micro-interactions (hover states)',
    faster: 'Quick feedback (button press)',
    fast: 'Standard transitions',
    normal: 'Default animation duration',
    slow: 'Deliberate transitions',
    slower: 'Complex animations',
    slowest: 'Dramatic effects',
  };
  return descriptions[name] || '';
}

function getDampingDescription(name: string): string {
  const descriptions: Record<string, string> = {
    none: 'No damping (infinite oscillation)',
    low: 'High bounce, playful feel',
    medium: 'Balanced, natural movement',
    high: 'Reduced bounce, controlled',
    critical: 'No overshoot',
    over: 'Sluggish, heavy feel',
  };
  return descriptions[name] || '';
}

function getStiffnessDescription(name: string): string {
  const descriptions: Record<string, string> = {
    soft: 'Slow, gentle response',
    light: 'Relaxed movement',
    medium: 'Balanced responsiveness',
    firm: 'Quick, responsive',
    stiff: 'Very responsive',
    rigid: 'Near-instant response',
  };
  return descriptions[name] || '';
}

function getScaleDescription(name: string): string {
  const descriptions: Record<string, string> = {
    pressed: 'Active/pressed state',
    subtle: 'Subtle interaction hint',
    normal: 'Default/resting state',
    emphasis: 'Mild emphasis',
    large: 'Strong emphasis',
  };
  return descriptions[name] || '';
}

function getSpringCharacter(name: string): string {
  const characters: Record<string, string> = {
    snappy: 'Quick, precise, professional',
    bouncy: 'Playful, energetic, fun',
    smooth: 'Calm, natural, elegant',
    gentle: 'Slow, peaceful, relaxed',
    overdamped: 'No bounce, direct, controlled',
  };
  return characters[name] || '';
}

function getTimingUseCase(name: string): string {
  const useCases: Record<string, string> = {
    instant: 'Immediate state changes',
    micro: 'Hover effects, small indicators',
    fast: 'Button feedback, toggles',
    normal: 'General transitions',
    slow: 'Modal reveals, page transitions',
    deliberate: 'Emphasis animations',
  };
  return useCases[name] || '';
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Generate and save
const markdown = generateMarkdown();
const outputPath = path.join(__dirname, '../docs/animation-system.md');

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, markdown);

console.log(`Documentation generated at: ${outputPath}`);
```

### 예제 5: 디자인-개발 협업 워크플로우

```typescript
// src/design-system/sync/figma-tokens.ts
// Figma Tokens Plugin 연동을 위한 변환 레이어

import {
  primitiveTokens,
  semanticTokens,
  componentTokens,
} from '../tokens/animation.tokens';

// Figma Tokens 형식으로 변환
export function exportToFigmaTokens() {
  return {
    animation: {
      duration: Object.entries(primitiveTokens.duration).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: {
            value: `${value}ms`,
            type: 'duration',
            description: `Animation duration: ${key}`,
          },
        }),
        {}
      ),

      spring: Object.entries(semanticTokens.spring).reduce(
        (acc, [key, config]) => ({
          ...acc,
          [key]: {
            value: {
              damping: config.damping,
              stiffness: config.stiffness,
              mass: config.mass,
            },
            type: 'spring',
            description: `Spring preset: ${key}`,
          },
        }),
        {}
      ),

      // Component-specific tokens with references
      components: Object.entries(componentTokens).reduce(
        (acc, [component, animations]) => ({
          ...acc,
          [component]: Object.entries(animations).reduce(
            (animAcc, [animName, config]) => ({
              ...animAcc,
              [animName]: {
                value: config,
                type: 'animation',
                description: `${component} ${animName} animation`,
              },
            }),
            {}
          ),
        }),
        {}
      ),
    },
  };
}

// Figma에서 가져온 토큰 적용
export function importFromFigmaTokens(figmaTokens: Record<string, any>) {
  // Validate and merge tokens
  const validatedTokens = validateFigmaTokens(figmaTokens);

  // Update local tokens (in development)
  if (__DEV__) {
    console.log('[Animation Tokens] Imported from Figma:', validatedTokens);
  }

  return validatedTokens;
}

function validateFigmaTokens(tokens: Record<string, any>) {
  const validated: Record<string, any> = {};

  // Validate duration tokens
  if (tokens.animation?.duration) {
    validated.duration = {};
    for (const [key, token] of Object.entries(tokens.animation.duration)) {
      const value = parseInt((token as any).value);
      if (!isNaN(value) && value >= 0 && value <= 2000) {
        validated.duration[key] = value;
      }
    }
  }

  // Validate spring tokens
  if (tokens.animation?.spring) {
    validated.spring = {};
    for (const [key, token] of Object.entries(tokens.animation.spring)) {
      const config = (token as any).value;
      if (
        typeof config.damping === 'number' &&
        typeof config.stiffness === 'number' &&
        typeof config.mass === 'number'
      ) {
        validated.spring[key] = {
          damping: Math.max(0, Math.min(30, config.damping)),
          stiffness: Math.max(10, Math.min(500, config.stiffness)),
          mass: Math.max(0.1, Math.min(5, config.mass)),
        };
      }
    }
  }

  return validated;
}
```

```typescript
// src/design-system/sync/design-handoff.ts
// 디자이너-개발자 핸드오프를 위한 애니메이션 스펙 생성

interface AnimationSpec {
  name: string;
  type: 'spring' | 'timing' | 'sequence';
  description: string;
  preview?: string; // GIF URL
  properties: Record<string, any>;
  states: {
    initial: Record<string, any>;
    final: Record<string, any>;
    intermediate?: Record<string, any>[];
  };
  trigger: 'press' | 'hover' | 'focus' | 'mount' | 'gesture' | 'state-change';
  duration?: number;
  notes?: string[];
}

export function generateAnimationSpec(
  componentName: string,
  animationName: string
): AnimationSpec | null {
  const component = componentTokens[componentName as keyof typeof componentTokens];
  if (!component) return null;

  const animation = component[animationName as keyof typeof component];
  if (!animation) return null;

  // Generate comprehensive spec
  return {
    name: `${componentName}-${animationName}`,
    type: 'spring' in animation ? 'spring' : 'timing',
    description: generateDescription(componentName, animationName),
    properties: animation,
    states: generateStates(componentName, animationName, animation),
    trigger: inferTrigger(animationName),
    duration: 'duration' in animation ? animation.duration : undefined,
    notes: generateNotes(componentName, animationName),
  };
}

function generateDescription(component: string, animation: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    button: {
      press: 'Scale down animation when button is pressed',
      hover: 'Subtle scale increase on hover/focus',
    },
    card: {
      press: 'Slight scale reduction on touch',
      swipe: 'Swipe-to-dismiss with rotation',
      flip: '3D flip animation for card reveal',
    },
    modal: {
      enter: 'Scale and fade in animation',
      exit: 'Quick fade and scale out',
      backdrop: 'Backdrop opacity transition',
    },
    // ... more descriptions
  };

  return descriptions[component]?.[animation] || `${component} ${animation} animation`;
}

function generateStates(
  component: string,
  animation: string,
  config: any
): AnimationSpec['states'] {
  // Generate initial and final states based on animation type
  if (animation === 'press') {
    return {
      initial: { scale: 1 },
      final: { scale: config.scale || 0.95 },
    };
  }

  if (animation === 'enter') {
    return {
      initial: {
        opacity: config.initialOpacity ?? 0,
        scale: config.initialScale ?? 0.9,
      },
      final: { opacity: 1, scale: 1 },
    };
  }

  if (animation === 'swipe') {
    return {
      initial: { translateX: 0, translateY: 0, rotate: 0 },
      final: { translateX: '±500px', translateY: 0, rotate: '±15deg' },
      intermediate: [
        { translateX: '50px', rotate: '5deg' },
        { translateX: '100px', rotate: '10deg' },
      ],
    };
  }

  return {
    initial: {},
    final: {},
  };
}

function inferTrigger(animationName: string): AnimationSpec['trigger'] {
  if (animationName.includes('press')) return 'press';
  if (animationName.includes('hover')) return 'hover';
  if (animationName.includes('enter') || animationName.includes('exit')) return 'mount';
  if (animationName.includes('swipe') || animationName.includes('drag')) return 'gesture';
  return 'state-change';
}

function generateNotes(component: string, animation: string): string[] {
  const notes: string[] = [];

  // Add accessibility notes
  notes.push('Respects reduced-motion preference');

  // Component-specific notes
  if (component === 'card' && animation === 'swipe') {
    notes.push('Threshold: 100px for activation');
    notes.push('Velocity threshold: 500px/s for quick swipe');
    notes.push('Rotation proportional to horizontal translation');
  }

  if (component === 'modal') {
    notes.push('Backdrop blocks interaction during transition');
    notes.push('Focus trapped within modal when open');
  }

  return notes;
}

// Export all component specs for design handoff
export function exportAllSpecs(): Record<string, AnimationSpec[]> {
  const allSpecs: Record<string, AnimationSpec[]> = {};

  for (const [componentName, animations] of Object.entries(componentTokens)) {
    allSpecs[componentName] = [];

    for (const animationName of Object.keys(animations)) {
      const spec = generateAnimationSpec(componentName, animationName);
      if (spec) {
        allSpecs[componentName].push(spec);
      }
    }
  }

  return allSpecs;
}
```

### 예제 6: 버전 관리와 마이그레이션

```typescript
// src/design-system/migrations/index.ts
// 애니메이션 토큰 버전 관리 및 마이그레이션

interface TokenVersion {
  version: string;
  date: string;
  changes: string[];
  breaking: boolean;
}

const VERSION_HISTORY: TokenVersion[] = [
  {
    version: '1.0.0',
    date: '2024-01-15',
    changes: ['Initial animation token system'],
    breaking: false,
  },
  {
    version: '1.1.0',
    date: '2024-02-01',
    changes: [
      'Added gentle spring preset',
      'Added skeleton animation tokens',
    ],
    breaking: false,
  },
  {
    version: '2.0.0',
    date: '2024-03-01',
    changes: [
      'Renamed bouncy to playful (breaking)',
      'Updated default spring damping values',
      'Added slider and switch tokens',
    ],
    breaking: true,
  },
];

export const CURRENT_VERSION = '2.0.0';

// Migration scripts
type MigrationFn = (oldTokens: any) => any;

const migrations: Record<string, MigrationFn> = {
  '1.0.0_to_1.1.0': (tokens) => {
    // Add new tokens, preserve existing
    return {
      ...tokens,
      semanticTokens: {
        ...tokens.semanticTokens,
        spring: {
          ...tokens.semanticTokens.spring,
          gentle: {
            damping: 25,
            stiffness: 50,
            mass: 1.5,
          },
        },
      },
      componentTokens: {
        ...tokens.componentTokens,
        skeleton: {
          shimmer: { duration: 1200, delay: 200 },
          pulse: { duration: 1500, minOpacity: 0.3, maxOpacity: 0.7 },
        },
      },
    };
  },

  '1.1.0_to_2.0.0': (tokens) => {
    // Breaking change: rename bouncy to playful
    const { bouncy, ...restSpring } = tokens.semanticTokens.spring;

    return {
      ...tokens,
      primitiveTokens: {
        ...tokens.primitiveTokens,
        damping: {
          ...tokens.primitiveTokens.damping,
          medium: 15, // Updated from 12
        },
      },
      semanticTokens: {
        ...tokens.semanticTokens,
        spring: {
          ...restSpring,
          playful: bouncy, // Renamed
        },
      },
      componentTokens: {
        ...tokens.componentTokens,
        slider: {
          thumb: { spring: tokens.semanticTokens.spring.snappy },
          track: { duration: 50 },
        },
        switch: {
          toggle: { spring: tokens.semanticTokens.spring.snappy },
          track: { duration: 150 },
        },
      },
    };
  },
};

export function migrateTokens(
  tokens: any,
  fromVersion: string,
  toVersion: string = CURRENT_VERSION
): { tokens: any; migrations: string[] } {
  const appliedMigrations: string[] = [];
  let currentTokens = { ...tokens };

  // Find migration path
  const versionOrder = VERSION_HISTORY.map(v => v.version);
  const startIndex = versionOrder.indexOf(fromVersion);
  const endIndex = versionOrder.indexOf(toVersion);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error(`Invalid version: ${fromVersion} or ${toVersion}`);
  }

  // Apply migrations sequentially
  for (let i = startIndex; i < endIndex; i++) {
    const fromVer = versionOrder[i];
    const toVer = versionOrder[i + 1];
    const migrationKey = `${fromVer}_to_${toVer}`;

    if (migrations[migrationKey]) {
      currentTokens = migrations[migrationKey](currentTokens);
      appliedMigrations.push(migrationKey);
    }
  }

  return {
    tokens: currentTokens,
    migrations: appliedMigrations,
  };
}

// Deprecation warnings
const deprecatedTokens: Record<string, { replacement: string; version: string }> = {
  'semanticTokens.spring.bouncy': {
    replacement: 'semanticTokens.spring.playful',
    version: '2.0.0',
  },
};

export function checkDeprecations(tokenPath: string): void {
  if (__DEV__ && deprecatedTokens[tokenPath]) {
    const { replacement, version } = deprecatedTokens[tokenPath];
    console.warn(
      `[Animation Tokens] Warning: "${tokenPath}" is deprecated since v${version}. ` +
      `Use "${replacement}" instead.`
    );
  }
}

// Codemods for breaking changes
export const codemods = {
  'bouncy-to-playful': {
    description: 'Rename bouncy spring preset to playful',
    pattern: /semanticTokens\.spring\.bouncy/g,
    replacement: 'semanticTokens.spring.playful',
    files: ['**/*.ts', '**/*.tsx'],
  },
  'update-damping-values': {
    description: 'Update hardcoded damping: 12 to use token',
    pattern: /damping:\s*12/g,
    replacement: 'damping: primitiveTokens.damping.medium',
    files: ['**/*.ts', '**/*.tsx'],
  },
};

// Run codemod
export async function runCodemod(modName: keyof typeof codemods): Promise<void> {
  const mod = codemods[modName];
  console.log(`Running codemod: ${mod.description}`);

  // In practice, this would use jscodeshift or similar
  // For now, just log instructions
  console.log(`
To apply this codemod manually:

1. Search for: ${mod.pattern}
2. Replace with: ${mod.replacement}
3. Files to check: ${mod.files.join(', ')}
  `);
}
```

## 🎯 sometimes-app 적용 사례

### 매칭 카드 디자인 시스템 통합

```typescript
// src/features/matching/design-system/matching-card.tokens.ts
import { semanticTokens, primitiveTokens } from '@/design-system/tokens/animation.tokens';

// 매칭 카드 전용 토큰 확장
export const matchingCardTokens = {
  // 카드 스와이프
  swipe: {
    threshold: 120,
    velocityThreshold: 600,
    rotationFactor: 0.1, // translateX * factor = rotation degrees
    spring: semanticTokens.spring.bouncy,
    exitSpring: {
      ...semanticTokens.spring.smooth,
      velocity: 1000,
    },
  },

  // 오버레이 (좋아요/거절)
  overlay: {
    like: {
      color: '#4CAF50',
      threshold: 60, // 표시 시작 임계값
      maxOpacity: 0.8,
    },
    nope: {
      color: '#F44336',
      threshold: 60,
      maxOpacity: 0.8,
    },
    superlike: {
      color: '#2196F3',
      threshold: 80,
      maxOpacity: 0.9,
    },
  },

  // 카드 스택
  stack: {
    maxVisible: 3,
    scaleStep: 0.05, // 각 카드 크기 감소
    translateYStep: -8, // 각 카드 Y 위치 차이
    opacityStep: 0.15,
    spring: semanticTokens.spring.smooth,
  },

  // 되돌리기 애니메이션
  undo: {
    duration: primitiveTokens.duration.slow,
    spring: semanticTokens.spring.gentle,
  },

  // 프로필 상세보기
  detail: {
    expand: {
      spring: semanticTokens.spring.smooth,
      backdropOpacity: 0.6,
    },
    imageZoom: {
      spring: semanticTokens.spring.snappy,
      maxScale: 2.5,
    },
  },

  // 튜토리얼 힌트
  tutorial: {
    swipeHint: {
      distance: 50,
      duration: 1000,
      pauseDuration: 500,
    },
    pulseScale: 1.1,
    pulseDuration: 800,
  },
} as const;

// 타입 export
export type MatchingCardTokens = typeof matchingCardTokens;
```

```typescript
// src/features/matching/hooks/useMatchingCardAnimation.ts
import { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { matchingCardTokens } from '../design-system/matching-card.tokens';

interface UseMatchingCardAnimationProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp?: () => void;
}

export function useMatchingCardAnimation({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
}: UseMatchingCardAnimationProps) {
  const tokens = matchingCardTokens;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const cardContext = useSharedValue({ x: 0, y: 0 });

  // 오버레이 투명도 계산
  const likeOpacity = useSharedValue(0);
  const nopeOpacity = useSharedValue(0);
  const superlikeOpacity = useSharedValue(0);

  const updateOverlays = () => {
    'worklet';
    const x = translateX.value;
    const y = translateY.value;

    // 좋아요 오버레이 (오른쪽)
    if (x > tokens.overlay.like.threshold) {
      likeOpacity.value = Math.min(
        (x - tokens.overlay.like.threshold) / tokens.swipe.threshold,
        tokens.overlay.like.maxOpacity
      );
    } else {
      likeOpacity.value = 0;
    }

    // 거절 오버레이 (왼쪽)
    if (x < -tokens.overlay.nope.threshold) {
      nopeOpacity.value = Math.min(
        (-x - tokens.overlay.nope.threshold) / tokens.swipe.threshold,
        tokens.overlay.nope.maxOpacity
      );
    } else {
      nopeOpacity.value = 0;
    }

    // 슈퍼라이크 오버레이 (위쪽)
    if (y < -tokens.overlay.superlike.threshold) {
      superlikeOpacity.value = Math.min(
        (-y - tokens.overlay.superlike.threshold) / tokens.swipe.threshold,
        tokens.overlay.superlike.maxOpacity
      );
    } else {
      superlikeOpacity.value = 0;
    }
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      cardContext.value = { x: translateX.value, y: translateY.value };
      scale.value = withSpring(1.02, tokens.swipe.spring);
    })
    .onUpdate((event) => {
      translateX.value = cardContext.value.x + event.translationX;
      translateY.value = cardContext.value.y + event.translationY;
      updateOverlays();
    })
    .onEnd((event) => {
      const { velocityX, velocityY } = event;

      // 오른쪽 스와이프 (좋아요)
      if (
        translateX.value > tokens.swipe.threshold ||
        velocityX > tokens.swipe.velocityThreshold
      ) {
        translateX.value = withSpring(500, tokens.swipe.exitSpring, () => {
          runOnJS(onSwipeRight)();
        });
        likeOpacity.value = withTiming(1);
        return;
      }

      // 왼쪽 스와이프 (거절)
      if (
        translateX.value < -tokens.swipe.threshold ||
        velocityX < -tokens.swipe.velocityThreshold
      ) {
        translateX.value = withSpring(-500, tokens.swipe.exitSpring, () => {
          runOnJS(onSwipeLeft)();
        });
        nopeOpacity.value = withTiming(1);
        return;
      }

      // 위쪽 스와이프 (슈퍼라이크)
      if (
        onSwipeUp &&
        (translateY.value < -tokens.swipe.threshold ||
          velocityY < -tokens.swipe.velocityThreshold)
      ) {
        translateY.value = withSpring(-600, tokens.swipe.exitSpring, () => {
          runOnJS(onSwipeUp)();
        });
        superlikeOpacity.value = withTiming(1);
        return;
      }

      // 리셋
      translateX.value = withSpring(0, tokens.swipe.spring);
      translateY.value = withSpring(0, tokens.swipe.spring);
      scale.value = withSpring(1, tokens.swipe.spring);
      likeOpacity.value = withTiming(0);
      nopeOpacity.value = withTiming(0);
      superlikeOpacity.value = withTiming(0);
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${translateX.value * tokens.swipe.rotationFactor}deg` },
      { scale: scale.value },
    ],
  }));

  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: likeOpacity.value,
    backgroundColor: tokens.overlay.like.color,
  }));

  const nopeOverlayStyle = useAnimatedStyle(() => ({
    opacity: nopeOpacity.value,
    backgroundColor: tokens.overlay.nope.color,
  }));

  const superlikeOverlayStyle = useAnimatedStyle(() => ({
    opacity: superlikeOpacity.value,
    backgroundColor: tokens.overlay.superlike.color,
  }));

  // 스택 카드 스타일 생성
  const getStackCardStyle = (index: number) => {
    const stackTokens = tokens.stack;
    return useAnimatedStyle(() => ({
      transform: [
        { scale: 1 - index * stackTokens.scaleStep },
        { translateY: index * stackTokens.translateYStep },
      ],
      opacity: 1 - index * stackTokens.opacityStep,
      zIndex: stackTokens.maxVisible - index,
    }));
  };

  // 되돌리기
  const undo = () => {
    translateX.value = withSpring(0, tokens.undo.spring);
    translateY.value = withSpring(0, tokens.undo.spring);
    scale.value = withSpring(1, tokens.undo.spring);
    likeOpacity.value = withTiming(0, { duration: tokens.undo.duration });
    nopeOpacity.value = withTiming(0, { duration: tokens.undo.duration });
    superlikeOpacity.value = withTiming(0, { duration: tokens.undo.duration });
  };

  return {
    panGesture,
    cardStyle,
    likeOverlayStyle,
    nopeOverlayStyle,
    superlikeOverlayStyle,
    getStackCardStyle,
    undo,
  };
}
```

```typescript
// src/features/matching/components/MatchingCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { MatchingCard } from './MatchingCard';
import { matchingCardTokens } from '../design-system/matching-card.tokens';

const meta: Meta<typeof MatchingCard> = {
  title: 'Features/Matching/MatchingCard',
  component: MatchingCard,
  parameters: {
    docs: {
      description: {
        component: `
# MatchingCard

사용자 프로필을 표시하고 스와이프 제스처로 좋아요/거절을 할 수 있는 카드 컴포넌트입니다.

## Animation Tokens

이 컴포넌트는 \`matchingCardTokens\`를 사용합니다:

| Token | Value | Description |
|-------|-------|-------------|
| swipe.threshold | ${matchingCardTokens.swipe.threshold}px | 스와이프 활성화 임계값 |
| swipe.velocityThreshold | ${matchingCardTokens.swipe.velocityThreshold}px/s | 빠른 스와이프 감지 속도 |
| overlay.like.threshold | ${matchingCardTokens.overlay.like.threshold}px | 좋아요 표시 시작점 |
| stack.maxVisible | ${matchingCardTokens.stack.maxVisible} | 동시 표시 카드 수 |

## Gestures

- **오른쪽 스와이프**: 좋아요
- **왼쪽 스와이프**: 거절
- **위쪽 스와이프**: 슈퍼라이크 (옵션)

## Usage

\`\`\`tsx
<MatchingCard
  user={userData}
  onSwipeLeft={() => handleNope()}
  onSwipeRight={() => handleLike()}
  onSwipeUp={() => handleSuperlike()}
/>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MatchingCard>;

const mockUser = {
  id: '1',
  name: '김소연',
  age: 24,
  university: '서울대학교',
  major: '경영학과',
  images: [
    'https://example.com/photo1.jpg',
    'https://example.com/photo2.jpg',
  ],
  bio: '안녕하세요! 커피와 독서를 좋아합니다 ☕📚',
};

export const Default: Story = {
  args: {
    user: mockUser,
    onSwipeLeft: () => console.log('Nope'),
    onSwipeRight: () => console.log('Like'),
  },
};

export const WithStack: Story = {
  render: () => {
    const users = [mockUser, { ...mockUser, id: '2' }, { ...mockUser, id: '3' }];
    return (
      <View style={{ flex: 1 }}>
        {users.map((user, index) => (
          <MatchingCard
            key={user.id}
            user={user}
            stackIndex={index}
            onSwipeLeft={() => {}}
            onSwipeRight={() => {}}
          />
        ))}
      </View>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '카드 스택 표시. 뒤에 있는 카드들이 점점 작아지고 위로 이동합니다.',
      },
    },
  },
};

export const WithSuperlike: Story = {
  args: {
    user: mockUser,
    onSwipeLeft: () => console.log('Nope'),
    onSwipeRight: () => console.log('Like'),
    onSwipeUp: () => console.log('Superlike!'),
    enableSuperlike: true,
  },
  parameters: {
    docs: {
      description: {
        story: '슈퍼라이크 활성화. 위로 스와이프하면 슈퍼라이크가 전송됩니다.',
      },
    },
  },
};

export const AnimationDemo: Story = {
  render: () => {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ marginBottom: 20, fontSize: 16 }}>
          카드를 드래그해서 애니메이션을 확인하세요:
        </Text>
        <Text>• 오른쪽: 초록색 "LIKE" 오버레이</Text>
        <Text>• 왼쪽: 빨간색 "NOPE" 오버레이</Text>
        <Text>• 위쪽: 파란색 "SUPER" 오버레이</Text>

        <View style={{ marginTop: 20, flex: 1 }}>
          <MatchingCard
            user={mockUser}
            onSwipeLeft={() => console.log('Nope')}
            onSwipeRight={() => console.log('Like')}
            onSwipeUp={() => console.log('Super')}
            enableSuperlike
          />
        </View>
      </View>
    );
  },
};
```

## ⚠️ 흔한 실수와 해결법

### 실수 1: 토큰 대신 하드코딩

```typescript
// ❌ 잘못된 방법 - 하드코딩된 값
const pressStyle = useAnimatedStyle(() => ({
  transform: [{ scale: withSpring(0.95, { damping: 12, stiffness: 100 }) }],
}));

// ✅ 올바른 방법 - 토큰 사용
import { componentTokens } from '@/design-system/tokens/animation.tokens';

const pressStyle = useAnimatedStyle(() => ({
  transform: [{
    scale: withSpring(
      componentTokens.button.press.scale,
      componentTokens.button.press.spring
    )
  }],
}));
```

### 실수 2: 컴포넌트 토큰 없이 semantic 토큰 직접 사용

```typescript
// ❌ 잘못된 방법 - 컴포넌트 특성 무시
const modalAnimation = useModalAnimation(semanticTokens.spring.bouncy);

// ✅ 올바른 방법 - 컴포넌트 전용 토큰 사용
const modalAnimation = useModalAnimation(componentTokens.modal.enter.spring);
// 모달은 bouncy보다 smooth가 적합
```

### 실수 3: 마이그레이션 없이 토큰 변경

```typescript
// ❌ 잘못된 방법 - 직접 토큰 수정
semanticTokens.spring.smooth.damping = 15; // 기존: 12

// ✅ 올바른 방법 - 마이그레이션 스크립트 작성
// migrations/1.1.0_to_1.2.0.ts
export const migration = (tokens) => ({
  ...tokens,
  semanticTokens: {
    ...tokens.semanticTokens,
    spring: {
      ...tokens.semanticTokens.spring,
      smooth: { ...tokens.semanticTokens.spring.smooth, damping: 15 },
    },
  },
});
```

## 💡 팁

### 팁 1: 토큰 자동완성 설정

```typescript
// tsconfig.json paths 설정
{
  "compilerOptions": {
    "paths": {
      "@tokens/*": ["src/design-system/tokens/*"],
      "@animations/*": ["src/design-system/hooks/*"]
    }
  }
}

// 사용
import { semanticTokens } from '@tokens/animation.tokens';
import { useButtonAnimation } from '@animations/useDesignSystemAnimation';
```

### 팁 2: 개발 중 토큰 오버라이드

```typescript
// 개발 환경에서만 토큰 조정 가능
const DevTokenOverride = ({ children }) => {
  if (!__DEV__) return children;

  const [overrides, setOverrides] = useState({});

  return (
    <TokenOverrideContext.Provider value={{ overrides, setOverrides }}>
      {children}
      <TokenDebugPanel />
    </TokenOverrideContext.Provider>
  );
};
```

### 팁 3: Storybook에서 토큰 실시간 수정

```typescript
// .storybook/decorators/TokenPlayground.tsx
export const TokenPlayground = (Story, context) => {
  const { springPreset, duration } = context.args;

  return (
    <TokenContext.Provider value={{ springPreset, duration }}>
      <Story />
    </TokenContext.Provider>
  );
};
```

## 🏋️ 연습 문제

### 문제 1: 알림 토스트 토큰 설계

알림 토스트 컴포넌트를 위한 토큰을 설계하세요:
- 진입/퇴장 애니메이션
- 유형별 다른 지속 시간 (info, success, error, warning)
- 스택 동작 (여러 토스트가 쌓일 때)

<details>
<summary>정답 보기</summary>

```typescript
export const toastTokens = {
  enter: {
    spring: semanticTokens.spring.bouncy,
    translateY: -100, // 위에서 내려옴
    initialOpacity: 0,
  },

  exit: {
    duration: primitiveTokens.duration.fast,
    translateX: 100, // 오른쪽으로 사라짐
    opacity: 0,
  },

  duration: {
    info: 3000,
    success: 2000,
    warning: 4000,
    error: 5000, // 에러는 더 오래 표시
  },

  stack: {
    maxVisible: 3,
    spacing: 8,
    staggerDelay: 100,
    collapseSpring: semanticTokens.spring.smooth,
  },

  swipeDismiss: {
    threshold: 60,
    velocityThreshold: 400,
  },

  progress: {
    height: 3,
    color: {
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
    },
  },
} as const;
```
</details>

### 문제 2: 디자인 핸드오프 문서 작성

`componentTokens.button`에 대한 디자인 핸드오프 문서를 작성하세요.

<details>
<summary>정답 보기</summary>

```markdown
# Button Animation Specification

## Overview
버튼 컴포넌트의 인터랙션 애니메이션 스펙입니다.

## Press Animation

### Trigger
- 사용자가 버튼을 터치할 때

### States
| State | Scale | Duration |
|-------|-------|----------|
| Resting | 1.0 | - |
| Pressed | 0.95 | Spring (snappy) |
| Released | 1.0 | Spring (snappy) |

### Spring Configuration
- Damping: 18
- Stiffness: 200
- Mass: 0.5

### Visual Reference
[GIF: button-press.gif]

## Hover Animation (Web/Desktop)

### Trigger
- 마우스 커서가 버튼 위에 올라갈 때

### States
| State | Scale | Duration |
|-------|-------|----------|
| Normal | 1.0 | - |
| Hovered | 0.98 | 100ms |

## Disabled State

### Visual Changes
- Opacity: 0.5
- No animation response

## Accessibility Notes
- Reduced motion 설정 시 scale 애니메이션 비활성화
- Press feedback은 opacity 변화로 대체

## Implementation Notes
- 연속 빠른 탭 시에도 애니메이션 부드럽게 처리
- 탭 중 드래그 아웃 시 정상 상태로 복귀
```
</details>

### 문제 3: 토큰 마이그레이션 스크립트

`button.press.scale`이 0.95에서 0.96으로 변경되는 마이그레이션을 작성하세요.

<details>
<summary>정답 보기</summary>

```typescript
// migrations/2.0.0_to_2.1.0.ts
export const migration = {
  version: '2.1.0',
  date: '2024-04-01',
  description: 'Update button press scale for subtler effect',
  breaking: false,

  transform: (tokens: any) => ({
    ...tokens,
    componentTokens: {
      ...tokens.componentTokens,
      button: {
        ...tokens.componentTokens.button,
        press: {
          ...tokens.componentTokens.button.press,
          scale: 0.96, // Updated from 0.95
        },
      },
    },
  }),

  // Codemod for hardcoded values
  codemod: {
    pattern: /scale:\s*0\.95(?!\d)/g,
    replacement: 'scale: componentTokens.button.press.scale',
    description: 'Replace hardcoded 0.95 scale with token reference',
  },

  // Validation
  validate: (oldTokens: any, newTokens: any) => {
    return (
      newTokens.componentTokens.button.press.scale === 0.96 &&
      newTokens.componentTokens.button.press.spring === oldTokens.componentTokens.button.press.spring
    );
  },
};
```
</details>

## 📚 이 장에서 배운 내용

1. **토큰 계층 구조**: Primitive → Semantic → Component 3단계
2. **Storybook 통합**: 애니메이션 문서화와 인터랙티브 데모
3. **디자인 협업**: Figma Tokens 연동과 핸드오프 문서
4. **버전 관리**: 마이그레이션 스크립트와 deprecation 경고
5. **실무 적용**: sometimes-app 매칭 카드 디자인 시스템

## 🎉 Part 9 완료!

축하합니다! **Part 9: 애니메이션 설계 패턴**을 완료했습니다.

이 파트에서 다룬 내용:
- 컴포넌트 아키텍처와 합성 패턴
- 상태 관리와 전역 애니메이션 동기화
- 훅 합성과 재사용 전략
- 테스팅 전략과 자동화
- 접근성과 Reduce Motion 대응
- 다크모드와 테마 전환
- 국제화와 RTL 지원
- 디자인 시스템 통합

**다음 장 예고**: **Part 10: 트러블슈팅 가이드**에서는 실무에서 마주치는 다양한 문제들을 해결하는 방법을 배웁니다. 성능 문제, 제스처 충돌, 플랫폼별 이슈 등 실전 디버깅 기법을 다룹니다.
