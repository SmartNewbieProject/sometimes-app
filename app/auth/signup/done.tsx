import { useEffect } from "react";
import { router } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { DefaultLayout } from "@/src/features/layout/ui";

export default function SignupDoneScreen() {
  useEffect(() => {
    router.replace("/home");
  }, []);

  return (
    <DefaultLayout className="flex-1 flex flex-col w-full items-center justify-center">
      <ActivityIndicator size="large" color="#6B4EFF" />
    </DefaultLayout>
  );
}
