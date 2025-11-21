
import { Image } from "expo-image";
import type React from "react";
import {
  Modal,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

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
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-5 relative">
        <View style={styles.infoWrapper}>
          <Text style={styles.infoTitle}>프로필을 매력적으로 보여주세요!</Text>
          <Text style={styles.infoDescription}>
            사진을 업로드하고 계정을 공개로 설정하면
          </Text>
          <Text style={styles.infoDescription}>매칭 확률이 더 높아져요</Text>
          <Image
            source={require("@assets/images/instagram-some.png")}
            style={{
              width: 116,
              height: 175,
              position: "absolute",
              top: 20,
              right: -66,
            }}
          />
          <Image
            source={require("@assets/images/instagram-lock.png")}
            style={{
              width: 52,
              height: 52,
              position: "absolute",
              top: -30,
              left: -30,
              transform: [{ rotate: "-10deg" }],
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  infoTitle: {
    color: "#9F84D8",
    fontWeight: 600,
    fontFamily: "semibold",
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
    backgroundColor: "#F2ECFF",
    borderWidth: 1,
    borderColor: "#FFF",

    shadowColor: "#F2ECFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3, // Android에서 그림자
  },
});

export default GuideWithLayoutAnimation;
