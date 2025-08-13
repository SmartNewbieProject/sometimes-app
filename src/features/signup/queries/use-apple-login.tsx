import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import apis from "../apis";
export interface AppleLoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  role: string;
  isNewUser: boolean;
  certificationInfo: {
    externalId: string;
    provider: string;
  };
}
export const useAppleLogin = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (identityToken: string) => {
      return apis.postAppleLogin(identityToken);
    },
    onSuccess: (result: AppleLoginResponse) => {
      if (result.isNewUser) {
        router.replace({
          pathname: "/auth/signup/area",
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
