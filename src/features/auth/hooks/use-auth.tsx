import { axiosClient, platform, tryCatch } from "@/src/shared/libs";
import { eventBus } from "@/src/shared/libs/event-bus";
import { registerForPushNotificationsAsync } from "@/src/shared/libs/notifications";
import type { TokenResponse } from "@/src/types/auth";
import { passKakao, passLogin } from "@features/auth/apis/index";
import { loginByPass } from "@features/auth/utils/login-utils";
import { useModal } from "@hooks/use-modal";
import { useStorage } from "@shared/hooks/use-storage";
import { router } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { useMyDetailsQuery, useProfileDetailsQuery } from "../queries";

export function useAuth() {
  const { value: accessToken, setValue: setToken } = useStorage<string | null>({
    key: "access-token",
    initialValue: null,
  });
  const { value: refreshToken, setValue: setRefreshToken } = useStorage<
    string | null
  >({
    key: "refresh-token",
    initialValue: null,
  });

  const { value: approvalStatus, setValue: setApprovalStatus } = useStorage<{
    status: "pending" | "rejected";
    phoneNumber?: string;
    rejectionReason?: string;
  } | null>({
    key: "approval-status",
    initialValue: null,
  });

  const { removeValue: removeAppleUserId } = useStorage({ key: "appleUserId" });

  const { data: profileDetails } = useProfileDetailsQuery(accessToken ?? null);
  const { my, ...myQueryProps } = useMyDetailsQuery(!!accessToken);
  const { showModal } = useModal();

  const updateToken = async (accessToken: string, refreshToken: string) => {
    await setToken(accessToken);
    await setRefreshToken(refreshToken);
  };

  const login = async (email: string, password: string) => {
    const { accessToken, refreshToken } = await loginApi(email, password);
    await updateToken(accessToken, refreshToken);
  };

  const loginWithPass = async (impUid: string) => {
    const data = await loginByPass(impUid);

    if (data.isNewUser) {
      // 신규 사용자인 경우 본인인증 정보 전달
      return { isNewUser: true, certificationInfo: data.certificationInfo };
    }

    await updateToken(data.accessToken, data.refreshToken);
    registerForPushNotificationsAsync().catch((error) => {
      console.error("푸시 토큰 등록 중 오류:", error);
    });

    return { isNewUser: false };
  };

  const loginWithKakao = async (code: string) => {
    const data = await passKakao(code);

    if (data.isNewUser) {
      // 신규 사용자인 경우 본인인증 정보 전달
      return { isNewUser: true, certificationInfo: data.certificationInfo };
    }

    await updateToken(data.accessToken, data.refreshToken);
    registerForPushNotificationsAsync().catch((error) => {
      console.error("푸시 토큰 등록 중 오류:", error);
    });

    return { isNewUser: false };
  };

  const logoutOnly = async () => {
    if (!refreshToken) {
      router.push("/auth/login");
      await setToken(null);
      await setRefreshToken(null);
      await setApprovalStatus(null);
      // if (Platform.OS === "ios") {
      //   await removeAppleUserId();
      //   console.log("iOS: appleUserId를 삭제합니다.");
      // } else {
      //   sessionStorage.removeItem("appleUserId");
      //   console.log("Web: appleUserId를 삭제합니다.");
      // }
      return;
    }

    await logoutApi(refreshToken);
    await setToken(null);
    await setRefreshToken(null);
    await setApprovalStatus(null);
  };
  const clearTokensOnly = async () => {
    await setToken(null);
    await setRefreshToken(null);
    await setApprovalStatus(null);
  };

  const logout = () => {
    tryCatch(
      async () => {
        logoutOnly();
        showModal({
          title: "로그아웃",
          children: "로그아웃 되었습니다.",
          primaryButton: {
            text: "확인",
            onClick: () => router.push("/auth/login"),
          },
        });
      },
      (error) => {
        console.error(error);
        router.push("/auth/login");
      }
    );
  };

  useEffect(() => {
    const unsubscribeTokens = eventBus.on(
      "auth:tokensUpdated",
      async ({ accessToken, refreshToken }) => {
        await setToken(accessToken);
        await setRefreshToken(refreshToken);
      }
    );

    const unsubscribeLogout = eventBus.on("auth:logout", async () => {
      await setToken(null);
      await setRefreshToken(null);
    });

    return () => {
      unsubscribeTokens();
      unsubscribeLogout();
    };
  }, [setToken, setRefreshToken]);

  const clearApprovalStatus = async () => {
    await setApprovalStatus(null);
  };

  return {
    login,
    loginWithPass,
    profileDetails,
    isAuthorized: !!accessToken,
    approvalStatus,
    clearApprovalStatus,
    loginWithKakao,
    logout,
    logoutOnly,
    clearTokensOnly,
    accessToken,
    my: {
      ...my,
      universityDetails: profileDetails?.universityDetails,
    },
    updateToken,
    queryProps: {
      my: myQueryProps,
    },
  };
}

const loginApi = (email: string, password: string) =>
  axiosClient.post("/auth/login", {
    email,
    password,
  }) as unknown as Promise<TokenResponse>;

const logoutApi = (refreshToken: string) =>
  axiosClient.post("/auth/logout", {
    refreshToken,
  });
