import { useAuth } from "@/src/features/auth";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { isAdult } from "@/src/features/pass/utils";
import { useModal } from "@/src/shared/hooks/use-modal";
import { track } from "@/src/shared/libs/amplitude-compat";
import { useRouter } from "expo-router";
// KakaoLoginWebView.tsx
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

interface KakaoLoginWebViewProps {
  visible: boolean;
  onClose: () => void;
}

const KakaoLoginWebView: React.FC<KakaoLoginWebViewProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useTranslation();
  const webViewRef = useRef<WebView>(null);
  const router = useRouter();
  const { loginWithKakao } = useAuth();
  const { showModal } = useModal();
  const KAKAO_CLIENT_ID = process.env.EXPO_PUBLIC_KAKAO_LOGIN_API_KEY as string;
  const redirectUri =
    (process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI as string) ??
    "https://some-in-univ.com/auth/login/redirect";

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
    console.log("Navigation URL:", url);

    // 리디렉션 URL 확인
    if (url.includes("/auth/login/redirect")) {
      try {
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get("code");
        const error = urlObj.searchParams.get("error");

        if (error) {
          console.log("카카오 로그인 에러:", error);
          onClose();
          return false;
        }

        if (code) {
          console.log("카카오 인증 코드 받음:", code);
          handleKakaoLogin(code);
          return false;
        }
      } catch (err) {
        console.log("URL 파싱 에러:", err);
      }
    }

    return true;
  };

  const handleKakaoLogin = async (code: string) => {
    try {
      onClose();
      const result = await loginWithKakao(code);
      track("Signup_Route_Entered", {
        screen: "AreaSelect",
        platform: "kakao",
        env: process.env.EXPO_PUBLIC_TRACKING_MODE,
      });

      if (result.isNewUser) {
        if (result.certificationInfo?.phone) {
          try {
            const { isBlacklisted } = await checkPhoneNumberBlacklist(
              result.certificationInfo?.phone
            );

            if (isBlacklisted) {
              track("Signup_PhoneBlacklist_Failed", {
                phone: result.certificationInfo?.phone,
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
        const birthday = result.certificationInfo?.birthday;

        if (birthday && !isAdult(birthday)) {
          track("Signup_AgeCheck_Failed", {
            birthday,
            platform: "kakao",
            env: process.env.EXPO_PUBLIC_TRACKING_MODE,
          });
          router.push("/auth/age-restriction");
          return;
        }

        router.push({
          pathname: "/auth/signup/university",
          params: {
            certificationInfo: JSON.stringify(result.certificationInfo),
          },
        });
      } else {
        router.push("/home");
      }
    } catch (error) {
      console.log("로그인 처리 에러:", error);
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