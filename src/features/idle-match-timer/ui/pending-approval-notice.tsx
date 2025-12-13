import { Text } from "@shared/ui";
import { StyleSheet, View } from "react-native";
import { semanticColors } from "@/src/shared/constants/colors";
import { useTranslation } from "react-i18next";
import type { PendingApprovalMatch } from "../types";

type PendingApprovalNoticeProps = {
  match: PendingApprovalMatch;
};

export const PendingApprovalNotice = ({ match }: PendingApprovalNoticeProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Text size="xxxl" weight="bold">⏳</Text>
        </View>

        <View style={styles.contentContainer}>
          <Text
            size="lg"
            weight="bold"
            textColor="text-primary"
            style={styles.title}
          >
            {t("features.idle-match-timer.ui.pending-approval.title")}
          </Text>

          <Text
            size="md"
            weight="regular"
            textColor="text-secondary"
            style={styles.description}
          >
            {match.approvalMessage || t("features.idle-match-timer.ui.pending-approval.description")}
          </Text>

          {match.estimatedApprovalTime && (
            <View style={styles.estimatedTimeContainer}>
              <Text size="sm" weight="medium" textColor="text-tertiary">
                {t("features.idle-match-timer.ui.pending-approval.estimated-time")}
              </Text>
              <Text size="sm" weight="bold" textColor="brand-primary">
                {match.estimatedApprovalTime}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.infoBox}>
          <Text size="sm" weight="medium" textColor="text-secondary">
            💡 {t("features.idle-match-timer.ui.pending-approval.info")}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 20,
  },
  card: {
    backgroundColor: semanticColors.background.primary,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  contentContainer: {
    gap: 8,
  },
  title: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    lineHeight: 20,
  },
  estimatedTimeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: semanticColors.background.secondary,
    borderRadius: 8,
    alignSelf: "center",
  },
  infoBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: semanticColors.background.tertiary,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: semanticColors.brand.primary,
  },
});
