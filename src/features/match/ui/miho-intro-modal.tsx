import { useEffect } from "react";
import { semanticColors } from "../../../shared/constants/colors";
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Text as RNText,
} from "react-native";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
  withSpring,
} from "react-native-reanimated";

const { width: screenWidth } = Dimensions.get("window");

interface MihoIntroModalProps {
  visible: boolean;
  onClose: () => void;
}

const MihoIntroModal: React.FC<MihoIntroModalProps> = ({
  visible,
  onClose,
}) => {
  const modalOpacity = useSharedValue(0);
  const mihoScale = useSharedValue(0);
  const speechBubbleScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
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

      speechBubbleScale.value = withDelay(
        600,
        withSpring(1, {
          damping: 12,
          stiffness: 200,
        })
      );
    } else {
      modalOpacity.value = 0;
      mihoScale.value = 0;
      speechBubbleScale.value = 0;
    }
  }, [visible, modalOpacity, mihoScale, speechBubbleScale]);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
  }));

  const mihoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mihoScale.value }],
  }));

  const speechBubbleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: speechBubbleScale.value }],
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

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, modalAnimatedStyle]}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.container, speechBubbleAnimatedStyle]}>
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.speechBubbleContainer}>
              <View style={styles.speechBubble}>
                <RNText style={styles.speechTitle}>미호가 물어왔어요!</RNText>
                <RNText style={styles.speechText}>쉿! 비밀인데요..🤫</RNText>
                <RNText style={styles.speechText}>
                  제가 봤을때 두 분.. 역대급 조합이에요!
                </RNText>
                <View style={styles.closeButtonContainer}>
                  <RNText style={styles.closeButtonText}>터치해서 닫기</RNText>
                </View>
              </View>
              <View style={styles.speechTail} />
            </View>
          </TouchableWithoutFeedback>

          <Animated.View style={[styles.mihoContainer, mihoAnimatedStyle]}>
            <Image
              source={require("@assets/images/instagram-some.png")}
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 100,
  },
  container: {
    width: screenWidth * 0.9,
    maxWidth: 400,
    position: "relative",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  mihoContainer: {
    position: "absolute",
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
  speechBubble: {
    backgroundColor: semanticColors.surface.secondary,
    borderRadius: 16,
    padding: 18,
    minHeight: 120,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  speechTail: {
    position: "absolute",
    bottom: 20,
    right: -8,
    width: 0,
    height: 0,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderLeftWidth: 12,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: semanticColors.surface.secondary,
  },
  speechTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: semanticColors.brand.accent,
    marginBottom: 8,
    textAlign: "left",
  },
  speechText: {
    fontSize: 14,
    color: semanticColors.text.primary,
    lineHeight: 20,
    marginBottom: 4,
    textAlign: "left",
  },
  closeButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: semanticColors.surface.background,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  closeButtonText: {
    fontSize: 14,
    color: semanticColors.text.primary,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default MihoIntroModal;

