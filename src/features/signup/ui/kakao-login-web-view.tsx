import { useAuth } from "@/src/features/auth";
import { track } from "@amplitude/analytics-react-native";
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

interface KakaoLoginWebViewProps {
  visible: boolean;
  onClose: () => void;
}

const KakaoLoginWebView: React.FC<KakaoLoginWebViewProps> = ({
  visible,
  onClose,
}) => {
  const webViewRef = useRef<WebView>(null);
  const router = useRouter();
  const { loginWithKakao } = useAuth();

  const KAKAO_CLIENT_ID = process.env.EXPO_PUBLIC_KAKAO_LOGIN_API_KEY as string;
  const redirectUri = process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI as string;

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
      });

      if (result.isNewUser) {
        router.push({
          pathname: "/auth/signup/area",
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
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>카카오 로그인</Text>
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
    backgroundColor: "#ffffff",
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
    color: "#000000",
  },
  placeholder: {
    width: 48,
  },
  webView: {
    flex: 1,
  },
});

export default KakaoLoginWebView;
