import KakaoLogo from "@assets/icons/kakao-logo.svg";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import useShare from "../../../hooks/promotion/use-share";

function KakaoShare() {
  const { handleShareKakao } = useShare();
  return (
    <Pressable onPress={handleShareKakao} style={styles.button}>
      <View style={styles.logoContainer}>
        <KakaoLogo width={34} height={34} />
      </View>
      <View>
        <Text style={styles.text}>카카오로 공유하기</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEE500",
    height: 54,
    borderRadius: 9999,
    justifyContent: "center",
  },
  logoContainer: {
    width: 34,
    height: 34,
  },
  text: {
    color: "#181600",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: 500,
    fontFamily: "Pretendard-Medium",
  },
});

export default KakaoShare;
