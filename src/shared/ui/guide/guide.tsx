import { Image } from "expo-image";
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
      <View className="flex-1 bg-black/50 justify-center items-center px-5 relative">
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
  boxContainer: {
    width: 310,
    marginHorizontal: "auto",
    bottom: 140,

    backgroundColor: "#fff",
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
