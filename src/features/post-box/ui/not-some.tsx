import { Image } from "expo-image";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { PROFILE_VIEWER_KEYS } from "@/src/shared/libs/locales/keys";

interface NotSomeProps {
  type: "likedMe" | "iLiked" | "viewedMe";
}

function NotSome({ type }: NotSomeProps) {
  const { t } = useTranslation();

  const getEmptyText = () => {
    switch (type) {
      case "likedMe":
        return t("features.post-box.apps.post_box.empty_state.no_some_received");
      case "iLiked":
        return t("features.post-box.apps.post_box.empty_state.no_some_sent");
      case "viewedMe":
        return t(PROFILE_VIEWER_KEYS.viewedMeEmptyTitle);
    }
  };

  const getDescriptionText = () => {
    if (type === "viewedMe") {
      return t(PROFILE_VIEWER_KEYS.viewedMeEmptyDescription);
    }
    return t("features.post-box.apps.post_box.empty_state.description");
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@assets/images/no-some-post-miho.webp")}
        style={styles.image}
      />
      <Text style={styles.description}>{getEmptyText()}</Text>
      <Text style={styles.description}>{getDescriptionText()}</Text>
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
