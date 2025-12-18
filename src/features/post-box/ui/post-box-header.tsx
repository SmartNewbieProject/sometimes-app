import { Header } from "@/src/shared/ui";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";




function PostBoxHeaders() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <Header.Container style={styles.headerContainer}>
      <Header.LeftContent>
        <Pressable
          onPress={() => {
            router.navigate("/home");
          }}
          style={styles.arrowContainer}
        >
          <View style={styles.backArrow} />
        </Pressable>
      </Header.LeftContent>
      <Header.CenterContent>
        <Text style={styles.headerTitle}>{t("features.post-box.ui.header.title")}</Text>
      </Header.CenterContent>

      <Header.RightContent>
        <View />
      </Header.RightContent>
    </Header.Container>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: semanticColors.text.primary,
    fontSize: 20,
    fontFamily: "Pretendard-Bold",
    fontWeight: 700,
    lineHeight: 22,
  },
  backArrow: {
    width: 12.6,
    height: 12.6,
    top: 3,
    left: 3,
    position: "absolute",
    borderLeftWidth: 2,
    borderLeftColor: "#000",
    borderTopWidth: 2,
    borderTopColor: "#000",
    transform: [{ rotate: "-45deg" }],
    borderRadius: 2,
  },
  arrowContainer: {
    width: 24,
    height: 24,
  },
});

export default PostBoxHeaders;
