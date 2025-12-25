import { axiosClient, platform, tryCatch, storage } from "@/src/shared/libs";
import * as Sentry from "@sentry/react-native";
import { resetAppState } from "@/src/shared/libs/reset-app-state";
import { eventBus } from "@/src/shared/libs/event-bus";
import { registerForPushNotificationsAsync } from "@/src/shared/libs/notifications";
import type { TokenResponse } from "@/src/types/auth";
import { passKakao, passKakaoNative, passLogin } from "@features/auth/apis/index";
import { loginByPass } from "@features/auth/utils/login-utils";
import { useModal } from "@hooks/use-modal";
import { useStorage } from "@shared/hooks/use-storage";
import { useMixpanel } from "@shared/hooks/use-mixpanel";
import { LOGOUT_REASONS } from "@shared/constants/mixpanel-events";
import { mixpanelAdapter } from "@/src/shared/libs/mixpanel";
import { router } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { useMyDetailsQuery, useProfileDetailsQuery } from "../queries";
import { useTranslation } from "react-i18next";

const ONBOARDING_COMPLETED_KEY = 'onboarding-completed';

const clearOnboardingCompletedFlag = async () => {
  await storage.removeItem(ONBOARDING_COMPLETED_KEY);
};

export function useAuth() {
  const { t } = useTranslation();
  const { trackEvent } = useMixpanel();

  const { value: accessToken, setValue: setToken, loading: tokenLoading } = useStorage<string | null>({
    key: "access-token",
    initialValue: null,
  });

  // 디버깅: 직접 storage 확인 제거 (storage import 오류 방지)
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

  const hasToken = !!accessToken;
  const { my, ...myQueryProps } = useMyDetailsQuery(hasToken);
  const { data: profileDetails } = useProfileDetailsQuery(accessToken ?? null);
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

    // Mixpanel 사용자 식별 (로그인 성공 시)
    if (data.userId) {
      mixpanelAdapter.identify(data.userId.toString());
    }

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

    // Mixpanel 사용자 식별 (로그인 성공 시)
    if (data.userId) {
      mixpanelAdapter.identify(data.userId.toString());
    }

    registerForPushNotificationsAsync().catch((error) => {
      console.error("푸시 토큰 등록 중 오류:", error);
    });

    return { isNewUser: false };
  };

  const loginWithKakaoNative = async (accessToken: string) => {
    const data = await passKakaoNative(accessToken);

    if (data.isNewUser) {
      // 신규 사용자인 경우 본인인증 정보 전달
      return { isNewUser: true, certificationInfo: data.certificationInfo };
    }

    await updateToken(data.accessToken, data.refreshToken);

    // Mixpanel 사용자 식별 (로그인 성공 시)
    if (data.userId) {
      mixpanelAdapter.identify(data.userId.toString());
    }

    registerForPushNotificationsAsync().catch((error) => {
      console.error("푸시 토큰 등록 중 오류:", error);
    });

    return { isNewUser: false };
  };

  const logoutOnly = async () => {
    resetAppState();
    Sentry.setUser(null);

    if (!refreshToken) {
      router.push("/auth/login");
      await setToken(null);
      await setRefreshToken(null);
      await setApprovalStatus(null);
      await clearOnboardingCompletedFlag();
      return;
    }

    await logoutApi(refreshToken);
    await setToken(null);
    await setRefreshToken(null);
    await setApprovalStatus(null);
    await clearOnboardingCompletedFlag();
  };
  const clearTokensOnly = async () => {
    await setToken(null);
    await setRefreshToken(null);
    await setApprovalStatus(null);
    await clearOnboardingCompletedFlag();
  };

  const logout = () => {
    tryCatch(
      async () => {
        trackEvent('AUTH_LOGOUT', {
          reason: LOGOUT_REASONS.MANUAL,
        });
        logoutOnly();
        showModal({
          title: t("features.auth.hooks.use_auth.logout_modal_title"),
          children: t("features.auth.hooks.use_auth.logout_modal_message"),
          primaryButton: {
            text: t("features.auth.hooks.use_auth.logout_modal_button"),
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
      resetAppState();
      Sentry.setUser(null);
      await setToken(null);
      await setRefreshToken(null);
      await setApprovalStatus(null);
      await clearOnboardingCompletedFlag();
    });

    return () => {
      unsubscribeTokens();
      unsubscribeLogout();
    };
  }, [setToken, setRefreshToken, setApprovalStatus]);

  // User Properties 설정 (my 정보 로드 시)
  useEffect(() => {
    if (my?.id && profileDetails) {
      mixpanelAdapter.setUserProperties({
        university_name: profileDetails.universityDetails?.name,
        university_verified: profileDetails.universityDetails?.isVerified,
        gender: my.gender,
        age: my.age,
        days_since_signup: my.createdAt
          ? Math.floor((Date.now() - new Date(my.createdAt).getTime()) / (1000 * 60 * 60 * 24))
          : undefined,
      });

      Sentry.setUser({
        id: my.id.toString(),
        username: my.nickname,
        email: my.email,
      });
    }
  }, [my, profileDetails]);

  const clearApprovalStatus = async () => {
    await setApprovalStatus(null);
  };

  return {
    login,
    loginWithPass,
    isAuthorized: !!accessToken,
    approvalStatus,
    clearApprovalStatus,
    loginWithKakao,
    loginWithKakaoNative,
    logout,
    logoutOnly,
    clearTokensOnly,
    accessToken,
    tokenLoading,
    my: {
      ...my,
      universityDetails: profileDetails?.universityDetails,
    },
    profileDetails,
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
