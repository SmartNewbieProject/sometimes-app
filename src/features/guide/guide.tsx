import { Image } from "expo-image";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import type React from "react";
import { useEffect } from "react";
import { Modal, StyleSheet, View } from "react-native";

interface GuideProps {
  isVisible: boolean;
  handleClose: () => void;
  children: React.ReactNode;
  height?: number;
}

function Guide({ isVisible, handleClose, children, height = 120 }: GuideProps) {
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        handleClose();
      }, 5000);
    }
  }, [isVisible]);
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.boxContainer, { height }]}>
          {children}
          <Image
            source={require("@assets/images/guide-miho.png")}
            style={styles.image}
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
  boxContainer: {
    width: 310,
    marginHorizontal: "auto",
    bottom: 140,

    backgroundColor: semanticColors.surface.background,
    borderRadius: 20,
    padding: 16,
    position: "absolute",
  },
  image: {
    position: "absolute",
    right: -24,
    bottom: -95,
    width: 120,
    height: 180,
  },
});

export default Guide;
