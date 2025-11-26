import { MyAnswersPage } from "@/src/features/moment/ui/my-answers/my-answers-page";
import { Stack } from "expo-router";

export default function MyAnswersRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "내 답변 기록",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerShadowVisible: false,
        }}
      />
      <MyAnswersPage />
    </>
  );
}