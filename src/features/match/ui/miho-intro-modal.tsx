import { useEffect, useMemo, useCallback } from 'react';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Text as RNText,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
  withSpring,
  withSequence,
  withRepeat,
  runOnJS,
} from 'react-native-reanimated';
import {
  getMihoMessage,
  getRarityStyle,
  getRarityLabel,
} from '../services/miho-message-service';
import { MatchContext, RarityTier, MihoMessage } from '../types/miho-message';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CONFETTI_EMOJIS = ['🎉', '✨', '💫', '🌟', '💜', '👑'];
const CONFETTI_COUNT = 12;

interface MihoIntroModalProps {
  visible: boolean;
  onClose: () => void;
  matchContext?: MatchContext;
  onMessageShown?: (message: MihoMessage) => void;
}

interface ConfettiPieceProps {
  emoji: string;
  delay: number;
  startX: number;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ emoji, delay, startX }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const randomEndX = startX + (Math.random() - 0.5) * 100;
    const duration = 2000 + Math.random() * 1000;

    translateY.value = withDelay(
      delay,
      withTiming(screenHeight * 0.6, { duration, easing: Easing.out(Easing.quad) })
    );
    translateX.value = withDelay(
      delay,
      withTiming(randomEndX, { duration, easing: Easing.inOut(Easing.sin) })
    );
    rotate.value = withDelay(
      delay,
      withTiming(360 * (Math.random() > 0.5 ? 1 : -1), { duration })
    );
    opacity.value = withDelay(
      delay + duration - 500,
      withTiming(0, { duration: 500 })
    );
  }, [delay, startX, translateY, translateX, rotate, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.confettiPiece, animatedStyle]}>
      <RNText style={styles.confettiEmoji}>{emoji}</RNText>
    </Animated.View>
  );
};

const MihoIntroModal: React.FC<MihoIntroModalProps> = ({
  visible,
  onClose,
  matchContext = { matchScore: 50 },
  onMessageShown,
}) => {
  const modalOpacity = useSharedValue(0);
  const mihoScale = useSharedValue(0);
  const speechBubbleScale = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);
  const glowScale = useSharedValue(1);

  const message = useMemo(() => {
    if (!visible) return null;
    return getMihoMessage(matchContext);
  }, [visible, matchContext]);

  const confettiPieces = useMemo(() => {
    return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      id: i,
      emoji: CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length],
      delay: 600 + Math.random() * 400,
      startX: (screenWidth / CONFETTI_COUNT) * i,
    }));
  }, []);

  useEffect(() => {
    if (visible && message && onMessageShown) {
      onMessageShown(message);
    }
  }, [visible, message, onMessageShown]);

  const rarityStyle = useMemo(() => {
    if (!message) return null;
    return getRarityStyle(message.rarity);
  }, [message]);

  const rarityLabel = useMemo(() => {
    if (!message) return '';
    return getRarityLabel(message.rarity);
  }, [message]);

  useEffect(() => {
    if (visible && rarityStyle) {
      modalOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });

      mihoScale.value = withDelay(
        200,
        withSpring(1, {
          damping: 15,
          stiffness: 150,
        })
      );

      const animationConfig = getAnimationConfig(rarityStyle.animation);
      speechBubbleScale.value = withDelay(600, animationConfig);

      if (rarityStyle.sparkle) {
        sparkleOpacity.value = withDelay(
          800,
          withRepeat(
            withSequence(
              withTiming(1, { duration: 400 }),
              withTiming(0.3, { duration: 400 })
            ),
            -1,
            true
          )
        );
      }

      if (rarityStyle.glow) {
        glowScale.value = withDelay(
          800,
          withRepeat(
            withSequence(
              withTiming(1.05, { duration: 600 }),
              withTiming(1, { duration: 600 })
            ),
            -1,
            true
          )
        );
      }
    } else {
      modalOpacity.value = 0;
      mihoScale.value = 0;
      speechBubbleScale.value = 0;
      sparkleOpacity.value = 0;
      glowScale.value = 1;
    }
  }, [
    visible,
    rarityStyle,
    modalOpacity,
    mihoScale,
    speechBubbleScale,
    sparkleOpacity,
    glowScale,
  ]);

  const getAnimationConfig = (animation: string) => {
    switch (animation) {
      case 'bounce':
        return withSpring(1, { damping: 8, stiffness: 200 });
      case 'shake':
        return withSequence(
          withSpring(1.1, { damping: 5, stiffness: 300 }),
          withSpring(1, { damping: 10, stiffness: 200 })
        );
      case 'heartbeat':
        return withSequence(
          withSpring(1.15, { damping: 5, stiffness: 400 }),
          withSpring(0.95, { damping: 5, stiffness: 400 }),
          withSpring(1.1, { damping: 5, stiffness: 400 }),
          withSpring(1, { damping: 10, stiffness: 200 })
        );
      case 'slideUp':
        return withSpring(1, { damping: 14, stiffness: 180 });
      default:
        return withSpring(1, { damping: 12, stiffness: 200 });
    }
  };

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
  }));

  const mihoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mihoScale.value }],
  }));

  const speechBubbleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: speechBubbleScale.value },
      { scale: glowScale.value },
    ],
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  const handleClose = () => {
    modalOpacity.value = withTiming(0, {
      duration: 200,
      easing: Easing.in(Easing.ease),
    });
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!visible || !message || !rarityStyle) return null;

  const isSpecialRarity =
    message.rarity === RarityTier.RARE ||
    message.rarity === RarityTier.EPIC ||
    message.rarity === RarityTier.LEGENDARY;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, modalAnimatedStyle]}>
        {rarityStyle.confetti && (
          <View style={styles.confettiContainer} pointerEvents="none">
            {confettiPieces.map((piece) => (
              <ConfettiPiece
                key={piece.id}
                emoji={piece.emoji}
                delay={piece.delay}
                startX={piece.startX}
              />
            ))}
          </View>
        )}

        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.container, speechBubbleAnimatedStyle]}
        >
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.speechBubbleContainer}>
              {rarityStyle.glow && (
                <View
                  style={[
                    styles.glowEffect,
                    { backgroundColor: rarityStyle.accentColor },
                  ]}
                />
              )}
              <View
                style={[
                  styles.speechBubble,
                  { backgroundColor: rarityStyle.bubbleColor },
                ]}
              >
                {isSpecialRarity && rarityLabel && (
                  <View style={styles.rarityBadge}>
                    <RNText style={styles.rarityBadgeText}>
                      {rarityLabel}
                    </RNText>
                  </View>
                )}

                <RNText
                  style={[
                    styles.speechTitle,
                    { color: rarityStyle.accentColor },
                  ]}
                >
                  {message.title}
                </RNText>

                {message.lines.map((line, index) => (
                  <RNText key={index} style={styles.speechText}>
                    {line}
                  </RNText>
                ))}

                {rarityStyle.sparkle && (
                  <Animated.View
                    style={[styles.sparkleContainer, sparkleAnimatedStyle]}
                  >
                    <RNText style={styles.sparkleEmoji}>✨</RNText>
                  </Animated.View>
                )}

                <View style={styles.closeButtonContainer}>
                  <RNText style={styles.closeButtonText}>터치해서 닫기</RNText>
                </View>
              </View>
              <View
                style={[
                  styles.speechTail,
                  { borderLeftColor: rarityStyle.bubbleColor },
                ]}
              />
            </View>
          </TouchableWithoutFeedback>

          <Animated.View style={[styles.mihoContainer, mihoAnimatedStyle]}>
            <Image
              source={require('@assets/images/instagram-some.png')}
              style={styles.mihoImage}
              contentFit="contain"
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 100,
  },
  container: {
    width: screenWidth * 0.9,
    maxWidth: 400,
    position: 'relative',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  mihoContainer: {
    position: 'absolute',
    bottom: -10,
    right: -20,
    zIndex: 2,
  },
  mihoImage: {
    width: 100,
    height: 150,
  },
  speechBubbleContainer: {
    zIndex: 3,
    marginRight: 80,
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    opacity: 0.3,
  },
  speechBubble: {
    backgroundColor: semanticColors.surface.secondary,
    borderRadius: 16,
    padding: 18,
    minHeight: 120,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  rarityBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rarityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sparkleContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  sparkleEmoji: {
    fontSize: 16,
  },
  speechTail: {
    position: 'absolute',
    bottom: 20,
    right: -8,
    width: 0,
    height: 0,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderLeftWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: semanticColors.surface.secondary,
  },
  speechTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: semanticColors.brand.accent,
    marginBottom: 8,
    textAlign: 'left',
  },
  speechText: {
    fontSize: 14,
    color: semanticColors.text.primary,
    lineHeight: 20,
    marginBottom: 4,
    textAlign: 'left',
  },
  closeButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: semanticColors.surface.background,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  closeButtonText: {
    fontSize: 14,
    color: semanticColors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  confettiPiece: {
    position: 'absolute',
    top: 0,
  },
  confettiEmoji: {
    fontSize: 24,
  },
});

export default MihoIntroModal;
