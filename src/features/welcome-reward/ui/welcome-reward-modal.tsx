import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
  Text as RNText,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
  withSpring,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";


const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface WelcomeRewardModalProps {
  visible: boolean;
  onClose: () => void;
}

const WelcomeRewardModal: React.FC<WelcomeRewardModalProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useTranslation();
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
          {/* 말풍선 */}
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.speechBubbleContainer}>
            <View style={styles.speechBubble}>
                <Text style={styles.speechText}>
                  {t("features.welcome-reward.ui.modal.title")}
                </Text>
                <Text style={styles.subText}>
                  {t("features.welcome-reward.ui.modal.subline")}
                </Text>
                <View style={styles.gemReward}>
                  <Text style={styles.gemText}>{t("features.welcome-reward.ui.modal.gem_reward_label")}</Text>
                  <Text style={styles.rewardText}>{t("features.welcome-reward.ui.modal.reward_text")}</Text>
                </View>
                <View style={styles.closeButtonContainer}>
                  <RNText style={styles.closeButtonText} onPress={handleClose}>
                    {t("features.welcome-reward.ui.modal.close_hint")}
                  </RNText>
                </View>
              </View>
              <View style={styles.speechTail} />
            </View>
          </TouchableWithoutFeedback>

          {/* 미호 캐릭터 */}
          <Animated.View style={[styles.mihoContainer, mihoAnimatedStyle]}>
            <Image
              source={require("@assets/images/instagram-some.png")}
              style={styles.mihoImage}
              resizeMode="contain"
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
    width: 80,
    height: 80,
  },
  speechBubbleContainer: {
    zIndex: 3,
    marginRight: 60,
  },
  speechBubble: {
    backgroundColor: '#F7F3FF',
    borderRadius: 16,
    padding: 18,
    minHeight: 120,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    borderLeftColor: "#F3EDFF",
  },
  speechText: {
    fontSize: 18,
    fontWeight: "bold",
    color: '#000000',
    marginBottom: 6,
    textAlign: "left",
  },
  subText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    marginBottom: 14,
    textAlign: "left",
  },
  gemReward: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  gemText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  rewardText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: "600",
  },
  closeButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  closeButtonText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: "600",
    textAlign: "center",
  },


});

export default WelcomeRewardModal;