import React, { useEffect } from "react";
import { semanticColors } from "../../../../shared/constants/semantic-colors";
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

interface UniversityCertificationPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onCertify: () => void;
  onLater: () => void;
}

export const UniversityCertificationPromptModal: React.FC<UniversityCertificationPromptModalProps> = ({
  visible,
  onClose,
  onCertify,
  onLater,
}) => {
  const { t } = useTranslation();
  const modalOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      modalOpacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });

      contentScale.value = withDelay(
        100,
        withSpring(1, {
          damping: 12,
          stiffness: 250,
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
      duration: 150,
      easing: Easing.in(Easing.ease),
    });
    setTimeout(() => {
      onClose();
    }, 150);
  };

  const handleCertify = () => {
    handleClose();
    setTimeout(() => {
      onCertify();
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
          <View style={styles.speechBubbleContainer}>
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>
                {t("features.event.ui.university_certification_prompt.title")}
              </Text>
              <Text style={styles.subText}>
                {t("features.event.ui.university_certification_prompt.subtitle")}
              </Text>
              <View style={styles.benefitContainer}>
                <View style={styles.gemIconContainer}>
                  <Image
                    source={require("@/assets/images/promotion/home-banner/gem.png")}
                    style={styles.gemImage}
                    resizeMode="contain"
                  />
                </View>
                <View>
                  <Text style={styles.benefitText}>
                    {t("features.event.ui.university_certification_prompt.benefit_text")}
                  </Text>
                  <Text style={styles.benefitSubtext}>
                    바로 지급!
                  </Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  onPress={onLater}
                  variant="secondary"
                  flex="flex-1"
                >
                  {t("features.event.ui.university_certification_prompt.later_button")}
                </Button>
                <Button
                  onPress={handleCertify}
                  variant="primary"
                  flex="flex-1"
                >
                  {t("features.event.ui.university_certification_prompt.certify_button")}
                </Button>
              </View>
            </View>
            <View style={styles.speechTail} />
          </View>

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
    minHeight: 180,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: semanticColors.brand.primary,
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
    borderLeftColor: semanticColors.surface.tertiary,
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
  benefitContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: semanticColors.surface.background,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: semanticColors.brand.primary,
  },
  gemIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: semanticColors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  gemImage: {
    width: 32,
    height: 32,
  },
  benefitText: {
    fontSize: 16,
    color: semanticColors.text.primary,
    fontWeight: "bold",
  },
  benefitSubtext: {
    fontSize: 12,
    color: semanticColors.brand.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  buttonContainer: {
    gap: 8,
    flexDirection: 'row',
  },
});