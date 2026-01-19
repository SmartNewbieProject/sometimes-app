import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { AnimatedArrow, Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

function AddIcon() {
  return (
    <Svg width={21} height={21} viewBox="0 0 21 21" fill="none">
      <Path
        d="M10.5 4.5V16.5M4.5 10.5H16.5"
        stroke="#A892D7"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface ImageSlotProps {
  label: string;
  isPrimary?: boolean;
}

function ImageSlot({ label, isPrimary = false }: ImageSlotProps) {
  return (
    <View style={styles.slotContainer}>
      <View style={styles.slot}>
        <AddIcon />
      </View>
      <Text
        size="xs"
        weight="medium"
        style={isPrimary ? styles.slotLabelPrimary : styles.slotLabel}
      >
        {label}
      </Text>
    </View>
  );
}

export default function ProfilePhotoCard() {
  const { t } = useTranslation();

  const handlePress = () => {
    router.navigate("/profile/photo-management?referrer=home");
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.slotsWrapper}>
        <ImageSlot
          label={t("features.home.ui.profile_photo_card.required")}
          isPrimary
        />
        <View style={styles.mascotWrapper}>
          <Image
            source={require("@assets/images/give-me-picture-miho.webp")}
            style={styles.mascot}
            contentFit="contain"
          />
        </View>
        <ImageSlot
          label={t("features.home.ui.profile_photo_card.recommended")}
        />
        <ImageSlot
          label={t("features.home.ui.profile_photo_card.recommended")}
        />
      </View>

      <View style={styles.arrowButtonWrapper}>
        <AnimatedArrow
          direction="right"
          onPress={handlePress}
          size={51}
          backgroundColor={semanticColors.brand.primary}
        />
      </View>

      <Text size="lg" weight="semibold" textColor="black" style={styles.title}>
        {t("features.home.ui.profile_photo_card.title")}
      </Text>

      <View style={styles.descriptionWrapper}>
        <Text size="xs" textColor="gray" style={styles.description}>
          {t("features.home.ui.profile_photo_card.description_1")}
          <Text size="xs" style={styles.highlight}>
            {t("features.home.ui.profile_photo_card.description_highlight")}
          </Text>
          {t("features.home.ui.profile_photo_card.description_2")}
        </Text>
        <Text size="xs" textColor="gray" style={styles.description}>
          {t("features.home.ui.profile_photo_card.description_3")}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8F4FF",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    position: "relative",
  },
  slotsWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    marginBottom: 50,
  },
  slotContainer: {
    alignItems: "center",
    gap: 4,
  },
  slot: {
    width: 84,
    height: 84,
    borderRadius: 15,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#A892D7",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  slotLabel: {
    color: "#8E8E8E",
  },
  slotLabelPrimary: {
    color: semanticColors.brand.primary,
  },
  mascotWrapper: {
    position: "absolute",
    left: "50%",
    top: 0,
    transform: [{ translateX: -70 }],
    zIndex: 1,
  },
  mascot: {
    width: 140,
    height: 140,
  },
  arrowButtonWrapper: {
    position: "absolute",
    right: 29,
    bottom: 62,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  descriptionWrapper: {
    alignItems: "center",
  },
  description: {
    textAlign: "center",
    lineHeight: 16,
  },
  highlight: {
    color: semanticColors.brand.primary,
  },
});
