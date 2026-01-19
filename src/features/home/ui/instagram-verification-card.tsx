import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function InstagramVerificationCard() {
  const { t } = useTranslation();

  const handlePress = () => {
    router.navigate("/instagram/verify?referrer=home");
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.contentWrapper}>
        <View style={styles.iconWrapper}>
          <Image
            source={require("@assets/images/instagram.webp")}
            style={styles.icon}
            contentFit="contain"
          />
        </View>

        <View style={styles.textWrapper}>
          <Text size="md" weight="semibold" textColor="black">
            {t("features.home.ui.instagram_verification_card.title")}
          </Text>
          <Text size="xs" textColor="gray" style={styles.description}>
            {t("features.home.ui.instagram_verification_card.description_1")}
          </Text>
          <Text size="xs" textColor="gray" style={styles.description}>
            {t("features.home.ui.instagram_verification_card.description_2")}
          </Text>
        </View>

        <View style={styles.rewardWrapper}>
          <Text size="xs" weight="medium" style={styles.rewardLabel}>
            {t("features.home.ui.instagram_verification_card.reward_label")}
          </Text>
          <View style={styles.rewardBadge}>
            <Image
              source={require("@assets/images/promotion/home-banner/gem.webp")}
              style={styles.gemIcon}
              contentFit="contain"
            />
            <Text size="sm" weight="bold" style={styles.rewardAmount}>
              x10
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8F4FF",
    borderRadius: 20,
    paddingVertical: 18,
    paddingLeft: 16,
    paddingRight: 12,
    marginTop: 12,
  },
  contentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 52,
    height: 52,
  },
  textWrapper: {
    flex: 1,
    gap: 2,
  },
  description: {
    lineHeight: 14,
  },
  rewardWrapper: {
    alignItems: "center",
    gap: 4,
  },
  rewardLabel: {
    color: semanticColors.brand.primary,
  },
  rewardBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: semanticColors.brand.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 2,
  },
  gemIcon: {
    width: 18,
    height: 18,
  },
  rewardAmount: {
    color: "white",
  },
});
