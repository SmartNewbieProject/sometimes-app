import { Image } from "expo-image";
import type React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

interface BannerProps {
  children: React.ReactNode;
}

function Banner({ children }: BannerProps) {
  return <View style={styles.container}>{children}</View>;
}

function BannerZero() {
  const { t } = useTranslation();
  return <Text style={styles.zeroText}>{t('features.event.roulette.result_zero')}</Text>;
}

function BannerOne() {
  return (
    <Image
      source={require("@assets/images/roulette/modal-banner/banner1.webp")}
      style={styles.bannerOne}
    />
  );
}

function BannerTwo() {
  return (
    <Image
      source={require("@assets/images/roulette/modal-banner/banner2.webp")}
      style={styles.bannerTwo}
    />
  );
}

function BannerThree() {
  return (
    <Image
      source={require("@assets/images/roulette/modal-banner/banner3.webp")}
      style={styles.bannerThree}
    />
  );
}

function BannerFour() {
  return (
    <Image
      source={require("@assets/images/roulette/modal-banner/banner4.webp")}
      style={styles.bannerFour}
    />
  );
}

function BannerFive() {
  return (
    <Image
      source={require("@assets/images/roulette/modal-banner/banner5.webp")}
      style={styles.bannerFive}
    />
  );
}

const styles = StyleSheet.create({
  zeroText: {
    color: "#8865D4",
    textAlign: "center",
    fontSize: 60,
    fontWeight: 700,
    lineHeight: 72,
    fontFamily: "Gmarket-Sans-Bold",
  },
  container: {
    alignItems: "center",
    position: "relative",
    marginBottom: 6,
  },
  bannerOne: {
    width: 80,
    height: 82,
  },
  bannerTwo: {
    width: 110,
    height: 90,
  },
  bannerThree: {
    width: 113,
    height: 88,
  },
  bannerFour: {
    width: 118,
    height: 88,
  },
  bannerFive: {
    width: 131,
    height: 87,
  },
});

Banner.Zero = BannerZero;
Banner.One = BannerOne;
Banner.Two = BannerTwo;
Banner.Three = BannerThree;
Banner.Four = BannerFour;
Banner.Five = BannerFive;

export default Banner;
