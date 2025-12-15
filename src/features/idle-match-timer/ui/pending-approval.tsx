import { StyleSheet, View } from "react-native";
import type { PendingApprovalMatch } from "../types";
import { PendingApprovalNotice } from "./pending-approval-notice";

type PendingApprovalProps = {
  match: PendingApprovalMatch;
  onTimeEnd?: () => void;
};

export const PendingApproval = ({ match, onTimeEnd }: PendingApprovalProps) => {
  return (
    <View style={styles.container}>
      <PendingApprovalNotice match={match} onRefresh={onTimeEnd} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
});
