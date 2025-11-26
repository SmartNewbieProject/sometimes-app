import { MyMomentRecordPage } from "@/src/features/moment/ui/my-moment-record/my-moment-record-page";
import { Stack } from "expo-router";

export default function MyMomentRecordRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "나의 모먼트 기록",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerShadowVisible: false,
        }}
      />
      <MyMomentRecordPage />
    </>
  );
}
