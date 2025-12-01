import LockIcon from "@assets/icons/lock.svg";
import { semanticColors } from '../../../shared/constants/colors';
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { use, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../auth";
import { useTranslation } from "react-i18next";


function NoneLikeBanner() {
  const { profileDetails } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const title =
    profileDetails?.gender === "FEMALE" ? (
      <Text style={[styles.title, { fontSize: 14 }]}>
        <Text style={styles.titleStrong}>{t("features.like.ui.none_like_banner.title_female")}</Text>
      </Text>
    ) : (
      <Text style={[styles.title, { fontSize: 14 }]}>
        {t("features.like.ui.none_like_banner.title_male")} <Text style={styles.titleStrong}>{t("features.like.ui.none_like_banner.title_male_profile")}</Text>{t("features.like.ui.none_like_banner.title_male_1")}
      </Text>
    );

  const description =
    profileDetails?.gender === "FEMALE" ? (
      <View>
        <Text style={styles.description}>
          {t("features.like.ui.none_like_banner.description_female_part1")}
        </Text>
        <Text style={styles.description}>{t("features.like.ui.none_like_banner.description_female_part2")}</Text>
      </View>
    ) : (
      <View>
        <Text style={styles.description}>
          {t("features.like.ui.none_like_banner.description_male_part1")}
        </Text>
        <Text style={styles.description}>{t("features.like.ui.none_like_banner.description_male_part2")}</Text>
      </View>
    );
  return (
    <View style={{ marginTop: 20 }}>
      <Text style={styles.text}>{t("features.like.ui.none_like_banner.nothing_like")}</Text>
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

    fontFamily: "semibold",
    lineHeight: 17,
    color: semanticColors.text.muted,
  },
  titleStrong: {
    fontWeight: 800,
    fontFamily: "extrabold",
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

    fontFamily: "semibold",
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