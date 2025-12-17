import {
  MobileIdentityVerification,
  usePortOneLogin,
} from "@/src/features/pass";
import { Button, Show, SlideUnlock, Text, AppDownloadSection } from "@/src/shared/ui";
import { useKpiAnalytics } from "@/src/shared/hooks";
import KakaoLogo from "@assets/icons/kakao-logo.svg";
import * as Localization from "expo-localization";
import { router, usePathname, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../auth";
import { PrivacyNotice } from "../../auth/ui/privacy-notice";
import AppleLoginButton from "./apple-login-button";
import UniversityLogos from "./university-logos";
import { useTranslation } from "react-i18next";
import i18n from "@/src/shared/libs/i18n";
import * as KakaoLogin from "@react-native-kakao/user";
import { checkPhoneNumberBlacklist } from "../apis";
import { isAdult } from "@/src/features/pass/utils";
import { useModal } from "@/src/shared/hooks/use-modal";
import { track } from "@/src/shared/libs/amplitude-compat";



export default function LoginForm() {
  const {
    startPortOneLogin,
    isLoading,
    error,
    clearError,
    showMobileAuth,
    mobileAuthRequest,
    handleMobileAuthComplete,
    handleMobileAuthError,
    handleMobileAuthCancel,
  } = usePortOneLogin();
  const { authEvents, signupEvents } = useKpiAnalytics();
  const pathname = usePathname();
  const { regionCode } = Localization.getLocales()[0];
  const isUS = regionCode === "US";
  const { t } = useTranslation();

  const onPressPassLogin = async () => {
    const loginStartTime = Date.now();

    authEvents.trackLoginStarted('pass');
    signupEvents.trackSignupStarted();

    clearError();
    try {
      await startPortOneLogin();

      // KPI 이벤트: 로그인 성공
      const loginDuration = Date.now() - loginStartTime;
      authEvents.trackLoginCompleted('pass', loginDuration);
    } catch (error) {
      // KPI 이벤트: 로그인 실패
      authEvents.trackLoginFailed('pass', 'authentication_error');
    }
  };

  // 모바일에서 PASS 인증 화면 표시
  if (showMobileAuth && mobileAuthRequest && Platform.OS !== "web") {
    return (
      <MobileIdentityVerification
        request={mobileAuthRequest}
        onComplete={handleMobileAuthComplete}
        onError={handleMobileAuthError}
        onCancel={handleMobileAuthCancel}
      />
    );
  }

  return (
    <View className="flex flex-col flex-1 items-center">
      {/* 대학교 로고 애니메이션 */}
      <View style={{ marginBottom: 20 }}>
        <UniversityLogos logoSize={64} />
      </View>

      {/* 웹 전용: 앱 다운로드 섹션 */}
      <Show when={Platform.OS === 'web'}>
        <AppDownloadSection
          onAppStorePress={() => {
            if (Platform.OS === 'web') {
              window.open('https://apps.apple.com/kr/app/%EC%8D%B8%ED%83%80%EC%9E%84-%EC%A7%80%EC%97%AD-%EB%8C%80%ED%95%99%EC%83%9D-%EC%86%8C%EA%B0%9C%ED%8C%85/id6746120889?l=en-GB', '_blank');
            }
          }}
          onGooglePlayPress={() => {
            if (Platform.OS === 'web') {
              window.open('https://play.google.com/store/apps/details?id=com.smartnewb.sometimes&hl=ko&pli=1', '_blank');
            }
          }}
        />
      </Show>

      {/* 슬라이드 잠금 해제 → 온보딩으로 이동 */}
      <View style={{ marginBottom: 15, width: 330 }}>
        <SlideUnlock onAction={() => router.push('/onboarding?source=login')} />
      </View>

      {/* 회원가입 및 로그인 버튼 */}
      <View className="flex w-full items-center flex-col ">
        <View style={{ marginBottom: 15 }}>
          <Button
            variant="primary"
            width="full"
            onPress={onPressPassLogin}
            disabled={isLoading}
            className="py-4 rounded-full min-w-[330px] min-h-[60px]"
            styles={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              className="text-text-inverse text-center text-[18px]"
              style={{ lineHeight: 40 }}
            >
              {isLoading ? t("features.signup.ui.login_form.pass_loading") : t("features.signup.ui.login_form.pass_login")}
            </Text>
          </Button>
        </View>
        <View style={{ marginBottom: 15 }}>
          <KakaoLoginComponent />
        </View>

        <Show when={Platform.OS === "ios"}>
          <View>
            <AppleLoginButton />
          </View>
        </Show>
      </View>
      {/* 에러 메시지 */}

      <View className="w-full px-6 mt-4">
        <Text className="text-red-600 text-sm text-center">{error}</Text>
      </View>

      {/* 약관 동의 안내 */}
      <View className="w-full px-6 mt-6">
        <PrivacyNotice />
      </View>
    </View>
  );
}
function KakaoLoginComponent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { authEvents, signupEvents } = useKpiAnalytics();
  const { loginWithKakaoNative } = useAuth();
  const { showModal } = useModal();

  const KAKAO_CLIENT_ID = process.env.EXPO_PUBLIC_KAKAO_LOGIN_API_KEY as string;
  const redirectUri = process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI as string;

  const handleNativeKakaoLogin = async () => {
    const loginStartTime = Date.now();

    try {
      setIsLoading(true);

      // 카카오 네이티브 SDK로 로그인
      const result = await KakaoLogin.login();

      if (!result.accessToken) {
        throw new Error("Failed to get Kakao access token");
      }

      // 백엔드로 accessToken 전송
      const loginResult = await loginWithKakaoNative(result.accessToken);

      track("Signup_Route_Entered", {
        screen: "AreaSelect",
        platform: "kakao_native",
        env: process.env.EXPO_PUBLIC_TRACKING_MODE,
      });

      if (loginResult.isNewUser) {
        if (loginResult.certificationInfo?.phone) {
          try {
            const { isBlacklisted } = await checkPhoneNumberBlacklist(
              loginResult.certificationInfo?.phone
            );

            if (isBlacklisted) {
              track("Signup_PhoneBlacklist_Failed", {
                phone: loginResult.certificationInfo?.phone,
              });
              showModal({
                title: t("features.signup.ui.login_form.registration_restricted_title"),
                children:
                  t("features.signup.ui.login_form.registration_restricted_message"),
                primaryButton: {
                  text: t("features.signup.ui.login_form.confirm_button"),
                  onClick: () => {
                    router.replace("/");
                  },
                },
              });
              return;
            }
          } catch (error) {
            console.error("블랙리스트 체크 오류:", error);
            track("Signup_Error", {
              stage: "PhoneBlacklistCheck",
              message: error instanceof Error ? error.message : String(error),
            });
            router.replace("/");
            return;
          }
        }

        const birthday = loginResult.certificationInfo?.birthday;

        if (birthday && !isAdult(birthday)) {
          track("Signup_AgeCheck_Failed", {
            birthday,
            platform: "kakao_native",
            env: process.env.EXPO_PUBLIC_TRACKING_MODE,
          });
          router.push("/auth/age-restriction");
          return;
        }

        router.push({
          pathname: "/auth/signup/university",
          params: {
            certificationInfo: JSON.stringify({
              ...loginResult.certificationInfo,
              loginType: "kakao_native",
              kakaoAccessToken: result.accessToken,
            }),
          },
        });
      } else {
        const loginDuration = Date.now() - loginStartTime;
        authEvents.trackLoginCompleted('kakao', loginDuration);

        router.push("/home");
      }
    } catch (error) {
      console.error("카카오 네이티브 로그인 실패:", error);
      authEvents.trackLoginFailed('kakao', 'authentication_error');
      showModal({
        title: t("features.signup.ui.login_form.login_failed_title"),
        children: t("features.signup.ui.login_form.login_failed_message"),
        primaryButton: {
          text: t("features.signup.ui.login_form.confirm_button"),
          onClick: () => { },
        },
      });

      track("Signup_Error", {
        stage: "KakaoNativeLogin",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebKakaoLogin = () => {
    // 웹에서는 기존 방식 유지
    const scope = [
      "name",
      "gender",
      "birthyear",
      "birthday",
      "phone_number",
    ].join(" ");

    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${encodeURIComponent(scope)}`;

    if (Platform.OS === "web") {
      window.location.href = kakaoAuthUrl;
    }
  };

  const handleKakaoLogin = () => {
    authEvents.trackLoginStarted('kakao');
    signupEvents.trackSignupStarted();
    if (Platform.OS === "web") {
      handleWebKakaoLogin();
    } else {
      handleNativeKakaoLogin();
    }
  };

  return (
    <View className="w-full ">
      <Pressable
        onPress={handleKakaoLogin}
        disabled={isLoading}
        className="py-4 !flex-row w-full !items-center !gap-[10px] !justify-center rounded-full min-w-[330px] !h-[60px] !bg-[#FEE500]"
        style={{ opacity: isLoading ? 0.6 : 1 }}
      >
        <View style={{ width: 34, height: 34 }}>
          <KakaoLogo width={34} height={34} />
        </View>
        <View>
          <Text className="text-text-primary text-[18px]">
            {isLoading
              ? t("features.signup.ui.login_form.kakao_login_loading")
              : t("features.signup.ui.login_form.kakao_login")
            }
          </Text>
        </View>
      </Pressable>
    </View>
  );
}