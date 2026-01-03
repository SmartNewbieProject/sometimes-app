import { Stack } from "expo-router";
import { useTranslation } from 'react-i18next';

export default function MomentLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Moment",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="my-moment"
        options={{
          title: t("apps.moment.common.my_moment"),
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="weekly-report"
        options={{
          headerShown: false,
          headerTitle: t("apps.moment.common.weekly_report"),
        }}
      />
      <Stack.Screen
        name="daily-roulette"
        options={{
          headerShown: false,
          title: t("apps.moment.common.daily_roulette"),
        }}
      />
    </Stack>
  );
}