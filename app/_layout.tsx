import "@/src/features/logger/service/patch";
import { useFonts } from "expo-font";
import { Slot, router, useLocalSearchParams, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { usePreventScreenCapture } from "expo-screen-capture";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import "react-native-reanimated";
import "../global.css";
import {
  type NotificationData,
  handleNotificationTap,
} from "@/src/shared/libs/notifications";
import { initializeKakaoSDK } from "@react-native-kakao/core";
import * as Notifications from "expo-notifications";

import { I18nextProvider } from "react-i18next";
import i18n from "@/src/shared/libs/i18n";

import { GlobalChatProvider } from "@/src/features/chat/providers/global-chat-provider";
import { ChatActivityTracker } from "@/src/features/chat/ui/chat-activity-tracker";
import LoggerContainer from "@/src/features/logger/ui/logger-container";
import { PortoneProvider } from "@/src/features/payment/hooks/PortoneProvider";
import { VersionUpdateChecker } from "@/src/features/version-update";
import { QueryProvider, RouteTracker } from "@/src/shared/config";
import { useAtt } from "@/src/shared/hooks";
import { useStorage } from "@/src/shared/hooks/use-storage";
import { cn } from "@/src/shared/libs/cn";
import { AnalyticsProvider, ModalProvider } from "@/src/shared/providers";
import Toast from "@/src/shared/ui/toast";
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { GestureHandlerRootView } from "react-native-gesture-handler";

if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync()
    .then(() => console.log("[Splash] prevent OK"))
    .catch((e) => console.log("[Splash] prevent ERR", e));
}

const MIN_SPLASH_MS = 2000;
const START_AT = Date.now();

export default function RootLayout() {
  usePreventScreenCapture();

  const { request: requestAtt } = useAtt();
  const notificationListener = useRef<{ remove(): void } | null>(null);
  const responseListener = useRef<{ remove(): void } | null>(null);
  const processedNotificationIds = useRef<Set<string>>(new Set());

  const [coldStartProcessed, setColdStartProcessed] = useState(false);
  const [sdkInitialized, setSdkInitialized] = useState(false);

  useEffect(() => {
    const initializeSDKs = async () => {
      try {
        console.log('[SDK Init] Starting SDK initialization sequence...');

        await initializeKakaoSDK("4d405583bea731b1c4fb26eb8a14e894", {
          web: {
            javascriptKey: "2356db85eb35f5f941d0d66178e16b4e",
            restApiKey: "228e892bfc0e42e824d592d92f52e72e",
          },
        });
        console.log('[SDK Init] Kakao SDK initialized');

        await new Promise(resolve => setTimeout(resolve, 100));

        const mixpanelToken = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN as string;
        if (mixpanelToken) {
          mixpanelAdapter.init(mixpanelToken, true);
          console.log('[SDK Init] Mixpanel initialized');
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        setSdkInitialized(true);
        console.log('[SDK Init] All SDKs initialized successfully');
      } catch (error) {
        console.error('[SDK Init] SDK 초기화 실패:', error);
        setSdkInitialized(true);
      }
    };

    initializeSDKs();
  }, []);

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
    "Gmarket-Sans-Medium": require("../assets/fonts/GmarketSansTTFMedium.ttf"),
    "Gmarket-Sans-Bold": require("../assets/fonts/GmarketSansTTFBold.ttf"),
    "Gmarket-Sans-Light": require("../assets/fonts/GmarketSansTTFLight.ttf"),
    StyleScript: require("../assets/fonts/StyleScript-Regular.ttf"),
    "MPLUS1p-Thin": require("../assets/fonts/MPLUS1p-Thin.ttf"),
    "MPLUS1p-Light": require("../assets/fonts/MPLUS1p-Light.ttf"),
    "MPLUS1p-Medium": require("../assets/fonts/MPLUS1p-Medium.ttf"),
    "MPLUS1p-Bold": require("../assets/fonts/MPLUS1p-Bold.ttf"),
    "MPLUS1p-ExtraBold": require("../assets/fonts/MPLUS1p-ExtraBold.ttf"),
    "MPLUS1p-Black": require("../assets/fonts/MPLUS1p-Black.ttf"),
  });

  useEffect(() => {
    if (!loaded || !sdkInitialized) {
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
  }, [loaded, sdkInitialized]);

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
    if (!loaded || !sdkInitialized) return;

    const handleColdStartNotification = () => {
      try {
        const lastNotificationResponse =
          Notifications.getLastNotificationResponse();

        if (lastNotificationResponse?.notification) {
          const notificationId =
            lastNotificationResponse.notification.request.identifier;
          const rawData =
            lastNotificationResponse.notification.request.content.data;

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
        console.error("콜드 스타트 알림 처리 중 오류:", error);
      } finally {
        setColdStartProcessed(true);
      }
    };

    handleColdStartNotification();
  }, [loaded, sdkInitialized, isValidNotificationData]);

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

  if (!loaded || !sdkInitialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LoggerContainer>
        <QueryProvider>
          <ModalProvider>
          <I18nextProvider i18n={i18n}>
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
                          <Toast />
                          <ChatActivityTracker />
                      </>
                      </RouteTracker>
                    </AnalyticsProvider>
                  </View>
                </PortoneProvider>
              </GlobalChatProvider>
            </I18nextProvider>  
          </ModalProvider>
        </QueryProvider>
      </LoggerContainer>
    </GestureHandlerRootView>
  );
}