import { useFonts } from "expo-font";
import { Slot, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { GlobalChatProvider } from "@/src/features/chat/providers/global-chat-provider";
import { QueryProvider, RouteTracker } from "@/src/shared/config";
import { useAtt } from "@/src/shared/hooks";
import { cn } from "@/src/shared/libs/cn";
import { AnalyticsProvider, ModalProvider } from "@/src/shared/providers";
import * as amplitude from "@amplitude/analytics-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync()
    .then(() => console.log("[Splash] prevent OK"))
    .catch((e) => console.log("[Splash] prevent ERR", e));
}

const MIN_SPLASH_MS = 2000;
const START_AT = Date.now();
amplitude.init(process.env.EXPO_PUBLIC_AMPLITUDE_KEY as string);

export default function RootLayout() {
  const { request: requestAtt } = useAtt();
  const notificationListener = useRef<{ remove(): void } | null>(null);
  const responseListener = useRef<{ remove(): void } | null>(null);
  const processedNotificationIds = useRef<Set<string>>(new Set());
  const [coldStartProcessed, setColdStartProcessed] = useState(false);

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
    //폰트가 로드되지 않았다면 아무것도 하지 않음
    if (!loaded) {
      return;
    }

    if (Platform.OS === "web") {
      console.log("[Splash] web platform -> no native splash");
      return;
    }

    const hideSplashScreen = async () => {
      const elapsed = Date.now() - START_AT;
      const remain = Math.max(0, MIN_SPLASH_MS - elapsed);
      console.log("[Splash] elapsed:", elapsed, "remain:", remain);

      await new Promise((resolve) => setTimeout(resolve, remain));
      await SplashScreen.hideAsync().catch((e) =>
        console.log("[Splash] hide ERR", e)
      );
    };

    hideSplashScreen();
  }, [loaded]);

  useEffect(() => {
    requestAtt();
  }, [requestAtt]);

  const isValidNotificationData = useCallback(
    (data: unknown): data is NotificationData => {
      if (!data || typeof data !== "object") return false;

      const obj = data as Record<string, unknown>;
      const validTypes = [
        "comment",
        "like",
        "general",
        "match_like",
        "match_connection",
        "reply",
        "comment_like",
      ];

      return typeof obj.type === "string" && validTypes.includes(obj.type);
    },
    []
  );


  useEffect(() => {
    if (!loaded) return;

    const handleColdStartNotification = () => {
      try {
        const lastNotificationResponse = Notifications.getLastNotificationResponse();

        if (lastNotificationResponse?.notification) {
          const notificationId = lastNotificationResponse.notification.request.identifier;
          const rawData = lastNotificationResponse.notification.request.content.data;

          if (!processedNotificationIds.current.has(notificationId)) {
            if (isValidNotificationData(rawData)) {
              processedNotificationIds.current.add(notificationId);
              Notifications.clearLastNotificationResponse();

              setTimeout(() => {
                handleNotificationTap(rawData as NotificationData, router);
              }, 500);
            }
          }
        }
      } catch (error) {
        console.error('콜드 스타트 알림 처리 중 오류:', error);
      } finally {
        setColdStartProcessed(true);
      }
    };

    handleColdStartNotification();
  }, [loaded, isValidNotificationData]);

  useEffect(() => {
    if (!loaded || !coldStartProcessed) return;

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("알림 수신:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const notificationId = response.notification.request.identifier;
        const rawData = response.notification.request.content.data;

        if (processedNotificationIds.current.has(notificationId)) {
          return;
        }

        try {
          if (isValidNotificationData(rawData)) {
            processedNotificationIds.current.add(notificationId);
            handleNotificationTap(rawData as NotificationData, router);
          } else {
            router.push("/home");
          }
        } catch (error) {
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
  }, [loaded, coldStartProcessed, isValidNotificationData]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <ModalProvider>
          <GlobalChatProvider>
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
          </GlobalChatProvider>
        </ModalProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
