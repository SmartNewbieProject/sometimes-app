import { useStorage } from "@/src/shared/hooks/use-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
import { useAuth } from "../../auth";
import apis from "../apis";

export interface AppleLoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  role: string;
  isNewUser: boolean;
  appleId: string;
  certificationInfo: {
    externalId: string;
    provider: string;
  };
}
export const useAppleLogin = () => {
  const router = useRouter();
  const { updateToken } = useAuth();
  const { setValue: setAppleUserId } = useStorage<string | null>({
    key: "appleUserId",
  });
  const { setValue: setLoginType } = useStorage<string | null>({
    key: "loginType",
  });

  return useMutation({
    mutationFn: (appleId: string) => {
      return apis.postAppleLogin(appleId);
    },
    onSuccess: async (result: AppleLoginResponse) => {
      if (result.isNewUser) {
        if (Platform.OS === "ios") {
          setLoginType("apple");
          setAppleUserId(result.appleId);
        } else if (Platform.OS === "web") {
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.setItem("appleUserId", result.appleId);
            sessionStorage.setItem("loginType", "apple");
          } else {
            console.warn("Web 환경이지만 localStorage에 저장하지 못했습니다.");
          }
        }
        router.replace({
          pathname: "/auth/login/apple-info",
          params: {
            certificationInfo: JSON.stringify(result.certificationInfo),
          },
        });
      } else {
        await updateToken(result.accessToken, result.refreshToken);
        router.replace("/home");
      }
    },
    onError: () => router.replace("/auth/login"),
  });
};
