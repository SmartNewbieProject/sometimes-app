import colors , { semanticColors } from "@/src/shared/constants/colors";

import { cn } from "@/src/shared/libs";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PhotoPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => Promise<string | null>;
  showGuide?: boolean;
  onPickFromGallery: () => Promise<string | null>;
}

const PhotoPickerModal = ({
  visible,
  onClose,
  onTakePhoto,
  showGuide = true,
  onPickFromGallery,
}: PhotoPickerModalProps) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { paddingBottom: insets.bottom }]}>
        {showGuide && (
          <View style={[styles.info, { bottom: insets.bottom + 192 }]}>
            <Text style={[styles.infoText]}>
              {t("features.mypage.image-modal.tips_1")}
            </Text>

            <Text style={[styles.infoText]}>
              {t("features.mypage.image-modal.tips_2")}
            </Text>

            <Text style={[styles.infoText]}>
              {t("features.mypage.image-modal.tips_3")}
            </Text>
          </View>
        )}
        <View style={[styles.modalContainer, { bottom: insets.bottom + 74 }]}>
          <TouchableOpacity onPress={onTakePhoto} style={styles.option}>
            <Text style={styles.optionText}>{t("features.mypage.image-modal.take_photo")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onPickFromGallery}
            style={[
              styles.option,
              {
                borderTopWidth: 0.5,
                borderTopColor: "#F3EDFF",
              },
            ]}
          >
            <Text style={styles.optionText}>{t("features.mypage.image-modal.choose_from_library") }</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeButton, { bottom: insets.bottom + 12 }]}
        >
          <Text style={styles.closeText}>{t("features.mypage.image-modal.close")}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    position: "relative",
    ...(Platform.OS === "web" && {
      maxWidth: 468,
      left: "50%",
      marginLeft: -234, // 468 / 2 = 234 (maxWidth의 절반)
    }),
  },
  modalContainer: {
    backgroundColor: semanticColors.surface.background,

    marginHorizontal: 30,
    bottom: 0,
    left: 0,

    right: 0,
    position: "absolute",
    borderRadius: 16,
  },
  option: {
    paddingVertical: 16,
    alignItems: "center",
  },
  optionText: {
    color: semanticColors.text.primary,
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: colors.primaryPurple,
    marginHorizontal: 30,
    bottom: 0,
    left: 0,
    paddingVertical: 16,
    right: 0,
    position: "absolute",
    borderRadius: 16,
    alignItems: "center",
  },
  closeText: {
    color: semanticColors.text.inverse, 
    fontFamily: "Pretendard-Bold",
    fontWeight: 700,
    fontSize: 16,
  },
  info: {
    position: "absolute",
    zIndex: 1000,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  infoText: {
    color: semanticColors.text.inverse,
    textAlign: "center",
    fontSize: 15,
    fontFamily: "Pretendard-Light",
    fontWeight: 300,
    lineHeight: 18,
  },
});

export default PhotoPickerModal;
