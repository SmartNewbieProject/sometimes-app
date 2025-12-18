import React, { useState, useRef, useEffect } from 'react';
import { semanticColors } from '../../../shared/constants/colors';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate
} from 'react-native-reanimated';
import { ImageResource } from '@shared/ui';
import { ImageResources } from '@/src/shared/libs/image';
import i18n from '@/src/shared/libs/i18n';

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
    backgroundColor: semanticColors.surface.background,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
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
      style={styles.touchable}
    >
      <View style={styles.container}>
        <Animated.View
          style={[cardStyle, styles.cardFace, frontAnimatedStyle]}
        >
          <ImageResource
            resource={initialImage}
            contentFit="cover"
            loadingTitle={i18n.t("features.pre-signup.ui.common.loading_card_image")}
            style={styles.image}
          />
        </Animated.View>

        <Animated.View
          style={[cardStyle, styles.cardFace, backAnimatedStyle]}
        >
          <ImageResource
            resource={switchImage}
            contentFit="cover"
            loadingTitle={i18n.t("features.pre-signup.ui.common.loading_card_image")}
            style={styles.image}
          />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
    height: '100%',
  },
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'visible',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    borderRadius: 18.34,
  },
});
