import { Button } from "@/src/shared/ui";
import { semanticColors } from '../../../../shared/constants/colors';
import CopyIcon from "@assets/icons/promotion/invite-code/copy.svg";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import useShare from "../../hooks/promotion/use-share";

function PromotionInviteCode() {
  const {handleShareCode, referralCode} = useShare();
  return (
    <View style={styles.container}>
      <Image
        style={styles.frontLetter}
        source={require("@assets/images/promotion/invite-code/front-letter.png")}
      />
      <Image
        style={styles.letter}
        source={require("@assets/images/promotion/invite-code/letter.png")}
      />
      <View
        style={[
          styles.blurContainer,
          {
            width:
              Dimensions.get("window").width >= 430
                ? 398
                : Dimensions.get("window").width - 32,
          },
        ]}
      >
        <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />

        <View style={[StyleSheet.absoluteFill, styles.colorOverlay]} />
        <View style={styles.topContainer}>
          <Image
            source={require("@assets/images/promotion/invite-code/key.png")}
            style={styles.key}
          />
          <Text style={styles.title}>내 초대 코드</Text>
        </View>
        <Pressable onPress={handleShareCode} style={styles.codeContainer}>
          <LinearGradient
            colors={["#7A4AE2", "#E4D7FF"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.borderGradient}
          />
          <View style={styles.code}>
            <Text style={styles.codeText}>{referralCode}</Text>
            <View style={styles.copyButton}>
              <CopyIcon />
              <Text style={styles.copyText}>복사</Text>
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 21,
    position: "relative",
  },
  blurContainer: {
    overflow: "hidden",
    borderRadius: 20,
    borderWidth: 1,
    padding: 15,
    borderColor: semanticColors.brand.accent,
  },
  colorOverlay: {
    backgroundColor: "#E7DBFF99",
  },
  topContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  key: {
    width: 44,
    height: 44,
  },
  title: {
    color: semanticColors.brand.primary,
    fontSize: 20,
    fontWeight: 600,
    fontFamily: "Pretendard-SemiBold",
  },
  codeContainer: {
    position: "relative",
    width: "100%",
    minHeight: 64,
    marginBottom: 25,
    marginTop: 16,
  },
  borderGradient: {
    top: 0,
    left: 5,
    right: 5,
    bottom: 0,
    position: "absolute",
    borderRadius: 12,
  },
  code: {
    position: "absolute",
    top: 1,
    left: 6,
    right: 6,
    bottom: 1,
    backgroundColor: semanticColors.surface.background,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 11,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 62,
  },
  codeText: {
    color: semanticColors.brand.accent,
    fontSize: 30,
  },
  copyButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: semanticColors.brand.primary,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 38,
    borderRadius: 6,
    gap: 5,
  },
  copyText: {
    color: semanticColors.text.inverse,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: 600,
    fontFamily: "Pretendard-SemiBold",
  },
  frontLetter: {
    position: "absolute",
    top: -28,
    right: 0,
    width: 89,
    height: 89,
    zIndex: 100,
  },
  letter: {
    position: "absolute",
    bottom: -60,
    left: -24,
    width: 128,
    height: 128,
  },
});

export default PromotionInviteCode;
