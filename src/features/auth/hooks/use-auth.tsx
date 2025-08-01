import {axiosClient, tryCatch} from "@/src/shared/libs";
import {useStorage} from "@shared/hooks/use-storage";
import {useMyDetailsQuery, useProfileDetailsQuery} from "../queries";
import type {TokenResponse} from "@/src/types/auth";
import {useModal} from "@hooks/use-modal";
import {router} from "expo-router";
import {eventBus} from '@/src/shared/libs/event-bus';
import {useEffect} from 'react';
import {passLogin} from "@features/auth/apis/index";
import {registerForPushNotificationsAsync} from "@/src/shared/libs/notifications";

export function useAuth() {
  const {value: accessToken, setValue: setToken} = useStorage<string | null>({
    key: 'access-token',
    initialValue: null,
  });

  const {value: refreshToken, setValue: setRefreshToken} = useStorage<string | null>({
    key: 'refresh-token',
    initialValue: null,
  });

  const {value: approvalStatus, setValue: setApprovalStatus} = useStorage<{
    status: 'pending' | 'rejected';
    phoneNumber?: string;
    rejectionReason?: string;
  } | null>({
    key: 'approval-status',
    initialValue: null,
  });

  const {data: profileDetails} = useProfileDetailsQuery(accessToken ?? null);
  const {my, ...myQueryProps} = useMyDetailsQuery(!!accessToken);
  const {showModal} = useModal();

  const updateToken = async (accessToken: string, refreshToken: string) => {
    await setToken(accessToken);
    await setRefreshToken(refreshToken);
  };

  const login = async (email: string, password: string) => {
    const {accessToken, refreshToken} = await loginApi(email, password);
    await updateToken(accessToken, refreshToken);
  };

  const loginWithPass = async (impUid: string) => {
    const data = await passLogin(impUid);

    if (data.isNewUser) {
      // 신규 사용자인 경우 본인인증 정보 전달
      return {isNewUser: true, certificationInfo: data.certificationInfo};
    }

    await updateToken(data.accessToken, data.refreshToken);
    registerForPushNotificationsAsync().catch(error => {
      console.error('푸시 토큰 등록 중 오류:', error);
    });

    return {isNewUser: false};
  };

  const logoutOnly = async () => {
    if (!refreshToken) {
      router.push('/auth/login');
      await setToken(null);
      await setRefreshToken(null);
      await setApprovalStatus(null);
      return;
    }

    await logoutApi(refreshToken);
    await setToken(null);
    await setRefreshToken(null);
    await setApprovalStatus(null);
  }

  const logout = () => {
    tryCatch(async () => {
      logoutOnly();
      showModal({
        title: '로그아웃',
        children: '로그아웃 되었습니다.',
        primaryButton: {
          text: '확인',
          onClick: () => router.push('/auth/login'),
        },
      });
    }, error => {
      console.error(error);
      router.push('/auth/login');
    });
  };

  useEffect(() => {
    const unsubscribeTokens = eventBus.on('auth:tokensUpdated',
        async ({accessToken, refreshToken}) => {
          await setToken(accessToken);
          await setRefreshToken(refreshToken);
        });

    const unsubscribeLogout = eventBus.on('auth:logout', async () => {
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
    logout,
    logoutOnly,
    my: {
      ...my,
      universityDetails: profileDetails?.universityDetails
    },
    updateToken,
    queryProps: {
      my: myQueryProps,
    },
  };
}

const loginApi = (email: string, password: string) =>
    axiosClient.post('/auth/login', {
      email, password,
    }) as unknown as Promise<TokenResponse>;

const logoutApi = (refreshToken: string) => axiosClient.post('/auth/logout', {
  refreshToken,
});
