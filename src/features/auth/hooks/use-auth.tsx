import { axiosClient, tryCatch } from "@/src/shared/libs";
import { useStorage } from "@shared/hooks/use-storage";
import { useMyDetailsQuery, useProfileDetailsQuery } from "../queries";
import type { TokenResponse } from "@/src/types/auth";
import { passLogin } from "../apis";
import { useModal } from "@hooks/use-modal";
import { router } from "expo-router";
import { eventBus } from '@/src/shared/libs/event-bus';
import { useEffect } from 'react';

export function useAuth() {
  const { value: accessToken, setValue: setToken } = useStorage<string | null>({
    key: 'access-token',
    initialValue: null,
  });

  const { value: refreshToken, setValue: setRefreshToken } = useStorage<string | null>({
    key: 'refresh-token',
    initialValue: null,
  });

  const { data: profileDetails } = useProfileDetailsQuery(accessToken ?? null);
  const { my, ...myQueryProps } = useMyDetailsQuery(!!accessToken);
  const { showModal } = useModal();

  const login = async (email: string, password: string) => {
    const { accessToken, refreshToken } = await loginApi(email, password);

    await setToken(accessToken);
    await setRefreshToken(refreshToken);
  };

  const loginWithPass = async (impUid: string) => {
    const data = await passLogin(impUid);
    if (data.isNewUser) {
      // 신규 사용자인 경우 회원가입 페이지로 이동하면서 본인인증 정보 전달
      router.push({
        pathname: '/auth/signup/terms',
        params: {
          certificationInfo: JSON.stringify(data.certificationInfo),
        },
      });
      return { isNewUser: true, certificationInfo: data.certificationInfo };
    } else {
      // 기존 사용자인 경우 로그인 처리
      if (data.accessToken && data.refreshToken) {
        await setToken(data.accessToken);
        await setRefreshToken(data.refreshToken);
      } else {
        throw new Error('로그인 응답에 토큰이 없습니다.');
      }
      return { isNewUser: false };
    }
  };

  const logoutOnly = async () => {
    if (!refreshToken) {
      router.push('/auth/login');
      await setToken(null);
      await setRefreshToken(null);
      return;
    }

    await logoutApi(refreshToken);
    await setToken(null);
    await setRefreshToken(null);
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
      async ({ accessToken, refreshToken }) => {
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

  return {
    login,
    loginWithPass,
    profileDetails,
    isAuthorized: !!accessToken,
    logout,
    logoutOnly,
    my,
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
