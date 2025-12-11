import React, { useEffect } from "react";
import { semanticColors } from "../../../../shared/constants/colors";
import {
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
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { Button } from "@/src/shared/ui";

const { width: screenWidth } = Dimensions.get("window");

interface CommunityEventPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onWriteArticle: () => void;
  onLater: () => void;
}

export const CommunityEventPromptModal: React.FC<CommunityEventPromptModalProps> = ({
  visible,
  onClose,
  onWriteArticle,
  onLater,
}) => {
  const { t } = useTranslation();
  const modalOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      modalOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });

      contentScale.value = withDelay(
        200,
        withSpring(1, {
          damping: 15,
          stiffness: 150,
        })
      );
    } else {
      modalOpacity.value = 0;
      contentScale.value = 0;
    }
  }, [visible]);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentScale.value }],
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

  const handleWriteArticle = () => {
    handleClose();
    setTimeout(() => {
      onWriteArticle();
    }, 300);
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.container, modalAnimatedStyle]}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.modalContainer, contentAnimatedStyle]}>
          {/* 말풍선 */}
          <View style={styles.speechBubbleContainer}>
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>
                {t("features.event.ui.community_event_prompt.title")}
              </Text>
              <Text style={styles.subText}>
                {t("features.event.ui.community_event_prompt.subtitle")}
              </Text>
              <View style={styles.gemReward}>
                <Text style={styles.gemText}>
                  {t("features.event.ui.community_event_prompt.gem_label")}
                </Text>
                <Text style={styles.rewardText}>
                  {t("features.event.ui.community_event_prompt.reward_text", { gems: 7 })}
                </Text>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  onPress={onLater}
                  variant="secondary"
                  flex="flex-1"
                >
                  {t("features.event.ui.community_event_prompt.later_button")}
                </Button>
                <Button
                  onPress={handleWriteArticle}
                  variant="primary"
                  flex="flex-1"
                >
                  {t("features.event.ui.community_event_prompt.write_button")}
                </Button>
              </View>
            </View>
            <View style={styles.speechTail} />
          </View>

          {/* 캐릭터 */}
          <View style={styles.characterContainer}>
            <Image
              source={require("@assets/images/instagram-some.png")}
              style={styles.characterImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 100,
    zIndex: 1000,
  },
  container: {
    flex: 1,
    width: "100%",
  },
  modalContainer: {
    width: screenWidth * 0.9,
    maxWidth: 400,
    position: "relative",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  characterContainer: {
    position: "absolute",
    bottom: -10,
    right: -20,
    zIndex: 2,
  },
  characterImage: {
    width: 80,
    height: 80,
  },
  speechBubbleContainer: {
    zIndex: 3,
    marginRight: 60,
  },
  speechBubble: {
    backgroundColor: semanticColors.surface.secondary,
    borderRadius: 16,
    padding: 18,
    minHeight: 160,
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
    color: semanticColors.text.primary,
    marginBottom: 6,
    textAlign: "left",
  },
  subText: {
    fontSize: 14,
    color: semanticColors.text.primary,
    lineHeight: 20,
    marginBottom: 14,
    textAlign: "left",
  },
  gemReward: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: semanticColors.surface.background,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  gemText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  rewardText: {
    fontSize: 16,
    color: semanticColors.text.primary,
    fontWeight: "600",
  },
  buttonContainer: {
    gap: 8,
    flexDirection: 'row',
  },
});