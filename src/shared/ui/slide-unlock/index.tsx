import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, View, Text as RNText } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  text,
  threshold = UNLOCK_THRESHOLD,
  size = 'md',
}) => {
  const { t } = useTranslation();
  const displayText = text ?? t('slide_unlock.default_text');
  const config = SIZE_CONFIG[size];
  const containerWidthShared = useSharedValue(0);
  const translateX = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const glowIntensity = useSharedValue(0);
  const isUnlocking = useSharedValue(false);

  // 웹용 드래그 상태
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);

  // JS 레이어용 containerWidth (웹 핸들러에서 사용)
  const [containerWidth, setContainerWidth] = React.useState(0);
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

  // 웹용 드래그 핸들러
  const handleWebPointerDown = (event: any) => {
    if (Platform.OS !== 'web') return;
    if (isUnlocking.value) return;

    isDraggingRef.current = true;
    startXRef.current = event.nativeEvent.pageX || event.nativeEvent.clientX;
    event.preventDefault();
  };

  const handleWebPointerMove = (event: any) => {
    if (Platform.OS !== 'web') return;
    if (!isDraggingRef.current || isUnlocking.value) return;

    const currentX = event.nativeEvent.pageX || event.nativeEvent.clientX;
    const deltaX = currentX - startXRef.current;
    const newX = Math.max(0, Math.min(deltaX, maxDrag));
    translateX.value = newX;
  };

  const handleWebPointerUp = () => {
    if (Platform.OS !== 'web') return;
    if (!isDraggingRef.current || isUnlocking.value) return;

    isDraggingRef.current = false;
    const progress = translateX.value / maxDrag;

    if (progress >= threshold) {
      isUnlocking.value = true;
      translateX.value = withTiming(maxDrag, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
      handleUnlockSuccess();
    } else {
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    }
  };

  // 웹에서 드래그 중 페이지를 벗어났을 때
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleGlobalPointerUp = () => {
      if (isDraggingRef.current) {
        handleWebPointerUp();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pointerup', handleGlobalPointerUp);
      window.addEventListener('mouseup', handleGlobalPointerUp);
      return () => {
        window.removeEventListener('pointerup', handleGlobalPointerUp);
        window.removeEventListener('mouseup', handleGlobalPointerUp);
      };
    }
  }, [maxDrag, threshold]);

  const handleSize = config.handleSize;
  const padding = config.padding;

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
      if (isUnlocking.value) return;
      const currentMaxDrag = containerWidthShared.value - handleSize - padding * 2;
      if (currentMaxDrag <= 0) return;
      const newX = Math.max(0, Math.min(event.translationX, currentMaxDrag));
      translateX.value = newX;
    })
    .onEnd(() => {
      'worklet';
      if (isUnlocking.value) return;
      const currentMaxDrag = containerWidthShared.value - handleSize - padding * 2;
      if (currentMaxDrag <= 0) return;

      const progress = translateX.value / currentMaxDrag;

      if (progress >= threshold) {
        isUnlocking.value = true;
        translateX.value = withTiming(currentMaxDrag, {
          duration: 200,
          easing: Easing.out(Easing.cubic),
        });
        runOnJS(handleUnlockSuccess)();
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
    const currentMaxDrag = containerWidthShared.value - handleSize - padding * 2;
    const progress = currentMaxDrag > 0 ? translateX.value / currentMaxDrag : 0;
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
        containerWidthShared.value = width;
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
            {displayText}
          </RNText>
        ) : (
          <Animated.Text
            style={[
              styles.text,
              { fontSize: config.fontSize },
              nativeTextAnimatedStyle,
            ]}
          >
            {displayText}
          </Animated.Text>
        )}
      </Animated.View>

      {/* Handle */}
      {Platform.OS === 'web' ? (
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
          onPointerDown={handleWebPointerDown}
          onPointerMove={handleWebPointerMove}
          onPointerUp={handleWebPointerUp}
          {...{
            onMouseDown: handleWebPointerDown,
            onMouseMove: handleWebPointerMove,
            onMouseUp: handleWebPointerUp,
          } as any}
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
      ) : (
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
      )}
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
    ...Platform.select({
      web: {
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      } as any,
      default: {},
    }),
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
