import React from "react";
import { semanticColors } from '@/src/shared/constants/colors';
import { View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import LockIcon from "@/assets/icons/lock-chat.svg";

type ProfileImageCoverProps = {
  visible?: boolean;
  title?: string;
  subtitle?: string;
};

export default function ProfileImageCover({
  visible = false,
  title = "프로필 심사를 진행중이에요",
  subtitle = "현재 프로필 심사를 진행중이에요\n끝난 후 사진 수정을 진행할 수 있어요",
}: ProfileImageCoverProps) {
  if (!visible) return null;

  return (
    <View pointerEvents="auto" style={styles.coverRoot}>
      <BlurView intensity={40} style={styles.blur} />

      <View style={styles.dim} />

      <View style={styles.center}>
        <LockIcon width={32} height={32} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  coverRoot: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
  },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 10,
    color: semanticColors.text.inverse,
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 22,
  },
  subtitle: {
    marginTop: 6,
    color: semanticColors.text.inverse,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
});
