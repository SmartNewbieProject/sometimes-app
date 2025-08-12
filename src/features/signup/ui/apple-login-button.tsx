import * as AppleAuthentication from "expo-apple-authentication";
import type React from "react";
import { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: AppleWebConfig) => void;
        signIn: () => Promise<AppleWebResponse>;
      };
    };
  }
}

interface AppleWebConfig {
  clientId: string;
  scope: string;
  redirectURI: string;
  state: string;
  usePopup: boolean;
}

interface AppleWebResponse {
  authorization: {
    code: string;
    id_token: string;
    state: string;
  };
  user?: {
    email?: string;
    name?: {
      firstName: string;
      lastName: string;
    };
  };
}

interface AppleIOSCredential {
  identityToken: string | null;
  user: string;
  email: string | null;
  fullName: AppleAuthentication.AppleAuthenticationFullName | null;
  authorizationCode: string | null;
}

interface BackendAppleData {
  platform: "web" | "ios";
  authorization?: {
    code: string;
    id_token: string;
    state: string;
  };
  user?: {
    email?: string;
    name?: {
      firstName: string;
      lastName: string;
    };
  };
  identityToken?: string | null;
  userId?: string;
  email?: string | null;
  fullName?: AppleAuthentication.AppleAuthenticationFullName | null;
  authorizationCode?: string | null;
}

interface BackendResponse {
  success: boolean;
  token?: string;
  error?: string;
}

const AppleLoginButton: React.FC = () => {
  const [isAppleJSLoaded, setIsAppleJSLoaded] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    initializeAppleLogin();
  }, []);

  const initializeAppleLogin = async (): Promise<void> => {
    if (Platform.OS === "web") {
      loadAppleJS();
    } else if (Platform.OS === "ios") {
      try {
        const available = await AppleAuthentication.isAvailableAsync();
        available;
      } catch (error) {
        console.error("Apple 로그인 가용성 확인 실패:", error);
      }
    }
  };

  // 웹용 Apple JS 로드
  const loadAppleJS = (): void => {
    if (typeof window !== "undefined" && window.AppleID) {
      setIsAppleJSLoaded(true);
      initAppleJS();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.async = true;
    script.onload = () => {
      setIsAppleJSLoaded(true);
      initAppleJS();
    };
    script.onerror = () => {
      console.error("Apple JS 로드 실패");
    };
    document.head.appendChild(script);
  };

  const initAppleJS = (): void => {
    if (typeof window !== "undefined" && window.AppleID) {
      window.AppleID.auth.init({
        clientId: "someinuniv.web.login", // 웹용 Service ID
        scope: "name email",
        redirectURI: "https://some-in-univ.com/test",
        state: "web-login",
        usePopup: true,
      });
    }
  };

  // 공통 백엔드 처리 함수
  const sendToBackend = async (data: BackendAppleData): Promise<void> => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/apple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: BackendResponse = await response.json();

      if (result.success && result.token) {
        // JWT 토큰 저장
        // await AsyncStorage.setItem('authToken', result.token);
        console.log("로그인 성공:", result);
        // 화면 이동 등...
      } else {
        throw new Error(result.error || "로그인 실패");
      }
    } catch (error) {
      console.error("백엔드 요청 실패:", error);
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 웹용 Apple 로그인
  const handleWebAppleLogin = async (): Promise<void> => {
    if (!window.AppleID || isLoading) return;

    try {
      const data: AppleWebResponse = await window.AppleID.auth.signIn();

      await sendToBackend({
        platform: "web",
        authorization: data.authorization,
        user: data.user,
      });
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (error: any) {
      if (error.error === "popup_closed_by_user") {
        console.log("사용자가 팝업을 닫았습니다");
      } else {
        console.error("웹 Apple 로그인 실패:", error);
        alert("Apple 로그인에 실패했습니다.");
      }
    }
  };

  // iOS용 Apple 로그인
  const handleIOSAppleLogin = async (): Promise<void> => {
    if (isLoading) return;

    try {
      const credential: AppleAuthentication.AppleAuthenticationCredential =
        await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });

      await sendToBackend({
        platform: "ios",
        identityToken: credential.identityToken,
        userId: credential.user,
        email: credential.email,
        fullName: credential.fullName,
        authorizationCode: credential.authorizationCode,
      });
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (error: any) {
      if (error.code === "ERR_CANCELED") {
        console.log("사용자가 로그인을 취소했습니다");
      } else {
        console.error("iOS Apple 로그인 실패:", error);
        alert("Apple 로그인에 실패했습니다.");
      }
    }
  };

  // 플랫폼별 렌더링
  if (Platform.OS === "web") {
    if (!isAppleJSLoaded) {
      return (
        <View style={styles.loadingContainer}>
          <Text>Apple 로그인 준비 중...</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.webAppleButton, isLoading && styles.disabled]}
        onPress={handleWebAppleLogin}
        disabled={isLoading}
      >
        <Text style={styles.webButtonText}>
          {isLoading ? "로그인 중..." : "🍎 Sign in with Apple"}
        </Text>
      </TouchableOpacity>
    );
  }

  // iOS
  if (Platform.OS === "ios") {
    return (
      <View style={styles.iosContainer}>
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={8}
          style={[styles.iosAppleButton, isLoading && styles.disabled]}
          onPress={handleIOSAppleLogin}
        />
        {isLoading && <Text style={styles.loadingText}>로그인 중...</Text>}
      </View>
    );
  }

  // Apple 로그인 지원 안 하는 경우
  return null;
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 16,
    alignItems: "center",
  },
  webAppleButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 200,
  },
  webButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  iosContainer: {
    alignItems: "center",
  },
  iosAppleButton: {
    width: 200,
    height: 44,
  },
  disabled: {
    opacity: 0.6,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
});

export default AppleLoginButton;
