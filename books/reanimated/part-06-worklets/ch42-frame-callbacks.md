# Chapter 42: useFrameCallback과 시간 기반 애니메이션

프레임 단위로 실행되는 콜백을 활용해 정밀한 시간 제어가 필요한 애니메이션을 구현합니다. 게임 루프, 물리 시뮬레이션, 실시간 효과 등 고급 기법을 마스터합니다.

## 📌 학습 목표

- useFrameCallback의 동작 원리 이해
- 델타 타임 기반 애니메이션 구현
- 물리 시뮬레이션과 게임 루프 패턴
- 프레임 독립적 애니메이션 작성
- 성능 모니터링과 최적화

## 📖 useFrameCallback 이해하기

### 프레임 콜백의 필요성

```
┌─────────────────────────────────────────────────────────────────┐
│              Animation Approaches Comparison                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  withTiming / withSpring:                                       │
│  ┌─────┐     ┌─────┐     ┌─────┐                               │
│  │Start│────►│Tween│────►│ End │  선언적, 자동 보간            │
│  └─────┘     └─────┘     └─────┘                               │
│                                                                  │
│  useFrameCallback:                                              │
│  ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐                    │
│  │Frame1│──►│Frame2│──►│Frame3│──►│Frame4│...  명령적, 수동 제어│
│  │ +16ms│   │ +16ms│   │ +16ms│   │ +16ms│                     │
│  └──────┘   └──────┘   └──────┘   └──────┘                    │
│                                                                  │
│  사용 사례:                                                      │
│  • 물리 시뮬레이션 (중력, 충돌)                                  │
│  • 게임 루프 (캐릭터 이동, 적 AI)                               │
│  • 파티클 시스템                                                │
│  • 실시간 데이터 시각화                                         │
│  • 커스텀 이징/모션 곡선                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 기본 사용법

```typescript
import { useFrameCallback } from 'react-native-reanimated';

function BasicFrameCallback() {
  const position = useSharedValue(0);

  useFrameCallback((frameInfo) => {
    // 매 프레임마다 호출 (약 60fps = 16.67ms 간격)
    position.value += 1; // 매 프레임 1픽셀 이동
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

  return <Animated.View style={[styles.box, animatedStyle]} />;
}
```

### FrameInfo 객체

```typescript
interface FrameInfo {
  timestamp: number;              // 현재 프레임 타임스탬프 (ms)
  timeSincePreviousFrame: number | null; // 이전 프레임부터 경과 시간 (ms)
  timeSinceFirstFrame: number;    // 첫 프레임부터 경과 시간 (ms)
}

function FrameInfoExample() {
  const elapsed = useSharedValue(0);
  const fps = useSharedValue(0);

  useFrameCallback((info) => {
    // 첫 프레임부터의 경과 시간
    elapsed.value = info.timeSinceFirstFrame;

    // FPS 계산
    if (info.timeSincePreviousFrame) {
      fps.value = 1000 / info.timeSincePreviousFrame;
    }
  });

  return (
    <View>
      <AnimatedText text={elapsed} prefix="Elapsed: " suffix="ms" />
      <AnimatedText text={fps} prefix="FPS: " decimals={1} />
    </View>
  );
}
```

## 💻 델타 타임 기반 애니메이션

### 프레임 독립적 이동

```typescript
// ❌ 프레임 의존적 - FPS에 따라 속도가 달라짐
function FrameDependentMovement() {
  const x = useSharedValue(0);
  const SPEED = 2; // 프레임당 픽셀

  useFrameCallback(() => {
    x.value += SPEED; // 60fps = 120px/s, 30fps = 60px/s
  });
}

// ✅ 프레임 독립적 - 모든 기기에서 일정한 속도
function FrameIndependentMovement() {
  const x = useSharedValue(0);
  const SPEED = 120; // 초당 픽셀

  useFrameCallback((info) => {
    if (info.timeSincePreviousFrame) {
      const deltaTime = info.timeSincePreviousFrame / 1000; // 초 단위
      x.value += SPEED * deltaTime;
    }
  });
}
```

### 부드러운 감속 (Decay)

```typescript
function SmoothDecay() {
  const velocity = useSharedValue(500); // 초기 속도 (px/s)
  const position = useSharedValue(0);

  const FRICTION = 0.95; // 마찰 계수 (프레임당)
  const MIN_VELOCITY = 0.5;

  useFrameCallback((info) => {
    if (!info.timeSincePreviousFrame) return;

    const dt = info.timeSincePreviousFrame / 1000;

    // 프레임 독립적 마찰 적용
    const frictionPerSecond = Math.pow(FRICTION, 60); // 60fps 기준으로 정규화
    const frictionThisFrame = Math.pow(frictionPerSecond, dt * 60);

    velocity.value *= frictionThisFrame;

    // 최소 속도 이하면 정지
    if (Math.abs(velocity.value) < MIN_VELOCITY) {
      velocity.value = 0;
    }

    // 위치 업데이트
    position.value += velocity.value * dt;
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

  const kickStart = () => {
    velocity.value = 500;
  };

  return (
    <TouchableOpacity onPress={kickStart}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </TouchableOpacity>
  );
}
```

### 스프링 물리학

```typescript
interface SpringState {
  position: number;
  velocity: number;
}

function PhysicsSpring() {
  const state = useSharedValue<SpringState>({
    position: 0,
    velocity: 0,
  });

  const target = useSharedValue(200);

  // 스프링 파라미터
  const STIFFNESS = 100; // 강성
  const DAMPING = 10;    // 감쇠
  const MASS = 1;        // 질량

  useFrameCallback((info) => {
    if (!info.timeSincePreviousFrame) return;

    const dt = Math.min(info.timeSincePreviousFrame / 1000, 0.064); // 최대 64ms

    const { position, velocity } = state.value;

    // 스프링 힘 계산
    const displacement = position - target.value;
    const springForce = -STIFFNESS * displacement;
    const dampingForce = -DAMPING * velocity;
    const acceleration = (springForce + dampingForce) / MASS;

    // Verlet 적분
    const newVelocity = velocity + acceleration * dt;
    const newPosition = position + newVelocity * dt;

    // 정지 조건
    if (Math.abs(newVelocity) < 0.1 && Math.abs(displacement) < 0.1) {
      state.value = { position: target.value, velocity: 0 };
    } else {
      state.value = { position: newPosition, velocity: newVelocity };
    }
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: state.value.position }],
  }));

  return <Animated.View style={[styles.box, animatedStyle]} />;
}
```

## 💻 게임 루프 패턴

### 기본 게임 루프

```typescript
interface GameState {
  player: { x: number; y: number };
  enemies: { x: number; y: number; vx: number; vy: number }[];
  score: number;
  isRunning: boolean;
}

function useGameLoop() {
  const gameState = useSharedValue<GameState>({
    player: { x: 100, y: 300 },
    enemies: [],
    score: 0,
    isRunning: false,
  });

  const input = useSharedValue({ dx: 0, dy: 0 });

  // 게임 루프
  useFrameCallback((info) => {
    if (!info.timeSincePreviousFrame || !gameState.value.isRunning) return;

    const dt = info.timeSincePreviousFrame / 1000;
    const state = gameState.value;

    // 플레이어 업데이트
    const newPlayer = updatePlayer(state.player, input.value, dt);

    // 적 업데이트
    const newEnemies = state.enemies.map(enemy => updateEnemy(enemy, dt));

    // 충돌 검사
    const collisions = checkCollisions(newPlayer, newEnemies);

    // 상태 업데이트
    gameState.value = {
      ...state,
      player: newPlayer,
      enemies: newEnemies,
      score: state.score + collisions.scoreGain,
    };
  });

  return { gameState, input };
}

function updatePlayer(
  player: { x: number; y: number },
  input: { dx: number; dy: number },
  dt: number
) {
  'worklet';
  const SPEED = 200;
  return {
    x: clamp(player.x + input.dx * SPEED * dt, 0, 300),
    y: clamp(player.y + input.dy * SPEED * dt, 0, 500),
  };
}

function updateEnemy(
  enemy: { x: number; y: number; vx: number; vy: number },
  dt: number
) {
  'worklet';
  return {
    x: enemy.x + enemy.vx * dt,
    y: enemy.y + enemy.vy * dt,
    vx: enemy.vx,
    vy: enemy.vy,
  };
}
```

### 물리 기반 게임

```typescript
interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

function BouncingBalls() {
  const balls = useSharedValue<Ball[]>([
    { x: 100, y: 100, vx: 150, vy: 100, radius: 20 },
    { x: 200, y: 150, vx: -100, vy: 150, radius: 25 },
    { x: 150, y: 200, vx: 80, vy: -120, radius: 15 },
  ]);

  const GRAVITY = 500;
  const BOUNDS = { width: 300, height: 500 };
  const BOUNCE = 0.8;
  const FRICTION = 0.99;

  useFrameCallback((info) => {
    if (!info.timeSincePreviousFrame) return;

    const dt = Math.min(info.timeSincePreviousFrame / 1000, 0.032);

    balls.value = balls.value.map(ball => {
      // 중력 적용
      let vy = ball.vy + GRAVITY * dt;

      // 위치 업데이트
      let x = ball.x + ball.vx * dt;
      let y = ball.y + vy * dt;
      let vx = ball.vx * FRICTION;
      vy *= FRICTION;

      // 벽 충돌
      if (x - ball.radius < 0) {
        x = ball.radius;
        vx = -vx * BOUNCE;
      } else if (x + ball.radius > BOUNDS.width) {
        x = BOUNDS.width - ball.radius;
        vx = -vx * BOUNCE;
      }

      // 바닥/천장 충돌
      if (y - ball.radius < 0) {
        y = ball.radius;
        vy = -vy * BOUNCE;
      } else if (y + ball.radius > BOUNDS.height) {
        y = BOUNDS.height - ball.radius;
        vy = -vy * BOUNCE;
      }

      return { x, y, vx, vy, radius: ball.radius };
    });
  });

  return (
    <View style={styles.gameContainer}>
      {balls.value.map((_, index) => (
        <BallComponent key={index} balls={balls} index={index} />
      ))}
    </View>
  );
}

function BallComponent({
  balls,
  index,
}: {
  balls: SharedValue<Ball[]>;
  index: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const ball = balls.value[index];
    return {
      position: 'absolute',
      width: ball.radius * 2,
      height: ball.radius * 2,
      borderRadius: ball.radius,
      backgroundColor: `hsl(${index * 120}, 70%, 50%)`,
      transform: [
        { translateX: ball.x - ball.radius },
        { translateY: ball.y - ball.radius },
      ],
    };
  });

  return <Animated.View style={animatedStyle} />;
}
```

## 💻 파티클 시스템

```typescript
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

function ParticleEmitter({
  emitRate = 10,
  maxParticles = 100,
}: {
  emitRate?: number;
  maxParticles?: number;
}) {
  const particles = useSharedValue<Particle[]>([]);
  const emitAccumulator = useSharedValue(0);

  const GRAVITY = 200;
  const SPREAD = 60;
  const SPEED_MIN = 100;
  const SPEED_MAX = 300;
  const LIFE_MIN = 1;
  const LIFE_MAX = 2;

  const emitParticle = (x: number, y: number): Particle => {
    'worklet';
    const angle = (-90 + (Math.random() - 0.5) * SPREAD) * (Math.PI / 180);
    const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);

    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: LIFE_MIN + Math.random() * (LIFE_MAX - LIFE_MIN),
      maxLife: LIFE_MIN + Math.random() * (LIFE_MAX - LIFE_MIN),
      size: 4 + Math.random() * 8,
      color: `hsl(${Math.random() * 60 + 10}, 100%, 50%)`, // 주황-노랑
    };
  };

  useFrameCallback((info) => {
    if (!info.timeSincePreviousFrame) return;

    const dt = info.timeSincePreviousFrame / 1000;

    // 파티클 생성
    emitAccumulator.value += emitRate * dt;
    const toEmit = Math.floor(emitAccumulator.value);
    emitAccumulator.value -= toEmit;

    let newParticles = [...particles.value];

    // 새 파티클 추가
    for (let i = 0; i < toEmit && newParticles.length < maxParticles; i++) {
      newParticles.push(emitParticle(150, 400));
    }

    // 파티클 업데이트
    newParticles = newParticles
      .map(p => ({
        ...p,
        x: p.x + p.vx * dt,
        y: p.y + p.vy * dt,
        vy: p.vy + GRAVITY * dt,
        life: p.life - dt,
      }))
      .filter(p => p.life > 0); // 죽은 파티클 제거

    particles.value = newParticles;
  });

  return (
    <View style={styles.emitterContainer}>
      {particles.value.map((_, index) => (
        <ParticleView key={index} particles={particles} index={index} />
      ))}
    </View>
  );
}

function ParticleView({
  particles,
  index,
}: {
  particles: SharedValue<Particle[]>;
  index: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const p = particles.value[index];
    if (!p) return { opacity: 0 };

    const lifeRatio = p.life / p.maxLife;

    return {
      position: 'absolute',
      width: p.size * lifeRatio,
      height: p.size * lifeRatio,
      borderRadius: p.size / 2,
      backgroundColor: p.color,
      opacity: lifeRatio,
      transform: [
        { translateX: p.x - p.size / 2 },
        { translateY: p.y - p.size / 2 },
      ],
    };
  });

  return <Animated.View style={animatedStyle} />;
}
```

## 💻 시간 기반 이펙트

### 펄스 효과

```typescript
function PulseEffect({ frequency = 2 }: { frequency?: number }) {
  const time = useSharedValue(0);

  useFrameCallback((info) => {
    time.value = info.timeSinceFirstFrame / 1000;
  });

  const animatedStyle = useAnimatedStyle(() => {
    const pulse = Math.sin(time.value * frequency * Math.PI * 2);
    const scale = 1 + pulse * 0.1;
    const opacity = 0.8 + pulse * 0.2;

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return <Animated.View style={[styles.pulseBox, animatedStyle]} />;
}
```

### 웨이브 효과

```typescript
function WaveEffect({ itemCount = 10 }: { itemCount?: number }) {
  const time = useSharedValue(0);

  useFrameCallback((info) => {
    time.value = info.timeSinceFirstFrame / 1000;
  });

  return (
    <View style={styles.waveContainer}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <WaveItem key={index} time={time} index={index} total={itemCount} />
      ))}
    </View>
  );
}

function WaveItem({
  time,
  index,
  total,
}: {
  time: SharedValue<number>;
  index: number;
  total: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const phase = (index / total) * Math.PI * 2;
    const wave = Math.sin(time.value * 3 + phase);

    return {
      transform: [{ translateY: wave * 20 }],
      opacity: 0.5 + wave * 0.5,
    };
  });

  return <Animated.View style={[styles.waveItem, animatedStyle]} />;
}
```

### 로딩 스피너

```typescript
function SmoothSpinner({ segments = 12 }: { segments?: number }) {
  const rotation = useSharedValue(0);

  useFrameCallback((info) => {
    if (!info.timeSincePreviousFrame) return;

    const dt = info.timeSincePreviousFrame / 1000;
    rotation.value += 360 * dt; // 초당 한 바퀴

    // 360도 넘으면 리셋 (정밀도 유지)
    if (rotation.value >= 360) {
      rotation.value -= 360;
    }
  });

  return (
    <View style={styles.spinnerContainer}>
      {Array.from({ length: segments }).map((_, index) => (
        <SpinnerSegment
          key={index}
          rotation={rotation}
          index={index}
          total={segments}
        />
      ))}
    </View>
  );
}

function SpinnerSegment({
  rotation,
  index,
  total,
}: {
  rotation: SharedValue<number>;
  index: number;
  total: number;
}) {
  const segmentAngle = (360 / total) * index;

  const animatedStyle = useAnimatedStyle(() => {
    const currentAngle = (rotation.value + segmentAngle) % 360;
    const opacity = 1 - (currentAngle / 360) * 0.7;

    return {
      opacity,
      transform: [
        { rotate: `${segmentAngle}deg` },
        { translateY: -30 },
      ],
    };
  });

  return (
    <Animated.View style={[styles.spinnerSegment, animatedStyle]}>
      <View style={styles.segmentDot} />
    </Animated.View>
  );
}
```

## 💻 성능 모니터링

### FPS 모니터

```typescript
function FPSMonitor() {
  const fps = useSharedValue(60);
  const frameCount = useSharedValue(0);
  const lastSecond = useSharedValue(0);
  const [displayFps, setDisplayFps] = useState(60);

  useFrameCallback((info) => {
    frameCount.value += 1;

    const currentSecond = Math.floor(info.timeSinceFirstFrame / 1000);

    if (currentSecond > lastSecond.value) {
      fps.value = frameCount.value;
      runOnJS(setDisplayFps)(frameCount.value);
      frameCount.value = 0;
      lastSecond.value = currentSecond;
    }
  });

  const barStyle = useAnimatedStyle(() => {
    const normalizedFps = Math.min(fps.value / 60, 1);
    const hue = normalizedFps * 120; // 0 = red, 120 = green

    return {
      width: `${normalizedFps * 100}%`,
      backgroundColor: `hsl(${hue}, 70%, 50%)`,
    };
  });

  return (
    <View style={styles.fpsMonitor}>
      <Text style={styles.fpsText}>{displayFps} FPS</Text>
      <View style={styles.fpsBarContainer}>
        <Animated.View style={[styles.fpsBar, barStyle]} />
      </View>
    </View>
  );
}
```

### 프레임 타임 그래프

```typescript
function FrameTimeGraph({ historyLength = 60 }: { historyLength?: number }) {
  const frameTimes = useSharedValue<number[]>(new Array(historyLength).fill(16.67));
  const currentIndex = useSharedValue(0);

  useFrameCallback((info) => {
    if (!info.timeSincePreviousFrame) return;

    const newTimes = [...frameTimes.value];
    newTimes[currentIndex.value] = info.timeSincePreviousFrame;
    frameTimes.value = newTimes;

    currentIndex.value = (currentIndex.value + 1) % historyLength;
  });

  return (
    <View style={styles.graphContainer}>
      {Array.from({ length: historyLength }).map((_, index) => (
        <FrameBar
          key={index}
          frameTimes={frameTimes}
          index={index}
          historyLength={historyLength}
        />
      ))}
      {/* 16.67ms 기준선 */}
      <View style={[styles.baseline, { bottom: (16.67 / 50) * 100 }]} />
    </View>
  );
}

function FrameBar({
  frameTimes,
  index,
  historyLength,
}: {
  frameTimes: SharedValue<number[]>;
  index: number;
  historyLength: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const frameTime = frameTimes.value[index];
    const height = Math.min((frameTime / 50) * 100, 100); // 50ms = 100%
    const hue = Math.max(0, 120 - (frameTime - 16.67) * 4); // 16.67ms = green

    return {
      height: `${height}%`,
      backgroundColor: `hsl(${hue}, 70%, 50%)`,
    };
  });

  return (
    <View style={styles.barWrapper}>
      <Animated.View style={[styles.frameBar, animatedStyle]} />
    </View>
  );
}
```

## 📱 sometimes-app 적용 사례

### 매칭 대기 타이머

```typescript
// src/features/idle-match-timer/hooks/use-countdown-animation.ts
export function useCountdownAnimation(
  targetTime: Date,
  onComplete: () => void
) {
  const remainingMs = useSharedValue(targetTime.getTime() - Date.now());
  const pulse = useSharedValue(1);

  useFrameCallback((info) => {
    const now = Date.now();
    const remaining = targetTime.getTime() - now;

    remainingMs.value = Math.max(0, remaining);

    // 마지막 10초 펄스 효과
    if (remaining <= 10000 && remaining > 0) {
      const urgency = 1 - remaining / 10000;
      const pulseSpeed = 2 + urgency * 4; // 2-6 Hz
      pulse.value = 1 + Math.sin(info.timeSinceFirstFrame * pulseSpeed * 0.001 * Math.PI * 2) * 0.1 * urgency;
    } else {
      pulse.value = 1;
    }

    // 완료 콜백
    if (remaining <= 0) {
      runOnJS(onComplete)();
    }
  });

  // 포맷된 시간
  const formattedTime = useDerivedValue(() => {
    const ms = remainingMs.value;
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const textStyle = useAnimatedStyle(() => {
    const urgencyColor = remainingMs.value <= 10000
      ? interpolateColor(
          remainingMs.value,
          [0, 10000],
          ['#EF4444', '#374151']
        )
      : '#374151';

    return {
      color: urgencyColor,
    };
  });

  return {
    remainingMs,
    formattedTime,
    containerStyle,
    textStyle,
  };
}
```

### 프로필 하트 애니메이션

```typescript
// src/features/like/hooks/use-heart-burst.ts
interface Heart {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  life: number;
}

export function useHeartBurst() {
  const hearts = useSharedValue<Heart[]>([]);
  const isActive = useSharedValue(false);

  const HEART_COUNT = 15;
  const GRAVITY = 400;
  const LIFETIME = 1.5;

  const burst = (originX: number, originY: number) => {
    const newHearts: Heart[] = [];

    for (let i = 0; i < HEART_COUNT; i++) {
      const angle = (Math.random() * 120 - 60 - 90) * (Math.PI / 180);
      const speed = 200 + Math.random() * 200;

      newHearts.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 720,
        scale: 0.5 + Math.random() * 0.5,
        life: LIFETIME,
      });
    }

    hearts.value = newHearts;
    isActive.value = true;
  };

  useFrameCallback((info) => {
    if (!isActive.value || !info.timeSincePreviousFrame) return;

    const dt = info.timeSincePreviousFrame / 1000;

    const updated = hearts.value
      .map(heart => ({
        ...heart,
        x: heart.x + heart.vx * dt,
        y: heart.y + heart.vy * dt,
        vy: heart.vy + GRAVITY * dt,
        rotation: heart.rotation + heart.rotationSpeed * dt,
        life: heart.life - dt,
      }))
      .filter(heart => heart.life > 0);

    hearts.value = updated;

    if (updated.length === 0) {
      isActive.value = false;
    }
  });

  return { hearts, burst };
}

function HeartBurstView({ burst }: { burst: ReturnType<typeof useHeartBurst> }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {burst.hearts.value.map((_, index) => (
        <HeartParticle key={index} hearts={burst.hearts} index={index} />
      ))}
    </View>
  );
}

function HeartParticle({
  hearts,
  index,
}: {
  hearts: SharedValue<Heart[]>;
  index: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const heart = hearts.value[index];
    if (!heart) return { opacity: 0 };

    const lifeRatio = heart.life / 1.5;

    return {
      position: 'absolute',
      opacity: lifeRatio,
      transform: [
        { translateX: heart.x - 12 },
        { translateY: heart.y - 12 },
        { rotate: `${heart.rotation}deg` },
        { scale: heart.scale * lifeRatio },
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Text style={styles.heartEmoji}>❤️</Text>
    </Animated.View>
  );
}
```

## ⚠️ 흔한 실수와 해결법

### 1. 델타 타임 누락

```typescript
// ❌ 프레임 의존적
useFrameCallback(() => {
  position.value += 5;
});

// ✅ 시간 기반
useFrameCallback((info) => {
  if (info.timeSincePreviousFrame) {
    const dt = info.timeSincePreviousFrame / 1000;
    position.value += 300 * dt; // 초당 300 픽셀
  }
});
```

### 2. 델타 타임 스파이크

```typescript
// ❌ 큰 델타 타임으로 물리 오류
useFrameCallback((info) => {
  const dt = info.timeSincePreviousFrame / 1000;
  velocity.value += GRAVITY * dt; // 백그라운드 복귀 시 튐
});

// ✅ 델타 타임 제한
useFrameCallback((info) => {
  const dt = Math.min(info.timeSincePreviousFrame / 1000, 0.032); // 최대 32ms
  velocity.value += GRAVITY * dt;
});
```

### 3. 메모리 누수

```typescript
// ❌ 무한히 증가하는 배열
useFrameCallback(() => {
  particles.value = [...particles.value, newParticle()];
});

// ✅ 최대 개수 제한 + 정리
useFrameCallback(() => {
  let updated = particles.value.filter(p => p.life > 0);

  if (updated.length < MAX_PARTICLES) {
    updated.push(newParticle());
  }

  particles.value = updated;
});
```

## 💡 성능 최적화 팁

### 1. 조건부 실행

```typescript
useFrameCallback((info) => {
  // 필요할 때만 실행
  if (!isAnimating.value) return;

  // 애니메이션 로직
});
```

### 2. 배치 업데이트

```typescript
// ❌ 여러 번 업데이트
useFrameCallback((info) => {
  x.value = calculateX();
  y.value = calculateY();
  rotation.value = calculateRotation();
});

// ✅ 한 번에 업데이트
useFrameCallback((info) => {
  const state = {
    x: calculateX(),
    y: calculateY(),
    rotation: calculateRotation(),
  };
  transform.value = state;
});
```

### 3. 계산 캐싱

```typescript
// 상수는 외부에서 계산
const CONSTANTS = {
  sin45: Math.sin(Math.PI / 4),
  cos45: Math.cos(Math.PI / 4),
  twoPi: Math.PI * 2,
};

useFrameCallback((info) => {
  // 프레임마다 Math.sin(Math.PI / 4) 재계산하지 않음
  x.value = position * CONSTANTS.cos45;
  y.value = position * CONSTANTS.sin45;
});
```

## 🏋️ 연습 문제

### 과제 1: 탄성 충돌
두 개의 공이 서로 충돌할 때 운동량을 교환하는 물리 시뮬레이션을 구현하세요.

### 과제 2: 트레일 효과
움직이는 요소 뒤에 잔상이 남는 트레일 효과를 구현하세요.

### 과제 3: 시계 애니메이션
실시간으로 동작하는 아날로그 시계를 useFrameCallback으로 구현하세요.

## 📚 이 장에서 배운 내용

1. **useFrameCallback**: 프레임 단위 콜백 함수
2. **델타 타임**: 프레임 독립적 애니메이션
3. **물리 시뮬레이션**: 중력, 충돌, 스프링
4. **게임 루프**: 상태 업데이트와 렌더링 분리
5. **성능 모니터링**: FPS와 프레임 타임 측정

## 다음 장 예고

**Chapter 43: 스레드 간 통신 마스터**에서는 runOnUI와 runOnJS를 활용한 효율적인 스레드 간 데이터 교환 패턴을 배웁니다. 복잡한 비동기 흐름을 안전하게 처리하는 방법을 익힙니다.
