# Chapter 46: 센서와 하드웨어 연동

디바이스 센서를 Reanimated 애니메이션과 연동해 몰입감 있는 인터랙션을 구현합니다. 가속도계, 자이로스코프, 나침반 등의 센서 데이터를 실시간으로 활용하는 방법을 배웁니다.

## 📌 학습 목표

- 다양한 디바이스 센서 이해
- useAnimatedSensor 활용법
- 센서 데이터 필터링과 보정
- 패럴랙스와 틸트 효과 구현
- 센서 기반 게임 인터랙션

## 📖 디바이스 센서 개요

### 사용 가능한 센서 유형

```
┌─────────────────────────────────────────────────────────────────┐
│                    Device Sensors Overview                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  가속도계 (Accelerometer)                                        │
│  ┌─────────────────────────────┐                                │
│  │ x: 좌우 가속도              │ 기기 움직임 감지               │
│  │ y: 위아래 가속도            │ 흔들기 감지                    │
│  │ z: 앞뒤 가속도              │ 낙하 감지                      │
│  └─────────────────────────────┘                                │
│                                                                  │
│  자이로스코프 (Gyroscope)                                        │
│  ┌─────────────────────────────┐                                │
│  │ x: 피치 (앞뒤 기울기)       │ 회전 속도 감지                │
│  │ y: 롤 (좌우 기울기)         │ 정밀한 각도 변화               │
│  │ z: 요 (수평 회전)           │                                │
│  └─────────────────────────────┘                                │
│                                                                  │
│  중력 센서 (Gravity)                                            │
│  ┌─────────────────────────────┐                                │
│  │ 중력 방향 감지              │ 기기 기울기 측정               │
│  │ 가속도에서 움직임 제외      │ 화면 방향 결정                 │
│  └─────────────────────────────┘                                │
│                                                                  │
│  회전 벡터 (Rotation)                                           │
│  ┌─────────────────────────────┐                                │
│  │ 절대적인 기기 방향          │ 3D 공간에서의 위치             │
│  │ 쿼터니언 또는 오일러 각도   │ AR/VR 애플리케이션             │
│  └─────────────────────────────┘                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### useAnimatedSensor 기본 사용법

```typescript
import {
  useAnimatedSensor,
  SensorType,
  useAnimatedStyle,
} from 'react-native-reanimated';

function BasicSensorExample() {
  // 가속도계 사용
  const accelerometer = useAnimatedSensor(SensorType.ACCELEROMETER, {
    interval: 16, // 업데이트 간격 (ms)
  });

  const animatedStyle = useAnimatedStyle(() => {
    // 센서 데이터 접근
    const { x, y, z } = accelerometer.sensor.value;

    return {
      transform: [
        { translateX: x * 20 },
        { translateY: y * 20 },
      ],
    };
  });

  return <Animated.View style={[styles.box, animatedStyle]} />;
}
```

## 💻 센서 유형별 활용

### 가속도계

```typescript
import { SensorType, useAnimatedSensor } from 'react-native-reanimated';

function AccelerometerExample() {
  const accelerometer = useAnimatedSensor(SensorType.ACCELEROMETER, {
    interval: 16,
  });

  // 움직임 감지
  const motionIntensity = useDerivedValue(() => {
    const { x, y, z } = accelerometer.sensor.value;
    return Math.sqrt(x * x + y * y + z * z);
  });

  // 흔들기 감지
  const isShaking = useDerivedValue(() => {
    return motionIntensity.value > 15; // 임계값
  });

  // 흔들기 카운터
  const shakeCount = useSharedValue(0);
  const lastShakeTime = useSharedValue(0);

  useAnimatedReaction(
    () => isShaking.value,
    (shaking, wasShaking) => {
      if (shaking && !wasShaking) {
        const now = Date.now();
        if (now - lastShakeTime.value > 500) {
          shakeCount.value += 1;
          lastShakeTime.value = now;
          runOnJS(onShake)(shakeCount.value);
        }
      }
    }
  );

  const onShake = (count: number) => {
    console.log(`Shake detected! Count: ${count}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: 1 + (isShaking.value ? 0.1 : 0) },
    ],
    backgroundColor: isShaking.value ? '#EF4444' : '#7A4AE2',
  }));

  return <Animated.View style={[styles.box, animatedStyle]} />;
}
```

### 자이로스코프

```typescript
function GyroscopeExample() {
  const gyroscope = useAnimatedSensor(SensorType.GYROSCOPE, {
    interval: 16,
  });

  const rotation = useSharedValue({ x: 0, y: 0, z: 0 });

  // 프레임마다 회전 누적
  useFrameCallback((info) => {
    if (!info.timeSincePreviousFrame) return;

    const dt = info.timeSincePreviousFrame / 1000;
    const { x, y, z } = gyroscope.sensor.value;

    rotation.value = {
      x: rotation.value.x + x * dt * (180 / Math.PI),
      y: rotation.value.y + y * dt * (180 / Math.PI),
      z: rotation.value.z + z * dt * (180 / Math.PI),
    };
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateX: `${rotation.value.x}deg` },
      { rotateY: `${rotation.value.y}deg` },
      { rotateZ: `${rotation.value.z}deg` },
    ],
  }));

  const reset = () => {
    rotation.value = { x: 0, y: 0, z: 0 };
  };

  return (
    <View>
      <Animated.View style={[styles.cube, animatedStyle]} />
      <Button title="Reset" onPress={reset} />
    </View>
  );
}
```

### 중력 센서

```typescript
function GravitySensorExample() {
  const gravity = useAnimatedSensor(SensorType.GRAVITY, {
    interval: 16,
  });

  // 기기 기울기를 각도로 변환
  const tiltAngle = useDerivedValue(() => {
    const { x, y, z } = gravity.sensor.value;

    // x, y 축 기울기
    const roll = Math.atan2(y, z) * (180 / Math.PI);
    const pitch = Math.atan2(-x, Math.sqrt(y * y + z * z)) * (180 / Math.PI);

    return { roll, pitch };
  });

  // 틸트에 반응하는 물체
  const animatedStyle = useAnimatedStyle(() => {
    const { roll, pitch } = tiltAngle.value;

    // 기울기에 따라 위치 이동
    const translateX = interpolate(
      pitch,
      [-45, 45],
      [100, -100],
      'clamp'
    );

    const translateY = interpolate(
      roll,
      [-45, 45],
      [-100, 100],
      'clamp'
    );

    return {
      transform: [
        { translateX },
        { translateY },
      ],
    };
  });

  return (
    <View style={styles.container}>
      {/* 레벨 표시기 */}
      <View style={styles.levelIndicator}>
        <Animated.View style={[styles.ball, animatedStyle]} />
      </View>
    </View>
  );
}
```

### 회전 벡터 (Rotation Vector)

```typescript
function RotationVectorExample() {
  const rotation = useAnimatedSensor(SensorType.ROTATION, {
    interval: 16,
  });

  // 쿼터니언에서 오일러 각도로 변환
  const eulerAngles = useDerivedValue(() => {
    const { qw, qx, qy, qz } = rotation.sensor.value;

    // 쿼터니언 → 오일러 변환
    const sinr_cosp = 2 * (qw * qx + qy * qz);
    const cosr_cosp = 1 - 2 * (qx * qx + qy * qy);
    const roll = Math.atan2(sinr_cosp, cosr_cosp);

    const sinp = 2 * (qw * qy - qz * qx);
    const pitch = Math.abs(sinp) >= 1
      ? Math.sign(sinp) * (Math.PI / 2)
      : Math.asin(sinp);

    const siny_cosp = 2 * (qw * qz + qx * qy);
    const cosy_cosp = 1 - 2 * (qy * qy + qz * qz);
    const yaw = Math.atan2(siny_cosp, cosy_cosp);

    return {
      roll: roll * (180 / Math.PI),
      pitch: pitch * (180 / Math.PI),
      yaw: yaw * (180 / Math.PI),
    };
  });

  const animatedStyle = useAnimatedStyle(() => {
    const { pitch, roll } = eulerAngles.value;

    return {
      transform: [
        { perspective: 1000 },
        { rotateX: `${pitch}deg` },
        { rotateY: `${roll}deg` },
      ],
    };
  });

  return <Animated.View style={[styles.card, animatedStyle]} />;
}
```

## 💻 센서 데이터 필터링

### 로우패스 필터

```typescript
// 노이즈 제거를 위한 로우패스 필터
function useLowPassFilter(
  sensor: ReturnType<typeof useAnimatedSensor>,
  smoothingFactor: number = 0.1
) {
  const filtered = useSharedValue({ x: 0, y: 0, z: 0 });

  useFrameCallback(() => {
    const current = sensor.sensor.value;

    filtered.value = {
      x: filtered.value.x + smoothingFactor * (current.x - filtered.value.x),
      y: filtered.value.y + smoothingFactor * (current.y - filtered.value.y),
      z: filtered.value.z + smoothingFactor * (current.z - filtered.value.z),
    };
  });

  return filtered;
}

// 사용
function SmoothSensorExample() {
  const accelerometer = useAnimatedSensor(SensorType.ACCELEROMETER);
  const smoothed = useLowPassFilter(accelerometer, 0.1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: smoothed.value.x * 20 },
      { translateY: smoothed.value.y * 20 },
    ],
  }));

  return <Animated.View style={[styles.box, animatedStyle]} />;
}
```

### 하이패스 필터

```typescript
// 움직임만 감지 (중력 제거)
function useHighPassFilter(
  sensor: ReturnType<typeof useAnimatedSensor>,
  cutoff: number = 0.8
) {
  const filtered = useSharedValue({ x: 0, y: 0, z: 0 });
  const previous = useSharedValue({ x: 0, y: 0, z: 0 });

  useFrameCallback(() => {
    const current = sensor.sensor.value;

    filtered.value = {
      x: cutoff * (filtered.value.x + current.x - previous.value.x),
      y: cutoff * (filtered.value.y + current.y - previous.value.y),
      z: cutoff * (filtered.value.z + current.z - previous.value.z),
    };

    previous.value = { ...current };
  });

  return filtered;
}
```

### 칼만 필터 (간소화)

```typescript
// 예측과 측정을 결합한 칼만 필터
function useKalmanFilter(
  sensor: ReturnType<typeof useAnimatedSensor>,
  processNoise: number = 0.125,
  measurementNoise: number = 4
) {
  const estimate = useSharedValue({ x: 0, y: 0, z: 0 });
  const errorCovariance = useSharedValue({ x: 1, y: 1, z: 1 });

  useFrameCallback(() => {
    const measurement = sensor.sensor.value;

    // 각 축에 대해 칼만 필터 적용
    ['x', 'y', 'z'].forEach((axis) => {
      const key = axis as 'x' | 'y' | 'z';

      // 예측 단계
      const predictedError = errorCovariance.value[key] + processNoise;

      // 업데이트 단계
      const kalmanGain = predictedError / (predictedError + measurementNoise);
      const newEstimate = estimate.value[key] + kalmanGain * (measurement[key] - estimate.value[key]);
      const newError = (1 - kalmanGain) * predictedError;

      estimate.value = { ...estimate.value, [key]: newEstimate };
      errorCovariance.value = { ...errorCovariance.value, [key]: newError };
    });
  });

  return estimate;
}
```

## 💻 패럴랙스 효과

### 다층 패럴랙스

```typescript
interface ParallaxLayer {
  depth: number;
  children: React.ReactNode;
}

function ParallaxScene({ layers }: { layers: ParallaxLayer[] }) {
  const gravity = useAnimatedSensor(SensorType.GRAVITY, { interval: 16 });
  const smoothed = useLowPassFilter(gravity, 0.05);

  return (
    <View style={styles.parallaxContainer}>
      {layers.map((layer, index) => (
        <ParallaxLayerView
          key={index}
          depth={layer.depth}
          sensorData={smoothed}
        >
          {layer.children}
        </ParallaxLayerView>
      ))}
    </View>
  );
}

function ParallaxLayerView({
  depth,
  sensorData,
  children,
}: {
  depth: number;
  sensorData: SharedValue<{ x: number; y: number; z: number }>;
  children: React.ReactNode;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const { x, y } = sensorData.value;

    // 깊이에 따라 이동량 조절
    const translateX = x * depth * 15;
    const translateY = -y * depth * 15;

    // 원근감을 위한 스케일
    const scale = 1 + depth * 0.02;

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
    };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

// 사용 예
function ParallaxDemo() {
  const layers: ParallaxLayer[] = [
    { depth: 0, children: <BackgroundImage /> },      // 배경 (고정)
    { depth: 0.5, children: <MidgroundElements /> },  // 중간층
    { depth: 1, children: <ForegroundElements /> },   // 전경
    { depth: 1.5, children: <FloatingElements /> },   // 떠있는 요소
  ];

  return <ParallaxScene layers={layers} />;
}
```

### 3D 카드 틸트

```typescript
function TiltCard() {
  const gravity = useAnimatedSensor(SensorType.GRAVITY, { interval: 16 });
  const smoothed = useLowPassFilter(gravity, 0.08);

  // 틸트 각도 계산
  const tilt = useDerivedValue(() => {
    const { x, y } = smoothed.value;

    return {
      rotateX: y * 15, // -15 ~ 15도
      rotateY: -x * 15,
    };
  });

  // 카드 스타일
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateX: `${tilt.value.rotateX}deg` },
      { rotateY: `${tilt.value.rotateY}deg` },
    ],
  }));

  // 반사광 효과
  const glareStyle = useAnimatedStyle(() => {
    const glareX = interpolate(tilt.value.rotateY, [-15, 15], [0, 100]);
    const glareY = interpolate(tilt.value.rotateX, [-15, 15], [0, 100]);

    return {
      opacity: 0.3,
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, white, transparent)`,
    };
  });

  // 그림자 효과
  const shadowStyle = useAnimatedStyle(() => {
    const shadowX = interpolate(tilt.value.rotateY, [-15, 15], [10, -10]);
    const shadowY = interpolate(tilt.value.rotateX, [-15, 15], [-10, 10]);

    return {
      shadowOffset: { width: shadowX, height: shadowY },
      shadowOpacity: 0.3,
      shadowRadius: 20,
    };
  });

  return (
    <Animated.View style={[styles.tiltCard, cardStyle, shadowStyle]}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>Premium Card</Text>
        <Text style={styles.cardNumber}>**** **** **** 1234</Text>
      </View>
      <Animated.View style={[styles.glare, glareStyle]} />
    </Animated.View>
  );
}
```

## 💻 게임 인터랙션

### 미로 게임

```typescript
interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Wall {
  x: number;
  y: number;
  width: number;
  height: number;
}

function MazeGame({ walls }: { walls: Wall[] }) {
  const gravity = useAnimatedSensor(SensorType.GRAVITY, { interval: 16 });
  const ball = useSharedValue<Ball>({ x: 50, y: 50, vx: 0, vy: 0 });

  const BALL_RADIUS = 15;
  const FRICTION = 0.98;
  const SENSITIVITY = 50;
  const BOUNDS = { width: 300, height: 500 };

  useFrameCallback((info) => {
    if (!info.timeSincePreviousFrame) return;

    const dt = info.timeSincePreviousFrame / 1000;
    const { x: gx, y: gy } = gravity.sensor.value;

    // 가속도 적용
    let vx = ball.value.vx + gx * SENSITIVITY * dt;
    let vy = ball.value.vy - gy * SENSITIVITY * dt;

    // 마찰 적용
    vx *= FRICTION;
    vy *= FRICTION;

    // 위치 업데이트
    let x = ball.value.x + vx;
    let y = ball.value.y + vy;

    // 벽 충돌 검사
    walls.forEach((wall) => {
      const collision = checkBallWallCollision(
        { x, y, radius: BALL_RADIUS },
        wall
      );

      if (collision) {
        ({ x, y, vx, vy } = resolveBallWallCollision(
          { x, y, vx, vy },
          wall,
          0.8 // 반발 계수
        ));
      }
    });

    // 경계 충돌
    if (x - BALL_RADIUS < 0) {
      x = BALL_RADIUS;
      vx = -vx * 0.8;
    } else if (x + BALL_RADIUS > BOUNDS.width) {
      x = BOUNDS.width - BALL_RADIUS;
      vx = -vx * 0.8;
    }

    if (y - BALL_RADIUS < 0) {
      y = BALL_RADIUS;
      vy = -vy * 0.8;
    } else if (y + BALL_RADIUS > BOUNDS.height) {
      y = BOUNDS.height - BALL_RADIUS;
      vy = -vy * 0.8;
    }

    ball.value = { x, y, vx, vy };
  });

  const ballStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: BALL_RADIUS * 2,
    height: BALL_RADIUS * 2,
    borderRadius: BALL_RADIUS,
    backgroundColor: '#7A4AE2',
    transform: [
      { translateX: ball.value.x - BALL_RADIUS },
      { translateY: ball.value.y - BALL_RADIUS },
    ],
  }));

  return (
    <View style={[styles.maze, { width: BOUNDS.width, height: BOUNDS.height }]}>
      {walls.map((wall, index) => (
        <View
          key={index}
          style={[
            styles.wall,
            {
              left: wall.x,
              top: wall.y,
              width: wall.width,
              height: wall.height,
            },
          ]}
        />
      ))}
      <Animated.View style={ballStyle} />
    </View>
  );
}

function checkBallWallCollision(
  ball: { x: number; y: number; radius: number },
  wall: Wall
): boolean {
  'worklet';

  const closestX = Math.max(wall.x, Math.min(ball.x, wall.x + wall.width));
  const closestY = Math.max(wall.y, Math.min(ball.y, wall.y + wall.height));

  const distanceX = ball.x - closestX;
  const distanceY = ball.y - closestY;
  const distanceSquared = distanceX * distanceX + distanceY * distanceY;

  return distanceSquared < ball.radius * ball.radius;
}
```

### 레이싱 게임 조향

```typescript
function RacingGame() {
  const rotation = useAnimatedSensor(SensorType.ROTATION, { interval: 16 });

  const carPosition = useSharedValue({ x: 150, y: 400 });
  const carRotation = useSharedValue(0);
  const speed = useSharedValue(0);

  const MAX_SPEED = 300;
  const ACCELERATION = 100;
  const STEERING_SENSITIVITY = 2;

  useFrameCallback((info) => {
    if (!info.timeSincePreviousFrame) return;

    const dt = info.timeSincePreviousFrame / 1000;

    // 자이로에서 조향각 계산
    const { qw, qx, qy, qz } = rotation.sensor.value;
    const siny_cosp = 2 * (qw * qz + qx * qy);
    const cosy_cosp = 1 - 2 * (qy * qy + qz * qz);
    const steeringAngle = Math.atan2(siny_cosp, cosy_cosp) * STEERING_SENSITIVITY;

    // 속도 업데이트 (자동 가속)
    speed.value = Math.min(speed.value + ACCELERATION * dt, MAX_SPEED);

    // 회전 업데이트
    carRotation.value += steeringAngle * dt * (speed.value / MAX_SPEED);

    // 위치 업데이트
    const radians = carRotation.value;
    carPosition.value = {
      x: carPosition.value.x + Math.sin(radians) * speed.value * dt,
      y: carPosition.value.y - Math.cos(radians) * speed.value * dt,
    };
  });

  const carStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: 40,
    height: 80,
    transform: [
      { translateX: carPosition.value.x - 20 },
      { translateY: carPosition.value.y - 40 },
      { rotate: `${carRotation.value}rad` },
    ],
  }));

  return (
    <View style={styles.raceTrack}>
      <Animated.View style={[styles.car, carStyle]}>
        <CarSprite />
      </Animated.View>
    </View>
  );
}
```

## 📱 sometimes-app 적용 사례

### 프로필 카드 틸트 효과

```typescript
// src/features/profile/hooks/use-profile-card-tilt.ts
export function useProfileCardTilt() {
  const gravity = useAnimatedSensor(SensorType.GRAVITY, { interval: 16 });
  const smoothed = useLowPassFilter(gravity, 0.06);

  // 최대 틸트 각도 제한
  const MAX_TILT = 12;

  const cardStyle = useAnimatedStyle(() => {
    const { x, y } = smoothed.value;

    // 틸트 각도 계산 및 제한
    const rotateX = interpolate(
      y,
      [-1, 1],
      [MAX_TILT, -MAX_TILT],
      'clamp'
    );

    const rotateY = interpolate(
      x,
      [-1, 1],
      [-MAX_TILT, MAX_TILT],
      'clamp'
    );

    return {
      transform: [
        { perspective: 1000 },
        { rotateX: `${rotateX}deg` },
        { rotateY: `${rotateY}deg` },
      ],
    };
  });

  // 그라디언트 오버레이 (빛 반사 효과)
  const gradientStyle = useAnimatedStyle(() => {
    const { x, y } = smoothed.value;

    // 빛 위치 계산
    const lightX = interpolate(x, [-1, 1], [0, 100]);
    const lightY = interpolate(y, [-1, 1], [0, 100]);
    const intensity = Math.sqrt(x * x + y * y) * 0.2;

    return {
      opacity: intensity,
      // React Native에서는 CSS gradient 불가, 대안 필요
      backgroundColor: `rgba(255, 255, 255, ${intensity})`,
    };
  });

  // 그림자 효과
  const shadowStyle = useAnimatedStyle(() => {
    const { x, y } = smoothed.value;

    return {
      shadowOffset: {
        width: x * -10,
        height: -y * 10 + 5,
      },
      shadowOpacity: 0.2 + Math.abs(x * y) * 0.1,
      shadowRadius: 15,
      shadowColor: '#000',
    };
  });

  return { cardStyle, gradientStyle, shadowStyle };
}

// 사용
function ProfileCard({ user }: { user: User }) {
  const { cardStyle, gradientStyle, shadowStyle } = useProfileCardTilt();

  return (
    <Animated.View style={[styles.card, cardStyle, shadowStyle]}>
      <Image source={{ uri: user.photoUrl }} style={styles.photo} />
      <View style={styles.info}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.university}>{user.university}</Text>
      </View>
      <Animated.View style={[styles.shineOverlay, gradientStyle]} />
    </Animated.View>
  );
}
```

### 매칭 대기 흔들기 감지

```typescript
// src/features/idle-match-timer/hooks/use-shake-to-refresh.ts
export function useShakeToRefresh(onShake: () => void) {
  const accelerometer = useAnimatedSensor(SensorType.ACCELEROMETER, {
    interval: 100, // 100ms 간격
  });

  const shakeThreshold = 15;
  const shakeCooldown = 1000; // 1초 쿨다운
  const lastShakeTime = useSharedValue(0);
  const shakeCount = useSharedValue(0);
  const requiredShakes = 2;

  useAnimatedReaction(
    () => {
      const { x, y, z } = accelerometer.sensor.value;
      return Math.sqrt(x * x + y * y + z * z);
    },
    (magnitude, prevMagnitude) => {
      const now = Date.now();

      // 임계값 초과 감지
      if (magnitude > shakeThreshold && (prevMagnitude ?? 0) <= shakeThreshold) {
        // 연속 흔들기 체크
        if (now - lastShakeTime.value < 500) {
          shakeCount.value += 1;
        } else {
          shakeCount.value = 1;
        }

        lastShakeTime.value = now;

        // 필요한 횟수 도달
        if (shakeCount.value >= requiredShakes) {
          shakeCount.value = 0;
          runOnJS(triggerHapticAndCallback)();
        }
      }
    }
  );

  const triggerHapticAndCallback = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onShake();
  };

  // 시각적 피드백
  const shakeIndicatorStyle = useAnimatedStyle(() => {
    const intensity = Math.min(shakeCount.value / requiredShakes, 1);

    return {
      opacity: intensity * 0.5,
      transform: [{ scale: 1 + intensity * 0.1 }],
    };
  });

  return { shakeIndicatorStyle };
}
```

## ⚠️ 흔한 실수와 해결법

### 1. 센서 노이즈 처리 누락

```typescript
// ❌ 필터링 없이 직접 사용
const style = useAnimatedStyle(() => ({
  transform: [{ translateX: accelerometer.sensor.value.x * 100 }],
}));

// ✅ 로우패스 필터 적용
const smoothed = useLowPassFilter(accelerometer, 0.1);
const style = useAnimatedStyle(() => ({
  transform: [{ translateX: smoothed.value.x * 100 }],
}));
```

### 2. 센서 구독 관리

```typescript
// 센서는 컴포넌트 마운트 해제 시 자동 정리됨
// 하지만 조건부 사용 시 주의

// ✅ 필요할 때만 센서 활성화
const accelerometer = useAnimatedSensor(SensorType.ACCELEROMETER, {
  interval: isActive ? 16 : -1, // -1은 비활성화
});
```

## 💡 성능 최적화 팁

### 1. 적절한 업데이트 간격

```typescript
// 고빈도 필요 없는 경우 간격 늘리기
useAnimatedSensor(SensorType.ACCELEROMETER, {
  interval: 33, // 30fps로 충분
});
```

### 2. 필요할 때만 계산

```typescript
useFrameCallback((info) => {
  // 센서 데이터가 변경됐을 때만 계산
  if (Math.abs(sensor.sensor.value.x - lastX.value) < 0.01) return;

  // 무거운 계산
});
```

## 🏋️ 연습 문제

### 과제 1: 나침반 앱
자이로/가속도계를 사용해 나침반 UI를 구현하세요.

### 과제 2: 수평계
중력 센서를 사용해 정밀한 수평계를 만드세요.

### 과제 3: 제스처 인식
센서 데이터로 특정 동작(예: 손목 돌리기)을 인식하세요.

## 📚 이 장에서 배운 내용

1. **센서 유형**: 가속도계, 자이로, 중력, 회전
2. **데이터 필터링**: 로우패스, 하이패스, 칼만 필터
3. **패럴랙스**: 다층 깊이감 효과
4. **게임 활용**: 물리 시뮬레이션, 조향
5. **실전 적용**: 틸트 카드, 흔들기 감지

## 다음 장 예고

**Chapter 47: 워크릿 테스팅과 디버깅**에서는 워크릿 코드를 효과적으로 테스트하고 디버깅하는 전략을 배웁니다. 개발 도구, 성능 프로파일링, 그리고 일반적인 문제 해결 방법을 다룹니다.
