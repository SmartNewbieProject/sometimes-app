import DownArrowIcon from "@assets/images/promotion/banner/down-arrow.svg";
import LetterIcon from "@assets/images/promotion/banner/letter.svg";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";
function PromotionBanner() {
  return (
    <>
      <View style={styles.container}>
        {BACKGROUND_IMAGES.map((image) => (
          <Image
            key={image.name}
            source={image.source}
            style={[image.style, styles.commonStyle]}
          />
        ))}
        <Text style={styles.title}>특별 혜택!</Text>
        <Text style={styles.description}>친구 초대 시 구슬 50개씩 지급!</Text>
        <Text style={styles.sub}>당신과 친구 모두에게</Text>
        <View style={styles.invite}>
          <LetterIcon style={styles.letter} />
          <DownArrowIcon />
          <Text style={styles.inviteText}>초대하러 가기</Text>
        </View>
        <Image
          source={require("@assets/images/promotion/banner/coupon-miho.png")}
          style={[
            styles.couponMiho,
            Dimensions.get("window").width < 390
              ? { width: 160, height: 160 }
              : { width: 189, height: 189 },
          ]}
        />
      </View>
      <LinearGradient
        style={styles.gradient}
        colors={["#7A4AE2", "#7A4AE200"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
    </>
  );
}

const BACKGROUND_IMAGES = [
  {
    source: require("@assets/images/promotion/banner/particle-top-left.png"),
    name: "particleTopLeft",
    style: {
      width: 198,
      height: 153,
      top: 0,
      left: 0,
    },
  },
  {
    source: require("@assets/images/promotion/banner/particle-top-right.png"),
    name: "particleTopRight",
    style: {
      width: 216,
      height: 113,
      top: 0,
      right: 0,
    },
  },
  {
    source: require("@assets/images/promotion/banner/particle-bottom-left.png"),
    name: "particleBottomLeft",
    style: {
      width: 180,
      height: 113,
      bottom: 0,
      left: 0,
    },
  },
  {
    source: require("@assets/images/promotion/banner/particle-bottom-middle.png"),
    name: "particleBottomMiddle",
    style: {
      width: 232,
      height: 184,
      bottom: 0,
      left: 134,
    },
  },
  {
    source: require("@assets/images/promotion/banner/particle-bottom-right.png"),
    name: "particleBottomRight",
    style: {
      width: 80,
      height: 205,
      bottom: 0,
      right: 0,
    },
  },
] as const;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#7A4AE2",
    width: "100%",
    height: 240,
    position: "relative",
    overflow: "hidden",
    paddingHorizontal: 15,
  },
  commonStyle: {
    position: "absolute",
    zIndex: -1,
  },
  title: {
    marginTop: 14,
    marginBottom: 3,
    color: "#fff",
    fontFamily: "Pretendard-Bold",
    fontWeight: 700,
    lineHeight: 45,
    fontSize: 30,
  },
  description: {
    color: "#fff",
    fontSize: 20,
    fontWeight: 700,
    fontFamily: "Pretendard-Bold",
    lineHeight: 30,
    marginBottom: 3,
  },
  sub: {
    color: "#fff",
    fontFamily: "Pretendard-Bold",
    fontWeight: 700,
    fontSize: 18,
    lineHeight: 27,
    opacity: 0.8,
  },
  invite: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    position: "relative",
    marginTop: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    backgroundColor: "#fff",
    letterSpacing: -0.06,
    minWidth: 178,
    maxWidth: 178,
  },
  inviteText: {
    color: "#212121",
    fontFamily: "Pretendard-Bold",
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 30,
  },
  letter: {
    position: "absolute",
    left: -16,
    top: -56,
  },
  couponMiho: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },
  gradient: {
    width: "100%",
    height: 8,
  },
});

export default PromotionBanner;
