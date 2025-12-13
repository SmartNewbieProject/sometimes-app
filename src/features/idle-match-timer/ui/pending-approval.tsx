import { dayUtils } from "@/src/shared/libs";
import { Text } from "@shared/ui";
import { StyleSheet, View } from "react-native";
import { calculateTime } from "../services/calculate-time";
import type { PendingApprovalMatch } from "../types";
import Time from "./time";
import { PendingApprovalNotice } from "./pending-approval-notice";
import { useTranslation } from "react-i18next";

type PendingApprovalProps = {
  match: PendingApprovalMatch;
  onTimeEnd?: () => void;
};

export const PendingApproval = ({ match, onTimeEnd }: PendingApprovalProps) => {
  const { t } = useTranslation();
  const untilNext = match.untilNext ? dayUtils.create(match.untilNext) : null;

  const { delimeter, value } = untilNext
    ? calculateTime(untilNext, dayUtils.create())
    : { delimeter: "D", value: "-" };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text
          size="lg"
          weight="medium"
          textColor="text-primary"
          style={styles.label}
        >
          {t("features.idle-match-timer.ui.pending-approval.next-matching")}
        </Text>

        <View style={styles.timerContainer}>
          <Time size="lg" value={delimeter} />
          <Time size="lg" value="-" />
          {value
            ?.toString()
            .split("")
            .map((char, index) => (
              <Time size="lg" key={`${char}-${index}`} value={char} />
            ))}
        </View>

        <Text
          size="sm"
          weight="regular"
          textColor="text-tertiary"
          style={styles.subLabel}
        >
          {t("features.idle-match-timer.ui.pending-approval.timer-description")}
        </Text>
      </View>

      <PendingApprovalNotice match={match} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "space-between",
    paddingVertical: 24,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  label: {
    textAlign: "center",
    marginBottom: 8,
  },
  timerContainer: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  subLabel: {
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 32,
  },
});
