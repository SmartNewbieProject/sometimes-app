import { MyMomentRecordPage } from "@/src/features/moment/ui/my-moment-record/my-moment-record-page";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function MyMomentRecordRoute() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: t("apps.moment.common.my_moment_record"),
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerShadowVisible: false,
        }}
      />
      <MyMomentRecordPage />
    </>
  );
}
