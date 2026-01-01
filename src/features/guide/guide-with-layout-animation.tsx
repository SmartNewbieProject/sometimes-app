
import { Image } from "expo-image";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import type React from "react";
import {
  Modal,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useTranslation } from "react-i18next";

interface GuideWithLayoutAnimationProps {
  lastStyle: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  isVisible: boolean;
  handleClose: () => void;
}

function GuideWithLayoutAnimation({
  lastStyle,
  children,
  isVisible,
  handleClose,
}: GuideWithLayoutAnimationProps) {
  const { t } = useTranslation();
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.infoWrapper}>
          <Text style={styles.infoTitle}>{t("features.guide.ui.profile_guide.title")}</Text>
          <Text style={styles.infoDescription}>
            {t("features.guide.ui.profile_guide.description_line1")}
          </Text>
          <Text style={styles.infoDescription}>{t("features.guide.ui.profile_guide.description_line2")}</Text>
          <Image
            source={require("@assets/images/instagram-some.png")}
            style={styles.instagramSomeImage}
          />
          <Image
            source={require("@assets/images/instagram-lock.png")}
            style={styles.instagramLockImage}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    position: "relative",
  },
  infoTitle: {
    color: semanticColors.brand.accent,
    fontWeight: 600,
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 16.8,
    fontSize: 14,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 11,
    lineHeight: 13.2,
    color: "#BAB0D0",
  },
  infoWrapper: {
    bottom: 223,
    position: "absolute",
    marginLeft: 30,
    marginHorizontal: "auto",
    paddingHorizontal: 28,
    paddingVertical: 19,
    borderRadius: 20,
    backgroundColor: semanticColors.surface.background,
    borderWidth: 1,
    borderColor: semanticColors.border.default,

    shadowColor: "#F2ECFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
  },
  instagramSomeImage: {
    width: 116,
    height: 175,
    position: "absolute",
    top: 20,
    right: -66,
  },
  instagramLockImage: {
    width: 52,
    height: 52,
    position: "absolute",
    top: -30,
    left: -30,
    transform: [{ rotate: "-10deg" }],
  },
});

export default GuideWithLayoutAnimation;
