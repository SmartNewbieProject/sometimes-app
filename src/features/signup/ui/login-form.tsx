import {
  MobileIdentityVerification,
  usePortOneLogin,
} from "@/src/features/pass";
import { Button, Show, Text } from "@/src/shared/ui";
import { track } from "@amplitude/analytics-react-native";
import KakaoLogo from "@assets/icons/kakao-logo.svg";
import * as Localization from "expo-localization";
import { Link, usePathname, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../auth";
import { PrivacyNotice } from "../../auth/ui/privacy-notice";
import AppleLoginButton from "./apple-login-button";
import KakaoLoginWebView from "./kakao-login-web-view";
import UniversityLogos from "./university-logos";
import { checkAppEnvironment } from "@shared/libs";

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
  } = usePortOneLogin();
  const pathname = usePathname();
  const { regionCode } = Localization.getLocales()[0];
  const isUS = regionCode === "US";

  const onPressPassLogin = async () => {
    track("Signup_Init", {
      platform: "pass",
      env: process.env.EXPO_PUBLIC_TRACKING_MODE,
    });

    clearError();
    await startPortOneLogin();
  };

  // 모바일에서 PASS 인증 화면 표시
  if (showMobileAuth && mobileAuthRequest && Platform.OS !== "web") {
    return (
      <MobileIdentityVerification
        request={mobileAuthRequest}
        onComplete={handleMobileAuthComplete}
        onError={handleMobileAuthError}
      />
    );
  }

  return (
    <View className="flex flex-col flex-1 items-center">
      {/* 대학교 로고 애니메이션 */}
      <UniversityLogos logoSize={64} />

      {/* 회원가입 및 로그인 버튼 */}
      <View className="flex flex-col ">
        <View
          className="w-full  "
          style={{ marginBottom: Platform.OS === "web" ? 10 : 20 }}
        >
          <Button
            variant="primary"
            width="full"
            onPress={onPressPassLogin}
            disabled={isLoading}
            className="py-4 rounded-full min-w-[330px] min-h-[60px]"
          >
            <Text className="text-white text-center text-[18px] h-[40px]">
              {isLoading ? "PASS 인증 중..." : "PASS 로그인"}
            </Text>
          </Button>
        </View>
        <Show when={!isUS}>
          <View style={{ marginBottom: 10 }}>
            <KakaoLogin />
          </View>
        </Show>

        <Show when={Platform.OS !== "android"}>
          <View style={{ marginRight: 48 }}>
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
function KakaoLogin() {
  const [showWebView, setShowWebView] = useState(false);

  const KAKAO_CLIENT_ID = process.env.EXPO_PUBLIC_KAKAO_LOGIN_API_KEY as string;
  const redirectUri = process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI as string;

  const handleKakaoLogin = () => {
    track("Signup_Init", {
      platform: "kakao",
      env: process.env.EXPO_PUBLIC_TRACKING_MODE,
    });

    if (Platform.OS === "web") {
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

      window.location.href = kakaoAuthUrl;
    } else {
      // 앱에서는 WebView 모달 열기
      setShowWebView(true);
    }
  };

  return (
    <>
      <View className="w-full max-w-xs">
        <Pressable
          onPress={handleKakaoLogin}
          className="py-4 !flex-row w-full !items-center !gap-[10px] !justify-center rounded-full min-w-[330px] !h-[60px] !bg-[#FEE500]"
        >
          <View style={{ width: 34, height: 34 }}>
            <KakaoLogo width={34} height={34} />
          </View>
          <View>
            <Text className="text-[#00000085] text-[18px]">카카오 로그인</Text>
          </View>
        </Pressable>
      </View>

      {/* WebView 모달 */}
      <KakaoLoginWebView
        visible={showWebView}
        onClose={() => setShowWebView(false)}
      />
    </>
  );
}
