import { useFonts } from "expo-font";
import { Slot, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef } from "react";
import { Platform, View } from "react-native";
import "react-native-reanimated";
import "../global.css";
import {
  type NotificationData,
  handleNotificationTap,
} from "@/src/shared/libs/notifications";
import * as Notifications from "expo-notifications";

import { PortoneProvider } from "@/src/features/payment/hooks/PortoneProvider";
import { VersionUpdateChecker } from "@/src/features/version-update";
import { QueryProvider, RouteTracker } from "@/src/shared/config";
import { useAtt } from "@/src/shared/hooks";
import { cn } from "@/src/shared/libs/cn";
import { AnalyticsProvider, ModalProvider } from "@/src/shared/providers";
import * as amplitude from "@amplitude/analytics-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

amplitude.init(process.env.EXPO_PUBLIC_AMPLITUDE_KEY as string);
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { request: requestAtt } = useAtt();
  const notificationListener = useRef<{ remove(): void } | null>(null);
  const responseListener = useRef<{ remove(): void } | null>(null);

  const [loaded] = useFonts({
    "Pretendard-Thin": require("../assets/fonts/Pretendard-Thin.ttf"),
    "Pretendard-ExtraLight": require("../assets/fonts/Pretendard-ExtraLight.ttf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.ttf"),
    "Pretendard-ExtraBold": require("../assets/fonts/Pretendard-ExtraBold.ttf"),
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-Black": require("../assets/fonts/Pretendard-Black.ttf"),
    Rubik: require("../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
    "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    requestAtt();
  }, []);

  const isValidNotificationData = useCallback(
    (data: unknown): data is NotificationData => {
      if (!data || typeof data !== "object") return false;

      const obj = data as Record<string, unknown>;
      return (
        typeof obj.type === "string" &&
        typeof obj.title === "string" &&
        typeof obj.body === "string" &&
        ["comment", "like", "general"].includes(obj.type)
      );
    },
    []
  );

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("알림 수신:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const rawData = response.notification.request.content.data;
        console.log("알림 탭:", rawData);

        try {
          if (isValidNotificationData(rawData)) {
            handleNotificationTap(rawData as NotificationData, router);
          } else {
            console.warn("유효하지 않은 알림 데이터:", rawData);
            router.push("/home");
          }
        } catch (error) {
          console.error("알림 처리 중 오류:", error);
          router.push("/home");
        }
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isValidNotificationData]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <ModalProvider>
          <PortoneProvider>
            <View
              className={cn(
                "flex-1 font-extralight",
                Platform.OS === "web" && "max-w-[468px] w-full self-center"
              )}
            >
              <AnalyticsProvider>
                <RouteTracker>
                  <>
                    <Slot />
                    <VersionUpdateChecker />
                  </>
                </RouteTracker>
              </AnalyticsProvider>
            </View>
          </PortoneProvider>
        </ModalProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
