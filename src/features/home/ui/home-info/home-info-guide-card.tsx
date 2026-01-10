import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

function CheckCircleIcon() {
  return (
    <Svg width={17} height={18} viewBox="0 0 17 18" fill="none">
      <Path
        d="M8.5 1.5C4.36 1.5 1 4.86 1 9C1 13.14 4.36 16.5 8.5 16.5C12.64 16.5 16 13.14 16 9C16 4.86 12.64 1.5 8.5 1.5ZM7 12.75L3.25 9L4.3075 7.9425L7 10.6275L12.6925 4.935L13.75 6L7 12.75Z"
        fill="#7A4AE2"
      />
    </Svg>
  );
}

function HomeInfoGuideCard() {
  const { t } = useTranslation();

  const checklistItems = [
    t("features.home.ui.home_info.guide_card.checklist_1"),
    t("features.home.ui.home_info.guide_card.checklist_2"),
    t("features.home.ui.home_info.guide_card.checklist_3"),
  ];

  return (
    <View style={styles.container}>
      <Text size="lg" weight="semibold" textColor="black" style={styles.title}>
        {t("features.home.ui.home_info.guide_card.title")}
      </Text>

      <View style={styles.contentWrapper}>
        <View style={styles.checklist}>
          {checklistItems.map((item, index) => (
            <View key={index} style={styles.checklistItem}>
              <CheckCircleIcon />
              <Text size="xs" style={styles.checklistText}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.imageSection}>
          <Image
            source={require("@assets/images/matching-guide-hearts.webp")}
            style={styles.heartsImage}
            contentFit="contain"
          />
          <Image
            source={require("@assets/images/matching-guide-fox.webp")}
            style={styles.foxImage}
            contentFit="contain"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8F4FF",
    borderRadius: 20,
    height: 158,
    width: "100%",
    paddingHorizontal: 32,
    paddingTop: 23,
    overflow: "hidden",
  },
  title: {
    textAlign: "center",
    marginBottom: 18,
  },
  contentWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  checklist: {
    gap: 7,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  checklistText: {
    color: semanticColors.brand.primary,
    lineHeight: 14,
  },
  imageSection: {
    position: "absolute",
    right: -28,
    top: -55,
    width: 188,
    height: 188,
  },
  heartsImage: {
    position: "absolute",
    top: 20,
    right: 10,
    width: 40,
    height: 40,
  },
  foxImage: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 152,
    height: 152,
    transform: [{ rotate: "16deg" }],
  },
});

export default HomeInfoGuideCard;
