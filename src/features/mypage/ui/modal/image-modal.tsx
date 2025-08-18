import colors from "@/src/shared/constants/colors";
import { cn } from "@/src/shared/libs";
import React from "react";
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
  onPickFromGallery: () => Promise<string | null>;
}

const PhotoPickerModal = ({
  visible,
  onClose,
  onTakePhoto,
  onPickFromGallery,
}: PhotoPickerModalProps) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { paddingBottom: insets.bottom }]}>
        <View style={[styles.info, { bottom: insets.bottom + 192 }]}>
          <Text style={[styles.infoText]}>
            모든 사진은 안전하게 보관됩니다.
          </Text>

          <Text style={[styles.infoText]}>
            프로필은 매칭 상대에게만 보여집니다.
          </Text>

          <Text style={[styles.infoText]}>
            본인의 사진이 아닌 경우에는 매칭이 제한됩니다.
          </Text>
        </View>
        <View style={[styles.modalContainer, { bottom: insets.bottom + 74 }]}>
          <TouchableOpacity onPress={onTakePhoto} style={styles.option}>
            <Text style={styles.optionText}>사진 찍기</Text>
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
            <Text style={styles.optionText}>앨범에서 가져오기</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeButton, { bottom: insets.bottom + 12 }]}
        >
          <Text style={styles.closeText}>닫기</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    position: "relative",
  },
  modalContainer: {
    backgroundColor: "white",

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
    color: "white",
    fontFamily: "Pretendard-Bold",
    fontWeight: 700,
    fontSize: 16,
  },
  info: {},
  infoText: {
    color: "#EEE8FA",
    textAlign: "center",
    fontSize: 15,
    fontFamily: "Pretendard-Light",
    fontWeight: 300,
    lineHeight: 18,
  },
});

export default PhotoPickerModal;
