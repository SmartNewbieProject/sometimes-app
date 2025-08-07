import { useEffect } from "react";
import {
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
  StyleSheet,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const PARTICLE_SIZE = 20;

// 물리 상수
const GRAVITY = 700; // 중력 (값이 클수록 빨리 떨어짐)
const INITIAL_VELOCITY = -400; // 초기 속도 (음수 값은 위로 쏘아 올림)
const ANIMATION_DURATION = 900; // 애니메이션 지속 시간

interface ParticleProps {
  angle: number;
  source: ImageSourcePropType;
  width: number;
  height: number;
  style: StyleProp<ImageStyle>;
}

const ModalParticle = ({
  angle,
  source,
  width,
  height,
  style,
}: ParticleProps) => {
  const CENTER = { x: width / 2, y: height / 2 };
  // 시간(t)의 흐름을 나타내는 Shared Value (0 -> 1)
  const time = useSharedValue(0);
  const opacity = useSharedValue(0);
  // 각도를 라디안으로 변환
  const angleRad = (angle * Math.PI) / 180;

  useEffect(() => {
    time.value = withTiming(1, {
      duration: ANIMATION_DURATION,
      easing: Easing.linear,
    });
    opacity.value = withTiming(1, {
      duration: ANIMATION_DURATION,
      easing: Easing.in(Easing.ease),
    });
  }, [time]);

  const animatedStyle = useAnimatedStyle(() => {
    const t = time.value * (ANIMATION_DURATION / 1000);

    // 1. 초기 속도 분해
    const v_x = INITIAL_VELOCITY * Math.cos(angleRad);
    const v_y = INITIAL_VELOCITY * Math.sin(angleRad);

    // 2. 시간에 따른 위치 계산
    const translateX = v_x * t;
    const translateY = v_y * t + 0.5 * GRAVITY * t * t;

    return {
      transform: [{ translateX }, { translateY }],
      opacity: 1 - opacity.value,
    };
  });

  return (
    <Animated.Image
      source={source}
      style={[
        styles.particleImage,
        { top: CENTER.y, left: CENTER.x },
        animatedStyle,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  particleImage: {
    position: "absolute",
  },
});

export default ModalParticle;
