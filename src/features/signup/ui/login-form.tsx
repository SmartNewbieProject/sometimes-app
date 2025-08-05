import {
  MobileIdentityVerification,
  usePortOneLogin,
} from "@/src/features/pass";
import { Button, Text } from "@/src/shared/ui";
import { track } from "@amplitude/analytics-react-native";
import KakaoLogo from "@assets/icons/kakao-logo.svg";
import * as AuthSession from "expo-auth-session";
import { useEffect, useMemo } from "react";
import { Platform, Pressable, TouchableOpacity, View } from "react-native";
import { PrivacyNotice } from "../../auth/ui/privacy-notice";
import UniversityLogos from "./university-logos";
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

  const onPressPassLogin = async () => {
    track("Signup_Init", { platform: "pass" });

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
      <View className="flex flex-col  " style={{ marginBottom: 10 }}>
        <View className="w-full max-w-xs  mt-2">
          <Button
            variant="primary"
            width="full"
            onPress={onPressPassLogin}
            disabled={isLoading}
            className="py-4 rounded-full min-w-[280px] min-h-[60px]"
          >
            <Text className="text-white text-center text-[18px] h-[40px]">
              {isLoading ? "PASS 인증 중..." : "회원가입 및 로그인"}
            </Text>
          </Button>
        </View>
      </View>
      <KakaoLogin />

      {/* 에러 메시지 */}
      {/* {error && (
        <TouchableOpacity className="w-full px-6 mt-4" onPress={clearError}>
          <View className="w-full px-4 py-2 bg-red-50 rounded-md">
            <Text className="text-red-600 text-sm text-center">{error}</Text>
            <Text className="text-red-400 text-xs text-center mt-1">
              탭하여 닫기
            </Text>
          </View>
        </TouchableOpacity>
      )} */}

      {/* 약관 동의 안내 */}
      <View className="w-full px-6 mt-10">
        <PrivacyNotice />
      </View>
    </View>
  );
}

const discovery = {
  authorizationEndpoint: "https://kauth.kakao.com/oauth/authorize",
  tokenEndpoint: "https://kauth.kakao.com/oauth/token",
};

function KakaoLogin() {
  const KAKAO_CLIENT_ID = process.env.EXPO_PUBLIC_KAKAO_LOGIN_API_KEY as string;

  const redirectUri = useMemo(() => {
    if (Platform.OS === "web") {
      return "http://localhost:3000/auth/login/redirect";
    }

    return AuthSession.makeRedirectUri({
      scheme: "myapp",
      path: "auth/login/redirect",
    });
  }, []);

  console.log("kakao", KAKAO_CLIENT_ID);
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: KAKAO_CLIENT_ID,
      redirectUri,

      responseType: AuthSession.ResponseType.Code,
      scopes: ["name", "gender", "birthyear", "birthday", "phone_number"],
    },
    discovery
  );

  return (
    <View className="flex flex-col">
      <View className="w-full max-w-xs">
        <Pressable
          onPress={() => {
            track("Signup_Init", { platform: "kakao" });
            if (Platform.OS === "web") {
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
              window.location.href = kakaoAuthUrl; // 현재 탭에서 열기
            } else {
              promptAsync(); // 앱에선 기존 방식
            }
          }}
          disabled={!request}
          className="py-4 !flex-row w-full !items-center !gap-[10px] !justify-center  rounded-full min-w-[280px] h-[60] !bg-[#FEE500] "
        >
          <View style={{ width: 34, height: 34 }}>
            <KakaoLogo width={34} height={34} />
          </View>
          <View>
            <Text className="text-[#00000085]  text-[18px] ">
              카카오 로그인
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
