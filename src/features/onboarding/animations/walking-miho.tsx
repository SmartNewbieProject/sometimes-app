import { useEffect } from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface WalkingMihoProps {
  isActive: boolean;
}

const schoolImage = require('@assets/images/onboarding/no-time/school.png');
const mihoImage = require('@assets/images/onboarding/no-time/go_home_miho.png');
const homeImage = require('@assets/images/onboarding/no-time/home.png');

const isWeb = Platform.OS === 'web';

const ROTATION_ANGLE = 12;
const STEP_DURATION = 150;
const PAUSE_DURATION = 1500;
const BASE_ROTATION = 10;

export const WalkingMiho = ({ isActive }: WalkingMihoProps) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isWeb) return;

    if (isActive) {
      rotation.value = withRepeat(
        withSequence(
          withTiming(-ROTATION_ANGLE, { duration: STEP_DURATION, easing: Easing.inOut(Easing.ease) }),
          withTiming(ROTATION_ANGLE, { duration: STEP_DURATION, easing: Easing.inOut(Easing.ease) }),
          withTiming(-ROTATION_ANGLE, { duration: STEP_DURATION, easing: Easing.inOut(Easing.ease) }),
          withTiming(ROTATION_ANGLE, { duration: STEP_DURATION, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: STEP_DURATION, easing: Easing.inOut(Easing.ease) }),
          withDelay(PAUSE_DURATION, withTiming(0, { duration: 0 }))
        ),
        -1,
        false
      );
    } else {
      rotation.value = withTiming(0, { duration: 300 });
    }
  }, [isActive, rotation]);

  const animatedMihoStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${BASE_ROTATION + rotation.value}deg` }],
  }));

  const renderMihoImage = () => {
    const mihoImageElement = (
      <Image source={mihoImage} style={styles.image} resizeMode="contain" />
    );

    if (isWeb) {
      return (
        <div
          style={{
            animation: isActive ? 'walkingWithPause 2.7s ease-in-out infinite' : 'none',
          }}
        >
          {mihoImageElement}
        </div>
      );
    }

    return (
      <Animated.View style={animatedMihoStyle}>
        {mihoImageElement}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {isWeb && (
        <style>
          {`
            @keyframes walkingWithPause {
              0% { transform: rotate(10deg); }
              5.5% { transform: rotate(-2deg); }
              11% { transform: rotate(22deg); }
              16.5% { transform: rotate(-2deg); }
              22% { transform: rotate(22deg); }
              27.5% { transform: rotate(10deg); }
              100% { transform: rotate(10deg); }
            }
          `}
        </style>
      )}

      <View style={[styles.imageWrapper, styles.schoolWrapper]}>
        <Image source={schoolImage} style={styles.image} resizeMode="contain" />
      </View>

      <View style={[styles.imageWrapper, styles.mihoWrapper]}>
        {renderMihoImage()}
      </View>

      <View style={[styles.imageWrapper, styles.homeWrapper]}>
        <Image source={homeImage} style={styles.image} resizeMode="contain" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginHorizontal: -30,
  },
  imageWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  schoolWrapper: {
    marginBottom: 70,
  },
  mihoWrapper: {
    marginHorizontal: -30,
  },
  homeWrapper: {
    marginTop: 100,
  },
  image: {
    width: 114,
    height: 114,
  },
});
