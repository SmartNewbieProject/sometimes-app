import {
  MobileIdentityVerification,
  usePortOneLogin,
} from "@/src/features/pass";
import { Button, Show, Text } from "@/src/shared/ui";
import { useKpiAnalytics } from "@/src/shared/hooks";
import KakaoLogo from "@assets/icons/kakao-logo.svg";
import { checkAppEnvironment } from "@shared/libs";
import * as Localization from "expo-localization";
import { Link, usePathname, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, TouchableOpacity, View, StyleSheet } from "react-native";
import { useAuth } from "../../auth";
import { PrivacyNotice } from "../../auth/ui/privacy-notice";
import AppleLoginButton from "./apple-login-button";
import KakaoLoginWebView from "./kakao-login-web-view";
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
  const { authEvents, signupEvents } = useKpiAnalytics();
  const pathname = usePathname();
  const { regionCode } = Localization.getLocales()[0];
  const isUS = regionCode === "US";

  const onPressPassLogin = async () => {
    const loginStartTime = Date.now();

    // KPI 이벤트: 로그인 시작
    authEvents.trackLoginStarted('pass');

    // 기존 이벤트 호환성
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
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* 대학교 로고 애니메이션 */}
      <UniversityLogos logoSize={64} />

      {/* 회원가입 및 로그인 버튼 */}
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <Button
            variant="primary"
            width="full"
            onPress={onPressPassLogin}
            disabled={isLoading}
            style={styles.passButton}
          >
            <Text style={styles.passButtonText}>
              {isLoading ? "PASS 인증 중..." : "PASS 로그인"}
            </Text>
          </Button>
        </View>
        <View style={styles.buttonWrapper}>
          <KakaoLogin />
        </View>

        <Show when={Platform.OS === "ios"}>
          <View>
            <AppleLoginButton />
          </View>
        </Show>
      </View>

      {/* 에러 메시지 */}
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>

      {/* 약관 동의 안내 */}
      <View style={styles.privacyContainer}>
        <PrivacyNotice />
      </View>
    </View>
  );
}
function KakaoLogin() {
  const [showWebView, setShowWebView] = useState(false);
  const { authEvents, signupEvents } = useKpiAnalytics();

  const KAKAO_CLIENT_ID = process.env.EXPO_PUBLIC_KAKAO_LOGIN_API_KEY as string;
  const redirectUri = process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI as string;

  const handleKakaoLogin = () => {
    // KPI 이벤트: 카카오 로그인 시작
    authEvents.trackLoginStarted('kakao');

    // 기존 이벤트 호환성
    signupEvents.trackSignupStarted();

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
      <View style={styles.kakaoButtonContainer}>
        <Pressable
          onPress={handleKakaoLogin}
          style={styles.kakaoButton}
        >
          <View style={styles.kakaoLogoContainer}>
            <KakaoLogo width={34} height={34} />
          </View>
          <View>
            <Text style={styles.kakaoButtonText}>카카오 로그인</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
  },
  buttonWrapper: {
    marginBottom: Platform.OS === 'web' ? 12 : 15, // 웹에서는 마진 조정
  },
  passButton: {
    paddingVertical: 16, // py-4
    borderRadius: 9999, // rounded-full
    minWidth: Platform.OS === 'web' ? 280 : 330, // 웹에서는 최소 너비 조정
    minHeight: Platform.OS === 'web' ? 50 : 60, // 웹에서는 높이 조정
  },
  passButtonText: {
    textAlign: 'center',
    fontSize: Platform.OS === 'web' ? 16 : 18, // 웹에서는 폰트 크기 조정
    height: Platform.OS === 'web' ? 35 : 40, // 웹에서는 높이 조정
    color: '#FFFFFF', // text-text-inverse
  },
  errorContainer: {
    width: '100%',
    paddingHorizontal: 24, // px-6
    marginTop: 16, // mt-4
  },
  errorText: {
    color: '#DC2626', // text-red-600
    fontSize: 14, // text-sm
    textAlign: 'center',
  },
  privacyContainer: {
    width: '100%',
    paddingHorizontal: 24, // px-6
    marginTop: 24, // mt-6
  },
  kakaoButtonContainer: {
    width: '100%',
  },
  kakaoButton: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16, // py-4
    borderRadius: 9999, // rounded-full
    minWidth: Platform.OS === 'web' ? 280 : 330, // 웹에서는 최소 너비 조정
    height: Platform.OS === 'web' ? 50 : 60, // 웹에서는 높이 조정
    backgroundColor: '#FEE500',
    gap: 10, // gap-[10px]
  },
  kakaoLogoContainer: {
    width: Platform.OS === 'web' ? 28 : 34, // 웹에서는 크기 조정
    height: Platform.OS === 'web' ? 28 : 34, // 웹에서는 크기 조정
  },
  kakaoButtonText: {
    fontSize: Platform.OS === 'web' ? 16 : 18, // 웹에서는 폰트 크기 조정
    color: '#000000', // text-text-primary
  },
});
