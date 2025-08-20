import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
  withSpring,
} from "react-native-reanimated";



const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const isSmallScreen = screenHeight < 700;
const mihoSize = isSmallScreen ? 120 : 140;
const mihoBottom = isSmallScreen ? screenHeight * 0.18 : screenHeight * 0.15;
const speechBubbleBottom = mihoBottom + mihoSize + 30;

interface WelcomeRewardModalProps {
  visible: boolean;
  onClose: () => void;
}

const WelcomeRewardModal: React.FC<WelcomeRewardModalProps> = ({
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
          <View style={styles.container}>

          {/* 미호 캐릭터 */}
          <Animated.View style={[styles.mihoContainer, mihoAnimatedStyle]}>
            <Image
              source={require("@assets/images/instagram-some.png")}
              style={styles.mihoImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* 말풍선 */}
          <Animated.View style={[styles.speechBubbleContainer, speechBubbleAnimatedStyle]}>
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>
                환영해요! 🎉
              </Text>
              <Text style={styles.subText}>
                가입 축하 선물로{"\n"}
                특별한 선물을 준비했어요
              </Text>
              <View style={styles.gemReward}>
                <Text style={styles.gemText}>구슬 10개</Text>
                <Text style={styles.rewardText}>를 드려요!</Text>
              </View>
            </View>
            <View style={styles.speechTail} />
          </Animated.View>

          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  mihoContainer: {
    position: "absolute",
    bottom: mihoBottom,
    right: screenWidth * 0.05,
    zIndex: 2,
  },
  mihoImage: {
    width: mihoSize,
    height: mihoSize,
  },
  speechBubbleContainer: {
    position: "absolute",
    bottom: speechBubbleBottom,
    left: screenWidth * 0.1,
    right: screenWidth * 0.1,
    zIndex: 3,
  },
  speechBubble: {
    backgroundColor: "#F3EDFF",
    borderRadius: 16,
    padding: isSmallScreen ? 16 : 18,
    minHeight: isSmallScreen ? 100 : 120,
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
    bottom: -8,
    right: 30,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#F3EDFF",
  },
  speechText: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: "bold",
    color: "#6B46C1",
    marginBottom: 6,
    textAlign: "left",
  },
  subText: {
    fontSize: isSmallScreen ? 13 : 14,
    color: "#6B46C1",
    lineHeight: isSmallScreen ? 18 : 20,
    marginBottom: isSmallScreen ? 12 : 14,
    textAlign: "left",
  },
  gemReward: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  gemText: {
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: "bold",
    color: "#8B5CF6",
  },
  rewardText: {
    fontSize: isSmallScreen ? 15 : 16,
    color: "#6B46C1",
    fontWeight: "600",
  },


});

export default WelcomeRewardModal;
