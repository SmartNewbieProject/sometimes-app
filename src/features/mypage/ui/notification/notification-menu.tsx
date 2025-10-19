import { Text } from "@/src/shared/ui";
import { StyleSheet, View } from "react-native";
import NotificationCard from "./notification-card";
import { usePushNotification } from "../../hooks/use-push-notification";

const NotificationMenu = () => {
  const { isEnabled, toggle } = usePushNotification();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>알림 설정</Text>
      <View style={styles.bar} />
      <View style={styles.contentContainer}>
        <NotificationCard
          title="푸시 알림"
          isOn={isEnabled}
          toggle={toggle}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 20,
  },
  title: {
    color: "#000",
    fontSize: 16,
    fontFamily: "Pretendard-SemiBold",
    fontWeight: 600,
    lineHeight: 21.6,
  },
  bar: {
    marginTop: 5,
    marginBottom: 10,
    height: 1,
    width: "100%",
    backgroundColor: "#E7E9EC",
  },
  contentContainer: {
    gap: 10,
    paddingHorizontal: 2,
  },
});

export default NotificationMenu;

