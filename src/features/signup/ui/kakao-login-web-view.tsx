import { useAuth } from "@/src/features/auth";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { isAdult } from "@/src/features/pass/utils";
import { useModal } from "@/src/shared/hooks/use-modal";
import { env } from "@/src/shared/libs/env";
import { useRouter } from "expo-router";
import type React from "react";
import { useRef } from "react";
import {
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView, type WebViewNavigation } from "react-native-webview";
import { useTranslation } from "react-i18next";
import { checkPhoneNumberBlacklist } from "../apis";
import { devLogWithTag } from "@/src/shared/utils";
import { useMixpanel } from "@/src/shared/hooks/use-mixpanel";

interface KakaoLoginWebViewProps {
  visible: boolean;
  onClose: () => void;
}

const KakaoLoginWebView: React.FC<KakaoLoginWebViewProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useTranslation();
  const { authEvents, signupEvents } = useMixpanel();
  const webViewRef = useRef<WebView>(null);
  const router = useRouter();
  const { loginWithKakao } = useAuth();
  const { showModal } = useModal();
  const KAKAO_CLIENT_ID = env.KAKAO_LOGIN_API_KEY;
  const redirectUri = env.KAKAO_REDIRECT_URI || "https://some-in-univ.com/auth/login/redirect";

  const scope = [
    "name",
    "gender",
    "birthyear",
    "birthday",
    "phone_number",
  ].join(" ");
  // 카카오 로그인 URL 생성
  const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(scope)}`;

  // WebView 네비게이션 상태 변경 처리
  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url } = navState;
    devLogWithTag('Kakao WebView', 'Navigation:', url);

    // 리디렉션 URL 확인
    if (url.includes("/auth/login/redirect")) {
      try {
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get("code");
        const error = urlObj.searchParams.get("error");

        if (error) {
          devLogWithTag('Kakao WebView', 'Login error:', error);
          onClose();
          return false;
        }

        if (code) {
          devLogWithTag('Kakao WebView', 'Auth code received');
          handleKakaoLogin(code);
          return false;
        }
      } catch (err) {
        devLogWithTag('Kakao WebView', 'URL parsing error:', err);
      }
    }

    return true;
  };

  const handleKakaoLogin = async (code: string) => {
    const loginStartTime = Date.now();

    try {
      onClose();
      const result = await loginWithKakao(code);

      if (result.isNewUser) {
        if (result.certificationInfo?.phone) {
          try {
            const { isBlacklisted } = await checkPhoneNumberBlacklist(
              result.certificationInfo?.phone
            );

            if (isBlacklisted) {
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
            router.replace("/");
            return;
          }
        }
        const birthday = result.certificationInfo?.birthday;

        if (birthday && !isAdult(birthday)) {
          router.push("/auth/age-restriction");
          return;
        }

        router.push({
          pathname: "/auth/signup/university",
          params: {
            certificationInfo: JSON.stringify({
              ...result.certificationInfo,
              loginType: "kakao",
              kakaoCode: code,
            }),
          },
        });
      } else {
        const loginDuration = Date.now() - loginStartTime;
        authEvents.trackLoginCompleted('kakao', loginDuration);
        router.push("/home");
      }
    } catch (error) {
      devLogWithTag('Kakao WebView', 'Login processing error:', error);
      authEvents.trackLoginFailed('kakao', 'login_processing_error');
    }
  };

  if (Platform.OS === "web") {
    if (visible) {
      window.location.href = kakaoLoginUrl;
    }
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>{t("features.signup.ui.login_form.close_button")}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("features.signup.ui.login_form.kakao_login")}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: kakaoLoginUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          mixedContentMode="compatibility"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          // iOS 설정
          allowsBackForwardNavigationGestures={true}
          // Android 설정
          userAgent="Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36"
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: semanticColors.text.primary,
  },
  placeholder: {
    width: 48,
  },
  webView: {
    flex: 1,
  },
});

export default KakaoLoginWebView;