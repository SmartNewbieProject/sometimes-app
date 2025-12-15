import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text } from "@/src/shared/ui";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import type { PendingApprovalMatch } from "../types";
import { UserRejectionCategory } from "../types";
import { useState, useCallback, useEffect, useRef } from "react";
import Svg, { Circle, Polyline } from "react-native-svg";
import { dayUtils } from "@/src/shared/libs";
import { calculateTime, type TimeResult } from "../services/calculate-time";
import Time from "./time";

type PendingApprovalNoticeProps = {
  match: PendingApprovalMatch;
  onRefresh?: () => void;
};

const getRejectionCategoryLabel = (
  category: UserRejectionCategory,
  t: (key: string) => string
): string => {
  const categoryMap: Record<UserRejectionCategory, string> = {
    [UserRejectionCategory.INAPPROPRIATE_PROFILE_IMAGE]: t(
      "features.idle-match-timer.ui.pending-approval.rejection-category.inappropriate-image"
    ),
    [UserRejectionCategory.FALSE_INFORMATION]: t(
      "features.idle-match-timer.ui.pending-approval.rejection-category.false-info"
    ),
    [UserRejectionCategory.TERMS_VIOLATION]: t(
      "features.idle-match-timer.ui.pending-approval.rejection-category.terms-violation"
    ),
    [UserRejectionCategory.OTHER]: t(
      "features.idle-match-timer.ui.pending-approval.rejection-category.other"
    ),
  };
  return categoryMap[category] || category;
};

const ClockIcon = () => (
  <Svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="none"
    stroke={semanticColors.brand.primary}
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Circle cx={12} cy={12} r={10} />
    <Polyline points="12,6 12,12 16,14" />
  </Svg>
);

const PendingCard = ({
  match,
  onRefresh,
}: {
  match: PendingApprovalMatch;
  onRefresh?: () => void;
}) => {
  const { t } = useTranslation();
  const trigger = useRef(false);
  const [currentTime, setCurrentTime] = useState(() => dayUtils.create());
  const [timeSet, setTimeSet] = useState<TimeResult>(() => {
    return calculateTime(match.untilNext, currentTime);
  });

  const fire = useCallback(() => {
    trigger.current = true;
    onRefresh?.();
  }, [onRefresh]);

  const updateTime = useCallback(() => {
    if (trigger.current) return;

    const now = dayUtils.create();
    setCurrentTime(now);

    const { shouldTriggerCallback, value, delimeter } = calculateTime(
      match.untilNext,
      now
    );

    setTimeSet({
      shouldTriggerCallback,
      value,
      delimeter,
    });

    if (shouldTriggerCallback && onRefresh) {
      fire();
    }
  }, [match.untilNext, onRefresh, fire]);

  useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [updateTime]);

  return (
    <View style={styles.pendingContainer}>
      <View style={styles.card}>
        <Text textColor="black" weight="bold" style={styles.timerLabel}>
          {t("features.idle-match-timer.ui.pending-approval.next-matching")}
        </Text>

        <View style={styles.timerContainer}>
          <Time value={timeSet.delimeter} size="sm" />
          <Time value="-" size="sm" />
          {timeSet.value
            .toString()
            .split("")
            .map((char, index) => (
              <Time size="sm" key={`${char}-${index}`} value={char} />
            ))}
        </View>

        <Text textColor="black" style={styles.cardTitle}>
          {t("features.idle-match-timer.ui.pending-approval.card-title-line1")}
          {" "}
          {t("features.idle-match-timer.ui.pending-approval.card-title-line2")}
        </Text>

        <Text textColor="secondary" style={styles.cardDesc}>
          {t("features.idle-match-timer.ui.pending-approval.card-desc-line1")}
          {"\n"}
          {t("features.idle-match-timer.ui.pending-approval.card-desc-line2")}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoBadge}>
            <Text textColor="black" style={styles.badgeLabel}>
              {t("features.idle-match-timer.ui.pending-approval.estimated-time")}
            </Text>
            <View style={styles.badgeValueContainer}>
              <ClockIcon />
              <Text textColor="purple" style={styles.badgeValue}>
                {t("features.idle-match-timer.ui.pending-approval.default-time")}
              </Text>
            </View>
          </View>

          <View style={styles.notificationBox}>
            <View style={styles.notiIconWrapper}>
              <Text style={styles.notiIcon}>🔔</Text>
            </View>
            <Text textColor="secondary" size="xs" style={styles.notiText}>
              {t("features.idle-match-timer.ui.pending-approval.notification-info")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const RejectedCard = ({ match }: { match: PendingApprovalMatch }) => {
  const { t } = useTranslation();

  const handleEditProfile = () => {
    router.navigate("/my");
  };

  const handleViewGuidelines = () => {
    // TODO: 가이드라인 페이지로 이동
    router.navigate("/my");
  };

  // 프로필 사진 거절 케이스
  const isProfileImageRejection =
    match.rejectionCategory === UserRejectionCategory.INAPPROPRIATE_PROFILE_IMAGE;

  if (isProfileImageRejection) {
    return (
      <View style={styles.rejectedContainer}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Text style={styles.sadEmoji}>😢</Text>
          </View>

          <View style={styles.contentContainer}>
            <Text
              size="lg"
              weight="bold"
              textColor="black"
              style={styles.photoRejectionTitle}
            >
              {t("features.idle-match-timer.ui.pending-approval.photo-rejection-title")}
            </Text>

            <Text
              size="sm"
              weight="normal"
              textColor="secondary"
              style={styles.photoRejectionDescription}
            >
              {t("features.idle-match-timer.ui.pending-approval.photo-rejection-line1")}
              {"\n\n"}
              {t("features.idle-match-timer.ui.pending-approval.photo-rejection-line2")}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.guidelineButton}
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
  }

  // 일반 거절 케이스
  return (
    <View style={styles.rejectedContainer}>
      <View style={[styles.card, styles.rejectedCard]}>
        <View style={styles.iconContainer}>
          <Text size="xl" weight="bold">
            ❌
          </Text>
        </View>

        <View style={styles.contentContainer}>
          <Text
            size="lg"
            weight="bold"
            style={styles.errorTitle}
          >
            {t("features.idle-match-timer.ui.pending-approval.rejected-title")}
          </Text>

          <Text
            size="md"
            weight="medium"
            textColor="black"
            style={styles.description}
          >
            {match.approvalMessage ||
              t("features.idle-match-timer.ui.pending-approval.description")}
          </Text>

          {match.rejectionCategory && (
            <View style={styles.rejectionBox}>
              <View style={styles.rejectionHeader}>
                <Text size="sm" weight="bold" style={styles.errorText}>
                  {t(
                    "features.idle-match-timer.ui.pending-approval.rejection-reason-label"
                  )}
                </Text>
                <View style={styles.categoryBadge}>
                  <Text size="xs" weight="medium" textColor="white">
                    {getRejectionCategoryLabel(match.rejectionCategory, t)}
                  </Text>
                </View>
              </View>
              {match.rejectionReason && (
                <Text
                  size="sm"
                  weight="normal"
                  textColor="black"
                  style={styles.rejectionReason}
                >
                  {match.rejectionReason}
                </Text>
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
            activeOpacity={0.8}
          >
            <Text size="md" weight="bold" textColor="white">
              {t(
                "features.idle-match-timer.ui.pending-approval.edit-profile-button"
              )}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.infoBox, styles.rejectedInfoBox]}>
          <Text size="sm" weight="medium" textColor="secondary">
            💡 {t("features.idle-match-timer.ui.pending-approval.rejected-info")}
          </Text>
        </View>
      </View>
    </View>
  );
};

export const PendingApprovalNotice = ({
  match,
  onRefresh,
}: PendingApprovalNoticeProps) => {
  const isRejected = match.approvalStatus === "rejected";

  if (isRejected) {
    return <RejectedCard match={match} />;
  }

  return <PendingCard match={match} onRefresh={onRefresh} />;
};

const styles = StyleSheet.create({
  pendingContainer: {
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
  timerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: semanticColors.text.primary,
    marginBottom: 12,
  },
  timerContainer: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: semanticColors.text.primary,
    marginBottom: 6,
    lineHeight: 24,
    textAlign: "center",
  },
  cardDesc: {
    fontSize: 13,
    color: semanticColors.text.secondary,
    fontWeight: "400",
    lineHeight: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  infoRow: {
    width: "100%",
    gap: 8,
  },
  infoBadge: {
    backgroundColor: semanticColors.surface.surface,
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  badgeLabel: {
    fontSize: 12,
    color: semanticColors.text.primary,
    fontWeight: "500",
  },
  badgeValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeValue: {
    fontSize: 13,
    color: semanticColors.brand.primary,
    fontWeight: "700",
  },
  notificationBox: {
    backgroundColor: semanticColors.surface.secondary,
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  notiIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  notiIcon: {
    fontSize: 12,
  },
  notiText: {
    flex: 1,
    fontSize: 8,
    color: semanticColors.text.primary,
    fontWeight: "400",
    lineHeight: 12,
  },

  rejectedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
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
    width: "100%",
  },
  title: {
    textAlign: "center",
  },
  errorTitle: {
    textAlign: "center",
    color: semanticColors.state.error,
  },
  errorText: {
    color: semanticColors.state.error,
  },
  description: {
    textAlign: "center",
    lineHeight: 20,
  },
  rejectionBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#FFF5F5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FED7D7",
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
    width: "100%",
  },
  rejectedInfoBox: {
    backgroundColor: "#FFF5F5",
    borderLeftColor: semanticColors.state.error,
  },

  sadEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  photoRejectionTitle: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 20,
  },
  photoRejectionDescription: {
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  guidelineButton: {
    width: "100%",
    backgroundColor: semanticColors.brand.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
});
