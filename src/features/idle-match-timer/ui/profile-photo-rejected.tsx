import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text } from "@/src/shared/ui";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

export const ProfilePhotoRejected = () => {
  const { t } = useTranslation();

  const handleViewGuidelines = () => {
    // TODO: 가이드라인 페이지로 이동
    router.navigate("/my");
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Text style={styles.sadEmoji}>😢</Text>
        </View>

        <View style={styles.contentContainer}>
          <Text
            size="lg"
            weight="bold"
            textColor="black"
            style={styles.title}
          >
            {t("features.idle-match-timer.ui.pending-approval.photo-rejection-title")}
          </Text>

          <Text
            size="sm"
            weight="normal"
            textColor="secondary"
            style={styles.description}
          >
            {t("features.idle-match-timer.ui.pending-approval.photo-rejection-line1")}
            {"\n\n"}
            {t("features.idle-match-timer.ui.pending-approval.photo-rejection-line2")}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleViewGuidelines}
          activeOpacity={0.8}
        >
          <Text size="md" weight="bold" textColor="white">
            {t("features.idle-match-timer.ui.pending-approval.view-guidelines-button")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: semanticColors.surface.background,
    borderRadius: 16,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  sadEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  contentContainer: {
    gap: 8,
    width: "100%",
    marginBottom: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 20,
  },
  description: {
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    width: "100%",
    backgroundColor: semanticColors.brand.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
});
