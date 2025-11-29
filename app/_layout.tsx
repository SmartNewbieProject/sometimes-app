import "@/src/features/logger/service/patch";
import { useFonts } from "expo-font";
import { Slot, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, View , StyleSheet } from "react-native";
import "react-native-reanimated";
import "../global.css";
import {
  type NotificationData,
  handleNotificationTap,
} from "@/src/shared/libs/notifications";
import { initializeKakaoSDK } from "@react-native-kakao/core";
import * as Notifications from "expo-notifications";

import { GlobalChatProvider } from "@/src/features/chat/providers/global-chat-provider";
import LoggerContainer from "@/src/features/logger/ui/logger-container";
import { PortoneProvider } from "@/src/features/payment/hooks/PortoneProvider";
import { VersionUpdateChecker } from "@/src/features/version-update";
import { QueryProvider, RouteTracker } from "@/src/shared/config";
import { useAtt } from "@/src/shared/hooks";
import { AnalyticsProvider, ModalProvider } from "@/src/shared/providers";
import Toast from "@/src/shared/ui/toast";
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
  useEffect(() => {
    const initKakao = async () => {
      try {
        await initializeKakaoSDK("4d405583bea731b1c4fb26eb8a14e894", {
          web: {
            javascriptKey: "2356db85eb35f5f941d0d66178e16b4e",
            restApiKey: "228e892bfc0e42e824d592d92f52e72e",
          },
        });
      } catch (error) {
        console.error("Kakao SDK 초기화 실패:", error);
      }
    };

    initKakao();
  }, []);

  // 네이티브 환경에서만 폰트 로딩 - 웹은 CSS @font-face 사용
  const getFontConfig = () => {
    if (Platform.OS === "web") {
      // 웹에서는 CSS @font-face를 사용하므로 expo-font 로딩 안 함
      return {};
    }

    try {
      return {
        "Pretendard-Regular": require("../assets/fonts/Pretendard-ExtraLight.ttf"),
        "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.ttf"),
        "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.ttf"),
        Rubik: require("../assets/fonts/Rubik-Regular.ttf"),
        "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
        "Gmarket-Sans-Medium": require("../assets/fonts/GmarketSansTTFMedium.ttf"),
      };
    } catch (e) {
      console.warn("Font loading failed:", e);
      return {};
    }
  };

  const [loaded, error] = useFonts(getFontConfig());

  // 폰트 로딩 에러가 있어도 앱이 계속 진행되도록 처리
  useEffect(() => {
    if (error) {
      console.warn("Font loading error:", error);
    }
  }, [error]);

  useEffect(() => {
    // 네이티브에서 폰트가 로드되지 않았다면 아무것도 하지 않음
    if (!loaded && Platform.OS !== "web") {
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
    // 네이티브 환경에서만 폰트 로딩 확인
    if (!loaded && Platform.OS !== "web") return;

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
  }, [loaded, isValidNotificationData]);

  useEffect(() => {
    // 네이티브 환경에서만 폰트 로딩 확인
    if ((!loaded && Platform.OS !== "web") || !coldStartProcessed) return;

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
        } catch {
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

  // 네이티브 환경에서만 폰트 로딩 대기, 웹은 바로 렌더링
  if (!loaded && Platform.OS !== "web" && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.gestureContainer}>
      <LoggerContainer>
        <QueryProvider>
          <ModalProvider>
            <GlobalChatProvider>
              <PortoneProvider>
                <View
                  style={styles.container}
                >
                  <AnalyticsProvider>
                    <RouteTracker>
                      <>
                        <Slot />
                        <VersionUpdateChecker />
                        <Toast />
                      </>
                    </RouteTracker>
                  </AnalyticsProvider>
                </View>
              </PortoneProvider>
            </GlobalChatProvider>
          </ModalProvider>
        </QueryProvider>
      </LoggerContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    ...(Platform.OS === "web" && {
      maxWidth: 468,
      width: "100%",
      alignSelf: "center",
    }),
  },
});
