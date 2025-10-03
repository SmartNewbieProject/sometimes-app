import { useModal } from "@/src/shared/hooks/use-modal";
import BlackXIcon from "@assets/icons/black-x-icon.svg";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import RouletteItem from "./roulette-item";
function RouletteModal() {
  const { hideModal } = useModal();
  return (
    <LinearGradient
      colors={["#FFCFE5", "#FFFFFF", "#DECEFF"]}
      locations={[0, 0.4339, 0.9534]}
      start={{ x: 0.76, y: 0.08 }}
      end={{ x: 0.24, y: 0.92 }}
      style={styles.container}
    >
      <Pressable style={styles.closeButton} onPress={() => hideModal()}>
        <BlackXIcon />
      </Pressable>
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>SOMETIME</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.topTitle}>오늘의</Text>
          <Text style={styles.bottomTitle}>럭키 룰렛</Text>
          <Text style={styles.freeText}>lucky</Text>
          {/*  이거 위치 되게 노가다로 잡았는데 보이지도 않네 */}
          <View style={styles.deco1} />
          <View style={styles.deco2} />
          <View style={styles.deco3} />
          <View style={styles.deco4} />
          <Image
            source={require("@assets/images/roulette-mini.png")}
            style={styles.rouletteMini}
          />
          <Image
            source={require("@assets/images/roulette-check.png")}
            style={styles.rouletteCheck}
          />
        </View>
        <View style={styles.descContainer}>
          <Text style={styles.descText}>
            오늘의 <Text style={styles.strongText}>운</Text>을{" "}
            <Text style={styles.strongText}>시험</Text>해보세요!
          </Text>
        </View>
        <RouletteItem />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 436,
    marginHorizontal: 16,
    paddingBottom: 72,
    borderRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 33,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 19,
    right: 19,
  },
  contentContainer: {
    alignItems: "center",
  },
  logoContainer: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 50,
    borderWidth: 0.5,
    borderColor: "#7A4AE2",
  },
  logoText: {
    color: "#7A4AE2",
    fontFamily: "Gmarket-Sans-Light",
    fontWeight: 300,
    fontSize: 8,
    lineHeight: 8,
  },
  titleContainer: {
    position: "relative",
    paddingTop: 10,
    paddingBottom: 20,
  },
  topTitle: {
    color: "#000",
    fontFamily: "Gmarket-Sans-Light",
    fontWeight: 300,
    lineHeight: 42,
    fontSize: 35,
    textAlign: "center",
  },
  bottomTitle: {
    color: "#000",
    fontFamily: "Gmarket-Sans-Bold",
    fontWeight: 700,
    lineHeight: 54,
    fontSize: 45,
    textAlign: "center",
  },
  rouletteMini: {
    right: -90,
    position: "absolute",
    zIndex: -1,
    width: 132,
    height: 132,
  },
  rouletteCheck: {
    left: -50,
    top: 10,
    position: "absolute",
    zIndex: -1,
    width: 80,
    height: 80,
  },
  descContainer: {},
  descText: {
    fontFamily: "Gmarket-Sans-Medium",
    fontWeight: 500,
    fontSize: 20,
    lineHeight: 26,
    color: "#000",
  },
  strongText: {
    color: "#7A4AE2",
    fontFamily: "Gmarket-Sans-Bold",
    fontWeight: 700,
  },
  freeText: {
    color: "#7A4AE2",
    fontFamily: "StyleScript",
    fontSize: 29,
    fontWeight: 400,
    lineHeight: 34.8,
    position: "absolute",
    top: 60,
    left: 70,
    zIndex: 30,
    transform: [{ rotate: "-16deg" }],
  },
  deco1: {
    backgroundColor: "#FFC8C833",
    width: 15,
    height: 15,
    borderRadius: 15,
    position: "absolute",
    top: 22,
    left: -16,
  },
  deco2: {
    backgroundColor: "#FFC8C833",
    width: 6,
    height: 6,
    borderRadius: 6,
    position: "absolute",
    top: 16,
    left: -28,
  },
  deco3: {
    backgroundColor: "#FFC8C833",
    width: 9,
    height: 9,
    borderRadius: 9,
    position: "absolute",
    top: 76,
    left: -70,
  },
  deco4: {
    backgroundColor: "#7A4AE21A",
    width: 8,
    height: 8,
    borderRadius: 8,
    position: "absolute",
    top: 10,
    right: 10,
  },
});

export default RouletteModal;
