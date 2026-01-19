import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { RouletteWheel } from "@/src/features/event/ui/roulette/roulette-wheel";
import { useRoulettePage } from "@/src/features/event/hooks/roulette/use-roulette-page";
import ChevronLeft from "@assets/icons/chevron-left.svg";

export default function DailyRoulettePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { rouletteAnimationStyle, handleStart, isSpinning } = useRoulettePage();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerWrapper}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/moment')}
        >
          <ChevronLeft />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('features.event.roulette.header_title')}</Text>
      </View>

      <LinearGradient
        colors={["#FFCFE5", "#FFFFFF", "#DECEFF"]}
        locations={[0, 0.4339, 0.9534]}
        start={{ x: 0.76, y: 0.08 }}
        end={{ x: 0.24, y: 0.92 }}
        style={styles.gradientContent}
      >

      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>SOMETIME</Text>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.topTitle}>{t('features.event.roulette.top_title')}</Text>
          <Text style={styles.bottomTitle}>{t('features.event.roulette.bottom_title')}</Text>
          <Text style={styles.luckyText}>lucky</Text>

          <View style={styles.deco1} />
          <View style={styles.deco2} />
          <View style={styles.deco3} />
          <View style={styles.deco4} />

          <Image
            source={require("@assets/images/roulette-mini.webp")}
            style={styles.rouletteMini}
          />
          <Image
            source={require("@assets/images/roulette-check.png")}
            style={styles.rouletteCheck}
          />
        </View>

        <View style={styles.descContainer}>
          <Text style={styles.descText}>
            {t('features.event.roulette.description_parts.prefix')}<Text style={styles.strongText}>{t('features.event.roulette.description_parts.luck')}</Text>
            {t('features.event.roulette.description_parts.middle')}<Text style={styles.strongText}>{t('features.event.roulette.description_parts.try')}</Text>
            {t('features.event.roulette.description_parts.suffix')}
          </Text>
        </View>

        <RouletteWheel
          isSpinning={isSpinning}
          rouletteAnimationStyle={rouletteAnimationStyle}
          onStart={handleStart}
        />
      </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerWrapper: {
    backgroundColor: "#FFFFFF",
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    padding: 4,
    zIndex: 1,
  },
  gradientContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "Pretendard-SemiBold",
    color: semanticColors.text.primary,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 33,
  },
  logoContainer: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 50,
    borderWidth: 0.5,
    borderColor: semanticColors.brand.primary,
  },
  logoText: {
    color: semanticColors.brand.primary,
    fontFamily: "Gmarket-Sans-Light",
    fontWeight: "300",
    fontSize: 8,
    lineHeight: 8,
  },
  titleContainer: {
    position: "relative",
    paddingTop: 10,
    paddingBottom: 20,
    alignItems: "center",
  },
  topTitle: {
    color: semanticColors.text.primary,
    fontFamily: "Gmarket-Sans-Light",
    fontWeight: "300",
    lineHeight: 42,
    fontSize: 35,
    textAlign: "center",
  },
  bottomTitle: {
    color: semanticColors.text.primary,
    fontFamily: "Gmarket-Sans-Bold",
    fontWeight: "700",
    lineHeight: 54,
    fontSize: 45,
    textAlign: "center",
  },
  luckyText: {
    color: semanticColors.brand.primary,
    fontFamily: "StyleScript",
    fontSize: 29,
    fontWeight: "400",
    lineHeight: 34.8,
    position: "absolute",
    top: 60,
    left: 70,
    zIndex: 30,
    transform: [{ rotate: "-16deg" }],
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
  descContainer: {
    marginBottom: 10,
  },
  descText: {
    fontFamily: "Gmarket-Sans-Medium",
    fontWeight: "500",
    fontSize: 20,
    lineHeight: 26,
    color: semanticColors.text.primary,
  },
  strongText: {
    color: semanticColors.brand.primary,
    fontFamily: "Gmarket-Sans-Bold",
    fontWeight: "700",
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
    backgroundColor: semanticColors.brand.primary,
    width: 8,
    height: 8,
    borderRadius: 8,
    position: "absolute",
    top: 10,
    right: 10,
  },
});
