import { AccountManagementMenu } from "@/src/features/setting/ui";
import { StyleSheet, View } from "react-native";

function SettingAccount() {
  return (
    <View style={styles.container}>
      <AccountManagementMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
});

export default SettingAccount;
