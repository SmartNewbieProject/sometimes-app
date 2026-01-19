import { Image } from "expo-image";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

interface NotSomeProps {
  type: "likedMe" | "iLiked";
}

function NotSome({ type }: NotSomeProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Image
        source={require("@assets/images/no-some-post-miho.webp")}
        style={styles.image}
      />
      <Text style={styles.description}>
        {type === "likedMe"
          ? t("features.post-box.apps.post_box.empty_state.no_some_received")
          : t("features.post-box.apps.post_box.empty_state.no_some_sent")}
      </Text>
      <Text style={styles.description}>{t("features.post-box.apps.post_box.empty_state.description")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    marginTop: 200,
  },
  image: {
    width: 216,
    height: 216,
  },
  description: {
    color: semanticColors.text.disabled,
    fontWeight: 500,
    fontFamily: "Pretendard-Medium",
    fontSize: 18,
    lineHeight: 24,
  },
});

export default NotSome;
