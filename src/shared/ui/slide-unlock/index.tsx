import React, { useEffect } from 'react';
import { Platform, StyleSheet, View, Text as RNText } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSpring,
  withSequence,
  runOnJS,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { semanticColors } from '@/src/shared/constants/colors';

type SlideUnlockSize = 'sm' | 'md' | 'lg';

export interface SlideUnlockProps {
  onAction: () => void;
  text?: string;
  threshold?: number;
  size?: SlideUnlockSize;
}

const SIZE_CONFIG = {
  sm: {
    containerHeight: 50,
    handleSize: 40,
    padding: 5,
    fontSize: 16,
    iconSize: 20,
  },
  md: {
    containerHeight: 60,
    handleSize: 50,
    padding: 5,
    fontSize: 18,
    iconSize: 22,
  },
  lg: {
    containerHeight: 70,
    handleSize: 60,
    padding: 5,
    fontSize: 20,
    iconSize: 24,
  },
} as const;

const CONTAINER_BG_COLOR = '#FCFAFF';
const UNLOCK_THRESHOLD = 0.7;

export const SlideUnlock: React.FC<SlideUnlockProps> = ({
  onAction,
  text = '스와이프하여 진짜 설렘 찾기',
  threshold = UNLOCK_THRESHOLD,
  size = 'md',
}) => {
  const config = SIZE_CONFIG[size];
  const [containerWidth, setContainerWidth] = React.useState(0);
  const translateX = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const glowIntensity = useSharedValue(0);
  const isUnlocking = useSharedValue(false);

  const maxDrag = containerWidth - config.handleSize - config.padding * 2;
  const borderWidth = 2;
  const verticalPadding = (config.containerHeight - config.handleSize - borderWidth) / 2;

  // Glow animation for Native text
  useEffect(() => {
    glowIntensity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  // Pulse animation for handle
  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.15, { duration: 1000, easing: Easing.ease }),
      -1,
      true
    );
  }, []);

  const handleUnlockSuccess = () => {
    if (Platform.OS !== 'web') {
      try {
        const { impactAsync, ImpactFeedbackStyle } = require('expo-haptics');
        impactAsync(ImpactFeedbackStyle.Medium);
      } catch (error) {}
    }
    onAction();
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (isUnlocking.value) return;
      const newX = Math.max(0, Math.min(event.translationX, maxDrag));
      translateX.value = newX;
    })
    .onEnd(() => {
      if (isUnlocking.value) return;
      const progress = translateX.value / maxDrag;

      if (progress >= threshold) {
        isUnlocking.value = true;
        translateX.value = withSpring(maxDrag, { damping: 15, stiffness: 150 }, () => {
          runOnJS(handleUnlockSuccess)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const handleAnimatedStyle = useAnimatedStyle(() => {
    const scale = isUnlocking.value ? 1 : pulseScale.value;
    return {
      transform: [
        { translateX: translateX.value },
        { scale: interpolate(scale, [1, 1.15], [1, 1.05], Extrapolate.CLAMP) },
      ],
    };
  });

  const textContainerAnimatedStyle = useAnimatedStyle(() => {
    const progress = maxDrag > 0 ? translateX.value / maxDrag : 0;
    return {
      opacity: 1 - progress * 1.5,
    };
  });

  // Native text glow animation
  const nativeTextAnimatedStyle = useAnimatedStyle(() => {
    const glowRadius = interpolate(glowIntensity.value, [0, 1], [2, 12], Extrapolate.CLAMP);
    const glowOpacity = interpolate(glowIntensity.value, [0, 1], [0.3, 0.9], Extrapolate.CLAMP);

    return {
      textShadowColor: `rgba(122, 74, 226, ${glowOpacity})`,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: glowRadius,
    };
  });

  return (
    <View
      style={[
        styles.wrapper,
        {
          height: config.containerHeight,
          borderRadius: config.containerHeight / 2,
        },
      ]}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
      }}
    >
      {/* Background Container */}
      <View
        style={[
          styles.container,
          {
            height: config.containerHeight,
            borderRadius: config.containerHeight / 2,
          },
        ]}
      />

      {/* Text Layer with Shimmer (Web) / Glow (Native) */}
      <Animated.View
        style={[
          styles.textContainer,
          { height: config.containerHeight },
          textContainerAnimatedStyle,
        ]}
      >
        {Platform.OS === 'web' ? (
          <RNText
            style={[
              styles.text,
              styles.shimmerTextWeb,
              { fontSize: config.fontSize },
            ]}
          >
            {text}
          </RNText>
        ) : (
          <Animated.Text
            style={[
              styles.text,
              { fontSize: config.fontSize },
              nativeTextAnimatedStyle,
            ]}
          >
            {text}
          </Animated.Text>
        )}
      </Animated.View>

      {/* Handle */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.handleWrapper,
            {
              left: config.padding,
              top: verticalPadding,
              width: config.handleSize,
              height: config.handleSize,
            },
            handleAnimatedStyle,
          ]}
        >
          <View
            style={[
              styles.handle,
              {
                width: config.handleSize,
                height: config.handleSize,
                borderRadius: config.handleSize / 2,
              },
            ]}
          >
            <Animated.Text style={[styles.handleIcon, { fontSize: config.iconSize }]}>
              ➜
            </Animated.Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    position: 'relative',
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: CONTAINER_BG_COLOR,
    borderWidth: 2,
    borderColor: `${semanticColors.brand.primary}26`,
    ...Platform.select({
      ios: {
        shadowColor: semanticColors.brand.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: `0 2px 8px ${semanticColors.brand.primary}26`,
      },
    }),
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
    color: semanticColors.brand.primary,
    letterSpacing: -0.3,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  shimmerTextWeb: Platform.select({
    web: {
      animationName: 'textGlow',
      animationDuration: '2s',
      animationIterationCount: 'infinite',
      animationTimingFunction: 'ease-in-out',
    } as any,
    default: {},
  }),
  handleWrapper: {
    position: 'absolute',
  },
  handle: {
    backgroundColor: semanticColors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: semanticColors.brand.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: `0 4px 10px ${semanticColors.brand.primary}66`,
        cursor: 'grab',
      },
    }),
  },
  handleIcon: {
    color: '#FFFFFF',
  },
});
