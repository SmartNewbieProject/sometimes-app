import BannerRightArrowIcon from "@assets/icons/banner-right-arrow.svg";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useWindowWidth } from "../../signup/hooks";
function FirstPurchaseEvent() {
  const translateXAnim = useSharedValue(0);
  const router = useRouter();
  const width = useWindowWidth();
  const { t } = useTranslation();
  useEffect(() => {
    translateXAnim.value = withRepeat(
      withTiming(10, {
        duration: 400,
        easing: Easing.out(Easing.circle),
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateXAnim.value }],
    };
  });

  const handleStore = () => {
    router.push("/purchase/gem-store");
  };

  return (
    <Pressable onPress={handleStore} style={styles.container}>
      <Image
        source={require("@assets/images/first-purchase.png")}
        style={styles.image}
      />
      <View style={styles.content}>
        {/* i18n: The following text has nested styling and requires manual translation using the <Trans> component or another method. */}
        <Text style={[styles.title, { fontSize: width >= 490 ? 18 : 15 }]}>
          <Text style={styles.titleStrong}>{t("features.home.ui.first_purchase_event_banner.brand_name")}</Text>{t("features.home.ui.first_purchase_event_banner.title")}
        </Text>
        <Text style={styles.description}>
          {t("features.home.ui.first_purchase_event_banner.description_1")}
        </Text>
        {/* i18n: The following text has nested styling and requires manual translation using the <Trans> component or another method. */}
        <Text style={styles.description}>
          <Text style={styles.descriptionStrong}>{t("features.home.ui.first_purchase_event_banner.special_match")}</Text>이
          {t("features.home.ui.first_purchase_event_banner.description_2")}
        </Text>
      </View>
      <View style={styles.button}>
        <Animated.View style={[animatedStyle, { left: -6 }]}>
          <BannerRightArrowIcon width={30} height={24} />
        </Animated.View>
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    width: "99%",
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#FFF",
    backgroundColor: "#F2ECFF",
    overflow: "hidden",
    shadowColor: "#F2ECFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3, // Android에서 그림자

    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    marginLeft: 4,
    width: 94,
    height: 90,
  },
  content: {
    gap: 4,
    flex: 1,
    paddingLeft: 4,
    paddingRight: 8,
  },
  title: {
    fontWeight: 600,

    fontFamily: "Pretendard-SemiBold",
    lineHeight: 21.6,
    color: "#4A4A4A",
  },
  titleStrong: {
    fontWeight: 800,
    fontFamily: "Pretendard-ExtraBold",
    color: "#7A4AE2",
  },
  description: {
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "Pretendard-Medium",
    lineHeight: 15.6,
  },
  descriptionStrong: {
    color: "#A77FFF",
  },
  button: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 53,
    backgroundColor: "#fff",
    marginRight: 12,
  },
});

export default FirstPurchaseEvent;