import { usePortOneLogin } from "@/src/features/pass/hooks/use-portone-login";
import { Button } from "@/src/shared/ui/button";
import { Show } from "@/src/shared/ui/show/index";
import { Text } from "@/src/shared/ui/text";
// import { useKpiAnalytics } from "@/src/shared/hooks/use-kpi-analytics";
import { Link, usePathname, useRouter } from "expo-router";
import * as Localization from "expo-localization";
import { useEffect, useMemo, useState } from "react";
import { Platform, TouchableOpacity, View, StyleSheet } from "react-native";
import AppleLoginButton from "./apple-login-button";
import KakaoLogin from "./kakao-login";
import KakaoLoginWebView from "./kakao-login-web-view";
import UniversityLogos from "./university-logos";
import { PrivacyNotice } from "../../auth/ui/privacy-notice";

export default function LoginForm() {
  const [showKakaoWebView, setShowKakaoWebView] = useState(false);
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
  // const { authEvents, signupEvents } = useKpiAnalytics();
  const pathname = usePathname();
  const { regionCode } = Localization.getLocales()[0];
  const isUS = regionCode === "US";

  const onPressPassLogin = async () => {
    const loginStartTime = Date.now();

    // KPI 이벤트: 로그인 시작
    // authEvents.trackLoginStarted('pass');

    // 기존 이벤트 호환성
    // signupEvents.trackSignupStarted();

    clearError();
    try {
      await startPortOneLogin();

      // KPI 이벤트: 로그인 성공
      const loginDuration = Date.now() - loginStartTime;
      // authEvents.trackLoginCompleted('pass', loginDuration);
    } catch (error) {
      // KPI 이벤트: 로그인 실패
      // authEvents.trackLoginFailed('pass', 'authentication_error');
    }
  };

  // 모바일에서 PASS 인증 화면 표시
  if (showMobileAuth && mobileAuthRequest && Platform.OS !== "web") {
    const MobileIdentityVerification = require("@/src/features/pass/ui/mobile-identity-verification").MobileIdentityVerification;
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
            width="fit"
            onPress={onPressPassLogin}
            disabled={isLoading}
            styles={styles.passButton}
          >
            <Text style={styles.passButtonText}>
              {isLoading ? "PASS 인증 중..." : "PASS 로그인"}
            </Text>
          </Button>
        </View>
        <View style={styles.buttonWrapper}>
          <KakaoLogin
            onKakaoLoginStart={() => setShowKakaoWebView(true)}
            onKakaoLoginComplete={() => setShowKakaoWebView(false)}
          />
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

      {/* Kakao WebView 모달 */}
      <KakaoLoginWebView
        visible={showKakaoWebView}
        onClose={() => setShowKakaoWebView(false)}
      />
    </View>
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
    width: 330,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999, // rounded-full
    backgroundColor: 'rgb(124 58 237)', // --tw-bg-opacity: 1; background-color: rgb(124 58 237/var(--tw-bg-opacity,1));
    paddingHorizontal: 24, // px-6
    paddingVertical: 16, // py-4
    columnGap: 6, // column-gap: .375rem
    transitionProperty: 'all',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '200ms',
    // Button 컴포넌트의 자체 스타일 덮어쓰기
    minWidth: 330,
  },
  passButtonText: {
    fontSize: 16,
    fontWeight: '700', // bold
    fontFamily: 'Pretendard-Bold',
    color: '#FFFFFF',
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
});