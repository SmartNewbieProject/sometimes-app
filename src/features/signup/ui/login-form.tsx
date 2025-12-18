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
import { Platform, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
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
import AsyncStorage from "@react-native-async-storage/async-storage";



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
    <View style={loginFormStyles.container}>
      {/* 대학교 로고 애니메이션 */}
      <View style={loginFormStyles.universityLogos}>
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
      <View style={loginFormStyles.slideUnlock}>
        <SlideUnlock onAction={() => router.push('/onboarding?source=login')} />
      </View>

      {/* 회원가입 및 로그인 버튼 */}
      <View style={loginFormStyles.buttonsContainer}>
        <View style={loginFormStyles.buttonWrapper}>
          <Button
            variant="primary"
            size="lg"
            rounded="full"
            onPress={onPressPassLogin}
            disabled={isLoading}
            styles={{
              width: 330,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              textColor="white"
              size="18"
              weight="semibold"
              style={{ lineHeight: 40, textAlign: 'center' }}
            >
              {isLoading ? t("features.signup.ui.login_form.pass_loading") : t("features.signup.ui.login_form.pass_login")}
            </Text>
          </Button>
        </View>
        <View style={loginFormStyles.buttonWrapper}>
          <KakaoLoginComponent />
        </View>

        <Show when={Platform.OS === "ios"}>
          <View>
            <AppleLoginButton />
          </View>
        </Show>
      </View>
      {/* 에러 메시지 */}

      <View style={loginFormStyles.errorMessage}>
        <Text size="sm" style={{ color: '#DC2626', textAlign: 'center' }}>{error}</Text>
      </View>

      {/* 약관 동의 안내 */}
      <View style={loginFormStyles.privacyNotice}>
        <PrivacyNotice />
      </View>
    </View>
  );
}

const loginFormStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  universityLogos: {
    marginBottom: 20,
  },
  slideUnlock: {
    marginBottom: 15,
    width: 330,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'column',
  },
  buttonWrapper: {
    marginBottom: 15,
  },
  errorMessage: {
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 16,
  },
  privacyNotice: {
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 24,
  },
});
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
      console.log("[카카오 로그인] 1단계: 카카오 SDK 호출 시작");

      // 카카오 네이티브 SDK로 로그인
      const result = await KakaoLogin.login();
      console.log("[카카오 로그인] 2단계: SDK 응답 받음", {
        hasAccessToken: !!result.accessToken,
        tokenLength: result.accessToken?.length
      });

      if (!result.accessToken) {
        throw new Error("Failed to get Kakao access token");
      }

      console.log("[카카오 로그인] 3단계: 백엔드 API 호출 시작");
      // 백엔드로 accessToken 전송
      const loginResult = await loginWithKakaoNative(result.accessToken);
      console.log("[카카오 로그인] 4단계: 백엔드 응답 받음", {
        isNewUser: loginResult.isNewUser,
        hasCertificationInfo: !!loginResult.certificationInfo
      });

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

        // 보안: certificationInfo를 AsyncStorage에 저장 (URL에 노출 방지)
        await AsyncStorage.setItem(
          'signup_certification_info',
          JSON.stringify({
            ...loginResult.certificationInfo,
            loginType: "kakao_native",
            kakaoAccessToken: result.accessToken,
          })
        );

        router.push("/auth/signup/university");
      } else {
        const loginDuration = Date.now() - loginStartTime;
        authEvents.trackLoginCompleted('kakao', loginDuration);

        router.push("/home");
      }
    } catch (error) {
      console.error("===== 카카오 로그인 에러 상세 정보 =====");
      console.error("에러 타입:", error?.constructor?.name);
      console.error("에러 메시지:", error instanceof Error ? error.message : String(error));
      console.error("에러 스택:", error instanceof Error ? error.stack : "스택 없음");
      if (error && typeof error === 'object') {
        console.error("에러 전체 객체:", JSON.stringify(error, null, 2));
      }
      console.error("=======================================");

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
    <View style={kakaoStyles.container}>
      <Pressable
        onPress={handleKakaoLogin}
        disabled={isLoading}
        style={[
          kakaoStyles.button,
          { opacity: isLoading ? 0.6 : 1 }
        ]}
      >
        <View style={{ width: 34, height: 34 }}>
          <KakaoLogo width={34} height={34} />
        </View>
        <View>
          <Text textColor="black" size="18" weight="semibold">
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

const kakaoStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    width: 330,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
});