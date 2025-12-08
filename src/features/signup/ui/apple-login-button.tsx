import { useStorage } from "@/src/shared/hooks/use-storage";
import { semanticColors } from '../../../shared/constants/colors';
import { track } from "@/src/shared/libs/amplitude-compat";
import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";
import type React from "react";
import { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { AppleLoginResponse, useAppleLogin } from "../queries/use-apple-login";

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: AppleWebConfig) => void;
        signIn: () => Promise<AppleWebResponse>;
      };
    };
    sessionStorage: Storage;
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
  const { t } = useTranslation();
  const { removeValue: removeAppleUserId } = useStorage({ key: "appleUserId" });
  const { setValue: setLoginType } = useStorage<string | null>({
    key: "loginType",
  });
  const {
    setValue: setAppleUserFullName,
    removeValue: removeAppleUserFullName,
  } = useStorage<string | null>({ key: "appleUserFullName" });
  const [isAppleJSLoaded, setIsAppleJSLoaded] = useState<boolean>(false);
  const mutation = useAppleLogin();
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
        clientId: "com.some-in-univ.web", // 웹용 Service ID
        scope: "name",
        redirectURI: "https://some-in-univ.com/auth/login",
        state: "web-login",
        usePopup: true,
      });
    }
  };

  const sendToBackend = async (data: BackendAppleData): Promise<void> => {
    try {
      setIsLoading(true);

      const userId = data.platform === "web" ? data.userId : data.userId;

      await mutation.mutateAsync(userId ?? "");

      track("Signup_Route_Entered", {
        screen: "AreaSelect",
        platform: "apple",
        env: process.env.EXPO_PUBLIC_TRACKING_MODE,
      });
    } catch (error) {
      console.error("백엔드 요청 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebAppleLogin = async (): Promise<void> => {
    console.log("Button clicked", { AppleID: window.AppleID, isLoading });
    if (!window.AppleID || isLoading) return;

    try {
      window.sessionStorage.removeItem("appleUserId");
      window.sessionStorage.removeItem("appleUserFullName");

      const data: AppleWebResponse = await window.AppleID.auth.signIn();

      const fullName = data.user?.name;
      if (fullName) {
        const fullDisplayName = `${fullName.lastName || ""}${
          fullName.firstName || ""
        }`;
        window.sessionStorage.setItem("appleUserFullName", fullDisplayName);
      } else {
        window.sessionStorage.removeItem("appleUserFullName");
      }
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
      }
    }
  };

  const handleIOSAppleLogin = async (): Promise<void> => {
    if (isLoading) return;

    try {
      await removeAppleUserId();
      await removeAppleUserFullName();

      const credential: AppleAuthentication.AppleAuthenticationCredential =
        await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });

      const fullName = credential.fullName;
      if (fullName) {
        const fullDisplayName = `${fullName.familyName || ""}${
          fullName.givenName || ""
        }`;
        await setAppleUserFullName(fullDisplayName);
      } else {
        await removeAppleUserFullName();
      }

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
      }
    }
  };

  if (Platform.OS === "web") {
    if (!isAppleJSLoaded) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={{ color: semanticColors.text.primary }}>{t("features.signup.ui.login_form.apple_login_preparing")}</Text>
        </View>
      );
    }

    return (
      <View>
        <Pressable
          onPress={handleWebAppleLogin}
          disabled={isLoading}
          className="py-4 !flex-row w-full !items-center !gap-[10px] !justify-center rounded-full min-w-[330px] !h-[60px] !bg-surface-inverse border  !border-border-default"
        >
          <Text style={styles.appleLogo}></Text>
          <View>
            <Text className="text-text-inverse text-[18px]">{t("features.signup.ui.login_form.apple_login")}</Text>
          </View>
        </Pressable>
      </View>
    );
  }

  // iOS
  if (Platform.OS === "ios") {
    return (
      <View style={styles.iosContainer}>
        <View className="w-full">
          <Pressable
            onPress={handleIOSAppleLogin}
            disabled={isLoading}
            className="py-4 !flex-row w-full !items-center !gap-[10px] !justify-center rounded-full min-w-[330px] !containerh-[60px] !bg-surface-inverse border  !border-border-default"
          >
            <Text style={styles.appleLogo}></Text>
            <View>
              <Text className="text-text-inverse text-[18px]">{t("features.signup.ui.login_form.apple_login")}</Text>
            </View>
          </Pressable>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 16,
    alignItems: "center",
  },
  webAppleButton: {
    backgroundColor: semanticColors.surface.inverse,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 200,
  },
  webButtonText: {
    color: semanticColors.text.inverse,
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
    color: semanticColors.text.disabled,
  },
  appleLogo: {
    color: semanticColors.text.inverse,
    textAlign: "center",

    fontFamily: "SF Pro",
    fontSize: 26,
    fontWeight: 600,
  },
});

export default AppleLoginButton;