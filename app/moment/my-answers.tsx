import { MyAnswersPage } from "@/src/features/moment/ui/my-answers/my-answers-page";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function MyAnswersRoute() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: t("apps.moment.common.my_answers_record"),
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerShadowVisible: false,
        }}
      />
      <MyAnswersPage />
    </>
  );
}