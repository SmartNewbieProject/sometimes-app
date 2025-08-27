import { useStorage } from "@/src/shared/hooks/use-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
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
  const { setValue: setAppleUserId } = useStorage<string | null>({
    key: "appleUserId",
  });
  const { setValue: setLoginType } = useStorage<string | null>({
    key: "loginType",
  });

  return useMutation({
    mutationFn: (identityToken: string) => {
      return apis.postAppleLogin(identityToken);
    },
    onSuccess: (result: AppleLoginResponse) => {
      if (result.isNewUser) {
        setLoginType("apple");
        if (Platform.OS === "ios") {
          setAppleUserId(result.appleId);
          console.log(
            "iOS: appleId를 useStorage에 저장했습니다.",
            result.appleId
          );
        } else if (Platform.OS === "web") {
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.setItem("appleUserId", result.appleId);
            console.log(
              "Web: appleId를 localStorage에 직접 저장했습니다.",
              result.appleId
            );
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
        router.replace("/home");
      }
    },
    onError: () => router.replace("/auth/login"),
  });
};
