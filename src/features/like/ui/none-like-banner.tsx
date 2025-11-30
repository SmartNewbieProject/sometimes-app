import LockIcon from "@assets/icons/lock.svg";
import { semanticColors } from '@/src/shared/constants/colors';
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../auth";

function NoneLikeBanner() {
  const { profileDetails } = useAuth();
  const router = useRouter();

  const title =
    profileDetails?.gender === "FEMALE" ? (
      <Text style={[styles.title, { fontSize: 14 }]}>
        <Text style={styles.titleStrong}>‘좋아요'</Text>를 보내보셨나요?
      </Text>
    ) : (
      <Text style={[styles.title, { fontSize: 14 }]}>
        잠시 <Text style={styles.titleStrong}>‘프로필'</Text>을 점검해 볼까요?
      </Text>
    );

  const description =
    profileDetails?.gender === "FEMALE" ? (
      <View>
        <Text style={styles.description}>
          마음에 드는 상대에게 '좋아요'를 보내고,{" "}
        </Text>
        <Text style={styles.description}>설레는 반응을 기다려보세요!</Text>
      </View>
    ) : (
      <View>
        <Text style={styles.description}>
          취미나 관심사를 추가해서, 공통점을 찾고
        </Text>
        <Text style={styles.description}>나만의 매력을 어필해 보세요!</Text>
      </View>
    );
  return (
    <View style={{ marginTop: 20 }}>
      <Text style={styles.text}>관심을 가진 사람이 아직 없어요</Text>
      <Pressable
        style={styles.container}
        onPress={() => {
          router.push("/post-box/i-liked");
        }}
      >
        <LinearGradient
          start={[0, 1]}
          end={[1, 0]}
          colors={["#E1D9FF", "#E1D9FF00"]}
          style={styles.background}
        />
        <Image
          source={require("@assets/images/sad-miho.png")}
          style={styles.image}
        />
        <View style={styles.content}>
          {title}
          {description}
        </View>
        <View style={styles.button}>
          <LockIcon width={15} height={25} />
        </View>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 72,
    overflow: "hidden",
    borderRadius: 36,
  },
  image: {
    marginLeft: 4,
    width: 70,
    height: 70,
    position: "relative",
    bottom: -2,
  },
  content: {
    gap: 4,
    flex: 1,
    width: "100%",
    paddingLeft: 8,
    paddingRight: 8,
  },
  title: {
    fontWeight: 600,

    fontFamily: "Pretendard-SemiBold",
    lineHeight: 17,
    color: semanticColors.text.muted,
  },
  titleStrong: {
    fontWeight: 800,
    fontFamily: "Pretendard-ExtraBold",
    color: semanticColors.brand.primary,
  },
  description: {
    fontSize: 10,
    fontWeight: 500,
    fontFamily: "Pretendard-Medium",
    lineHeight: 14,
  },
  text: {
    marginBottom: 5,
    marginLeft: 14,
    color: semanticColors.text.primary,
    fontSize: 12,

    fontFamily: "Pretendard-Semibold",
    fontWeight: 600,
  },
  background: {
    top: 0,
    left: 0,
    zIndex: -1,
    bottom: 0,
    right: 0,
    position: "absolute",
  },
  descriptionStrong: {
    color: "#A77FFF",
  },
  button: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 53,
    backgroundColor: semanticColors.brand.accent,
    marginRight: 12,
  },
});

export default NoneLikeBanner;
