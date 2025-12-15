import { Text } from "@/src/shared/ui";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { StyleSheet, View } from "react-native";
import NotificationCard from "./notification-card";
import { usePushNotification } from "../../hooks/use-push-notification";
import { useTranslation } from "react-i18next";

const NotificationMenu = () => {
  const { t } = useTranslation();
  const { isEnabled, isUpdating, toggle } = usePushNotification();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('features.mypage.notification.title')}</Text>
      <View style={styles.bar} />
      <View style={styles.contentContainer}>
        <NotificationCard
          title={t('features.mypage.notification.push_notification')}
          isOn={isEnabled}
          toggle={toggle}
          disabled={isUpdating}
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
    color: semanticColors.text.primary,
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
    backgroundColor: semanticColors.surface.background,
  },
  contentContainer: {
    gap: 10,
    paddingHorizontal: 2,
  },
});

export default NotificationMenu;

