import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate
} from 'react-native-reanimated';
import { ImageResource } from '@shared/ui';
import { ImageResources } from '@/src/shared/libs/image';

interface FlippableCardProps {
  initialImage: ImageResources;
  switchImage: ImageResources;
  onPress?: () => void;
  disableFlip?: boolean;
}

export const FlippableCard: React.FC<FlippableCardProps> = ({ 
  initialImage, 
  switchImage, 
  onPress, 
  disableFlip = false 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rotation = useSharedValue(0);

  const flipCard = () => {
    if (disableFlip) return;

    rotation.value = withSpring(isFlipped ? 0 : 180, {
      damping: 15,
      stiffness: 100
    });

    setIsFlipped(!isFlipped);
    onPress && onPress();
  };

  const startAutoFlipTimer = () => {
    if (flipTimerRef.current) {
      clearInterval(flipTimerRef.current);
    }

    flipTimerRef.current = setInterval(() => {
      flipCard();
    }, 3000) as unknown as NodeJS.Timeout;
  };

  const stopAutoFlipTimer = () => {
    if (flipTimerRef.current) {
      clearInterval(flipTimerRef.current);
      flipTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (disableFlip) {
      stopAutoFlipTimer();
    } else {
      startAutoFlipTimer();
    }

    return () => {
      stopAutoFlipTimer();
    };
  }, [disableFlip, isFlipped]);

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotation.value}deg` },
      { scale: interpolate(
          rotation.value,
          [0, 90, 180],
          [1, 0.9, 1]
        )
      }
    ],
    opacity: interpolate(
      rotation.value,
      [0, 90, 91, 180],
      [1, 0, 0, 0]
    ),
    zIndex: rotation.value < 90 ? 1 : 0,
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotation.value + 180}deg` },
      { scale: interpolate(
          rotation.value,
          [0, 90, 180],
          [1, 0.9, 1]
        )
      }
    ],
    opacity: interpolate(
      rotation.value,
      [0, 89, 90, 180],
      [0, 0, 1, 1]
    ),
    zIndex: rotation.value >= 90 ? 1 : 0,
  }));

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 18.34,
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    borderRadius: 18.34,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={flipCard}
      disabled={disableFlip}
      className="w-full h-full"
    >
      <View className="relative w-full h-full overflow-visible">
        <Animated.View
          className="absolute w-full h-full overflow-hidden"
          style={[cardStyle, frontAnimatedStyle]}
        >
          <ImageResource
            resource={initialImage}
            contentFit="cover"
            loadingTitle="카드 이미지 로딩 중..."
            style={{
              width: '100%',
              height: '100%',
              maxWidth: '100%',
              borderRadius: 18.34,
            }}
            className="w-full h-full"
          />
        </Animated.View>

        <Animated.View
          className="absolute w-full h-full overflow-hidden"
          style={[cardStyle, backAnimatedStyle]}
        >
          <ImageResource
            resource={switchImage}
            contentFit="cover"
            loadingTitle="카드 이미지 로딩 중..."
            style={{
              width: '100%',
              height: '100%',
              maxWidth: '100%',
              borderRadius: 18.34,
            }}
            className="w-full h-full"
          />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};
