import SmallTitle from "@/assets/icons/small-title.svg";
import { semanticColors } from '../../../src/shared/constants/colors';
import { DefaultLayout } from "@/src/features/layout/ui";
import Signup from "@/src/features/signup";
import { environmentStrategy } from "@/src/shared/libs";
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { track } from "@/src/shared/libs/amplitude-compat";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { registerForPushNotificationsAsync } from "@/src/shared/libs/notifications";
import { mixpanelAdapter } from "@/src/shared/libs/mixpanel";
const { useSignupProgress, useSignupAnalytics, useSignup } = Signup;

export default function SignupDoneScreen() {
  const { clear } = useSignupProgress();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [autoLoginInProgress, setAutoLoginInProgress] = useState(false);
  const { trackSignupEvent } = useSignupAnalytics("done");
  const { updateToken } = useAuth();
  const { signupResponse } = useSignup();

  useEffect(() => {
    const performAutoLogin = async () => {
      if (signupResponse?.accessToken && signupResponse?.refreshToken) {
        try {
          setAutoLoginInProgress(true);

          // 토큰 저장
          await updateToken(signupResponse.accessToken, signupResponse.refreshToken);

          // Mixpanel 사용자 식별
          if (signupResponse.userId) {
            mixpanelAdapter.identify(signupResponse.userId.toString());
          }

          // 푸시 알림 등록
          registerForPushNotificationsAsync().catch((error) => {
            console.error("푸시 토큰 등록 중 오류:", error);
          });

          // 1초 대기 후 홈으로 이동
          setTimeout(() => {
            setLoading(false);
            setAutoLoginInProgress(false);
          }, 1000);
        } catch (error) {
          console.error("자동 로그인 실패:", error);
          setLoading(false);
          setAutoLoginInProgress(false);
        }
      } else {
        // 토큰이 없으면 기존 플로우 (로그인 화면으로)
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    performAutoLogin();
  }, [signupResponse, updateToken]);

  const onNext = () => {
    trackSignupEvent("completion_button_click");
    track("Signup_done", { env: process.env.EXPO_PUBLIC_TRACKING_MODE });
    clear();

    if (signupResponse?.accessToken) {
      // 토큰이 있으면 홈으로
      router.replace("/(tabs)/");
    } else {
      // 토큰이 없으면 로그인 화면으로
      router.push("/auth/login");
    }
  };

  return (
    <DefaultLayout className="flex-1 flex flex-col w-full items-center">
      <PalePurpleGradient />
      <IconWrapper
        width={128}
        className="text-primaryPurple md:pb-[58px] py-12"
      >
        <SmallTitle />
      </IconWrapper>

      <View className="flex flex-col flex-1">
        <View style={{ position: "relative" }}>
          <View
            style={{
              width: 274,
              height: 274,
              borderRadius: 274,
              top: 12,
              left: 0,

              backgroundColor: semanticColors.brand.primary,
              position: "absolute",
            }}
          />
          <Image
            source={require("@assets/images/signup-done.png")}
            style={{ width: 298, height: 296, marginTop: 50 }}
          />
        </View>

        <View className="flex flex-col">
          <View className="mt-[42px]">
            <Text size="lg" textColor="black" weight="semibold">
              {t("apps.auth.sign_up.done.congrats")}
            </Text>
            <Text size="lg" textColor="black" weight="semibold">
              {t("apps.auth.sign_up.done.signup_complete")}
            </Text>
          </View>

          <View className="mt-2">
            <Text size="sm" textColor="pale-purple" weight="light">
              {t("apps.auth.sign_up.done.start_love")}
            </Text>
            <Text size="sm" textColor="pale-purple" weight="light">
              {t("apps.auth.sign_up.done.find_match")}
            </Text>
          </View>
        </View>
      </View>

      <View className="w-full px-5 mb-[24px] md:mb-[58px]">
        <Button
          disabled={loading}
          variant="primary"
          size="md"
          onPress={onNext}
          className="w-full items-center "
        >
          {loading || autoLoginInProgress ? (
            <>
              <Text textColor={"white"} className="text-md white">
                {autoLoginInProgress ? "로그인 중..." : t("apps.auth.sign_up.done.loading")}
              </Text>
              <ActivityIndicator
                size="small"
                color="#ffffff"
                className="ml-6"
              />
            </>
          ) : (
            <Text textColor={"white"} className="text-md white">
              {signupResponse?.accessToken ? "시작하기" : t("apps.auth.sign_up.done.go_login")}
            </Text>
          )}
        </Button>
      </View>
    </DefaultLayout>
  );
}
