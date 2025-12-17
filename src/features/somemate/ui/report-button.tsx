import { Image } from "expo-image";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";

export const ReportButton = () => {
  const { t } = useTranslation();

  return (
    <Pressable
      style={styles.reportButton}
      onPress={() => router.push("/chat/somemate-report")}
    >
      <Image
        source={require("@assets/images/details.png")}
        style={styles.reportIcon}
        contentFit="contain"
      />
      <Text style={styles.reportButtonText}>{t('features.somemate.intro.report_button')}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  reportButton: {
    width: "100%",
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: semanticColors.brand.primary,
    backgroundColor: semanticColors.surface.background,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  reportIcon: {
    width: 30,
    height: 30,
  },
  reportButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: semanticColors.brand.primary,
    fontFamily: "Pretendard-SemiBold",
  },
});

