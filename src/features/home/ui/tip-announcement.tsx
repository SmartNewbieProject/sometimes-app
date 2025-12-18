import { StyleSheet, View } from "react-native";
import { Text } from "@/src/shared/ui";
import { useTranslation } from "react-i18next";
import colors from "@/src/shared/constants/colors";

export const TipAnnouncement = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text textColor="black" weight="bold" style={styles.title}>
        {t("features.home.ui.tip_announcement.title")}
      </Text>
      <View style={styles.tipCard}>
        <Text size="sm" weight="light" textColor="black">
          {t("features.home.ui.tip_announcement.tip")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 25,
  },
  title: {
    fontSize: 18,
  },
  tipCard: {
    flexDirection: "column",
    gap: 8,
    width: "100%",
    backgroundColor: colors.moreLightPurple,
    padding: 10,
    borderRadius: 12,
    marginTop: 8,
  },
});