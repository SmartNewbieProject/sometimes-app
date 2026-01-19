import React from "react";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { View, Text, StyleSheet, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import LockIcon from "@/assets/icons/lock-chat.svg";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

type ProfileImageCoverProps = {
  visible?: boolean;
  title?: string;
  subtitle?: string;
};

export default function ProfileImageCover({
  visible = false,
  title,
  subtitle,
}: ProfileImageCoverProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const displayTitle = title ?? t("features.profile-edit.ui.profile_image_cover.default_title");
  const displaySubtitle = subtitle ?? t("features.profile-edit.ui.profile_image_cover.default_subtitle");

  if (!visible) return null;

  const handlePress = () => {
    router.push('/profile/photo-management?referrer=profile-edit');
  };

  return (
    <Pressable onPress={handlePress} style={styles.coverRoot}>
      <BlurView intensity={40} style={styles.blur} />

      <View style={styles.dim} />

      <View style={styles.center}>
        <LockIcon width={32} height={32} />
        <Text style={styles.title}>{displayTitle}</Text>
        <Text style={styles.subtitle}>{displaySubtitle}</Text>
      </View>
    </Pressable>
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
