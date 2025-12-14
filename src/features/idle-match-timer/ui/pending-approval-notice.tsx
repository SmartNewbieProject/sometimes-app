import { Text } from "@shared/ui";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import type { PendingApprovalMatch } from "../types";
import { UserRejectionCategory } from "../types";

type PendingApprovalNoticeProps = {
  match: PendingApprovalMatch;
};

const getRejectionCategoryLabel = (category: UserRejectionCategory, t: (key: string) => string): string => {
  const categoryMap: Record<UserRejectionCategory, string> = {
    [UserRejectionCategory.INAPPROPRIATE_PROFILE_IMAGE]: t("features.idle-match-timer.ui.pending-approval.rejection-category.inappropriate-image"),
    [UserRejectionCategory.FALSE_INFORMATION]: t("features.idle-match-timer.ui.pending-approval.rejection-category.false-info"),
    [UserRejectionCategory.TERMS_VIOLATION]: t("features.idle-match-timer.ui.pending-approval.rejection-category.terms-violation"),
    [UserRejectionCategory.OTHER]: t("features.idle-match-timer.ui.pending-approval.rejection-category.other"),
  };
  return categoryMap[category] || category;
};

export const PendingApprovalNotice = ({ match }: PendingApprovalNoticeProps) => {
  const { t } = useTranslation();
  const isRejected = match.approvalStatus === 'rejected';

  const handleEditProfile = () => {
    router.navigate('/mypage');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, isRejected && styles.rejectedCard]}>
        <View style={styles.iconContainer}>
          <Text size="xxxl" weight="bold">{isRejected ? '❌' : '⏳'}</Text>
        </View>

        <View style={styles.contentContainer}>
          <Text
            size="lg"
            weight="bold"
            textColor={isRejected ? "state-error" : "text-primary"}
            style={styles.title}
          >
            {isRejected
              ? t("features.idle-match-timer.ui.pending-approval.rejected-title")
              : t("features.idle-match-timer.ui.pending-approval.title")}
          </Text>

          <Text
            size="md"
            weight="regular"
            textColor="text-secondary"
            style={styles.description}
          >
            {match.approvalMessage || t("features.idle-match-timer.ui.pending-approval.description")}
          </Text>

          {isRejected && match.rejectionCategory && (
            <View style={styles.rejectionBox}>
              <View style={styles.rejectionHeader}>
                <Text size="sm" weight="bold" textColor="state-error">
                  {t("features.idle-match-timer.ui.pending-approval.rejection-reason-label")}
                </Text>
                <View style={styles.categoryBadge}>
                  <Text size="xs" weight="medium" textColor="text-inverse">
                    {getRejectionCategoryLabel(match.rejectionCategory, t)}
                  </Text>
                </View>
              </View>
              {match.rejectionReason && (
                <Text size="sm" weight="regular" textColor="text-primary" style={styles.rejectionReason}>
                  {match.rejectionReason}
                </Text>
              )}
            </View>
          )}

          {!isRejected && match.estimatedApprovalTime && (
            <View style={styles.estimatedTimeContainer}>
              <Text size="sm" weight="medium" textColor="text-tertiary">
                {t("features.idle-match-timer.ui.pending-approval.estimated-time")}
              </Text>
              <Text size="sm" weight="bold" textColor="brand-primary">
                {match.estimatedApprovalTime}
              </Text>
            </View>
          )}

          {isRejected && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
              activeOpacity={0.8}
            >
              <Text size="md" weight="bold" textColor="text-inverse">
                {t("features.idle-match-timer.ui.pending-approval.edit-profile-button")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.infoBox, isRejected && styles.rejectedInfoBox]}>
          <Text size="sm" weight="medium" textColor="text-secondary">
            💡 {isRejected
              ? t("features.idle-match-timer.ui.pending-approval.rejected-info")
              : t("features.idle-match-timer.ui.pending-approval.info")}
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
    backgroundColor: semanticColors.surface.background,
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
  rejectedCard: {
    borderWidth: 2,
    borderColor: semanticColors.state.error,
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
    backgroundColor: semanticColors.surface.secondary,
    borderRadius: 8,
    alignSelf: "center",
  },
  rejectionBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7D7',
    gap: 8,
  },
  rejectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: semanticColors.state.error,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  rejectionReason: {
    lineHeight: 18,
  },
  editButton: {
    marginTop: 12,
    backgroundColor: semanticColors.brand.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  infoBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: semanticColors.surface.tertiary,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: semanticColors.brand.primary,
  },
  rejectedInfoBox: {
    backgroundColor: '#FFF5F5',
    borderLeftColor: semanticColors.state.error,
  },
});
