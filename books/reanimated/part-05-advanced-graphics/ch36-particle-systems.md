# Chapter 36: 파티클 시스템

수백 개의 입자를 효율적으로 관리하고 애니메이션하는 파티클 시스템을 구현합니다. 눈, 불꽃, 폭발, 색종이 등 다양한 시각 효과를 다룹니다.

## 📌 학습 목표

- 파티클 시스템 아키텍처
- 물리 시뮬레이션 (중력, 마찰, 바람)
- 파티클 생성과 수명 주기
- 다양한 파티클 효과 구현
- 성능 최적화 전략

## 📖 파티클 시스템 기초

### 파티클이란?

```
┌────────────────────────────────────────────────────────┐
│                    파티클 시스템                        │
├────────────────────────────────────────────────────────┤
│                                                         │
│   Emitter (방출기)                                      │
│      │                                                  │
│      ├─── 파티클 1: { x, y, vx, vy, life, size, color } │
│      ├─── 파티클 2: { x, y, vx, vy, life, size, color } │
│      ├─── 파티클 3: { x, y, vx, vy, life, size, color } │
│      │    ...                                           │
│      └─── 파티클 N                                      │
│                                                         │
│   매 프레임:                                            │
│   1. 새 파티클 생성 (spawn rate)                        │
│   2. 물리 업데이트 (위치, 속도, 가속도)                 │
│   3. 수명 감소                                          │
│   4. 죽은 파티클 제거                                   │
│   5. 렌더링                                             │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### 기본 파티클 타입 정의

```typescript
// types/particle.ts
export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;      // velocity X
  vy: number;      // velocity Y
  ax: number;      // acceleration X
  ay: number;      // acceleration Y
  life: number;    // 0 to 1 (1 = new, 0 = dead)
  decay: number;   // life 감소 속도
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export interface EmitterConfig {
  x: number;
  y: number;
  angle: number;           // 방출 방향 (라디안)
  spread: number;          // 퍼짐 각도
  speed: { min: number; max: number };
  size: { min: number; max: number };
  life: { min: number; max: number };
  colors: string[];
  gravity: number;
  wind: number;
  spawnRate: number;       // 초당 생성 수
  maxParticles: number;
}
```

## 💻 기본 파티클 엔진

### 파티클 엔진 구현

```typescript
// engine/ParticleEngine.ts
import { Particle, EmitterConfig } from '../types/particle';

export class ParticleEngine {
  private particles: Particle[] = [];
  private config: EmitterConfig;
  private idCounter = 0;
  private accumulator = 0;

  constructor(config: EmitterConfig) {
    this.config = config;
  }

  private generateId(): string {
    return `particle_${this.idCounter++}`;
  }

  private randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  private createParticle(): Particle {
    const { x, y, angle, spread, speed, size, life, colors, gravity } = this.config;

    const particleAngle = angle + (Math.random() - 0.5) * spread;
    const particleSpeed = this.randomInRange(speed.min, speed.max);

    return {
      id: this.generateId(),
      x,
      y,
      vx: Math.cos(particleAngle) * particleSpeed,
      vy: Math.sin(particleAngle) * particleSpeed,
      ax: 0,
      ay: gravity,
      life: 1,
      decay: 1 / this.randomInRange(life.min, life.max),
      size: this.randomInRange(size.min, size.max),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      opacity: 1,
    };
  }

  public update(deltaTime: number): void {
    const { spawnRate, maxParticles, wind } = this.config;

    // 새 파티클 생성
    this.accumulator += deltaTime * spawnRate;
    while (this.accumulator >= 1 && this.particles.length < maxParticles) {
      this.particles.push(this.createParticle());
      this.accumulator -= 1;
    }

    // 파티클 업데이트
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // 물리 업데이트
      p.vx += (p.ax + wind) * deltaTime;
      p.vy += p.ay * deltaTime;
      p.x += p.vx * deltaTime * 60;
      p.y += p.vy * deltaTime * 60;

      // 회전
      p.rotation += p.rotationSpeed;

      // 수명 감소
      p.life -= p.decay * deltaTime;
      p.opacity = p.life;

      // 죽은 파티클 제거
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public getParticles(): Particle[] {
    return this.particles;
  }

  public emit(count: number): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length < this.config.maxParticles) {
        this.particles.push(this.createParticle());
      }
    }
  }

  public clear(): void {
    this.particles = [];
  }

  public updateConfig(config: Partial<EmitterConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
```

### React 컴포넌트와 통합

```typescript
// components/ParticleView.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useFrameCallback,
  runOnJS,
} from 'react-native-reanimated';
import { ParticleEngine } from '../engine/ParticleEngine';
import { Particle, EmitterConfig } from '../types/particle';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DEFAULT_CONFIG: EmitterConfig = {
  x: SCREEN_WIDTH / 2,
  y: SCREEN_HEIGHT / 2,
  angle: -Math.PI / 2, // 위로
  spread: Math.PI / 4, // 45도 퍼짐
  speed: { min: 2, max: 5 },
  size: { min: 4, max: 8 },
  life: { min: 1, max: 2 },
  colors: ['#7A4AE2', '#E24A7A', '#4AE27A', '#FFD600'],
  gravity: 0.2,
  wind: 0,
  spawnRate: 30,
  maxParticles: 200,
};

interface ParticleViewProps {
  config?: Partial<EmitterConfig>;
  active?: boolean;
}

function ParticleView({ config, active = true }: ParticleViewProps) {
  const engineRef = useRef<ParticleEngine>();
  const [particles, setParticles] = React.useState<Particle[]>([]);
  const lastTimeRef = useRef<number>(Date.now());

  // 엔진 초기화
  useEffect(() => {
    engineRef.current = new ParticleEngine({ ...DEFAULT_CONFIG, ...config });
  }, [config]);

  // 프레임 콜백
  useFrameCallback(() => {
    if (!active || !engineRef.current) return;

    const now = Date.now();
    const deltaTime = (now - lastTimeRef.current) / 1000;
    lastTimeRef.current = now;

    engineRef.current.update(deltaTime);

    runOnJS(setParticles)([...engineRef.current.getParticles()]);
  });

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <ParticleItem key={particle.id} particle={particle} />
      ))}
    </View>
  );
}

interface ParticleItemProps {
  particle: Particle;
}

const ParticleItem = React.memo(function ParticleItem({ particle }: ParticleItemProps) {
  return (
    <View
      style={[
        styles.particle,
        {
          left: particle.x - particle.size / 2,
          top: particle.y - particle.size / 2,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
          opacity: particle.opacity,
          transform: [{ rotate: `${particle.rotation}rad` }],
        },
      ]}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
  },
});

export default ParticleView;
```

## 💻 다양한 파티클 효과

### 폭죽 효과

```typescript
// components/Fireworks.tsx
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  useFrameCallback,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FireworkParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  decay: number;
  trail: { x: number; y: number }[];
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
];

function Fireworks() {
  const [particles, setParticles] = useState<FireworkParticle[]>([]);
  const [rockets, setRockets] = useState<{ x: number; y: number; targetY: number; color: string }[]>([]);
  const particleIdRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  const createExplosion = useCallback((x: number, y: number) => {
    const particleCount = 50 + Math.floor(Math.random() * 30);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newParticles: FireworkParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.2;
      const speed = 2 + Math.random() * 4;

      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 3,
        life: 1,
        decay: 0.015 + Math.random() * 0.01,
        trail: [],
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  const launchRocket = useCallback((x: number) => {
    const targetY = 100 + Math.random() * (SCREEN_HEIGHT / 3);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    setRockets((prev) => [...prev, { x, y: SCREEN_HEIGHT, targetY, color }]);

    // 로켓이 목표 지점에 도달하면 폭발
    setTimeout(() => {
      createExplosion(x, targetY);
      setRockets((prev) => prev.filter((r) => !(r.x === x && r.targetY === targetY)));
    }, 800);
  }, [createExplosion]);

  // 파티클 업데이트
  useFrameCallback(() => {
    const now = Date.now();
    const deltaTime = (now - lastTimeRef.current) / 1000;
    lastTimeRef.current = now;

    setParticles((prev) => {
      const updated = prev
        .map((p) => {
          // 트레일 업데이트
          const newTrail = [...p.trail, { x: p.x, y: p.y }].slice(-5);

          return {
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15, // 중력
            vx: p.vx * 0.99, // 마찰
            life: p.life - p.decay,
            size: p.size * 0.98,
            trail: newTrail,
          };
        })
        .filter((p) => p.life > 0);

      return updated;
    });
  });

  const handlePress = (event: any) => {
    const { locationX } = event.nativeEvent;
    launchRocket(locationX);
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      {/* 로켓 */}
      {rockets.map((rocket, index) => (
        <RocketTrail key={index} rocket={rocket} />
      ))}

      {/* 파티클 */}
      {particles.map((particle) => (
        <FireworkParticleView key={particle.id} particle={particle} />
      ))}

      <Text style={styles.hint}>Tap to launch fireworks</Text>
    </Pressable>
  );
}

interface RocketTrailProps {
  rocket: { x: number; y: number; targetY: number; color: string };
}

function RocketTrail({ rocket }: RocketTrailProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 800 });
  }, []);

  const style = useAnimatedStyle(() => ({
    left: rocket.x - 3,
    top: SCREEN_HEIGHT - (SCREEN_HEIGHT - rocket.targetY) * progress.value,
  }));

  return (
    <Animated.View style={[styles.rocket, style]}>
      <View style={[styles.rocketBody, { backgroundColor: rocket.color }]} />
    </Animated.View>
  );
}

interface FireworkParticleViewProps {
  particle: FireworkParticle;
}

function FireworkParticleView({ particle }: FireworkParticleViewProps) {
  return (
    <>
      {/* 트레일 */}
      {particle.trail.map((point, index) => (
        <View
          key={index}
          style={[
            styles.trail,
            {
              left: point.x - 1,
              top: point.y - 1,
              width: 2,
              height: 2,
              backgroundColor: particle.color,
              opacity: (index / particle.trail.length) * particle.life * 0.5,
            },
          ]}
        />
      ))}

      {/* 파티클 */}
      <View
        style={[
          styles.particle,
          {
            left: particle.x - particle.size / 2,
            top: particle.y - particle.size / 2,
            width: particle.size,
            height: particle.size,
            borderRadius: particle.size / 2,
            backgroundColor: particle.color,
            opacity: particle.life,
            shadowColor: particle.color,
            shadowRadius: particle.size * 2,
            shadowOpacity: particle.life,
          },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  rocket: {
    position: 'absolute',
    width: 6,
    height: 20,
  },
  rocketBody: {
    width: 4,
    height: 12,
    borderRadius: 2,
  },
  trail: {
    position: 'absolute',
    borderRadius: 1,
  },
  particle: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
  },
  hint: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
  },
});

export default Fireworks;
```

### 눈 내리는 효과

```typescript
// components/SnowEffect.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useFrameCallback } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Snowflake {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  wobble: number;
  wobbleSpeed: number;
  opacity: number;
}

const SNOWFLAKE_COUNT = 100;

function SnowEffect() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
  const timeRef = useRef(0);
  const idRef = useRef(0);

  // 초기 눈송이 생성
  useEffect(() => {
    const initial: Snowflake[] = [];
    for (let i = 0; i < SNOWFLAKE_COUNT; i++) {
      initial.push(createSnowflake(Math.random() * SCREEN_HEIGHT));
    }
    setSnowflakes(initial);
  }, []);

  function createSnowflake(startY: number = -10): Snowflake {
    return {
      id: idRef.current++,
      x: Math.random() * SCREEN_WIDTH,
      y: startY,
      size: 2 + Math.random() * 6,
      speed: 0.5 + Math.random() * 1.5,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      opacity: 0.4 + Math.random() * 0.6,
    };
  }

  useFrameCallback(({ timeSincePreviousFrame }) => {
    if (!timeSincePreviousFrame) return;

    const deltaTime = timeSincePreviousFrame / 1000;
    timeRef.current += deltaTime;

    setSnowflakes((prev) => {
      return prev.map((flake) => {
        let newY = flake.y + flake.speed;
        let newWobble = flake.wobble + flake.wobbleSpeed;
        let newX = flake.x + Math.sin(newWobble) * 0.5;

        // 화면 아래로 나가면 위에서 다시 시작
        if (newY > SCREEN_HEIGHT + 10) {
          return createSnowflake();
        }

        // 화면 좌우 래핑
        if (newX < -10) newX = SCREEN_WIDTH + 10;
        if (newX > SCREEN_WIDTH + 10) newX = -10;

        return {
          ...flake,
          x: newX,
          y: newY,
          wobble: newWobble,
        };
      });
    });
  });

  return (
    <View style={styles.container} pointerEvents="none">
      {snowflakes.map((flake) => (
        <View
          key={flake.id}
          style={[
            styles.snowflake,
            {
              left: flake.x,
              top: flake.y,
              width: flake.size,
              height: flake.size,
              borderRadius: flake.size / 2,
              opacity: flake.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  snowflake: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 3,
    shadowOpacity: 0.8,
  },
});

export default SnowEffect;
```

### 색종이 효과 (Confetti)

```typescript
// components/Confetti.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  useFrameCallback,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  width: number;
  height: number;
  wobble: number;
  wobbleSpeed: number;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#7A4AE2', '#E24A7A',
];

interface ConfettiProps {
  count?: number;
  trigger?: boolean;
  onComplete?: () => void;
}

function Confetti({ count = 100, trigger = false, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const idRef = useRef(0);
  const isActiveRef = useRef(false);

  const createPiece = useCallback((): ConfettiPiece => {
    const startX = SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 100;

    return {
      id: idRef.current++,
      x: startX,
      y: -20,
      vx: (Math.random() - 0.5) * 8,
      vy: 2 + Math.random() * 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      width: 8 + Math.random() * 8,
      height: 4 + Math.random() * 6,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.1 + Math.random() * 0.1,
    };
  }, []);

  useEffect(() => {
    if (trigger) {
      isActiveRef.current = true;
      const newPieces: ConfettiPiece[] = [];
      for (let i = 0; i < count; i++) {
        newPieces.push(createPiece());
      }
      setPieces(newPieces);
    }
  }, [trigger, count, createPiece]);

  useFrameCallback(({ timeSincePreviousFrame }) => {
    if (!isActiveRef.current || !timeSincePreviousFrame) return;

    setPieces((prev) => {
      const updated = prev
        .map((piece) => ({
          ...piece,
          x: piece.x + piece.vx + Math.sin(piece.wobble) * 2,
          y: piece.y + piece.vy,
          vy: piece.vy + 0.1, // 중력
          vx: piece.vx * 0.99, // 마찰
          rotation: piece.rotation + piece.rotationSpeed,
          wobble: piece.wobble + piece.wobbleSpeed,
        }))
        .filter((piece) => piece.y < SCREEN_HEIGHT + 50);

      if (updated.length === 0 && prev.length > 0) {
        isActiveRef.current = false;
        if (onComplete) {
          runOnJS(onComplete)();
        }
      }

      return updated;
    });
  });

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.map((piece) => (
        <View
          key={piece.id}
          style={[
            styles.piece,
            {
              left: piece.x,
              top: piece.y,
              width: piece.width,
              height: piece.height,
              backgroundColor: piece.color,
              transform: [
                { rotate: `${piece.rotation}deg` },
                { rotateX: `${Math.sin(piece.wobble) * 60}deg` },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

// 데모 컴포넌트
function ConfettiDemo() {
  const [trigger, setTrigger] = useState(false);

  const handlePress = () => {
    setTrigger(true);
    setTimeout(() => setTrigger(false), 100);
  };

  return (
    <View style={styles.demo}>
      <Pressable style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>🎉 Celebrate!</Text>
      </Pressable>

      <Confetti trigger={trigger} count={150} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  piece: {
    position: 'absolute',
    borderRadius: 2,
  },
  demo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  button: {
    backgroundColor: '#7A4AE2',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
});

export { Confetti, ConfettiDemo };
export default Confetti;
```

## 💻 Skia를 활용한 고성능 파티클

### Skia 파티클 시스템

```typescript
// components/SkiaParticles.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Blur,
  vec,
  useDerivedValue,
  useClockValue,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue as useDerivedValueReanimated,
  withRepeat,
  withTiming,
  useFrameCallback,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SkiaParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
  life: number;
  decay: number;
}

const MAX_PARTICLES = 300;

function SkiaParticles() {
  const particlesRef = useRef<SkiaParticle[]>([]);
  const [, forceUpdate] = useState(0);
  const clock = useClockValue();

  const createParticle = (x: number, y: number): SkiaParticle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;

    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 3 + Math.random() * 5,
      hue: Math.random() * 360,
      life: 1,
      decay: 0.01 + Math.random() * 0.02,
    };
  };

  useFrameCallback(({ timeSincePreviousFrame }) => {
    if (!timeSincePreviousFrame) return;

    const particles = particlesRef.current;

    // 새 파티클 추가 (중앙에서 방출)
    if (particles.length < MAX_PARTICLES) {
      for (let i = 0; i < 3; i++) {
        particles.push(createParticle(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2));
      }
    }

    // 파티클 업데이트
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // 중력
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }

    runOnJS(forceUpdate)((n) => n + 1);
  });

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {particlesRef.current.map((particle, index) => (
          <Group key={index} opacity={particle.life}>
            {/* 글로우 효과 */}
            <Circle
              cx={particle.x}
              cy={particle.y}
              r={particle.size * 2}
              color={`hsla(${particle.hue}, 80%, 60%, 0.3)`}
            >
              <Blur blur={particle.size} />
            </Circle>

            {/* 메인 파티클 */}
            <Circle
              cx={particle.x}
              cy={particle.y}
              r={particle.size * particle.life}
              color={`hsl(${particle.hue}, 80%, 60%)`}
            />
          </Group>
        ))}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  canvas: {
    flex: 1,
  },
});

export default SkiaParticles;
```

### 불꽃 효과

```typescript
// components/FireEffect.tsx
import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Blur,
  LinearGradient,
  vec,
} from '@shopify/react-native-skia';
import { useFrameCallback, runOnJS } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FireParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  hue: number; // 0 = red, 60 = yellow
}

const FIRE_X = SCREEN_WIDTH / 2;
const FIRE_Y = SCREEN_HEIGHT * 0.7;

function FireEffect() {
  const particlesRef = useRef<FireParticle[]>([]);
  const [, forceUpdate] = useState(0);

  const createParticle = (): FireParticle => {
    const spread = 30;

    return {
      x: FIRE_X + (Math.random() - 0.5) * spread,
      y: FIRE_Y,
      vx: (Math.random() - 0.5) * 1,
      vy: -2 - Math.random() * 3,
      size: 10 + Math.random() * 20,
      life: 1,
      hue: 0 + Math.random() * 40, // 빨강~주황
    };
  };

  useFrameCallback(() => {
    const particles = particlesRef.current;

    // 새 파티클 생성
    for (let i = 0; i < 5; i++) {
      if (particles.length < 150) {
        particles.push(createParticle());
      }
    }

    // 업데이트
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      p.x += p.vx + (Math.random() - 0.5) * 2;
      p.y += p.vy;
      p.vy *= 0.98; // 감속
      p.life -= 0.02;
      p.size *= 0.98;
      p.hue += 2; // 빨강 → 노랑으로 변화

      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }

    runOnJS(forceUpdate)((n) => n + 1);
  });

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {/* 불꽃 파티클 */}
        {particlesRef.current.map((particle, index) => (
          <Group key={index} opacity={particle.life}>
            {/* 외부 글로우 */}
            <Circle
              cx={particle.x}
              cy={particle.y}
              r={particle.size * 1.5}
              color={`hsla(${particle.hue}, 100%, 50%, 0.2)`}
            >
              <Blur blur={particle.size} />
            </Circle>

            {/* 내부 밝은 부분 */}
            <Circle
              cx={particle.x}
              cy={particle.y}
              r={particle.size * 0.5}
              color={`hsl(${Math.min(particle.hue + 20, 60)}, 100%, 70%)`}
            />

            {/* 메인 불꽃 */}
            <Circle
              cx={particle.x}
              cy={particle.y}
              r={particle.size}
              color={`hsl(${particle.hue}, 100%, 50%)`}
            />
          </Group>
        ))}

        {/* 불꽃 베이스 글로우 */}
        <Circle
          cx={FIRE_X}
          cy={FIRE_Y}
          r={50}
          color="rgba(255, 100, 0, 0.3)"
        >
          <Blur blur={30} />
        </Circle>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  canvas: {
    flex: 1,
  },
});

export default FireEffect;
```

## 💻 sometimes-app 적용 사례

### 매칭 성공 축하 효과

```typescript
// src/features/matching/ui/match-celebration.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  runOnJS,
  useFrameCallback,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import colors from '@/src/shared/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  life: number;
  delay: number;
}

interface MatchCelebrationProps {
  isVisible: boolean;
  partnerName: string;
  onAnimationComplete?: () => void;
}

function MatchCelebration({
  isVisible,
  partnerName,
  onAnimationComplete,
}: MatchCelebrationProps) {
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  const heartIdRef = useRef(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  const createHeart = useCallback((delay: number = 0): HeartParticle => {
    const startX = SCREEN_WIDTH / 2;
    const startY = SCREEN_HEIGHT / 2;
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 5;

    return {
      id: heartIdRef.current++,
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      size: 20 + Math.random() * 20,
      life: 1,
      delay,
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      // 하트 생성
      const newHearts: HeartParticle[] = [];
      for (let i = 0; i < 30; i++) {
        newHearts.push(createHeart(i * 50));
      }
      setHearts(newHearts);

      // 메인 애니메이션
      scale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 12 })
      );

      opacity.value = withTiming(1, { duration: 300 });

      textOpacity.value = withDelay(
        500,
        withTiming(1, { duration: 500 })
      );

      // 완료 콜백
      setTimeout(() => {
        onAnimationComplete?.();
      }, 3000);
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0);
      textOpacity.value = 0;
      setHearts([]);
    }
  }, [isVisible, createHeart, scale, opacity, textOpacity, onAnimationComplete]);

  useFrameCallback(({ timeSincePreviousFrame }) => {
    if (!isVisible || !timeSincePreviousFrame) return;

    const now = Date.now();

    setHearts((prev) =>
      prev
        .map((heart) => {
          if (heart.delay > now - heartIdRef.current * 50) {
            return heart;
          }

          return {
            ...heart,
            x: heart.x + heart.vx,
            y: heart.y + heart.vy,
            vy: heart.vy + 0.1,
            rotation: heart.rotation + heart.rotationSpeed,
            life: heart.life - 0.01,
          };
        })
        .filter((heart) => heart.life > 0)
    );
  });

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const heartContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [
      { translateY: (1 - textOpacity.value) * 20 },
    ],
  }));

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <BlurView intensity={20} style={StyleSheet.absoluteFill} />

      {/* 하트 파티클 */}
      {hearts.map((heart) => (
        <Text
          key={heart.id}
          style={[
            styles.heartParticle,
            {
              left: heart.x - heart.size / 2,
              top: heart.y - heart.size / 2,
              fontSize: heart.size,
              opacity: heart.life,
              transform: [{ rotate: `${heart.rotation}deg` }],
            },
          ]}
        >
          💜
        </Text>
      ))}

      {/* 메인 하트 */}
      <Animated.View style={[styles.mainHeartContainer, heartContainerStyle]}>
        <Text style={styles.mainHeart}>💜</Text>
      </Animated.View>

      {/* 축하 텍스트 */}
      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.congratsText}>축하해요!</Text>
        <Text style={styles.matchText}>
          {partnerName}님과 매칭되었어요
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  heartParticle: {
    position: 'absolute',
  },
  mainHeartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainHeart: {
    fontSize: 120,
  },
  textContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.25,
    alignItems: 'center',
  },
  congratsText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  matchText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});

export default MatchCelebration;
```

## ⚠️ 흔한 실수와 해결법

### 1. 메모리 누수

```typescript
// ❌ 잘못된 예: 파티클 배열이 계속 증가
particles.push(newParticle);

// ✅ 올바른 예: 최대 개수 제한
if (particles.length < MAX_PARTICLES) {
  particles.push(newParticle);
}

// 또는 오래된 파티클 재사용 (Object Pool)
const deadParticle = particles.find(p => p.life <= 0);
if (deadParticle) {
  Object.assign(deadParticle, newParticleData);
} else if (particles.length < MAX_PARTICLES) {
  particles.push(newParticle);
}
```

### 2. 프레임 드롭

```typescript
// ❌ 잘못된 예: 매번 새 컴포넌트 생성
{particles.map(p => (
  <View key={Math.random()} ... /> // key가 매번 변경
))}

// ✅ 올바른 예: 안정적인 key 사용
{particles.map(p => (
  <View key={p.id} ... /> // 고유 id 사용
))}
```

### 3. 업데이트 타이밍

```typescript
// ❌ 잘못된 예: deltaTime 무시
p.x += p.vx; // 프레임률에 따라 속도가 달라짐

// ✅ 올바른 예: deltaTime 적용
p.x += p.vx * deltaTime * 60; // 60fps 기준 정규화
```

## 💡 성능 최적화 팁

### 1. Object Pool 패턴

```typescript
class ParticlePool {
  private pool: Particle[] = [];
  private activeCount = 0;

  acquire(): Particle | null {
    if (this.activeCount < this.pool.length) {
      const particle = this.pool[this.activeCount];
      this.activeCount++;
      return particle;
    }
    return null; // 풀이 가득 참
  }

  release(particle: Particle): void {
    const index = this.pool.indexOf(particle);
    if (index !== -1 && index < this.activeCount) {
      // Swap with last active
      [this.pool[index], this.pool[this.activeCount - 1]] =
        [this.pool[this.activeCount - 1], this.pool[index]];
      this.activeCount--;
    }
  }
}
```

### 2. 배치 렌더링

```typescript
// 여러 파티클을 하나의 Path로 렌더링
const particlePath = useMemo(() => {
  const path = Skia.Path.Make();
  particles.forEach(p => {
    path.addCircle(p.x, p.y, p.size);
  });
  return path;
}, [particles]);

<Path path={particlePath} color="white" />
```

### 3. 시야 컬링

```typescript
// 화면 밖 파티클은 렌더링 제외
const visibleParticles = particles.filter(p =>
  p.x >= -10 &&
  p.x <= SCREEN_WIDTH + 10 &&
  p.y >= -10 &&
  p.y <= SCREEN_HEIGHT + 10
);
```

## 🏋️ 연습 문제

### 문제 1: 버블 효과
물속에서 올라오는 거품 효과:
- 아래에서 위로 상승
- 좌우로 흔들림
- 크기 변화와 터짐

### 문제 2: 스파클 효과
반짝이는 별 효과:
- 랜덤 위치에 나타남
- 밝아졌다 어두워짐
- 회전하며 크기 변화

### 문제 3: 폭발 효과
터치 위치에서 폭발:
- 중심에서 퍼져나감
- 충격파 원
- 잔해 파티클

## 📚 이 장에서 배운 내용

1. **파티클 시스템 아키텍처**: Emitter, Particle, 수명 주기
2. **물리 시뮬레이션**: 중력, 마찰, 바람 효과
3. **다양한 효과**: 폭죽, 눈, 색종이, 불꽃
4. **Skia 활용**: 고성능 파티클 렌더링
5. **성능 최적화**: Object Pool, 배치 렌더링, 컬링

**다음 장 예고**: **Chapter 37: Lottie 통합**에서는 After Effects로 제작한 복잡한 애니메이션을 앱에 통합합니다. JSON 기반 벡터 애니메이션의 강력한 기능을 다룹니다.
